import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, X, CheckCircle, FileText, MessageSquare, ArrowUpDown, Trash2, Download, Plus, Save, Phone, Building2, MapPin, Hash, User, Calendar, CreditCard, Droplets, Banknote, History, ChevronRight, UserPlus } from 'lucide-react';
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

export default function AddNewCustomerPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    flat_no: '',
    apartment_name: '',
    deposit_amount: '',
    normal_rate: '40',
    bisleri_rate: '110'
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshData } = useData();
  const from = location.state?.from || '/customer-hub/data';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = form.name || form.flat_no;
    const finalWhatsApp = form.whatsapp || form.phone; 

    if (!finalName || !form.phone) {
      alert("Name (or Flat No) and Phone are required.");
      return;
    }

    try {
      storage.addCustomer({
        ...form,
        name: finalName,
        whatsapp: finalWhatsApp,
        apartment_name: form.apartment_name.toUpperCase(),
        deposit_amount: parseFloat(form.deposit_amount) || 0,
        normal_rate: parseFloat(form.normal_rate),
        bisleri_rate: parseFloat(form.bisleri_rate),
        type: parseFloat(form.deposit_amount) > 0 ? 'Deposit' : 'Non Deposit',
        created_at: new Date().toISOString()
      } as any);
      
      await refreshData();
      navigate(from);
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 active:scale-95 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Registration</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">Add New Customer</h2>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
            <UserPlus size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Client Profile</p>
            <p className="text-[10px] font-black text-brand-dark uppercase tracking-tighter">Register a new account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
              <input type="text" placeholder="FULL NAME" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none font-black text-xs uppercase tracking-tight transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input type="text" placeholder="10-DIGIT NUMBER" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none font-black font-mono text-xs transition-all" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
              <input type="text" placeholder="OPTIONAL" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none font-black font-mono text-xs transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Flat No</label>
                <input type="text" placeholder="FLAT #" value={form.flat_no} onChange={e => setForm({...form, flat_no: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none font-black text-xs uppercase tracking-tight transition-all" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Apartment</label>
                <input type="text" placeholder="APT NAME" value={form.apartment_name} onChange={e => setForm({...form, apartment_name: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none font-black text-xs uppercase tracking-tight transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Financial Settings</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit</label>
                <input type="number" placeholder="0" value={form.deposit_amount} onChange={e => setForm({...form, deposit_amount: e.target.value})} className="w-full px-3 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none font-black text-xs font-mono transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Normal</label>
                <input type="number" value={form.normal_rate} onChange={e => setForm({...form, normal_rate: e.target.value})} className="w-full px-3 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none font-black text-xs font-mono transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bisleri</label>
                <input type="number" value={form.bisleri_rate} onChange={e => setForm({...form, bisleri_rate: e.target.value})} className="w-full px-3 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none font-black text-xs font-mono transition-all" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-brand-dark text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-dark/20 active:scale-[0.98] transition-all mt-2">
            Register Customer
          </button>
        </form>
      </motion.div>
    </div>
  );
}
