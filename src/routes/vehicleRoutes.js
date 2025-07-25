const express = require("express");
const router = express.Router();
const VehicleController = require("../controllers/vehicleController");
const { isAuth } = require("../utils/auth");
router.post("/create", isAuth, VehicleController.createVehicle);
router.post("/update/:id", isAuth, VehicleController.updateVehicle);
router.post("/delete/:id", isAuth, VehicleController.deleteVehicle);
router.post("/listingVehicles", isAuth, VehicleController.listVehicles);
router.post("/fetchAll", isAuth, VehicleController.fetchAllVehicles);

module.exports = router;
