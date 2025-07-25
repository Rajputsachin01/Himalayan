const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", userController.register);
router.post("/update", isAuth, userController.update);
router.post("/remove", isAuth, userController.remove);
router.post("/find-By-Id", isAuth, userController.findUserById);
router.post("/update-password", isAuth, userController.updatePassword);
router.post("/login", userController.userLogin);
router.post("/forgotPassword",  userController.forgotPassword)
router.post("/verifyOtp",  userController.verifyResetPasswordOtp)
router.post("/resendOtp",  userController.resendResetPasswordOtp)
router.post("/resetPassword",userController.resetPassword) 
router.post("/fetch-profile",isAuth, userController.fetchProfile);
router.post("/toggle-active", isAuth, userController.toggleIsActive);
router.post("/listingUser",isAuth, userController.listingUser);
module.exports = router;
