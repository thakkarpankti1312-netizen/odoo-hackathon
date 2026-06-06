import { useEffect, useState } from "react";
import { FileText, RefreshCw, Send } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/feedback";

function SubmitQuotation() {
  const [form, setForm] = useState({
    quotationId: "",
    rfqId: "",
    vendorId: "",
    price: "",
    deliveryDays: "",
    notes: "",
  });
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const loadOptions = async () => {
    try {
      const [rfqRes, vendorRes] = await Promise.all([API.get("/rfqs"), API.get("/vendors")]);
      setRfqs(rfqRes.data);
      setVendors(vendorRes.data);
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load RFQs/vendors") });
    }
  };

  useEffect(() => {
    loadOptions().catch(() => {});
  }, []);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      if (form.quotationId) {
        await API.put(`/quotations/${form.quotationId}`, {
          price: Number(form.price),
          deliveryDays: Number(form.deliveryDays),
          notes: form.notes,
        });
        setFeedback({ type: "success", message: "Quotation updated successfully" });
      } else {
        await API.post("/quotations", {
          rfq: form.rfqId,
          vendor: form.vendorId,
          price: Number(form.price),
          deliveryDays: Number(form.deliveryDays),
          notes: form.notes,
        });
        setFeedback({ type: "success", message: "Quotation submitted successfully" });
      }
      setForm({ quotationId: "", rfqId: "", vendorId: "", price: "", deliveryDays: "", notes: "" });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to save quotation") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Vendor quotation</p>
          <h2>Submit pricing and delivery commitment</h2>
          <p>Use the RFQ ID and vendor ID generated from the procurement flow.</p>
        </div>
        <FileText size={24} />
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {feedback.message && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="quotationId">Quotation ID for edit</label>
            <input
              id="quotationId"
              value={form.quotationId}
              placeholder="Leave empty for new quotation"
              onChange={(e) => handleChange("quotationId", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="rfqId">RFQ ID</label>
            <select
              id="rfqId"
              value={form.rfqId}
              onChange={(e) => handleChange("rfqId", e.target.value)}
            >
              <option value="">Select RFQ</option>
              {rfqs.map((rfq) => (
                <option key={rfq._id} value={rfq._id}>
                  {rfq.title} - {rfq.status}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="vendorId">Vendor ID</label>
            <select
              id="vendorId"
              value={form.vendorId}
              onChange={(e) => handleChange("vendorId", e.target.value)}
            >
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name} - {vendor.category}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="price">Quoted price</label>
            <input
              id="price"
              type="number"
              value={form.price}
              placeholder="125000"
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="deliveryDays">Delivery days</label>
            <input
              id="deliveryDays"
              type="number"
              value={form.deliveryDays}
              placeholder="7"
              onChange={(e) => handleChange("deliveryDays", e.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={form.notes}
              placeholder="Warranty, delivery terms, payment notes"
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            <Send size={17} />
            {loading ? "Saving..." : "Submit Quotation"}
          </button>
          <button className="secondary-button" type="button" onClick={loadOptions}>
            <RefreshCw size={16} />
            Refresh Lists
          </button>
        </div>
      </form>
    </section>
  );
}

export default SubmitQuotation;
