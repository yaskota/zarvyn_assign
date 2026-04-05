import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Users, Filter } from "lucide-react";

const AnalystDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [analystData, setAnalystData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?search=${search}`);
      setUsers(res.data.users);
      if (!selectedUser && res.data.users.length > 0) {
         setSelectedUser(res.data.users[0]._id);
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/analytics?userId=${selectedUser}`);
      setAnalystData(res.data.data);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel: Accounts List */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <Users className="mr-2 h-5 w-5 text-blue-500" /> Accounts
            </h2>
            <div className="mt-4">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {users.map(u => (
              <div 
                key={u._id} 
                onClick={() => setSelectedUser(u._id)}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedUser === u._id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
              >
                <div className="font-semibold text-slate-800 text-sm">{u.name}</div>
                <div className="text-xs text-slate-500 mb-2">{u.email}</div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-emerald-600">IN: ${u.income || 0}</span>
                  <span className="text-red-500">EX: ${u.expense || 0}</span>
                  <span className="text-blue-600">BAL: ${u.balance || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Analytics */}
        <div className="w-full md:w-2/3 space-y-6">
          {!loading && analystData ? (
            <>
              {/* Category Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Category Distribution</h3>
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

              {/* Monthly Trends */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Trends</h3>
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
            </>
          ) : (
             <div className="bg-white h-full rounded-2xl flex items-center justify-center border border-slate-100 text-slate-500">
               {loading ? "Loading analytics..." : "Select a user to view insights"}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalystDashboard;
