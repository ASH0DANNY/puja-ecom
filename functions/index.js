const admin = require("firebase-admin");
admin.initializeApp();

const emailFunctions = require("./sendEmail.js");
const razorpayFunctions = require("./razorpay.js");

module.exports = {
  ...emailFunctions,
  ...razorpayFunctions
};
