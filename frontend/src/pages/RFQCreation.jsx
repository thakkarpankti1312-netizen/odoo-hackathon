import { useEffect, useState } from "react";
import { ClipboardList, Plus, RefreshCw } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/feedback";

function RFQCreation() {
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    quantity: "",
    deadline: "",
    attachmentName: "",
    vendors: [],
  });

  const loadData = async () => {
    try {
      const [vendorRes, rfqRes] = await Promise.all([API.get("/vendors"), API.get("/rfqs")]);
      setVendors(vendorRes.data);
      setRfqs(rfqRes.data);
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load RFQ data") });
    }
  };

  useEffect(() => {
    loadData().catch(() => {});
    const timer = setInterval(() => loadData().catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, []);

  const updateVendorSelection = (vendorId) => {
    setForm((current) => ({
      ...current,
      vendors: current.vendors.includes(vendorId)
        ? current.vendors.filter((id) => id !== vendorId)
        : [...current.vendors, vendorId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });
    try {
      await API.post("/rfqs", {
        ...form,
        quantity: Number(form.quantity),
      });
      setFeedback({ type: "success", message: "RFQ created and assigned to vendors" });
      setForm({ title: "", description: "", quantity: "", deadline: "", attachmentName: "", vendors: [] });
      loadData();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to create RFQ") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RFQ management</p>
          <h2>Create RFQs and assign vendors</h2>
          <p>Initiate procurement with quantity, deadline, attachment name, and vendor assignment.</p>
        </div>
        <ClipboardList size={24} />
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {feedback.message && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="title">RFQ title</label>
            <input
              id="title"
              value={form.title}
              placeholder="Laptop procurement"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              value={form.quantity}
              placeholder="25"
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="deadline">Deadline</label>
            <input
              id="deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="attachment">Attachment name</label>
            <input
              id="attachment"
              value={form.attachmentName}
              placeholder="requirements.pdf"
              onChange={(e) => setForm({ ...form, attachmentName: e.target.value })}
            />
          </div>
          <div className="field full">
            <label htmlFor="description">Product or service details</label>
            <textarea
              id="description"
              value={form.description}
              placeholder="Specifications, delivery location, warranty, and terms"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="field full">
            <label>Assign vendors</label>
            <div className="check-grid">
              {vendors.map((vendor) => (
                <label className="check-card" key={vendor._id}>
                  <input
                    type="checkbox"
                    checked={form.vendors.includes(vendor._id)}
                    onChange={() => updateVendorSelection(vendor._id)}
                  />
                  <span>{vendor.name}</span>
                  <small>{vendor.category}</small>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            <Plus size={17} />
            {loading ? "Creating..." : "Create RFQ"}
          </button>
          <button className="secondary-button" type="button" onClick={loadData}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </form>

      <div className="table-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RFQ list</p>
            <h2>Created requests</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>RFQ ID</th>
                <th>Title</th>
                <th>Quantity</th>
                <th>Deadline</th>
                <th>Vendors</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => (
                <tr key={rfq._id}>
                  <td>{rfq._id}</td>
                  <td>{rfq.title}</td>
                  <td>{rfq.quantity}</td>
                  <td>{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : "-"}</td>
                  <td>{rfq.vendors?.length || 0}</td>
                  <td><span className="status-pill">{rfq.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default RFQCreation;
