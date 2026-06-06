import { useEffect, useState } from "react";
import { Building2, RefreshCw, Save, Search } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/feedback";

function AddVendor() {
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    gstNumber: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      const res = await API.get(`/vendors?${params.toString()}`);
      setVendors(res.data);
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load vendors") });
    }
  };

  useEffect(() => {
    loadVendors().catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });
    try {
      await API.post("/vendors", form);
      setFeedback({ type: "success", message: "Vendor added successfully" });
      setForm({
        name: "",
        category: "",
        gstNumber: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
      });
      loadVendors();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to add vendor") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Vendor master</p>
          <h2>Register and manage vendor details</h2>
          <p>Add suppliers with GST, category, contact, and current status.</p>
        </div>
        <Building2 size={24} />
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {feedback.message && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="vendor-name">Vendor name</label>
            <input
              id="vendor-name"
              value={form.name}
              placeholder="Apex Traders"
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              value={form.category}
              placeholder="IT Hardware"
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="gst">GST number</label>
            <input
              id="gst"
              value={form.gstNumber}
              placeholder="24ABCDE1234F1Z5"
              onChange={(e) => handleChange("gstNumber", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              placeholder="vendor@example.com"
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              value={form.phone}
              placeholder="+91 98765 43210"
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              value={form.address}
              placeholder="Office address"
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            <Save size={17} />
            {loading ? "Saving..." : "Save Vendor"}
          </button>
        </div>
      </form>

      <div className="table-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vendor records</p>
            <h2>Search and filter vendors</h2>
          </div>
        </div>

        <div className="form-grid compact">
          <div className="field">
            <label htmlFor="vendor-search">Search</label>
            <input
              id="vendor-search"
              value={filters.search}
              placeholder="Name, email, or GST"
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="vendor-status">Status</label>
            <select
              id="vendor-status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={loadVendors}>
            <Search size={16} />
            Apply
          </button>
          <button className="secondary-button" type="button" onClick={loadVendors}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>GST</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>{vendor._id}</td>
                  <td>{vendor.name}</td>
                  <td>{vendor.category}</td>
                  <td>{vendor.gstNumber}</td>
                  <td>{vendor.email}<br />{vendor.phone}</td>
                  <td><span className="status-pill">{vendor.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AddVendor;
