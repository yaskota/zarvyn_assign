import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email is required";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      
      toast.success(res.data.message);
      
      login(res.data.user, res.data.token || "token-in-cookie");

      if (res.data.user.role === "admin") navigate("/admin");
      else if (res.data.user.role === "analyst") navigate("/analyst");
      else navigate("/viewer");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Welcome Back
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Sign in to manage your finances seamlessly</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                required
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: null}) }}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-semibold">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                required
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: null}) }}
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 ml-1 font-semibold">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
            {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create account
          </Link>
        </p>

        {/* Demo Credentials Section */}
        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">Demo Accounts</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium text-emerald-400">Analyst:</span>
              <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded">analyst@gmail.com</span>
              <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded">123456</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium text-blue-400">Admin:</span>
              <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded">admin@gmail.com</span>
              <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded">123456</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;