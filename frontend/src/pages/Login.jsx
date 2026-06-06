import { useState } from "react";
import { KeyRound, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import API from "../services/api";

function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loadingDemo, setLoadingDemo] = useState("");
  const [signup, setSignup] = useState({
    name: "",
    email: "",
    password: "",
    role: "procurement",
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await API.post("/auth/login", form);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    window.location.href = "/dashboard";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    await API.post("/auth/signup", signup);
    alert("Signup successful. You can login now.");
    setMode("login");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) {
      alert("Enter your email first");
      return;
    }
    const res = await API.post("/auth/forgot-password", { email: form.email });
    alert(res.data.message);
  };

  const demoLogin = async (role) => {
    const credentials = {
      admin: "admin@test.com",
      procurement: "procurement@test.com",
      vendor: "vendor@test.com",
      manager: "manager@test.com",
    };

    setLoadingDemo(role);
    try {
      await API.post("/demo/seed");
      const res = await API.post("/auth/login", {
        email: credentials[role],
        password: "password123",
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } finally {
      setLoadingDemo("");
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Secure access</p>
          <h2>Login to VendorBridge</h2>
          <p>Use role-based accounts for procurement, vendors, managers, and admins.</p>
        </div>
        <ShieldCheck size={24} />
      </div>

      <div className="mode-tabs">
        <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>
          Login
        </button>
        <button className={mode === "signup" ? "active" : ""} type="button" onClick={() => setMode("signup")}>
          Signup
        </button>
      </div>

      <div className="demo-panel">
        <div>
          <p className="eyebrow">Hackathon demo</p>
          <h3>One-click setup and login</h3>
          <p>Creates sample vendors, RFQ, quotations, approval, PO, invoice, logs, and reports.</p>
        </div>
        <div className="demo-buttons">
          <button className="primary-button" type="button" onClick={() => demoLogin("admin")}>
            {loadingDemo === "admin" ? "Preparing..." : "Demo Admin"}
          </button>
          <button className="secondary-button" type="button" onClick={() => demoLogin("procurement")}>
            Demo Procurement
          </button>
          <button className="secondary-button" type="button" onClick={() => demoLogin("manager")}>
            Demo Manager
          </button>
          <button className="secondary-button" type="button" onClick={() => demoLogin("vendor")}>
            Demo Vendor
          </button>
        </div>
        <p className="helper-text">All demo accounts use password: password123</p>
      </div>

      {mode === "login" ? (
        <form className="form-card" onSubmit={handleLogin}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="procurement@test.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              <LogIn size={17} />
              Login
            </button>
            <button className="secondary-button" type="button" onClick={handleForgotPassword}>
              <KeyRound size={17} />
              Forgot Password
            </button>
          </div>
        </form>
      ) : (
        <form className="form-card" onSubmit={handleSignup}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="signup-name">Name</label>
              <input
                id="signup-name"
                value={signup.name}
                placeholder="User name"
                onChange={(e) => setSignup({ ...signup, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={signup.email}
                placeholder="user@test.com"
                onChange={(e) => setSignup({ ...signup, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                value={signup.password}
                placeholder="Create password"
                onChange={(e) => setSignup({ ...signup, password: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="signup-role">Role</label>
              <select
                id="signup-role"
                value={signup.role}
                onChange={(e) => setSignup({ ...signup, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="procurement">Procurement Officer</option>
                <option value="vendor">Vendor</option>
                <option value="manager">Manager / Approver</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              <UserPlus size={17} />
              Create Account
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default Login;
