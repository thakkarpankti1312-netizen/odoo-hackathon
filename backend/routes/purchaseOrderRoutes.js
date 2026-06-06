const express = require("express");
const PurchaseOrder = require("../models/PurchaseOrder");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth(["admin", "procurement", "manager", "vendor"]), async (req, res) => {
  const purchaseOrders = await PurchaseOrder.find()
    .sort({ createdAt: -1 })
    .populate({
      path: "quotation",
      populate: ["rfq", "vendor"],
    });

  res.json(purchaseOrders);
});

module.exports = router;
