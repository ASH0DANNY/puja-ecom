const admin = require("firebase-admin");
const { onCall } = require("firebase-functions/v2/https");
const { HttpsError } = require("firebase-functions/v2/https");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Secrets are automatically injected as environment variables
// when passed to the secrets option in onCall

exports.createRazorpayOrder = onCall(
  { secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] },
  async (request) => {
    console.log("Function invoked, checking secrets...");
    console.log("KEY_ID present:", !!process.env.RAZORPAY_KEY_ID);
    console.log("KEY_SECRET present:", !!process.env.RAZORPAY_KEY_SECRET);
    
    // Validate authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to create an order."
      );
    }

    const { items, shippingAddress, discountCode, customerName, customerPhone } = request.data;

    if (!items || !items.length || !shippingAddress) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: items or shippingAddress."
      );
    }

    const db = admin.firestore();
    let subtotal = 0;
    const orderItems = [];

    // Calculate subtotal securely from Firestore prices
    for (const item of items) {
      const productDoc = await db.collection("products").doc(item.productId).get();
      if (!productDoc.exists) {
        throw new HttpsError("not-found", `Product ${item.productId} not found.`);
      }

      const productData = productDoc.data();
      let itemPrice = productData.price || 0;
      let priceAtSelectedSize = itemPrice;

      // Check if size was selected and adjust price
      if (item.selectedSize && productData.sizesWithPrices && productData.sizesWithPrices.length > 0) {
        const sizePriceObj = productData.sizesWithPrices.find(s => s.size === item.selectedSize);
        if (sizePriceObj) {
          itemPrice = sizePriceObj.price;
          priceAtSelectedSize = itemPrice;
        }
      }

      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: {
          id: productDoc.id,
          name: productData.name || "",
          image: productData.image || (productData.images && productData.images[0]) || ""
        },
        quantity: item.quantity,
        priceAtOrder: productData.price || 0,
        priceAtSelectedSize: priceAtSelectedSize,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        customDimensions: item.customDimensions || null
      });
    }

    let discountAmount = 0;

    // Apply discount if provided
    if (discountCode) {
      const discountQuery = await db.collection("discounts")
        .where("code", "==", discountCode)
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (!discountQuery.empty) {
        const discountDoc = discountQuery.docs[0];
        const discountData = discountDoc.data();

        // Basic validation of discount
        const now = new Date();
        const startDate = discountData.startDate ? discountData.startDate.toDate() : null;
        const endDate = discountData.endDate ? discountData.endDate.toDate() : null;

        let isValid = true;
        if (startDate && now < startDate) isValid = false;
        if (endDate && now > endDate) isValid = false;
        if (discountData.minPurchase && subtotal < discountData.minPurchase) isValid = false;
        if (discountData.usageLimit && discountData.currentUsage >= discountData.usageLimit) isValid = false;

        if (isValid) {
          if (discountData.discountType === "percentage") {
            discountAmount = subtotal * (discountData.value / 100);
            if (discountData.maxDiscount && discountAmount > discountData.maxDiscount) {
              discountAmount = discountData.maxDiscount;
            }
          } else if (discountData.discountType === "fixed") {
            discountAmount = discountData.value;
          }
        }
      }
    }

    const total = subtotal - discountAmount;
    // Razorpay amount is in paise (multiply by 100)
    const amountInPaise = Math.round(total * 100);

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderRef = db.collection("orders").doc();
    const orderNumber = `ORD${Date.now().toString().slice(-6)}`;

    try {
      // Create Razorpay Order
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderRef.id,
      });

      // Save pending order to Firestore
      const orderData = {
        id: orderRef.id,
        orderNumber: orderNumber,
        userId: request.auth.uid,
        userEmail: request.auth.token.email || "",
        customerName: customerName || request.auth.token.name || "Customer",
        customerPhone: customerPhone || "",
        items: orderItems,
        total: total,
        subtotal: subtotal,
        discountCode: discountCode || null,
        discountAmount: discountAmount,
        status: "pending_payment",
        paymentMethod: "razorpay",
        shippingAddress: shippingAddress,
        razorpayOrderId: rzpOrder.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await orderRef.set(orderData);

      return {
        firestoreOrderId: orderRef.id,
        razorpayOrderId: rzpOrder.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new HttpsError(
        "internal",
        "Failed to initialize payment gateway."
      );
    }
  }
);

