const AdminModel = require("../models/adminModel");
const { signInToken } = require("../utils/auth");
const Response = require("../utils/responseHelper");
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function getUserWithToken(adminId, type) {
  try {
    let adminDetail = await adminProfile(adminId);
    const token = signInToken(adminId, type);
    return { token: token, adminDetail: adminDetail };
  } catch (error) {
    console.log(error);
    return {};
  }
}
const adminProfile = async (adminId) => {
  try {
    let adminProfile = await AdminModel.findById(adminId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    return adminProfile;
  } catch (error) {
    return false;
  }
};

//for generating 6 digit random otp
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
//For creating admin
const registerAdmin = async (req, res) => {
  try {
    const { profileImage, fullName, phoneNo, email, password } =
      req.body;
  
    if (!fullName) return Response.fail(res, "fullName is required");
    if (!phoneNo) return Response.fail(res, "Phone number is required");
    if (!email) return Response.fail(res, "Email is required");
    if (!password) return Response.fail(res, "Password is required");
    // Validating email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return Response.fail(res, "Email is not valid!");
    }
    // Validating phoneNumber
    if (phoneNo) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(phoneNo)) {
        return Response.fail(res, " number is not valid!");
      }
    }
    let checkObj = { $or: [{ email: email }] };
    if (phoneNo) {
      checkObj.$or.push({ phoneNo: phoneNo });
    }
    let adminCheck = await AdminModel.find(checkObj);
    if (adminCheck.length > 0) {
      return Response.fail(
        res,
        "Admin already exists with this email or mobile No!"
      );
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Generate OTP
    // const otp = generateOTP();
    const otp = "123456";
    const userObj = {
      profileImage,
      fullName,
      email,
      phoneNo,
      password: hashedPassword,
      otp: otp,
    };
    const createAdmin = await AdminModel.create(userObj);
    return Response.success(res, "Admin registered successfully", createAdmin);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//for verifying OTP
const verifyOTP = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;
    if (!otp) {
      return Response.fail(res, " OTP are required");
    }
    // Validating phone no.
    if (phoneNo) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(phoneNo)) {
        return Response.fail(res, " phoneNo is not valid!");
      }
    }
    const user = await AdminModel.findOne({ phoneNo: phoneNo, otp });
    if (!user) {
      return Response.fail(res, "Invalid OTP");
    }
    let newotp = "123456";
    await AdminModel.updateOne({ phoneNo: phoneNo }, { $set: { otp: newotp } });
    const type = "admin";
    const { token, adminDetail } = await getUserWithToken(user._id, type);
    if (!token || !adminDetail) {
      return Response.error("Failed to generate token or get admin profile");
    }
    res.cookie("token", token);
    return Response.success(
      res,
      "otp is verified and Token generated successfully.",
      {
        token,
        adminDetail,
      }
    );
  } catch (error) {
    console.error(error);
    return Response.fail(res, error.message);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { phoneNo } = req.body;
    if (!phoneNo) {
      return Response.fail(res, "phone number is required");
    }
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo;
    }
    const admin = await AdminModel.findOne({
      $or: [phoneNo ? { phoneNo } : null].filter(Boolean),
      isDeleted: false,
    });
    if (!admin) {
      return Response.fail(
        res,
        "admin not found, please enter a valid phone number"
      );
    }
    // const otp = generateOTP();
    const newotp = "123456";
    admin.otp = newotp;
    await admin.save();

    return Response.success(res, "OTP sent successfull",{phoneNo:admin.phoneNo});
  } catch (error) {
    console.log(error);
    return Response.fail(res, "failed to send OTP");
  }
};

// soft delete admin
const removeAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId) {
      return Response.fail(res, "Please provide Admin Id ");
    }
    let i = { _id: adminId };
    let deleted = await AdminModel.findOneAndUpdate(
      i,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Response.fail(res, "No admin found!");
    }
    return Response.success(res, " Admin deleted successfully", deleted);
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};

//for fetching admin Profile
const fetchProfile = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await AdminModel.findById(adminId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    if (!admin) {
      return Response.fail(res, "admin not found");
    }
    return Response.success(res, "Profile fetched successfully", admin);
  } catch (error) {
    console.log(error);
    return Response.fail(res, "Failed to fetch profile");
  }
};

//for forget password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return Response.fail(res, "please enter your email");
    }
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return Response.fail(res, "admin not found");
    }
    const otp = "123456"
    admin.resetPasswordToken = otp; // Store OTP for password reset
    admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();
    return Response.success(res, "Password reset email sent", null); //here sending otp in res for testing only
  } catch (error) {
    console.error("Error:", error.message);
    return Response.fail(
      res,
      error.message || "Failed to initiate password reset"
    );
  }
};
//for password reset OTP On email
const verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return Response.fail(res, "Email and OTP are required");

    const admin = await AdminModel.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) return Response.fail(res, "Invalid or expired OTP");
    return Response.success(res, "OTP verified successfully");
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};
//for resend Password Reset OTP On email
const resendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return Response.fail(res, "Email is required");
    }
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return Response.fail(res, "admin not found");
    }
    const otp = "123456";
    admin.resetPasswordToken = otp;
    admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();

    return Response.success(res, "New OTP sent successfully", otp);
  } catch (error) {
    console.log(error);
    return Response.fail(res, "Failed to resend OTP");
  }
};
//for reset password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return Response.fail(res, "All fields are required");
    }
    if (newPassword !== confirmPassword) {
      return Response.fail(res, "Passwords do not match");
    }
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return Response.fail(res, "admin not found");
    }
    if (admin.resetPasswordExpires < Date.now()) {
      return Response.fail(res, "OTP expired. Please request a new OTP.");
    }
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();
    return Response.success(res, "Password has been reset successfully");
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};


module.exports = {
  registerAdmin,
  loginAdmin,
  verifyOTP,
  removeAdmin,
  fetchProfile,
  forgotPassword,
  verifyResetPasswordOtp,
  resendResetPasswordOtp,
  resetPassword

};
