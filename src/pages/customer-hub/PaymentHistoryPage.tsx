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

export default function PaymentHistoryPage() {
  const { sales, refreshData } = useData();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleDeleteSettlement = async (id: number) => {
    try {
      storage.deleteSale(id);
      refreshData();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting settlement:", error);
      alert("Failed to delete settlement. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 space-y-6 pb-safe">
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-400 hover:text-brand-dark transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Credit Data</p>
            <h2 className="text-xl font-black text-brand-dark tracking-tighter">Payment History</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 font-black text-slate-400 uppercase tracking-widest">S.No</th>
                <th className="py-3 font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="py-3 font-black text-slate-400 uppercase tracking-widest">Amt</th>
                <th className="py-3 font-black text-slate-400 uppercase tracking-widest">Mode</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales
                .filter(s => s.type === 'Billing' || s.product_details?.includes('Credit Settlement'))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-mono text-slate-300">{i + 1}</td>
                    <td className="py-3 font-black text-brand-dark">
                      <div>{s.customer_name}</div>
                      <div className="text-[7px] text-slate-400">{new Date(s.date).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 font-black text-emerald-600 font-mono">₹{s.amount_received}</td>
                    <td className="py-3"><span className="px-1.5 py-0.5 bg-slate-50 rounded text-[8px] font-black uppercase tracking-widest">{s.payment_mode}</span></td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => setDeleteConfirmId(s.id)}
                        className="text-rose-500 hover:text-rose-600 transition-colors active:scale-90 p-2"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              {sales.filter(s => s.type === 'Billing' || s.product_details?.includes('Credit Settlement')).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest">No payment history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-[280px] rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
              <X size={24} className="text-rose-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black text-brand-dark uppercase tracking-tight">Delete Settlement?</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">This action cannot be undone.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
              <button onClick={() => handleDeleteSettlement(deleteConfirmId)} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95 transition-all">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
