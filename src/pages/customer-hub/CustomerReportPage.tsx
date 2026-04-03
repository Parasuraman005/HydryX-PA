import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, X, CheckCircle, FileText, MessageSquare, ArrowUpDown, Trash2, Download, Plus, Save, Phone, Building2, MapPin, Hash, User, Calendar, CreditCard, Droplets, Banknote, History, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
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

interface Sale {
  id: number;
  customer_id: number;
  customer_name?: string;
  product_details: string;
  amount_received: number;
  credit_amount: number;
  total_amount: number;
  payment_mode: string;
  date: string;
  type: string;
  flat_no?: string;
}

export default function CustomerReportPage() {
  const { id } = useParams();
  const [sales, setSales] = useState<Sale[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const customerId = parseInt(id);
      let data = storage.getSales().filter(s => s.customer_id === customerId);
      
      if (dateRange.from) {
        data = data.filter(s => s.date >= dateRange.from);
      }
      if (dateRange.to) {
        data = data.filter(s => s.date <= dateRange.to);
      }
      
      setSales(data);
      
      const cust = storage.getCustomers().find(c => c.id === customerId);
      if (cust) {
        setCustomer(cust as any);
      }
    }
  }, [id, dateRange]);

  const totalAmount = sales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalReceived = sales.reduce((acc, s) => acc + s.amount_received, 0);
  const totalPending = sales.reduce((acc, s) => acc + s.credit_amount, 0);

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 active:scale-95 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Analytics</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">Customer Report</h2>
        </div>
        <button 
          onClick={() => navigate(`/entry?customerId=${id}`)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          <Plus size={14} /> New Sale
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-sm border border-blue-100/50">
                {customer?.name?.[0] || 'C'}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-brand-dark tracking-tight uppercase">{customer?.name || 'LOADING...'}</h3>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Flat: {customer?.flat_no} • {customer?.apartment_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date From</label>
                <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-dark/5 outline-none font-bold text-xs transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date To</label>
                <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-dark/5 outline-none font-bold text-xs transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">History</h4>
              <span className="px-2 py-0.5 bg-white rounded-lg text-[8px] font-black text-blue-600 border border-blue-100">{sales.length} Entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest italic font-serif">Date</th>
                    <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest italic font-serif">Details</th>
                    <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest italic font-serif text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sales.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3 text-[9px] font-bold text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="text-[9px] font-black text-brand-dark uppercase tracking-tight">{s.product_details}</div>
                        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{s.payment_mode}</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="text-[10px] font-black text-brand-dark font-mono">₹{s.total_amount}</div>
                        {s.credit_amount > 0 && <div className="text-[7px] font-black text-rose-500 uppercase tracking-tighter">Credit: ₹{s.credit_amount}</div>}
                        {s.credit_amount < 0 && <div className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">Advance: ₹{Math.abs(s.credit_amount)}</div>}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">No data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-brand-dark p-6 rounded-3xl text-white shadow-2xl shadow-brand-dark/20 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="relative z-10 space-y-4">
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-brand-light/40 uppercase tracking-widest">Total Billing</p>
                <p className="text-3xl font-black tracking-tighter">₹{totalAmount}</p>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-brand-light/40 uppercase tracking-widest">Received</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">₹{totalReceived}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-brand-light/40 uppercase tracking-widest">Pending</span>
                  <span className="text-xs font-black text-rose-400 font-mono">₹{totalPending}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-3">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quick Actions</h4>
            <div className="grid grid-cols-1 gap-2">
              <button className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                <Download size={12} /> Export PDF
              </button>
              <button className="w-full py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
                <MessageSquare size={12} /> Send Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
