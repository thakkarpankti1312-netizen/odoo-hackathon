const express = require("express");
const Approval = require("../models/Approval");
const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");
const Quotation = require("../models/Quotation");
const RFQ = require("../models/RFQ");
const Vendor = require("../models/Vendor");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", auth(["admin", "procurement", "manager"]), async (req, res) => {
  const [
    totalVendors,
    activeRfqs,
    pendingApprovals,
    purchaseOrders,
    invoices,
    quotations,
  ] = await Promise.all([
    Vendor.countDocuments(),
    RFQ.countDocuments({ status: { $in: ["open", "approval"] } }),
    Approval.countDocuments({ status: "pending" }),
    PurchaseOrder.find(),
    Invoice.find(),
    Quotation.find().populate("vendor"),
  ]);

  const totalSpend = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  const monthlySpend = {};

  invoices.forEach((invoice) => {
    const key = invoice.createdAt.toISOString().slice(0, 7);
    monthlySpend[key] = (monthlySpend[key] || 0) + (invoice.total || 0);
  });

  const vendorPerformance = {};
  quotations.forEach((quotation) => {
    const name = quotation.vendor?.name || "Unknown vendor";
    if (!vendorPerformance[name]) {
      vendorPerformance[name] = { vendor: name, quotations: 0, selected: 0 };
    }
    vendorPerformance[name].quotations += 1;
    if (quotation.status === "selected") vendorPerformance[name].selected += 1;
  });

  res.json({
    cards: {
      totalVendors,
      activeRfqs,
      pendingApprovals,
      purchaseOrders: purchaseOrders.length,
      invoices: invoices.length,
      totalSpend,
    },
    monthlyTrends: Object.entries(monthlySpend).map(([month, spend]) => ({ month, spend })),
    vendorPerformance: Object.values(vendorPerformance),
  });
});

module.exports = router;
