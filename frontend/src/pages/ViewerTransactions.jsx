import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Download, Filter } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-hot-toast";

const ViewerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    dateFrom: "",
    dateTo: ""
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page,
        limit: 20,
        ...(filters.type && { type: filters.type }),
        ...(filters.category && { category: filters.category }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      }).toString();

      const res = await api.get(`/transaction?${q}`);
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction History", 14, 15);
    
    const tableColumn = ["Date", "Type", "Category", "Payment Method", "Amount", "Notes"];
    const tableRows = [];

    transactions.forEach(tx => {
      const txData = [
        new Date(tx.date).toLocaleDateString(),
        tx.type.toUpperCase(),
        tx.category,
        tx.paymentMethod,
        `$${tx.amount.toFixed(2)}`,
        tx.notes || "-"
      ];
      tableRows.push(txData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("transactions.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Transactions</h1>
          <p className="text-slate-500">History of your financial activities.</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center shadow-md shadow-blue-500/20"
        >
          <Download size={18} className="mr-2" /> PDF Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Type</label>
          <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Category</label>
          <input type="text" name="category" placeholder="Search category" value={filters.category} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">From Date</label>
          <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">To Date</label>
          <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <button onClick={() => setFilters({ type: "", category: "", dateFrom: "", dateTo: "" })} className="border border-slate-200 hover:bg-slate-50 rounded-lg p-2.5 text-slate-600 transition flex items-center justify-center">
          <Filter size={20} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="py-10 text-center text-slate-500">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-slate-500">No transactions found.</td></tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">{tx.category}</td>
                    <td className="py-4 px-6 font-semibold">${tx.amount.toFixed(2)}</td>
                    <td className="py-4 px-6">{tx.paymentMethod}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">Showing page {page} of {totalPages} ({total} total)</p>
            <div className="flex space-x-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-white text-sm font-medium">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-white text-sm font-medium">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewerTransactions;
