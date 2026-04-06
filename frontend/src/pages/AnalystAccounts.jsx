import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { Users, Filter } from "lucide-react";

const AnalystAccounts = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    if (selectedUser) {
      fetchTransactions();
    }
  }, [selectedUser, filters]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?role=viewer&search=${search}`);
      setUsers(res.data.users);
      if (!selectedUser && res.data.users.length > 0) {
        setSelectedUser(res.data.users[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const q = new URLSearchParams({
        userId: selectedUser,
        limit: 100,
        ...(filters.category && { category: filters.category }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      }).toString();

      const res = await api.get(`/transaction?${q}`);
      setTransactions(res.data.transactions);
    } catch (err) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoadingTx(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-6">
        
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <Users className="mr-2 h-5 w-5 text-blue-500" /> Viewer Accounts
            </h2>
            <div className="mt-4">
              <input 
                type="text" 
                placeholder="Search viewers..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? <p className="text-center p-4 text-slate-500">Loading...</p> : users.map(u => (
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

        
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Category</label>
                <input type="text" name="category" placeholder="e.g. Food" value={filters.category} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
             </div>
             <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">From</label>
                <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
             </div>
             <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">To</label>
                <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
             </div>
             <button onClick={() => setFilters({ category: "", dateFrom: "", dateTo: "" })} className="border border-slate-200 hover:bg-slate-50 rounded-lg p-2.5 text-slate-600 transition flex items-center justify-center">
                <Filter size={20} />
             </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">User Transactions</div>
            <div className="overflow-x-auto flex-1 p-0">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100/50">
                     <tr>
                        <th className="py-3 px-6 font-semibold text-slate-500 uppercase text-xs">Date</th>
                        <th className="py-3 px-6 font-semibold text-slate-500 uppercase text-xs">Type</th>
                        <th className="py-3 px-6 font-semibold text-slate-500 uppercase text-xs">Category</th>
                        <th className="py-3 px-6 font-semibold text-slate-500 uppercase text-xs">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {loadingTx ? (
                        <tr><td colSpan="4" className="py-10 text-center text-slate-500">Loading...</td></tr>
                     ) : transactions.length === 0 ? (
                        <tr><td colSpan="4" className="py-10 text-center text-slate-500">No transactions found.</td></tr>
                     ) : (
                        transactions.map(tx => (
                           <tr key={tx._id} className="hover:bg-slate-50">
                              <td className="py-4 px-6">{new Date(tx.date).toLocaleDateString()}</td>
                              <td className="py-4 px-6">
                                 <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {tx.type}
                                 </span>
                              </td>
                              <td className="py-4 px-6">{tx.category}</td>
                              <td className="py-4 px-6 font-bold text-slate-800">${tx.amount.toFixed(2)}</td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalystAccounts;
