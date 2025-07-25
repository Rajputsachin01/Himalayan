const express = require("express");
const router = express.Router();
const HotelController = require("../controllers/hotelController");
const { isAuth } = require("../utils/auth");
router.post("/create", isAuth, HotelController.createHotel);
router.post("/update/:id", isAuth, HotelController.updateHotel);
router.post("/remove/:id", isAuth, HotelController.deleteHotel);
router.post("/getHotel/:id", isAuth, HotelController.getHotel);
router.post("/listingHotel", isAuth, HotelController.listHotels);

module.exports = router;
