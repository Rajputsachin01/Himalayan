const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  verifyOTP,
  removeAdmin,
  fetchProfile,
  forgotPassword,
  verifyResetPasswordOtp,
  resendResetPasswordOtp,
  resetPassword,
} = require("../controllers/adminController");
const { isAuth} = require("../utils/auth");

/*--------------------------------Admin Routes-------------------------------*/
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/verifyotp", verifyOTP);
router.post("/remove", isAuth, removeAdmin);
router.post("/fetchProfile", isAuth, fetchProfile);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyOtp", verifyResetPasswordOtp);
router.post("/resendOtp", resendResetPasswordOtp);
router.post("/resetPassword", resetPassword);
module.exports = router;
