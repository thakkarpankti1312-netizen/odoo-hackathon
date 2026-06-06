const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    gstNumber: String,
    email: String,
    phone: String,
    address: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);