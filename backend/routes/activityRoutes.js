const express = require("express");
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth(["admin", "procurement", "manager", "vendor"]), async (req, res) => {
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("createdBy", "name email role");

  res.json(logs);
});

module.exports = router;
