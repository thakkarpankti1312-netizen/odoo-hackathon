import { useEffect, useState } from "react";
import { CheckCircle2, GitCompare, RefreshCw, Search } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/feedback";

function CompareQuotations() {
  const [rfqId, setRfqId] = useState("");
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [sortBy, setSortBy] = useState("price");
  const [statusFilter, setStatusFilter] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const loadQuotations = async () => {
    if (!rfqId) {
      setFeedback({ type: "error", message: "Please select an RFQ first" });
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/quotations/rfq/${rfqId}`);
      setQuotations(res.data);
      setFeedback({ type: "success", message: `${res.data.length} quotation(s) loaded` });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load quotations") });
    } finally {
      setLoading(false);
    }
  };

  const loadRfqs = async () => {
    try {
      const res = await API.get("/rfqs");
      setRfqs(res.data);
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load RFQs") });
    }
  };

  useEffect(() => {
    loadRfqs().catch(() => {});
    const timer = setInterval(() => {
      loadRfqs().catch(() => {});
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const selectQuotation = async (id) => {
    setLoading(true);
    try {
      await API.put(`/quotations/${id}/select`);
      await API.post("/approvals", { quotation: id });
      setFeedback({ type: "success", message: "Quotation selected and sent for approval" });
      loadQuotations();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to select quotation") });
    } finally {
      setLoading(false);
    }
  };

  const lowestPrice =
    quotations.length > 0 ? Math.min(...quotations.map((q) => q.price)) : 0;

  const visibleQuotations = quotations
    .filter((q) => !statusFilter || q.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "delivery") return a.deliveryDays - b.deliveryDays;
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return a.price - b.price;
    });

  const getRating = (quotation) => {
    if (quotation.price === lowestPrice && quotation.deliveryDays <= 7) return "A";
    if (quotation.price === lowestPrice || quotation.deliveryDays <= 10) return "B";
    return "C";
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Quotation comparison</p>
          <h2>Compare vendor offers side by side</h2>
          <p>Load quotations by RFQ ID, identify the best price, and send one for approval.</p>
        </div>
        <GitCompare size={24} />
      </div>

      <div className="form-card">
        {feedback.message && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="rfq-search">RFQ ID</label>
            <select
              id="rfq-search"
              value={rfqId}
              onChange={(e) => setRfqId(e.target.value)}
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
            <label htmlFor="sortBy">Sort by</label>
            <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="price">Lowest price</option>
              <option value="delivery">Fastest delivery</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="statusFilter">Filter status</label>
            <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="submitted">Submitted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="button" onClick={loadQuotations} disabled={loading}>
            <Search size={17} />
            {loading ? "Loading..." : "Load Quotations"}
          </button>
          <button className="secondary-button" type="button" onClick={loadRfqs}>
            <RefreshCw size={16} />
            Refresh RFQs
          </button>
        </div>
      </div>

      <div className="table-card">
        {quotations.length === 0 ? (
          <div className="empty-state">
            <div>
              <h3>No quotations loaded</h3>
              <p>Enter an RFQ ID above to compare vendor pricing, delivery time, and remarks.</p>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Price</th>
                  <th>Delivery</th>
                  <th>Rating</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleQuotations.map((q) => (
                  <tr key={q._id}>
                    <td>{q.vendor?.name || "Vendor"}</td>
                    <td className={q.price === lowestPrice ? "best-price" : ""}>
                      Rs. {q.price}
                    </td>
                    <td>{q.deliveryDays} days</td>
                    <td><span className="rating-badge">{getRating(q)}</span></td>
                    <td>{q.notes || "No notes"}</td>
                    <td>
                      <span className="status-pill">{q.status}</span>
                    </td>
                    <td>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => selectQuotation(q._id)}
                      >
                        <CheckCircle2 size={16} />
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default CompareQuotations;
