const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("VendorBridge API running");
});


// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/vendors", require("./routes/vendorRoutes"));
// app.use("/api/rfqs", require("./routes/rfqRoutes"));
// app.use("/api/quotations", require("./routes/quotationRoutes"));
// app.use("/api/approvals", require("./routes/approvalRoutes"));
// app.use("/api/invoices", require("./routes/invoiceRoutes"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

