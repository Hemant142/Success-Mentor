import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { School, User, Mail, Phone, Lock, MapPin, ArrowRight } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../Context/AuthContext";

function SignUp() {
  const [formData, setFormData] = useState({
    institute_name: "",
    admin_name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const Auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register-institute", formData);
      if (res.data.success) {
        Auth.loginUser(res.data.data);
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register institute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#304b62] p-8 text-white text-center">
          <div className="w-14 h-14 bg-[#d49539] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <School size={26} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Register Coaching Institute</h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Setup your coaching center on Success Mentor (Classes 1–10)
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Institute / Coaching Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <School size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="institute_name"
                  required
                  placeholder="e.g. Sharma Coaching Classes"
                  value={formData.institute_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="admin_name"
                  required
                  placeholder="e.g. R. K. Sharma"
                  value={formData.admin_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@coaching.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Mobile Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City / Region</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Delhi NCR"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d49539] hover:bg-[#c0832d] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                "Creating Institute..."
              ) : (
                <>
                  Register Institute & Launch <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{" "}
            <Link to="/login" className="text-[#304b62] font-bold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;