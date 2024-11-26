const admin = require("../firebaseConfig");
const response = require("../components/utils/response");

exports.sendOtp = async (req, res) => {
  const { phoneNumber, lang } = req.body;

  // Set locale dynamically based on the lang parameter
  if (lang) {
    req.setLocale(lang);
  }

  if (!phoneNumber) {
    return response.error(res, req.__("messages.phoneNumberRequired"));
  }

  try {
    // Simulate OTP sending (Firebase Phone Auth must be handled client-side)
    return response.success(res, req.__("messages.otpSendSuccess"), {
      message: "Simulated OTP sent to phone number.",
    });
  } catch (err) {
    return response.serverError(
      res,
      req.__("messages.internalServerError"),
      err.message
    );
  }
};

exports.verifyOtp = async (req, res) => {
  const { idToken, lang } = req.body;

  // Set locale dynamically based on the lang parameter
  if (lang) {
    req.setLocale(lang);
  }

  if (!idToken) {
    return response.error(res, req.__("messages.sessionOtpRequired"));
  }

  try {
    // Verify ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    return response.success(res, req.__("messages.otpVerifySuccess"), {
      user: decodedToken,
    });
  } catch (err) {
    return response.error(
      res,
      req.__("messages.invalidOtpSession"),
      err.message
    );
  }
};
