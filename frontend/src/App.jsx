import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  GitCompare,
  LayoutDashboard,
  LogIn,
  PackageCheck,
  Receipt,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";
import AddVendor from "./pages/AddVendor";
import SubmitQuotation from "./pages/SubmitQuotation";
import CompareQuotations from "./pages/CompareQuotations";
import Approvals from "./pages/Approvals";
import Login from "./pages/Login";
import RFQCreation from "./pages/RFQCreation";
import Documents from "./pages/Documents";
import ActivityLogs from "./pages/ActivityLogs";
import Reports from "./pages/Reports";
import API from "./services/api";
import "./App.css";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/login", label: "Login", icon: LogIn },
  { to: "/add-vendor", label: "Vendors", icon: Building2 },
  { to: "/rfqs", label: "RFQs", icon: ClipboardList },
  { to: "/submit-quotation", label: "Quotation", icon: FileText },
  { to: "/compare-quotations", label: "Compare", icon: GitCompare },
  { to: "/approvals", label: "Approvals", icon: ShieldCheck },
  { to: "/documents", label: "PO & Invoice", icon: Receipt },
  { to: "/activity", label: "Activity", icon: Bell },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

const workflow = [
  { title: "RFQ Created", meta: "Office supplies", status: "Done" },
  { title: "Quotes Received", meta: "3 vendors replied", status: "Live" },
  { title: "Comparison", meta: "Lowest price found", status: "Review" },
  { title: "Approval", meta: "Waiting manager", status: "Pending" },
  { title: "PO + Invoice", meta: "Auto generate", status: "Next" },
];

const recentActivity = [
  "Apex Traders submitted quotation for RFQ-1042",
  "Manager approval pending for laptop procurement",
  "Invoice INV-2026-018 generated from PO-2026-024",
  "New vendor GreenPack Supplies added",
];

function Shell({ children }) {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">VB</div>
          <div>
            <strong>VendorBridge</strong>
            <span>Procurement ERP</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-status">
          <CheckCircle2 size={18} />
          <div>
            <strong>System ready</strong>
            <span>MongoDB and API connected</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Procurement command center</p>
            <h1>Vendor Management ERP</h1>
          </div>
          <div className="top-actions">
            {user ? (
              <div className="user-chip">
                <strong>{user.name}</strong>
                <span>{user.role}</span>
              </div>
            ) : (
              <NavLink className="secondary-button" to="/login">
                Login
              </NavLink>
            )}
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            {user && (
              <button className="primary-button" type="button" onClick={logout}>
                <Send size={17} />
                Logout
              </button>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const loadDashboard = () => {
      API.get("/reports/summary")
        .then((res) => setSummary(res.data))
        .catch(() => setSummary(null));

      API.get("/activity")
        .then((res) => setActivity(res.data.slice(0, 4)))
        .catch(() => setActivity([]));
    };

    if (isLoggedIn) {
      loadDashboard();
      const timer = setInterval(loadDashboard, 15000);
      return () => clearInterval(timer);
    }
  }, []);

  const stats = [
    {
      label: "Active RFQs",
      value: summary?.cards?.activeRfqs ?? "0",
      detail: "Open procurement requests",
      icon: ClipboardList,
    },
    {
      label: "Pending Approvals",
      value: summary?.cards?.pendingApprovals ?? "0",
      detail: "Manager queue",
      icon: ShieldCheck,
    },
    {
      label: "Purchase Orders",
      value: summary?.cards?.purchaseOrders ?? "0",
      detail: "Generated POs",
      icon: PackageCheck,
    },
    {
      label: "Invoices",
      value: summary?.cards?.invoices ?? "0",
      detail: "Generated invoices",
      icon: Receipt,
    },
  ];

  return (
    <div className="dashboard-grid">
      {!isLoggedIn && (
        <div className="notice error">
          Login first to see live ERP data. Use Login &gt; Demo Admin for a ready workspace.
        </div>
      )}
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Live procurement flow</p>
          <h2>Track RFQs, quotations, approvals, POs, and invoices in one place.</h2>
          <p>
            Use this screen as your hackathon demo entry point: start with a vendor, create
            an RFQ, collect quotations, compare, approve, and generate documents.
          </p>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <Truck size={52} />
          <span>RFQ</span>
          <span>Quote</span>
          <span>PO</span>
        </div>
      </section>

      <section className="stats-row">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article className="metric-card" key={item.label}>
              <div className="metric-icon">
                <Icon size={20} />
              </div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="quick-actions panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Quick actions</p>
            <h2>Start the next procurement step</h2>
          </div>
        </div>
        <div className="action-grid">
          <NavLink className="action-card" to="/add-vendor">
            <Building2 size={20} />
            <strong>Add Vendor</strong>
            <span>Register supplier details</span>
          </NavLink>
          <NavLink className="action-card" to="/rfqs">
            <ClipboardList size={20} />
            <strong>Create RFQ</strong>
            <span>Assign vendors and deadline</span>
          </NavLink>
          <NavLink className="action-card" to="/compare-quotations">
            <GitCompare size={20} />
            <strong>Compare Quotes</strong>
            <span>Select the best offer</span>
          </NavLink>
          <NavLink className="action-card" to="/documents">
            <Receipt size={20} />
            <strong>Generate Invoice</strong>
            <span>Create PO-linked invoice</span>
          </NavLink>
        </div>
      </section>

      <section className="content-split">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workflow</p>
              <h2>Current procurement request</h2>
            </div>
            <BarChart3 size={20} />
          </div>
          <div className="workflow-list">
            {workflow.map((step, index) => (
              <div className="workflow-item" key={step.title}>
                <div className="step-number">{index + 1}</div>
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.meta}</span>
                </div>
                <em>{step.status}</em>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Audit trail</p>
              <h2>Recent activity</h2>
            </div>
            <Bell size={20} />
          </div>
          <div className="activity-list">
            {(activity.length ? activity.map((item) => item.message) : recentActivity).map((message) => (
              <div className="activity-item" key={message}>
                <span />
                <p>{message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-vendor" element={<AddVendor />} />
          <Route path="/rfqs" element={<RFQCreation />} />
          <Route path="/submit-quotation" element={<SubmitQuotation />} />
          <Route path="/compare-quotations" element={<CompareQuotations />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/activity" element={<ActivityLogs />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

export default App;
