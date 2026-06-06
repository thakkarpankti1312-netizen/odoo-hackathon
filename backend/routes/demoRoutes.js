const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const RFQ = require("../models/RFQ");
const Quotation = require("../models/Quotation");
const Approval = require("../models/Approval");
const PurchaseOrder = require("../models/PurchaseOrder");
const Invoice = require("../models/Invoice");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();

const demoUsers = [
  { name: "Admin User", email: "admin@test.com", password: "password123", role: "admin" },
  { name: "Priya Procurement", email: "procurement@test.com", password: "password123", role: "procurement" },
  { name: "Apex Vendor", email: "vendor@test.com", password: "password123", role: "vendor" },
  { name: "Manager Approver", email: "manager@test.com", password: "password123", role: "manager" },
];

router.post("/seed", async (req, res) => {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = {};
  for (const user of demoUsers) {
    users[user.role] = await User.findOneAndUpdate(
      { email: user.email },
      { ...user, password: hashedPassword },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  const vendorSeed = [
    {
      name: "Apex Traders",
      category: "IT Hardware",
      gstNumber: "24APEX1234F1Z5",
      email: "sales@apextraders.com",
      phone: "+91 98765 43210",
      address: "Ahmedabad, Gujarat",
      status: "active",
    },
    {
      name: "GreenPack Supplies",
      category: "Office Supplies",
      gstNumber: "24GREEN9876K1Z2",
      email: "orders@greenpack.com",
      phone: "+91 99887 77665",
      address: "Vadodara, Gujarat",
      status: "active",
    },
    {
      name: "SwiftLogix",
      category: "Logistics",
      gstNumber: "24SWIFT5555P1Z1",
      email: "quote@swiftlogix.com",
      phone: "+91 90990 11223",
      address: "Surat, Gujarat",
      status: "active",
    },
  ];

  const vendors = [];
  for (const vendor of vendorSeed) {
    vendors.push(
      await Vendor.findOneAndUpdate(
        { gstNumber: vendor.gstNumber },
        vendor,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
    );
  }

  const rfq = await RFQ.findOneAndUpdate(
    { title: "Laptop procurement for engineering team" },
    {
      title: "Laptop procurement for engineering team",
      description: "25 business laptops with 16GB RAM, 512GB SSD, 3-year warranty, and delivery to HQ.",
      quantity: 25,
      attachmentName: "laptop-requirements.pdf",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      vendors: vendors.map((vendor) => vendor._id),
      status: "approval",
      createdBy: users.procurement._id,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const quotationSeed = [
    {
      rfq: rfq._id,
      vendor: vendors[0]._id,
      price: 1225000,
      deliveryDays: 8,
      notes: "Includes 3-year warranty and onsite support.",
      status: "selected",
    },
    {
      rfq: rfq._id,
      vendor: vendors[1]._id,
      price: 1290000,
      deliveryDays: 6,
      notes: "Fastest delivery with standard warranty.",
      status: "submitted",
    },
    {
      rfq: rfq._id,
      vendor: vendors[2]._id,
      price: 1255000,
      deliveryDays: 10,
      notes: "Bundled delivery and installation support.",
      status: "submitted",
    },
  ];

  const quotations = [];
  for (const quotation of quotationSeed) {
    quotations.push(
      await Quotation.findOneAndUpdate(
        { rfq: quotation.rfq, vendor: quotation.vendor },
        quotation,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
    );
  }

  const approval = await Approval.findOneAndUpdate(
    { quotation: quotations[0]._id },
    { quotation: quotations[0]._id, status: "pending" },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const purchaseOrder = await PurchaseOrder.findOneAndUpdate(
    { quotation: quotations[0]._id },
    {
      poNumber: `PO-${Date.now()}`,
      quotation: quotations[0]._id,
      amount: quotations[0].price,
      status: "generated",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const subtotal = purchaseOrder.amount;
  const gst = subtotal * 0.18;
  const invoice = await Invoice.findOneAndUpdate(
    { purchaseOrder: purchaseOrder._id },
    {
      invoiceNumber: `INV-${Date.now()}`,
      purchaseOrder: purchaseOrder._id,
      subtotal,
      gst,
      total: subtotal + gst,
      status: "generated",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await ActivityLog.insertMany([
    {
      type: "rfq",
      title: "Demo RFQ created",
      message: `${rfq.title} was created and assigned to ${vendors.length} vendors.`,
      entityType: "RFQ",
      entityId: rfq._id.toString(),
      createdBy: users.procurement._id,
    },
    {
      type: "quotation",
      title: "Demo quotations received",
      message: "Three vendor quotations are ready for comparison.",
      entityType: "RFQ",
      entityId: rfq._id.toString(),
      createdBy: users.procurement._id,
    },
    {
      type: "invoice",
      title: "Demo invoice generated",
      message: `${invoice.invoiceNumber} was generated from ${purchaseOrder.poNumber}.`,
      entityType: "Invoice",
      entityId: invoice._id.toString(),
      createdBy: users.procurement._id,
    },
  ]);

  res.status(201).json({
    message: "Demo workspace created",
    credentials: demoUsers.map(({ email, password, role }) => ({ email, password, role })),
    ids: {
      rfqId: rfq._id,
      vendorId: vendors[0]._id,
      quotationId: quotations[0]._id,
      approvalId: approval._id,
      purchaseOrderId: purchaseOrder._id,
      invoiceId: invoice._id,
    },
  });
});

module.exports = router;
