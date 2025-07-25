const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    driverId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum :["Active","OffDuty","OnLeave"],
      default:"Available"
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", VehicleSchema);