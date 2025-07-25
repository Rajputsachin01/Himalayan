const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    userRole: {
      type: String,
      default: "",
    },
    userUnder: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      default: "",
    },
    phoneNo: {
      type: Number,
      required: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      default: "",
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      default: "",
    },
    isActive: { type: Boolean, default: true },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);
