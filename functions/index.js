const admin = require("firebase-admin");
admin.initializeApp();

const emailFunctions = require("./sendEmail.js");
const razorpayFunctions = require("./razorpay.js");
const backfillFunctions = require("./backfillPendingPayments.js");

module.exports = {
  ...emailFunctions,
  ...razorpayFunctions,
  ...backfillFunctions
};
