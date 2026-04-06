import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { Users, Edit2, Trash2, Search } from "lucide-react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);

  
  const [editingTx, setEditingTx] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    if (selectedUser) {
      fetchTransactions(selectedUser);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/users?search=${search}`);
      setUsers(res.data.users);
      if (!selectedUser && res.data.users.length > 0) {
        setSelectedUser(res.data.users[0]._id);
      }
    } catch (err) {
       toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTransactions = async (userId) => {
    setLoadingTx(true);
    try {
      const res = await api.get(`/transaction?userId=${userId}&limit=100`);
      setTransactions(res.data.transactions);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoadingTx(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/transaction/${id}`);
      toast.success("Transaction deleted");
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/transaction/${editingTx._id}`, editingTx);
      toast.success("Transaction updated");
      setTransactions(transactions.map(t => t._id === editingTx._id ? res.data.transaction : t));
      setEditingTx(null);
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left: User List */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <Users className="mr-2 h-5 w-5 text-purple-600" /> Manage Users
            </h2>
            <div className="relative mt-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loadingUsers ? <p className="text-center p-4 text-sm text-slate-500">Loading...</p> : users.map(u => (
              <div 
                key={u._id} 
                onClick={() => setSelectedUser(u._id)}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedUser === u._id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50 border border-transparent'}`}
              >
                <div className="font-semibold text-slate-800 text-sm flex justify-between">
                  {u.name} <span className="text-xs text-purple-600 uppercase bg-purple-100 px-2 py-0.5 rounded-md">{u.role}</span>
                </div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col max-h-[85vh]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">User Transactions</h2>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4">
            {loadingTx ? (
              <p className="text-center text-slate-500 mt-10">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-slate-500 mt-10">No transactions found for this user.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 bg-slate-50">
                  <tr>
                    <th className="py-3 px-4 rounded-tl-lg font-medium">Date</th>
                    <th className="py-3 px-4 font-medium">Tx Details</th>
                    <th className="py-3 px-4 font-medium">Amount</th>
                    <th className="py-3 px-4 rounded-tr-lg font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                     <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                       <td className="py-3 px-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                       <td className="py-3 px-4">
                         <span className="font-medium text-slate-700">{tx.category}</span>
                         <div className="text-xs text-slate-400 capitalize">{tx.type} • {tx.paymentMethod}</div>
                       </td>
                       <td className="py-3 px-4 font-semibold text-slate-800">
                         ${tx.amount.toFixed(2)}
                       </td>
                       <td className="py-3 px-4 flex space-x-2">
                         <button onClick={() => setEditingTx(tx)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"><Edit2 size={16} /></button>
                         <button onClick={() => handleDelete(tx._id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"><Trash2 size={16} /></button>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      
      {editingTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-slate-800">Edit Transaction</h3>
              <button onClick={() => setEditingTx(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Amount</label>
                  <input type="number" step="0.01" required value={editingTx.amount} onChange={e=>setEditingTx({...editingTx, amount: Number(e.target.value)})} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                  <select value={editingTx.type} onChange={e=>setEditingTx({...editingTx, type: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                     <option value="income">Income</option>
                     <option value="expense">Expense</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <input type="text" required value={editingTx.category} onChange={e=>setEditingTx({...editingTx, category: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
               </div>
               <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setEditingTx(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">Save Changes</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
