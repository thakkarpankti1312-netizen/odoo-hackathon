const ActivityLog = require("../models/ActivityLog");

async function logActivity(data) {
  try {
    await ActivityLog.create(data);
  } catch (err) {
    console.log("Activity log failed:", err.message);
  }
}

module.exports = logActivity;
