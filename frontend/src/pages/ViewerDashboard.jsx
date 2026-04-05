import React, { useEffect, useState } from "react";
import api from "../services/api";
import { ArrowUpRight, ArrowDownRight, Wallet, Activity } from "lucide-react";
import { toast } from "react-hot-toast";

const ViewerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/dashboard/summary");
      setSummary(res.data.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading Dashboard...</div>;
  if (!summary) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Your financial summary at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Balance</p>
            <h3 className="text-3xl font-bold text-slate-800">${summary.balance?.toFixed(2) || "0.00"}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Wallet size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Income</p>
            <h3 className="text-3xl font-bold text-emerald-600">+${summary.totalIncome?.toFixed(2) || "0.00"}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
            <h3 className="text-3xl font-bold text-red-600">-${summary.totalExpense?.toFixed(2) || "0.00"}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <ArrowDownRight size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-500" />
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto">
          {summary.recentTransactions?.length === 0 ? (
            <p className="text-center text-slate-500 py-6">No recent transactions found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Category</th>
                  <th className="py-4 px-6 font-medium">Type</th>
                  <th className="py-4 px-6 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 text-sm">
                {summary.recentTransactions?.map(tx => (
                  <tr key={tx._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {tx.type === "income" ? (
                        <span className="text-emerald-600 font-medium flex items-center">
                          <ArrowUpRight size={14} className="mr-1" /> Income
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium flex items-center">
                          <ArrowDownRight size={14} className="mr-1" /> Expense
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
