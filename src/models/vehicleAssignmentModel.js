const mongoose = require("mongoose");
const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    assignDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "UnAssigned", "InMaintenance"],
      default: "UnAssigned",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicleassignment", VehicleSchema);
