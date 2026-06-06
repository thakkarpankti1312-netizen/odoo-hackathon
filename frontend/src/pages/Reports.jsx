import { useEffect, useState } from "react";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/feedback";

function Reports() {
  const [summary, setSummary] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadReports = async () => {
    try {
      const res = await API.get("/reports/summary");
      setSummary(res.data);
      setFeedback({ type: "", message: "" });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load reports") });
    }
  };

  useEffect(() => {
    loadReports().catch(() => {});
    const timer = setInterval(() => loadReports().catch(() => {}), 20000);
    return () => clearInterval(timer);
  }, []);

  const cards = summary?.cards || {};

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Reports and analytics</p>
          <h2>Procurement insights and trends</h2>
          <p>Monitor vendor performance, spending summaries, procurement statistics, and monthly trends.</p>
        </div>
        <BarChart3 size={24} />
      </div>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={loadReports}>
          <RefreshCw size={16} />
          Refresh
        </button>
        <button className="secondary-button" type="button" onClick={() => window.print()}>
          <Download size={16} />
          Export
        </button>
      </div>

      {feedback.message && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}

      <section className="stats-row">
        <article className="metric-card"><span>Vendors</span><strong>{cards.totalVendors || 0}</strong><p>Registered suppliers</p></article>
        <article className="metric-card"><span>Active RFQs</span><strong>{cards.activeRfqs || 0}</strong><p>Open or in approval</p></article>
        <article className="metric-card"><span>Total spend</span><strong>Rs. {Math.round(cards.totalSpend || 0)}</strong><p>Generated invoices</p></article>
        <article className="metric-card"><span>Pending approvals</span><strong>{cards.pendingApprovals || 0}</strong><p>Manager queue</p></article>
      </section>

      <section className="content-split">
        <div className="table-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Vendor performance</p>
              <h2>Quotation conversion</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Vendor</th><th>Quotations</th><th>Selected</th></tr>
              </thead>
              <tbody>
                {(summary?.vendorPerformance || []).map((vendor) => (
                  <tr key={vendor.vendor}>
                    <td>{vendor.vendor}</td>
                    <td>{vendor.quotations}</td>
                    <td>{vendor.selected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Monthly trend</p>
              <h2>Spend summary</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Month</th><th>Spend</th></tr>
              </thead>
              <tbody>
                {(summary?.monthlyTrends || []).map((trend) => (
                  <tr key={trend.month}>
                    <td>{trend.month}</td>
                    <td>Rs. {Math.round(trend.spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Reports;
