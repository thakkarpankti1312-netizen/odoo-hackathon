const express = require("express");
const Vendor = require("../models/Vendor");
const auth = require("../middleware/authMiddleware");
const logActivity = require("../utils/logActivity");

const router = express.Router();

router.post("/", auth(["admin", "procurement"]), async (req, res) => {
  const { name, category, gstNumber, email, phone } = req.body;

  if (!name || !category || !gstNumber || !email || !phone) {
    return res.status(400).json({ message: "Name, category, GST, email, and phone are required" });
  }

  const existing = await Vendor.findOne({ gstNumber });
  if (existing) {
    return res.status(400).json({ message: "A vendor with this GST number already exists" });
  }

  const vendor = await Vendor.create(req.body);
  await logActivity({
    type: "vendor",
    title: "Vendor registered",
    message: `${vendor.name} was added to the vendor master.`,
    entityType: "Vendor",
    entityId: vendor._id.toString(),
    createdBy: req.user.id,
  });
  res.status(201).json(vendor);
});

router.get("/", auth(["admin", "procurement", "vendor", "manager"]), async (req, res) => {
  const { search = "", status = "", category = "" } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { gstNumber: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (category) query.category = { $regex: category, $options: "i" };

  const vendors = await Vendor.find(query).sort({ createdAt: -1 });
  res.json(vendors);
});

router.put("/:id", auth(["admin", "procurement"]), async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  await logActivity({
    type: "vendor",
    title: "Vendor updated",
    message: `${vendor.name} details were updated.`,
    entityType: "Vendor",
    entityId: vendor._id.toString(),
    createdBy: req.user.id,
  });

  res.json(vendor);
});

module.exports = router;
