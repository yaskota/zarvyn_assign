import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const AdminAnalytics = () => {
  const [analystData, setAnalystData] = useState(null);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [month]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const qs = month ? `?month=${month}` : "";
      const res = await api.get(`/dashboard/analytics${qs}`);
      setAnalystData(res.data.data);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">System Analytics Overview</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold text-slate-500">Month:</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
          </div>
        </div>
        
        <div className="w-full space-y-6">
          {!loading && analystData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Category Distribution (All Users)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={analystData.categoryStats}
                        dataKey="total"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analystData.categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Platform Monthly Trends</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analystData.monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                      <Tooltip cursor={{fill: '#F1F5F9'}} />
                      <Legend />
                      <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                      <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-white h-64 rounded-2xl flex items-center justify-center border border-slate-100 text-slate-500">
               {loading ? "Loading analytics..." : "No data available"}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
