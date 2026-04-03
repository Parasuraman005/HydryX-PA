import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, X, CheckCircle, FileText, MessageSquare, ArrowUpDown, Trash2, Download, Plus, Save, Phone, Building2, MapPin, Hash, User, Calendar, CreditCard, Droplets, Banknote, History, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { storage } from '../../lib/storage';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Types
interface Deposit {
  id: number;
  customer_id: number;
  customer_name: string;
  phone: string;
  flat_no: string;
  amount: number;
  type: string;
  date: string;
  ref: string;
}

export default function ReturnListPage() {
  const [returns, setReturns] = useState<Deposit[]>([]);

  useEffect(() => {
    const data = storage.getDeposits().filter((d: any) => d.type === 'Return');
    setReturns(data as any);
  }, []);

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="flex items-center gap-3">
        <Link to="/customer-hub/deposit" className="p-2.5 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-400 hover:text-brand-dark transition-all active:scale-90"><ArrowLeft size={18} /></Link>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Security</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">Return List</h2>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-blue-50/50 text-blue-400 font-black uppercase tracking-widest text-[8px]">
              <tr>
                <th className="p-4">S.NO</th>
                <th className="p-4">CUSTOMER</th>
                <th className="p-4 text-right">AMT</th>
                <th className="p-4 text-right pr-6">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No returns recorded</td>
                </tr>
              ) : (
                returns.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 font-black text-blue-300 font-mono text-[10px]">{idx + 1}</td>
                    <td className="p-4">
                      <div className="font-black text-brand-dark text-[11px] truncate max-w-[140px] group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{r.customer_name}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{r.phone}</div>
                    </td>
                    <td className="p-4 font-black text-rose-600 font-mono text-[11px] text-right">₹{r.amount}</td>
                    <td className="p-4 font-black text-brand-dark text-[10px] text-right pr-6">{new Date(r.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
