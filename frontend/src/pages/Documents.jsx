import { useEffect, useState } from "react";
import { Download, Mail, Printer, Receipt, RefreshCw } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/feedback";

function Documents() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedPo, setSelectedPo] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const loadDocuments = async () => {
    try {
      const [poRes, invoiceRes] = await Promise.all([
        API.get("/purchase-orders"),
        API.get("/invoices"),
      ]);
      setPurchaseOrders(poRes.data);
      setInvoices(invoiceRes.data);
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load documents") });
    }
  };

  useEffect(() => {
    loadDocuments().catch(() => {});
    const timer = setInterval(() => loadDocuments().catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, []);

  const generateInvoice = async () => {
    if (!selectedPo) {
      setFeedback({ type: "error", message: "Please select a purchase order" });
      return;
    }
    setLoading(true);
    try {
      await API.post("/invoices", { purchaseOrder: selectedPo });
      setFeedback({ type: "success", message: "Invoice generated successfully" });
      setSelectedPo("");
      loadDocuments();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to generate invoice") });
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    try {
      await API.put(`/invoices/${id}/status`, { status });
      setFeedback({ type: "success", message: `Invoice marked as ${status}` });
      loadDocuments();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to update invoice") });
    }
  };

  const emailInvoice = async (invoice) => {
    const vendorEmail = invoice.purchaseOrder?.quotation?.vendor?.email || "";
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber}`);
    const body = encodeURIComponent(
      `Hello,\n\nPlease find invoice ${invoice.invoiceNumber}.\nTotal amount: Rs. ${invoice.total}\nStatus: ${invoice.status}\n\nRegards,\nVendorBridge Procurement`
    );
    await updateInvoiceStatus(invoice._id, "sent");
    window.location.href = `mailto:${vendorEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PO and invoice</p>
          <h2>Generate official procurement documents</h2>
          <p>Create invoices from approved purchase orders, calculate GST, print, and mark sent.</p>
        </div>
        <Receipt size={24} />
      </div>

      <div className="form-card">
        {feedback.message && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="po">Approved purchase order</label>
            <select id="po" value={selectedPo} onChange={(e) => setSelectedPo(e.target.value)}>
              <option value="">Select PO</option>
              {purchaseOrders.map((po) => (
                <option key={po._id} value={po._id}>
                  {po.poNumber} - Rs. {po.amount} - {po.status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="primary-button" type="button" onClick={generateInvoice} disabled={loading}>
            <Receipt size={17} />
            {loading ? "Generating..." : "Generate Invoice"}
          </button>
          <button className="secondary-button" type="button" onClick={loadDocuments}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Purchase orders</p>
            <h2>Generated POs</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PO number</th>
                <th>Vendor</th>
                <th>RFQ</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po._id}>
                  <td>{po.poNumber}</td>
                  <td>{po.quotation?.vendor?.name || "-"}</td>
                  <td>{po.quotation?.rfq?.title || "-"}</td>
                  <td>Rs. {po.amount}</td>
                  <td><span className="status-pill">{po.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Invoices</p>
            <h2>Generated invoices</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>Rs. {invoice.subtotal}</td>
                  <td>Rs. {invoice.gst}</td>
                  <td><strong>Rs. {invoice.total}</strong></td>
                  <td><span className="status-pill">{invoice.status}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="secondary-button" type="button" onClick={() => window.print()}>
                        <Printer size={15} />
                        Print
                      </button>
                      <button className="secondary-button" type="button" onClick={() => window.print()}>
                        <Download size={15} />
                        PDF
                      </button>
                      <button className="secondary-button" type="button" onClick={() => emailInvoice(invoice)}>
                        <Mail size={15} />
                        Email
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Documents;
