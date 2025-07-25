const UserModel = require("../models/userModel");
const { signInToken } = require("../utils/auth");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");
const Response = require("../utils/responseHelper");
const {
  isValidEmail,
  isValidPhone,
  isEmpty,
  isValidObjectId,
} = require("../utils/validationHelper");
const bcrypt = require("bcrypt");
const saltRounds = 10;
async function getUserWithToken(userId) {
  try {
    const userDetail = await UserModel.findById(userId).select("-password -__v -createdAt -updatedAt");
    const token = signInToken(userId);
    return { token, userDetail };
  } catch (error) {
    console.log(error);
    return {};
  }
}
const register = async (req, res) => {
  try {
    const { userRole, userUnder, userName, phoneNo, email, password } = req.body;

    if (isEmpty(phoneNo)) return Response.fail(res, "Phone number is required");
    if (!isValidPhone(phoneNo)) return Response.fail(res, "Invalid phone number");
    if (isEmpty(email)) return Response.fail(res, "Email is required");
    if (!isValidEmail(email)) return Response.fail(res, "Invalid email format");
    if (isEmpty(password)) return Response.fail(res, "Password is required");

    const existing = await UserModel.findOne({
      $or: [{ email }, { phoneNo }],
    });

    if (existing) return Response.fail(res, "User already exists");

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await UserModel.create({
      userRole,
      userUnder,
      userName,
      phoneNo,
      email,
      password: hashedPassword,
    });

    const { token, userDetail } = await getUserWithToken(newUser._id);
    return Response.success(res, "Signup successful", { token, userDetail });
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};
const update = async (req, res) => {
  try {
    const { userId, userRole, userUnder, userName, phoneNo, email } = req.body;

    if (!isValidObjectId(userId)) return Response.fail(res, "Invalid userId");

    const updates = {};

    if (!isEmpty(userRole)) updates.userRole = userRole;
    if (!isEmpty(userUnder)) updates.userUnder = userUnder;
    if (!isEmpty(userName)) updates.userName = userName;

    if (email) {
      if (!isValidEmail(email)) return Response.fail(res, "Invalid email format");
      const emailExists = await UserModel.findOne({ email, _id: { $ne: userId } });
      if (emailExists) return Response.fail(res, "Email already in use");
      updates.email = email;
    }

    if (phoneNo) {
      if (!isValidPhone(phoneNo)) return Response.fail(res, "Invalid phone number");
      const phoneExists = await UserModel.findOne({ phoneNo, _id: { $ne: userId } });
      if (phoneExists) return Response.fail(res, "Phone number already in use");
      updates.phoneNo = phoneNo;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, { new: true });
    if (!updatedUser) return Response.fail(res, "User not found");

    const { token, userDetail } = await getUserWithToken(userId);
    return Response.success(res, "User updated successfully", { token, userDetail });

  } catch (error) {
    console.error(error);
    return Response.error(res, "failed to update",error);
  }
};

const remove = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isValidObjectId(userId)) return Response.fail(res, "Invalid userId");

    const deleted = await UserModel.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
    if (!deleted) return Response.fail(res, "User not found");

    return Response.success(res, "User deleted successfully", deleted);
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};
const findUserById = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isValidObjectId(userId)) return Response.fail(res, "Invalid userId");

    const user = await UserModel.findById(userId);
    if (!user) return Response.fail(res, "User not found");

    return Response.success(res, "User found", user);
  } catch (error) {
    console.log(error);
    return Response.fail(res, "Failed to fetch user");
  }
};
const updatePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { password, old_password } = req.body;

    if (isEmpty(password) || isEmpty(old_password))
      return Response.fail(res, "Old and new password are required");

    const user = await UserModel.findById(userId);
    if (!user) return Response.fail(res, "User not found");

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) return Response.fail(res, "Old password is incorrect");

    user.password = await bcrypt.hash(password, saltRounds);
    await user.save();
    return Response.success(res, "Password updated successfully");
  } catch (error) {
    console.log(error);
    return Response.fail(res, "Failed to update password");
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) return Response.fail(res, "Valid email required");

    const user = await UserModel.findOne({ email });
    if (!user) return Response.fail(res, "User not found");

    const otp = "123456"; 
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    return Response.success(res, "OTP sent for password reset");
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};
const verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (isEmpty(email) || isEmpty(otp)) return Response.fail(res, "Email and OTP required");

    const user = await UserModel.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return Response.fail(res, "Invalid or expired OTP");
    return Response.success(res, "OTP verified successfully");
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};
const resendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) return Response.fail(res, "Valid email required");

    const user = await UserModel.findOne({ email });
    if (!user) return Response.fail(res, "User not found");

    const otp = "123456";
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    return Response.success(res, "New OTP sent successfully");
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (isEmpty(email) || isEmpty(newPassword) || isEmpty(confirmPassword))
      return Response.fail(res, "All fields are required");

    if (newPassword !== confirmPassword)
      return Response.fail(res, "Passwords do not match");

    const user = await UserModel.findOne({ email });
    if (!user) return Response.fail(res, "User not found");

    if (user.resetPasswordExpires < Date.now())
      return Response.fail(res, "OTP expired");

    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return Response.success(res, "Password reset successfully");
  } catch (error) {
    console.log(error);
    return Response.error(res,"Failed To reset password", error);
  }
};
const userLogin = async (req, res) => {
  try {
    const { phoneNo, password } = req.body;

    if (!phoneNo || !password)
      return Response.fail(res, "Phone number and password are required");

    const user = await UserModel.findOne({ phoneNo });
    if (!user) return Response.fail(res, "User not registered");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return Response.fail(res, "Invalid password");

    const { token, userDetail } = await getUserWithToken(user._id);
    return Response.success(res, "Login successful", { token, userDetail });
  } catch (error) {
    console.log(error);
    return Response.error(res, "Login failed",error);
  }
};
const fetchProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId).select("-password -__v -createdAt -updatedAt");
    if (!user) return Response.fail(res, "User not found");
    return Response.success(res, "Profile fetched", user);
  } catch (error) {
    console.log(error);
    return Response.error(res, "Failed to fetch profile",error);
  }
};
const toggleIsActive = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!isValidObjectId(userId)) return Response.fail(res, "Invalid user ID");

    const user = await UserModel.findById(userId);
    if (!user) return Response.fail(res, "User not found");

    user.isActive = !user.isActive;
    await user.save();

    return Response.success(res, `User is now ${user.isActive ? "Active" : "Inactive"}`, {
      isActive: user.isActive,
    });
  } catch (err) {
    return Response.error(res, "Failed to toggle user status", err);
  }
};
const listingUser = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const query = { isDeleted: false };

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query),
    ]);

    const response = paginatedResponse(users, total, page, limit);

    return Response.success(res, "Users fetched successfully", {
      ...response,
      totalPages: response.pagination.totalPages, 
    });
  } catch (error) {
    return Response.error(res, "Failed to fetch users", error);
  }
};



module.exports = {
  register,
  update,
  remove,
  findUserById,
  updatePassword,
  userLogin,
  forgotPassword,
  verifyResetPasswordOtp,
  resendResetPasswordOtp,
  resetPassword,
  fetchProfile,
  toggleIsActive,
  listingUser
};
