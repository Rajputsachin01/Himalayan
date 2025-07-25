const express = require("express");
const router = express.Router();
const DriverController = require("../controllers/driverController");
const { isAuth } = require("../utils/auth");

router.post("/create", isAuth, DriverController.createDriver);
router.post("/update/:id", isAuth, DriverController.updateDriver);
router.post("/remove/:id", isAuth, DriverController.deleteDriver);
router.post("/listingDrivers", isAuth, DriverController.listDrivers);
router.post("/fetchAll", isAuth, DriverController.fetchAllDrivers);

module.exports = router;
