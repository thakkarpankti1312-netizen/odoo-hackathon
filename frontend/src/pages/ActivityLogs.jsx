import { useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/feedback";

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadLogs = async () => {
    try {
      const res = await API.get("/activity");
      setLogs(res.data);
      setFeedback({ type: "", message: "" });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load activity logs") });
    }
  };

  useEffect(() => {
    loadLogs().catch(() => {});
    const timer = setInterval(() => loadLogs().catch(() => {}), 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Notifications and audit</p>
          <h2>Activity timeline</h2>
          <p>Track RFQ notifications, approval alerts, invoice updates, and audit logs.</p>
        </div>
        <Bell size={24} />
      </div>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={loadLogs}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {feedback.message && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}

      <div className="panel">
        <div className="activity-list">
          {logs.length === 0 ? (
            <div className="empty-state">
              <div>
                <h3>No activity yet</h3>
                <p>Create vendors, RFQs, quotations, approvals, and invoices to build the audit trail.</p>
              </div>
            </div>
          ) : (
            logs.map((log) => (
              <div className="activity-item" key={log._id}>
                <span />
                <div>
                  <strong>{log.title}</strong>
                  <p>{log.message}</p>
                  <small>{new Date(log.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ActivityLogs;
