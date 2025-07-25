const express = require("express");
const router = express.Router();
const HotelController = require("../controllers/hotelController");
const { isAuth } = require("../utils/auth");
router.post("/create", isAuth, HotelController.createHotel);
router.put("/update/:id", isAuth, HotelController.updateHotel);
router.put("/delete/:id", isAuth, HotelController.deleteHotel);
router.put("/getHotel/:id", isAuth, HotelController.getHotel);
router.post("/listingHotel", isAuth, HotelController.listHotels);

module.exports = router;
