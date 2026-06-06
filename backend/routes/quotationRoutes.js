const express = require("express");
const Quotation = require("../models/Quotation");
const RFQ = require("../models/RFQ");
const auth = require("../middleware/authMiddleware");
const logActivity = require("../utils/logActivity");

const router = express.Router();

router.post("/", auth(["admin", "procurement", "vendor"]), async (req, res) => {
  const { rfq, vendor, price, deliveryDays, notes } = req.body;

  if (!rfq || !vendor || !price || !deliveryDays) {
    return res.status(400).json({ message: "RFQ, vendor, price, and delivery days are required" });
  }

  const rfqDoc = await RFQ.findById(rfq);
  if (!rfqDoc) {
    return res.status(404).json({ message: "RFQ not found" });
  }

  const existing = await Quotation.findOne({ rfq, vendor });
  if (existing) {
    return res.status(400).json({ message: "Quotation already submitted" });
  }

  const quotation = await Quotation.create({
    rfq,
    vendor,
    price,
    deliveryDays,
    notes,
  });

  await logActivity({
    type: "quotation",
    title: "Quotation submitted",
    message: `A vendor submitted a quotation of Rs. ${price}.`,
    entityType: "Quotation",
    entityId: quotation._id.toString(),
    createdBy: req.user.id,
  });

  res.status(201).json(quotation);
});

router.get("/rfq/:rfqId", auth(["admin", "procurement", "manager"]), async (req, res) => {
  const quotations = await Quotation.find({ rfq: req.params.rfqId })
    .populate("vendor")
    .populate("rfq");

  res.json(quotations);
});

router.put("/:id", auth(["admin", "procurement", "vendor"]), async (req, res) => {
  if (!req.body.price || !req.body.deliveryDays) {
    return res.status(400).json({ message: "Price and delivery days are required" });
  }

  const quotation = await Quotation.findByIdAndUpdate(
    req.params.id,
    {
      price: req.body.price,
      deliveryDays: req.body.deliveryDays,
      notes: req.body.notes,
    },
    { new: true }
  );

  if (!quotation) {
    return res.status(404).json({ message: "Quotation not found" });
  }

  await logActivity({
    type: "quotation",
    title: "Quotation edited",
    message: `Quotation was updated to Rs. ${quotation.price}.`,
    entityType: "Quotation",
    entityId: quotation._id.toString(),
    createdBy: req.user.id,
  });

  res.json(quotation);
});

router.put("/:id/select", auth(["admin", "procurement"]), async (req, res) => {
  const quotation = await Quotation.findByIdAndUpdate(
    req.params.id,
    { status: "selected" },
    { new: true }
  );

  if (!quotation) {
    return res.status(404).json({ message: "Quotation not found" });
  }

  await RFQ.findByIdAndUpdate(quotation.rfq, { status: "approval" });

  await logActivity({
    type: "quotation",
    title: "Quotation selected",
    message: "A quotation was selected and moved into approval workflow.",
    entityType: "Quotation",
    entityId: quotation._id.toString(),
    createdBy: req.user.id,
  });

  res.json(quotation);
});

module.exports = router;
