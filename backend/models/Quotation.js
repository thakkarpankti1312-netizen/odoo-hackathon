const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RFQ",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    price: Number,
    deliveryDays: Number,
    notes: String,
    status: {
      type: String,
      enum: ["submitted", "selected", "rejected"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);