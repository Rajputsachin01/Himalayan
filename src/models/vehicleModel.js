const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum :["Available","InTransit","Maintenance"],
      default:"Available"
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);