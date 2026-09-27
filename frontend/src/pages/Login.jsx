import React, { useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, ArrowRight } from "lucide-react";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const Auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRoleRedirect = (role) => {
    switch (role) {
      case "ADMIN":
      case "SUPER_ADMIN":
        navigate("/admin");
        break;
      case "TEACHER":
        navigate("/teacher");
        break;
      case "PARENT":
        navigate("/parent");
        break;
      case "STUDENT":
        navigate("/student");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        Auth.loginUser(res.data.data);
        handleRoleRedirect(res.data.data.user.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Auto-Fill
  const fillDemoCreds = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-[460px] rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#304b62] p-8 text-white text-center relative">
          <div className="w-14 h-14 bg-[#d49539] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock size={26} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Portal Login</h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Access your Coaching Admin, Teacher, Parent, or Student account
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs md:text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email or Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm text-slate-800"
                  placeholder="name@successmentor.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d49539] hover:bg-[#c0832d] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Log In to Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
              ⚡ Quick 1-Click Demo Credentials
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoCreds("admin@successmentor.com", "adminpassword123")}
                className="p-2 rounded-lg bg-slate-100 hover:bg-[#304b62] hover:text-white transition-colors font-semibold text-slate-700 text-left"
              >
                👑 <strong>Admin</strong>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCreds("rajesh@successmentor.com", "teacherpassword123")}
                className="p-2 rounded-lg bg-slate-100 hover:bg-[#304b62] hover:text-white transition-colors font-semibold text-slate-700 text-left"
              >
                👨‍🏫 <strong>Teacher</strong>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCreds("parent@successmentor.com", "parentpassword123")}
                className="p-2 rounded-lg bg-[#f6d6a0]/30 hover:bg-[#d49539] hover:text-white transition-colors font-semibold text-slate-700 text-left"
              >
                👩‍👦 <strong>Parent (Sunita)</strong>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCreds("aarav@successmentor.com", "studentpassword123")}
                className="p-2 rounded-lg bg-slate-100 hover:bg-[#304b62] hover:text-white transition-colors font-semibold text-slate-700 text-left"
              >
                🎒 <strong>Student (Aarav)</strong>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Want to register a new institute?{" "}
            <Link to="/signup" className="text-[#304b62] font-bold hover:underline">
              Register Institute Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
