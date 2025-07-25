const express = require("express");
const router = express.Router();
const targetController = require("../controllers/targetController");
const { isAuth, } = require("../utils/auth");

/*--------------------------------Target Routes-------------------------------*/
router.post("/setTarget", targetController.createTarget)
router.post("/update/:id", targetController.updateTarget)
router.post("/remove/:id",isAuth, targetController.deleteTarget)
router.post("/listing",isAuth, targetController.listTargets)

module.exports = router;

