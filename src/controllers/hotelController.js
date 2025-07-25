const Hotel = require("../models/hotelModel");
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId, isValidEmail, isValidPhone } = require("../utils/validationHelper");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");

const createHotel = async (req, res) => {
  try {
    const {
      name, contactNumber, email, website,
      country, state, city, address,
      hotelCategory, roomCategory, mealPlan
    } = req.body;

    if ([name, contactNumber, email, country, state, city, address, hotelCategory, roomCategory, mealPlan].some(isEmpty)) {
      return Response.fail(res, "All required fields must be filled");
    }

    if (!isValidEmail(email)) {
      return Response.fail(res, "Invalid email format");
    }

    if (!isValidPhone(contactNumber)) {
      return Response.fail(res, "Invalid contact number");
    }

    const hotel = await Hotel.create({
      name, contactNumber, email, website,
      country, state, city, address,
      hotelCategory, roomCategory, mealPlan,
    });

    return Response.success(res, "Hotel created successfully", hotel);
  } catch (err) {
    return Response.error(res, "Something went wrong", err);
  }
};
const updateHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const updateData = req.body;

    if (!isValidObjectId(hotelId)) {
      return Response.fail(res, "Invalid hotel ID");
    }

    if (updateData.email && !isValidEmail(updateData.email)) {
      return Response.fail(res, "Invalid email format");
    }

    if (updateData.contactNumber && !isValidPhone(updateData.contactNumber)) {
      return Response.fail(res, "Invalid contact number");
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotelId,
      updateData,
      { new: true }
    );

    if (!updatedHotel) {
      return Response.fail(res, "Hotel not found");
    }

    return Response.success(res, "Hotel updated successfully", updatedHotel);
  } catch (err) {
    return Response.error(res, "Update failed", err);
  }
};
const deleteHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;

    if (!isValidObjectId(hotelId)) {
      return Response.fail(res, "Invalid hotel ID");
    }

    const deleted = await Hotel.findByIdAndUpdate(
      hotelId,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) {
      return Response.fail(res, "Hotel not found");
    }

    return Response.success(res, "Hotel deleted successfully", deleted);
  } catch (err) {
    return Response.error(res, "Deletion failed", err);
  }
};
const getHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;

    if (!isValidObjectId(hotelId)) {
      return Response.fail(res, "Invalid hotel ID");
    }

    const hotel = await Hotel.findOne({ _id: hotelId, isDeleted: false });

    if (!hotel) {
      return Response.fail(res, "Hotel not found");
    }

    return Response.success(res, "Hotel fetched successfully", hotel);
  } catch (err) {
    return Response.error(res, "Fetch failed", err);
  }
};
const listHotels = async (req, res) => {
  try {
    const { search = "" } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    const query = {
      isDeleted: false,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ]
    };

    const [hotels, total] = await Promise.all([
      Hotel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Hotel.countDocuments(query),
    ]);

    return Response.success(
      res,
      "Hotels fetched successfully",
      paginatedResponse(hotels, total, page, limit)
    );
  } catch (err) {
    return Response.error(res, "Listing failed", err);
  }
};

module.exports = {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotel,
  listHotels,
};
