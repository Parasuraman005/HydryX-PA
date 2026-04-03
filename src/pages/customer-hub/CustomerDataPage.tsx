import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, X, CheckCircle, FileText, MessageSquare, ArrowUpDown, Trash2, Download, Plus, Save, Phone, Building2, MapPin, Hash, User, Calendar, CreditCard, Droplets, Banknote, History, ChevronRight, Edit } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useData } from '../../contexts/DataContext';
import { useCompany } from '../../contexts/CompanyContext';
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

export default function CustomerDataPage() {
  const { customers, refreshData } = useData();
  const [search, setSearch] = useState('');
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const navigate = useNavigate();

  const { companyInfo } = useCompany();

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (!editForm.name || !editForm.phone) {
      alert("Name and Phone are required.");
      return;
    }

    try {
      storage.updateCustomer(editingCustomer.id, editForm);
      setEditingCustomer(null);
      refreshData();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer. Please try again.");
    }
  };

  const generateCustomerWhatsAppMessage = () => {
    const shopName = companyInfo?.name || 'Shop Name';
    const address = companyInfo?.address || '';
    const phone1 = companyInfo?.phone1 || '';
    const phone2 = companyInfo?.phone2 || '';
    const website1 = companyInfo?.website1 || '';
    const website2 = companyInfo?.website2 || '';

    let msg = `From ${shopName}\n`;
    if (address) msg += `${address}\n`;
    
    let contactLine = 'Contact : ';
    if (phone1) contactLine += phone1;
    if (phone1 && phone2) contactLine += ' ,';
    if (phone2) contactLine += phone2;
    if (phone1 || phone2) msg += `${contactLine}\n`;
    
    if (website1) msg += `${website1}\n`;
    if (website2) msg += `${website2}\n`;

    return encodeURIComponent(msg);
  };

  const apartments = Array.from(new Set(customers.map(c => c.apartment_name?.toLowerCase()))).filter(Boolean) as string[];
  const filtered = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.flat_no.toLowerCase().includes(search.toLowerCase());
    const matchesApartment = !selectedApartment || c.apartment_name?.toLowerCase() === selectedApartment.toLowerCase();
    return matchesSearch && matchesApartment;
  });

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/customer-hub')} className="p-2 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-400 hover:text-brand-dark transition-colors"><ArrowLeft size={18} /></button>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Registry</p>
            <h2 className="text-xl font-black text-brand-dark tracking-tighter">Customer Data</h2>
          </div>
        </div>
        <button 
          onClick={() => navigate('/customer-hub/add')}
          className="bg-brand-dark text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-brand-dark/20"
        >
          <Plus size={14} strokeWidth={3} />
          NEW CUSTOMER
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-brand-dark transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search by Name, Phone or Flat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-blue-100 bg-white outline-none focus:ring-4 focus:ring-brand-dark/5 focus:border-brand-dark/20 text-xs font-bold transition-all shadow-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        <button 
          onClick={() => setSelectedApartment(null)} 
          className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${!selectedApartment ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'bg-white text-blue-400 border border-blue-100 hover:border-blue-200'}`}
        >
          All Units
        </button>
        {apartments.map(apt => (
          <button 
            key={apt} 
            onClick={() => setSelectedApartment(apt)} 
            className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${selectedApartment?.toLowerCase() === apt.toLowerCase() ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'bg-white text-blue-400 border border-blue-100 hover:border-blue-200'}`}
          >
            {apt}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-10 text-center text-blue-400 font-black text-[10px] bg-white rounded-3xl border border-blue-100 uppercase tracking-widest">No data</div>
        ) : (
          filtered.map((c, idx) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-4 rounded-3xl border border-blue-100 shadow-sm active:scale-[0.98] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full -mr-8 -mt-8"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1 flex-1" onClick={() => navigate(`/customer-hub/report/${c.id}`)}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest font-mono">#{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${c.type === 'Deposit' ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-400'}`}>
                      {c.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-brand-dark tracking-tight group-hover:text-blue-600 transition-colors">{c.name}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Phone size={10} />
                      <span className="text-[9px] font-bold">{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin size={10} />
                      <span className="text-[9px] font-bold uppercase tracking-tighter">{c.flat_no} • {c.apartment_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/entry?customerId=${c.id}`); }}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="New Sale"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingCustomer(c); setEditForm(c); }}
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-brand-dark hover:text-white transition-all"
                  >
                    <Edit size={14} />
                  </button>
                  <a 
                    href={`https://wa.me/${c.whatsapp ? c.whatsapp.replace(/\D/g, '').length === 10 ? '91' + c.whatsapp.replace(/\D/g, '') : c.whatsapp.replace(/\D/g, '') : ''}?text=${generateCustomerWhatsAppMessage()}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <MessageSquare size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {editingCustomer && (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-brand-dark tracking-tight">Edit Profile</h3>
              <button onClick={() => setEditingCustomer(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-xs font-black uppercase tracking-tight" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-xs font-black font-mono" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input type="text" value={editForm.whatsapp} onChange={e => setEditForm({...editForm, whatsapp: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-xs font-black font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Flat No</label>
                  <input type="text" value={editForm.flat_no} onChange={e => setEditForm({...editForm, flat_no: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-xs font-black uppercase tracking-tight" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Apartment</label>
                  <input type="text" value={editForm.apartment_name} onChange={e => setEditForm({...editForm, apartment_name: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-xs font-black uppercase tracking-tight" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Normal Rate</label>
                  <input type="number" value={editForm.normal_rate} onChange={e => setEditForm({...editForm, normal_rate: parseFloat(e.target.value)})} className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-xs font-black font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Premium Rate</label>
                  <input type="number" value={editForm.bisleri_rate} onChange={e => setEditForm({...editForm, bisleri_rate: parseFloat(e.target.value)})} className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-xs font-black font-mono" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingCustomer(null)} className="flex-1 py-3 rounded-xl border border-slate-100 font-black text-[9px] uppercase tracking-widest text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-brand-dark text-white font-black text-[9px] uppercase tracking-widest shadow-xl shadow-brand-dark/20 flex items-center justify-center gap-2">
                  <Save size={14} /> Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
