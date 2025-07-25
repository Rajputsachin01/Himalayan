const express = require("express");
const router = express.Router();
const LeadController = require("../controllers/leadController");
const { isAuth } = require("../utils/auth");

router.post("/create", isAuth, LeadController.createLead);
router.post("/update/:id", isAuth, LeadController.updateLead);
router.post("/remove/:id", isAuth, LeadController.deleteLead);
router.post("/listingLeads", isAuth, LeadController.listLeads);
router.post("/fetchAll", isAuth, LeadController.fetchAllLeads);

module.exports = router;
