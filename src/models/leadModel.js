const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  companyWebsite: {
    type: String,
    default: "",
  },
  contactPersonName: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    default: "",
  },
  potentialValue: {
    type: Number,
    required: true,
    default: 0,
  },
  priorityLevel: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
  stage: {
    type: String,
    required: true,
  },
  assignToExecutive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  leadSource: {
    type: String,
    default: "",
  },
  notes: {
    type: String,
    default: "",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Lead", LeadSchema);
