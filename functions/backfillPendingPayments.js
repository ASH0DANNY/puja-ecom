const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");

admin.initializeApp();
const db = admin.firestore();
const backfillSecret = defineSecret("BACKFILL_SECRET");
const allowedAdminUids = (process.env.BACKFILL_ALLOWED_ADMIN_UIDS || "")
  .split(",")
  .map((uid) => uid.trim())
  .filter(Boolean);

/**
 * Callable function to backfill orders stuck in 'pending_payment' by checking Razorpay.
 * - Scans orders with status 'pending_payment' or 'pending-payment'
 * - For orders that have `razorpayPaymentId`, fetches Razorpay payment status
 * - If Razorpay status != 'captured', marks order as 'payment_failed' and records reason/timestamp
 *
 * Security: requires `data.secret` to match process.env.BACKFILL_SECRET
 * Usage (callable): pass { secret: '...' , cutoffHours: 48 }
 */
// Core implementation (reusable)
async function backfillPendingPaymentsImpl({ cutoffHours = 48 } = {}) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const cutoffMillis = Number(cutoffHours) * 60 * 60 * 1000;
  const now = Date.now();

  const statusesToScan = ["pending_payment", "pending-payment"];

  const q = db.collection("orders").where("status", "in", statusesToScan);
  const snapshot = await q.get();
  const results = {
    scanned: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (const doc of snapshot.docs) {
    results.scanned += 1;
    const data = doc.data();
    try {
      const createdAt = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().getTime() : (data.createdAt ? new Date(data.createdAt).getTime() : 0);
      if (createdAt && now - createdAt < cutoffMillis) {
        results.skipped += 1;
        continue;
      }

      const paymentId = data.razorpayPaymentId || null;
      if (!paymentId) {
        results.skipped += 1;
        continue;
      }

      let payment;
      try {
        payment = await razorpay.payments.fetch(paymentId);
      } catch (e) {
        console.error("Failed to fetch payment", paymentId, e.message || e);
        results.errors += 1;
        continue;
      }

      const status = payment?.status;
      if (status && status !== "captured") {
        const failureReason = `Razorpay status: ${status}`;
        await doc.ref.update({
          status: "payment_failed",
          paymentFailureReason: failureReason,
          paymentFailureAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          razorpayPaymentStatus: status,
        });
        results.updated += 1;
      } else {
        results.skipped += 1;
      }
    } catch (error) {
      console.error("Error processing order", doc.id, error.message || error);
      results.errors += 1;
    }
  }

  return results;
}

async function isAuthorizedBackfillCaller(req) {
  if (!req.auth?.uid) {
    return false;
  }

  const { secret } = req.data || {};
  const secretMatches = typeof secret === "string" && secret === backfillSecret.value();
  if (secretMatches) {
    return true;
  }

  const adminUidMatches = allowedAdminUids.includes(req.auth.uid);
  if (adminUidMatches) {
    return true;
  }

  const userDoc = await db.collection("users").doc(req.auth.uid).get();
  const userData = userDoc.data() || {};
  const firestoreRoleAdmin = userData.role === "admin" || userData.isAdmin === true;
  const customClaimAdmin = Boolean(req.auth.token?.admin || req.auth.token?.role === "admin");

  return firestoreRoleAdmin || customClaimAdmin;
}

// Callable wrapper - requires secret
exports.backfillPendingPayments = onCall(
  { region: "asia-south1", secrets: [backfillSecret] },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const { cutoffHours = 48 } = req.data || {};
    const isAuthorized = await isAuthorizedBackfillCaller(req);

    if (!isAuthorized) {
      throw new HttpsError("permission-denied", "Not authorized");
    }

    const results = await backfillPendingPaymentsImpl({ cutoffHours });
    return { ok: true, results };
  }
);

// Scheduled wrapper: runs daily (can be adjusted)
exports.scheduledBackfill = onSchedule(
  {
    schedule: "every 24 hours",
    region: "asia-south1",
    secrets: [backfillSecret],
    timeoutSeconds: 300,
  },
  async (event) => {
    try {
      const results = await backfillPendingPaymentsImpl({ cutoffHours: 48 });
      console.log("scheduledBackfill results:", results);
      return { ok: true, results };
    } catch (error) {
      console.error("scheduledBackfill error:", error);
      return { ok: false, error: error.message || String(error) };
    }
  }
);
