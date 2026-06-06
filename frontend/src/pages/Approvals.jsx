import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/feedback";

function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const loadApprovals = async () => {
    try {
      const res = await API.get("/approvals/pending");
      setApprovals(res.data);
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load approvals") });
    }
  };

  const approve = async (id) => {
    setLoading(true);
    try {
      await API.put(`/approvals/${id}/approve`, { remarks });
      setFeedback({ type: "success", message: "Approved and purchase order generated" });
      setRemarks("");
      loadApprovals();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to approve request") });
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id) => {
    setLoading(true);
    try {
      await API.put(`/approvals/${id}/reject`, { remarks });
      setFeedback({ type: "success", message: "Request rejected" });
      setRemarks("");
      loadApprovals();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to reject request") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
    const timer = setInterval(loadApprovals, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Manager approval</p>
          <h2>Review selected quotations</h2>
          <p>Approve requests to automatically generate purchase orders.</p>
        </div>
        <ShieldCheck size={24} />
      </div>

      <div className="form-card">
        {feedback.message && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}
        <div className="field">
          <label htmlFor="remarks">Approval remarks</label>
          <input
            id="remarks"
            placeholder="Add decision notes"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
      </div>

      <div className="approval-list">
        {approvals.length === 0 ? (
          <div className="empty-state">
            <div>
              <h3>No pending approvals</h3>
              <p>Selected quotations will appear here once procurement sends them for review.</p>
            </div>
          </div>
        ) : (
          approvals.map((item) => (
            <article className="approval-card" key={item._id}>
              <div className="section-heading">
                <div>
                  <h3>{item.quotation?.rfq?.title || "Procurement request"}</h3>
                  <p>{item.quotation?.rfq?.description || "Quotation waiting for decision"}</p>
                </div>
                <span className="status-pill">{item.status}</span>
              </div>

              <div className="approval-meta">
                <div>
                  <span>Vendor</span>
                  <strong>{item.quotation?.vendor?.name || "Vendor"}</strong>
                </div>
                <div>
                  <span>Price</span>
                  <strong>Rs. {item.quotation?.price || 0}</strong>
                </div>
                <div>
                  <span>Delivery</span>
                  <strong>{item.quotation?.deliveryDays || 0} days</strong>
                </div>
              </div>

              <div className="row-actions">
                <button className="primary-button" type="button" onClick={() => approve(item._id)} disabled={loading}>
                  <CheckCircle2 size={17} />
                  Approve
                </button>
                <button className="danger-button" type="button" onClick={() => reject(item._id)} disabled={loading}>
                  <XCircle size={17} />
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default Approvals;
