const mongoose = require("mongoose");
const TargetSchema = new mongoose.Schema(
  {
    teamLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Date: {
      type: Date,
      required: true,
    },
    target: {
      type: Number,
      default:0,
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Target", TargetSchema);
