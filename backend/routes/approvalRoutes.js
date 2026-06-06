const express = require("express");
const Approval = require("../models/Approval");
const Quotation = require("../models/Quotation");
const PurchaseOrder = require("../models/PurchaseOrder");
const auth = require("../middleware/authMiddleware");
const logActivity = require("../utils/logActivity");

const router = express.Router();

router.post("/", auth(["admin", "procurement"]), async (req, res) => {
  const existing = await Approval.findOne({
    quotation: req.body.quotation,
    status: "pending",
  });

  if (existing) {
    return res.status(200).json(existing);
  }

  const approval = await Approval.create({
    quotation: req.body.quotation,
  });

  await logActivity({
    type: "approval",
    title: "Approval requested",
    message: "Selected quotation was sent to manager approval.",
    entityType: "Approval",
    entityId: approval._id.toString(),
    createdBy: req.user.id,
  });

  res.status(201).json(approval);
});

router.get("/pending", auth(["admin", "manager"]), async (req, res) => {
  const approvals = await Approval.find({ status: "pending" }).populate({
    path: "quotation",
    populate: ["rfq", "vendor"],
  });

  res.json(approvals);
});

router.get("/", auth(["admin", "procurement", "manager"]), async (req, res) => {
  const approvals = await Approval.find().sort({ createdAt: -1 }).populate({
    path: "quotation",
    populate: ["rfq", "vendor"],
  });

  res.json(approvals);
});

router.put("/:id/approve", auth(["admin", "manager"]), async (req, res) => {
  const approval = await Approval.findByIdAndUpdate(
    req.params.id,
    {
      status: "approved",
      remarks: req.body.remarks,
      approvedBy: req.user.id,
    },
    { new: true }
  ).populate("quotation");

  const poNumber = `PO-${Date.now()}`;

  const po =
    (await PurchaseOrder.findOne({ quotation: approval.quotation._id })) ||
    (await PurchaseOrder.create({
      poNumber,
      quotation: approval.quotation._id,
      amount: approval.quotation.price,
    }));

  await logActivity({
    type: "approval",
    title: "Approval accepted",
    message: `${po.poNumber} was generated from the approved quotation.`,
    entityType: "PurchaseOrder",
    entityId: po._id.toString(),
    createdBy: req.user.id,
  });

  res.json({ approval, purchaseOrder: po });
});

router.put("/:id/reject", auth(["admin", "manager"]), async (req, res) => {
  const approval = await Approval.findByIdAndUpdate(
    req.params.id,
    {
      status: "rejected",
      remarks: req.body.remarks,
      approvedBy: req.user.id,
    },
    { new: true }
  );

  await logActivity({
    type: "approval",
    title: "Approval rejected",
    message: "A procurement request was rejected by manager.",
    entityType: "Approval",
    entityId: approval._id.toString(),
    createdBy: req.user.id,
  });

  res.json(approval);
});

module.exports = router;
