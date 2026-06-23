const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { defineSecret } = require("firebase-functions/params");
const Razorpay = require("razorpay");
const { defineSecret } = require("firebase-functions/params");

// Define Firebase Secrets
const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");

exports.createRazorpayOrder = functions
  .runWith({ secrets: [razorpayKeyId, razorpayKeySecret] })
  .https.onCall(async (data, context) => {
    // Validate authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to create an order."
      );
    }

    const { items, shippingAddress, discountCode, customerName, customerPhone } = data;

    if (!items || !items.length || !shippingAddress) {
      throw new functions.https.HttpsError(
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
        throw new functions.https.HttpsError("not-found", `Product ${item.productId} not found.`);
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
      key_id: razorpayKeyId.value(),
      key_secret: razorpayKeySecret.value(),
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
        userId: context.auth.uid,
        userEmail: context.auth.token.email || "",
        customerName: customerName || context.auth.token.name || "Customer",
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
        keyId: razorpayKeyId.value(),
      };
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to initialize payment gateway."
      );
    }
});

exports.verifyRazorpayPayment = functions
  .runWith({ secrets: [razorpayKeyId, razorpayKeySecret] })
  .https.onCall(async (data, context) => {
    // Validate authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to verify payment."
      );
    }

    const {
      firestoreOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = data;

    if (!firestoreOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required payment verification fields."
      );
    }

    const db = admin.firestore();
    const orderRef = db.collection("orders").doc(firestoreOrderId);

    // 1. Verify Signature
    const secret = razorpayKeySecret.value();
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // Invalid signature: Mark order as failed
      await orderRef.update({
        status: "payment_failed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw new functions.https.HttpsError(
        "permission-denied",
        "Payment signature verification failed."
      );
    }

    // 2. Fetch Payment Details from Razorpay
    const razorpay = new Razorpay({
      key_id: razorpayKeyId.value(),
      key_secret: secret,
    });

    let paymentDetails;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
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
    try {
      const updatedOrder = await db.runTransaction(async (transaction) => {
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists) {
          throw new Error("Order not found");
        }

        const orderData = orderDoc.data();

        // Prevent double processing
        if (orderData.status === "paid" || orderData.status === "processing") {
          return orderData; // Already processed
        }

        const items = orderData.items || [];
        const productRefs = items.map(item => db.collection("products").doc(item.product.id));
        
        // Read all products first (Firestore requirement in transactions)
        const productDocs = await Promise.all(
          productRefs.map(ref => transaction.get(ref))
        );

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
            // In a real strict system we might throw and fail here, 
            // but since payment already happened, we allow it to proceed and just drop stock negative 
            // so admin can handle backorders.
          }

          // Decrement stock
          transaction.update(productRefs[i], {
            stock: admin.firestore.FieldValue.increment(-item.quantity)
          });
        }

        // Update Order
        transaction.update(orderRef, {
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          paymentMethod: paymentMethod,
          paymentMethodDetails: paymentMethodDetails,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Return merged data for the email
        return {
          ...orderData,
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          paymentMethod: paymentMethod,
          paymentMethodDetails: paymentMethodDetails,
        };
      });

      // 4. Send Confirmation Email (Server-side)
      // Only send if it was just newly marked as paid
      if (updatedOrder && updatedOrder.status === "paid") {
        try {
          const emailService = require("./sendEmail.js");
          if (emailService.sendInternalOrderEmail) {
            await emailService.sendInternalOrderEmail(updatedOrder);
          }
        } catch (emailError) {
          console.error("Failed to send internal confirmation email:", emailError);
          // Don't fail the verification just because email failed
        }
      }

      return { success: true, orderId: firestoreOrderId, status: "paid" };

    } catch (error) {
      console.error("Transaction failed during payment verification:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update order and stock."
      );
    }
});
