const mongoose = require("mongoose");

const rfqSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    quantity: Number,
    attachmentName: String,
    deadline: Date,
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
    status: {
      type: String,
      enum: ["open", "closed", "approval", "completed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RFQ", rfqSchema);
