const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    profileImage: {
        type: String,
        default: "",
    },
    fullName: {
        type: String,
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
    phoneNo: {
        type: Number,
        required: true,
        default: "",
    },
    otp: {
        type: String,
    },
    resetPasswordToken: { type: String },//for forget password otp store
    resetPasswordExpires: { type: Date },
    isDeleted: {
      type: Boolean,
      default: false,
    },
}, 
 { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);