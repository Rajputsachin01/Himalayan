const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController");
const { isAuth } = require("../utils/auth");

router.post("/create", isAuth, TaskController.createTask);
router.post("/update/:id", isAuth, TaskController.updateTask);
router.post("/remove/:id", isAuth, TaskController.deleteTask);
router.post("/listingTasks", isAuth, TaskController.listTasks);
router.post("/fetchAll", isAuth, TaskController.fetchAllTasks);

module.exports = router;
