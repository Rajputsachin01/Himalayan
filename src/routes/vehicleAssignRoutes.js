const express = require("express");
const router = express.Router();
const AssignmentController = require("../controllers/vehicleAssignmentController");
const { isAuth } = require("../utils/auth");

router.post("/create", isAuth, AssignmentController.createAssignment);
router.put("/update/:id", isAuth, AssignmentController.updateAssignment);
router.put("/delete/:id", isAuth, AssignmentController.deleteAssignment);
router.post("/listing", isAuth, AssignmentController.listAssignments);

module.exports = router;
