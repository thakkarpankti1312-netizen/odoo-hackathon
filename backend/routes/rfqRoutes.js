const express = require("express");
const RFQ = require("../models/RFQ");
const auth = require("../middleware/authMiddleware");
const logActivity = require("../utils/logActivity");

const router = express.Router();

router.post("/", auth(["admin", "procurement"]), async (req, res) => {
  const { title, description, quantity, deadline, vendors = [] } = req.body;

  if (!title || !description || !quantity || !deadline || !vendors.length) {
    return res.status(400).json({
      message: "RFQ title, details, quantity, deadline, and at least one vendor are required",
    });
  }

  const rfq = await RFQ.create({
    ...req.body,
    createdBy: req.user.id,
  });

  await logActivity({
    type: "rfq",
    title: "RFQ created",
    message: `${rfq.title} was created and assigned to ${rfq.vendors.length} vendor(s).`,
    entityType: "RFQ",
    entityId: rfq._id.toString(),
    createdBy: req.user.id,
  });

  res.status(201).json(rfq);
});

router.get("/", auth(["admin", "procurement", "vendor", "manager"]), async (req, res) => {
  const rfqs = await RFQ.find()
    .populate("vendors")
    .populate("createdBy", "name email");

  res.json(rfqs);
});

router.get("/:id", auth(["admin", "procurement", "vendor", "manager"]), async (req, res) => {
  const rfq = await RFQ.findById(req.params.id).populate("vendors");
  res.json(rfq);
});

module.exports = router;
