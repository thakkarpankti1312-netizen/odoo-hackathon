const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    type: String,
    title: String,
    message: String,
    entityType: String,
    entityId: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
