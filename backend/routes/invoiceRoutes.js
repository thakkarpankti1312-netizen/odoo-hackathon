const express = require("express");
const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");
const auth = require("../middleware/authMiddleware");
const logActivity = require("../utils/logActivity");

const router = express.Router();

router.post("/", auth(["admin", "procurement"]), async (req, res) => {
  const po = await PurchaseOrder.findById(req.body.purchaseOrder);

  if (!po) {
    return res.status(404).json({ message: "Purchase order not found" });
  }

  const existingInvoice = await Invoice.findOne({ purchaseOrder: po._id });
  if (existingInvoice) {
    return res.status(200).json(existingInvoice);
  }

  const subtotal = po.amount;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${Date.now()}`,
    purchaseOrder: po._id,
    subtotal,
    gst,
    total,
  });

  await PurchaseOrder.findByIdAndUpdate(po._id, { status: "invoiced" });

  await logActivity({
    type: "invoice",
    title: "Invoice generated",
    message: `${invoice.invoiceNumber} was generated with total Rs. ${total}.`,
    entityType: "Invoice",
    entityId: invoice._id.toString(),
    createdBy: req.user.id,
  });

  res.status(201).json(invoice);
});

router.get("/", auth(["admin", "procurement", "manager"]), async (req, res) => {
  const invoices = await Invoice.find()
    .sort({ createdAt: -1 })
    .populate({
      path: "purchaseOrder",
      populate: {
        path: "quotation",
        populate: ["rfq", "vendor"],
      },
    });
  res.json(invoices);
});

router.put("/:id/status", auth(["admin", "procurement"]), async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  await logActivity({
    type: "invoice",
    title: "Invoice status updated",
    message: `${invoice.invoiceNumber} status changed to ${invoice.status}.`,
    entityType: "Invoice",
    entityId: invoice._id.toString(),
    createdBy: req.user.id,
  });

  res.json(invoice);
});

module.exports = router;
