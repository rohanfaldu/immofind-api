const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/otpController");

const router = express.Router();

// Define routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router; // Export the router
