import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { Users, Edit2, Trash2, Search, Filter } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${search}`);
      setUsers(res.data.users);
    } catch (err) {
       toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user and all their transactions?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      
      const payload = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      };
      const res = await api.put(`/users/${editingUser._id}`, payload);
      toast.success("User updated");
      setUsers(users.map(u => u._id === editingUser._id ? {...u, ...res.data.user} : u));
      setEditingUser(null);
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center text-slate-800">
                <Users className="mr-2 h-6 w-6 text-purple-600" /> Manage Users
              </h2>
              <p className="text-slate-500 text-sm mt-1">View, edit, or remove user accounts across the system.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto p-0">
            {loading ? (
              <p className="text-center text-slate-500 my-10">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-center text-slate-500 my-10">No users found.</p>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-slate-500 bg-slate-50/80">
                  <tr>
                    <th className="py-4 px-6 font-semibold uppercase text-xs">User</th>
                    <th className="py-4 px-6 font-semibold uppercase text-xs">Role</th>
                    <th className="py-4 px-6 font-semibold uppercase text-xs">Income</th>
                    <th className="py-4 px-6 font-semibold uppercase text-xs">Expense</th>
                    <th className="py-4 px-6 font-semibold uppercase text-xs">Balance</th>
                    <th className="py-4 px-6 font-semibold uppercase text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                     <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                       <td className="py-4 px-6">
                         <div className="font-semibold text-slate-800">{u.name}</div>
                         <div className="text-xs text-slate-500">{u.email}</div>
                       </td>
                       <td className="py-4 px-6">
                         <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                           u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                           u.role === 'analyst' ? 'bg-blue-100 text-blue-700' :
                           'bg-slate-100 text-slate-700'
                         }`}>
                           {u.role}
                         </span>
                       </td>
                       <td className="py-4 px-6 font-medium text-emerald-600">${u.income || 0}</td>
                       <td className="py-4 px-6 font-medium text-red-500">${u.expense || 0}</td>
                       <td className="py-4 px-6 font-bold text-slate-800">${u.balance || 0}</td>
                       <td className="py-4 px-6 flex space-x-2 justify-end">
                         <button onClick={() => setEditingUser(u)} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={16} /></button>
                         <button onClick={() => handleDelete(u._id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
      </div>

      
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-800">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 focus:outline-none">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Name</label>
                  <input type="text" required value={editingUser.name} onChange={e=>setEditingUser({...editingUser, name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-slate-50 focus:bg-white" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Email</label>
                  <input type="email" required value={editingUser.email} onChange={e=>setEditingUser({...editingUser, email: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-slate-50 focus:bg-white" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Role</label>
                  <select value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-slate-50 focus:bg-white">
                     <option value="viewer">Viewer</option>
                     <option value="analyst">Analyst</option>
                     <option value="admin">Admin</option>
                  </select>
               </div>
               <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-all">Save Changes</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