exports.verifyRazorpayPayment = onCall(
  { secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] },
  async (request) => {
    console.log("Function invoked, checking secrets...");
    console.log("KEY_ID present:", !!process.env.RAZORPAY_KEY_ID);
    console.log("KEY_SECRET present:", !!process.env.RAZORPAY_KEY_SECRET);
    
    // Validate authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to verify payment."
      );
    }

    const {
      firestoreOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = request.data;

    console.log("Verification request data received:", {
      firestoreOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? "present" : "missing"
    });

    if (!firestoreOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required payment verification fields."
      );
    }

    const db = admin.firestore();
    const orderRef = db.collection("orders").doc(firestoreOrderId);

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Signature verification:", {
      generated: generated_signature.substring(0, 10) + "...",
      received: razorpay_signature.substring(0, 10) + "...",
      match: generated_signature === razorpay_signature
    });

    if (generated_signature !== razorpay_signature) {
      console.error("SIGNATURE MISMATCH - Payment verification failed");
      // Invalid signature: Mark order as failed
      await orderRef.update({
        status: "payment_failed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw new HttpsError(
        "permission-denied",
        "Payment signature verification failed."
      );
    }

    // 2. Fetch Payment Details from Razorpay
    console.log("Fetching payment details from Razorpay for payment:", razorpay_payment_id);
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: secret,
    });

    let paymentDetails;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      console.log("Payment details fetched successfully:", {
        id: paymentDetails.id,
        method: paymentDetails.method,
        status: paymentDetails.status
      });
    } catch (error) {
      console.error("Failed to fetch Razorpay payment details:", error);
      // We don't fail the verification if this fails, we just won't have the rich details
    }

    let paymentMethodDetails = {};
    let paymentMethod = "razorpay";
    
    if (paymentDetails) {
      paymentMethod = paymentDetails.method; // e.g., 'card', 'upi', 'netbanking', 'wallet'
      
      // Extract specific details based on method
      if (paymentMethod === "card" && paymentDetails.card) {
        paymentMethodDetails = {
          network: paymentDetails.card.network,
          last4: paymentDetails.card.last4,
          issuer: paymentDetails.card.issuer
        };
      } else if (paymentMethod === "upi") {
        paymentMethodDetails = { vpa: paymentDetails.vpa };
      } else if (paymentMethod === "netbanking") {
        paymentMethodDetails = { bank: paymentDetails.bank };
      } else if (paymentMethod === "wallet") {
        paymentMethodDetails = { wallet: paymentDetails.wallet };
      }
    }

    // 3. Process Transaction (Stock decrement + Order status update)
    console.log("Starting transaction for order:", firestoreOrderId);
    try {
      const updatedOrder = await db.runTransaction(async (transaction) => {
        console.log("Transaction started, fetching order document");
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists) {
          throw new Error("Order not found");
        }

        const orderData = orderDoc.data();
        console.log("Order found with status:", orderData.status);

        // Prevent double processing
        if (orderData.status === "paid" || orderData.status === "processing") {
          console.log("Order already processed, skipping");
          return orderData; // Already processed
        }

        const items = orderData.items || [];
        const productRefs = items.map(item => db.collection("products").doc(item.product.id));
        
        // Read all products first (Firestore requirement in transactions)
        const productDocs = await Promise.all(
          productRefs.map(ref => transaction.get(ref))
        );
        console.log("Product documents fetched, count:", productDocs.length);

        // Check stock
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const productDoc = productDocs[i];
          
          if (!productDoc.exists) {
            console.warn(`Product ${item.product.id} not found during stock decrement.`);
            continue;
          }
          
          const currentStock = productDoc.data().stock || 0;
          if (currentStock < item.quantity) {
            console.warn(`Insufficient stock for ${item.product.id}. Ordered: ${item.quantity}, Available: ${currentStock}`);
          }

          // Decrement stock
          transaction.update(productRefs[i], {
            stock: admin.firestore.FieldValue.increment(-item.quantity)
          });
        }
        console.log("Stock updates queued");

        // Update Order
        transaction.update(orderRef, {
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          paymentMethod: paymentMethod,
          paymentMethodDetails: paymentMethodDetails,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Order status updated to paid");

        // Return merged data for the email
        return {
          ...orderData,
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          paymentMethod: paymentMethod,
          paymentMethodDetails: paymentMethodDetails,
        };
      });

      console.log("Transaction completed successfully for order:", firestoreOrderId);

      // 4. Send Confirmation Email (Server-side)
      // Only send if it was just newly marked as paid
      if (updatedOrder && updatedOrder.status === "paid") {
        try {
          console.log("Sending confirmation email for order:", firestoreOrderId);
          const emailService = require("./sendEmail.js");
          if (emailService.sendInternalOrderEmail) {
            await emailService.sendInternalOrderEmail(updatedOrder);
            console.log("Confirmation email sent successfully");
          } else {
            console.warn("sendInternalOrderEmail not available in email service");
          }
        } catch (emailError) {
          console.error("Failed to send internal confirmation email:", emailError);
          // Don't fail the verification just because email failed
        }
      }

      console.log("Payment verification completed successfully for order:", firestoreOrderId);
      return { success: true, orderId: firestoreOrderId, status: "paid" };

    } catch (error) {
      console.error("Transaction failed during payment verification:", error);
      console.error("Error stack:", error.stack);
      throw new HttpsError(
        "internal",
        "Failed to update order and stock."
      );
    }
  }
);
