import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, X, CheckCircle, FileText, MessageSquare, ArrowUpDown, Trash2, Download, Plus, Save, Phone, Building2, MapPin, Hash, User, Calendar, CreditCard, Droplets, Banknote, History, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useData } from '../../contexts/DataContext';
import { storage } from '../../lib/storage';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Types
interface Customer {
  id: number;
  name: string;
  phone: string;
  whatsapp?: string;
  flat_no: string;
  apartment_name: string;
  normal_rate: number;
  bisleri_rate: number;
  type: string;
  deposit_amount: number;
  advance_balance: number;
}

interface Stats {
  totalCustomers: number;
  totalDepositCustomers: number;
  totalDepositAmount: number;
}

const generateWhatsAppMessage = (sale: any) => {
  const text = "Hello " + sale.customer_name + ",\n\nThis is a gentle reminder regarding your pending payment of ₹" + sale.credit_amount + " for water delivery.\n\nPlease settle the amount at your earliest convenience.\n\nThank you,\nV V WATER SUPPLY";
  return encodeURIComponent(text);
};

export default function DepositPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { customers, refreshData } = useData();
  const [search, setSearch] = useState('');
  const [selectedCustomerForReturn, setSelectedCustomerForReturn] = useState<Customer | null>(null);
  const [selectedCustomerForAdd, setSelectedCustomerForAdd] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const fetchStats = () => {
    const statsRes = storage.getStats();
    setStats(statsRes as any);
  };

  useEffect(() => {
    fetchStats();
    refreshData();
  }, [refreshData]);

  const handleProcessDeposit = async (e: React.FormEvent, type: 'Add' | 'Return') => {
    e.preventDefault();
    const targetCustomer = type === 'Add' ? selectedCustomerForAdd : selectedCustomerForReturn;
    if (!targetCustomer || !amount) return;

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    setIsProcessing(true);
    try {
      storage.addDeposit({
        customer_id: targetCustomer.id,
        customer_name: targetCustomer.name,
        phone: targetCustomer.phone,
        flat_no: targetCustomer.flat_no,
        amount: val,
        type: type === 'Add' ? 'Deposit' : 'Return',
        date: new Date().toISOString(),
        ref: `${type === 'Add' ? 'DEP' : 'RET'}-${Date.now()}`
      });

      setSelectedCustomerForReturn(null);
      setSelectedCustomerForAdd(null);
      setAmount('');
      fetchStats();
      refreshData();
    } catch (error) {
      console.error(`Error processing ${type}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = customers.filter(c => (
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.flat_no.toLowerCase().includes(search.toLowerCase())
  )).sort((a, b) => (b.deposit_amount || 0) - (a.deposit_amount || 0));

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/customer-hub')} className="p-2.5 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-400 hover:text-brand-dark transition-all active:scale-90"><ArrowLeft size={18} /></button>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Security</p>
            <h2 className="text-xl font-black text-brand-dark tracking-tighter">Deposit Hub</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/customer-hub/add" 
            state={{ from: '/customer-hub/deposit' }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={14} />
            Add New
          </Link>
          <Link to="returns" className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 shadow-sm active:scale-95 transition-all">
            Returns
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-100 space-y-1 relative overflow-hidden group hover:border-blue-200 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full -mr-8 -mt-8 group-hover:bg-blue-100 transition-colors"></div>
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest relative z-10">Total Clients</p>
          <p className="text-3xl font-black text-brand-dark font-mono relative z-10 tracking-tighter">{stats?.totalDepositCustomers || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-100 space-y-1 relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full -mr-8 -mt-8 group-hover:bg-emerald-100 transition-colors"></div>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest relative z-10">Total Amt</p>
          <p className="text-3xl font-black text-emerald-700 font-mono relative z-10 tracking-tighter">₹{stats?.totalDepositAmount || 0}</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-brand-dark transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search Name, Phone, Flat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-blue-100 bg-white outline-none focus:ring-4 focus:ring-brand-dark/5 focus:border-brand-dark/20 text-xs font-black transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-blue-100">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-blue-400 font-black text-[10px] uppercase tracking-widest">No data found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest w-8">#</th>
                  <th className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                  <th className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-3 font-black text-slate-300 font-mono text-[9px]">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-black text-brand-dark text-[10px] group-hover:text-blue-600 transition-colors uppercase tracking-tighter truncate max-w-[100px] sm:max-w-[150px]">{c.name}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[100px] sm:max-w-[150px]">Flat: {c.flat_no}</div>
                    </td>
                    <td className="p-3 font-black text-emerald-600 font-mono text-[10px] text-right">₹{c.deposit_amount || 0}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedCustomerForAdd(c);
                            setAmount('');
                          }}
                          className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                        >
                          Add
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedCustomerForReturn(c);
                            setAmount(c.deposit_amount?.toString() || '0');
                          }}
                          className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                        >
                          Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return/Add Modal */}
      {(selectedCustomerForReturn || selectedCustomerForAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => { setSelectedCustomerForReturn(null); setSelectedCustomerForAdd(null); }}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-blue-100 relative z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">{selectedCustomerForAdd ? 'Collect Deposit' : 'Process Return'}</p>
                <h3 className="text-2xl font-black text-brand-dark tracking-tighter">{selectedCustomerForAdd ? 'Security Deposit' : 'Security Refund'}</h3>
              </div>
              <button 
                onClick={() => { setSelectedCustomerForReturn(null); setSelectedCustomerForAdd(null); }}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 hover:text-brand-dark transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-blue-50/50 rounded-3xl p-5 mb-6 border border-blue-100/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</span>
                <span className="text-[11px] font-black text-brand-dark uppercase tracking-tighter">{(selectedCustomerForAdd || selectedCustomerForReturn)?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Deposit</span>
                <span className="text-[11px] font-black text-emerald-600 font-mono">₹{(selectedCustomerForAdd || selectedCustomerForReturn)?.deposit_amount || 0}</span>
              </div>
            </div>

            <form onSubmit={(e) => handleProcessDeposit(e, selectedCustomerForAdd ? 'Add' : 'Return')} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{selectedCustomerForAdd ? 'Deposit Amount' : 'Refund Amount'}</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">₹</div>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 font-mono font-black text-xl transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setSelectedCustomerForReturn(null); setSelectedCustomerForAdd(null); }}
                  className="flex-1 py-4 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className={cn(
                    "flex-1 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50",
                    selectedCustomerForAdd ? "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700" : "bg-rose-600 shadow-rose-200 hover:bg-rose-700"
                  )}
                >
                  {isProcessing ? 'Processing...' : selectedCustomerForAdd ? 'Confirm Deposit' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
