import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-hot-toast";

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    paymentMethod: "Credit Card",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.amount || Number(formData.amount) <= 0) errs.amount = "Amount must be a positive number";
    if (!formData.category) errs.category = "Category must be selected";
    if (!formData.date || isNaN(new Date(formData.date).getTime())) errs.date = "Valid date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/transaction", { ...formData, amount: Number(formData.amount) });
      toast.success("Transaction successfully added!");
      navigate("/viewer");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  const categories = formData.type === "expense" 
    ? ["Food", "Transport", "Shopping", "Utilities", "Health", "Other"]
    : ["Salary", "Freelance", "Investment", "Gift", "Other"];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Add New Transaction</h1>
      <p className="text-slate-500 mb-8">Record your latest income or expense details here.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Transaction Type</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "income", category: "" })}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.type === "income" ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : "bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100"
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.type === "expense" ? "bg-red-100 text-red-700 border-2 border-red-500" : "bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100"
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Amount ($)</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); setErrors({"amount": null}) }}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1 font-semibold ml-1">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                value={formData.category}
                onChange={(e) => { setFormData({ ...formData, category: e.target.value }); setErrors({"category": null}) }}
              >
                <option value="" disabled>Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1 font-semibold ml-1">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input 
                type="date" 
                required 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Payment Method</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Notes (Optional)</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows="3"
                placeholder="Write any additional notes here..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransaction;
