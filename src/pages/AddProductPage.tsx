import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { storage } from '../lib/storage';

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: '',
    purchasingRate: '',
    gst: '',
    packing: '',
    caseSellingRate: '',
    singleSellingRate: '',
    image: null as File | null
  });
  const navigate = useNavigate();

  const handleCalculate = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const purchasingRate = parseFloat(form.purchasingRate) || 0;
  const caseMargin = purchasingRate > 0 ? (((parseFloat(form.caseSellingRate) || 0) - purchasingRate) / purchasingRate * 100).toFixed(2) : '0';
  const singleMargin = purchasingRate > 0 ? (((parseFloat(form.singleSellingRate) || 0) - purchasingRate) / purchasingRate * 100).toFixed(2) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    storage.addProduct({
      name: form.name,
      rate: parseFloat(form.caseSellingRate), // Assuming rate is case selling rate
      stock: 0
    });
    navigate('/report/stock');
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24">
      <div className="space-y-0.5">
        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Management</p>
        <h2 className="text-xl font-black text-brand-dark tracking-tighter">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 space-y-4">
        <div className="border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-slate-400 group hover:border-blue-200 transition-all cursor-pointer">
          <Upload size={32} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Upload Image</span>
          <input type="file" className="hidden" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
            <input type="text" placeholder="Enter product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-xs font-black focus:bg-white focus:ring-4 focus:ring-brand-dark/5 transition-all" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchasing Rate</label>
              <input type="number" placeholder="0.00" value={form.purchasingRate} onChange={e => handleCalculate('purchasingRate', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-xs font-black focus:bg-white focus:ring-4 focus:ring-brand-dark/5 transition-all" required />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">GST (%)</label>
              <input type="number" placeholder="0" value={form.gst} onChange={e => setForm({...form, gst: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-xs font-black focus:bg-white focus:ring-4 focus:ring-brand-dark/5 transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Packing</label>
            <input type="text" placeholder="e.g. 20L" value={form.packing} onChange={e => setForm({...form, packing: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-xs font-black focus:bg-white focus:ring-4 focus:ring-brand-dark/5 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Selling Rate</label>
              <input type="number" placeholder="0.00" value={form.caseSellingRate} onChange={e => handleCalculate('caseSellingRate', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-xs font-black focus:bg-white focus:ring-4 focus:ring-brand-dark/5 transition-all" required />
              <div className="text-[7px] font-black text-emerald-600 uppercase tracking-widest ml-1">Margin: {caseMargin}%</div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Single Selling Rate</label>
              <input type="number" placeholder="0.00" value={form.singleSellingRate} onChange={e => handleCalculate('singleSellingRate', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-xs font-black focus:bg-white focus:ring-4 focus:ring-brand-dark/5 transition-all" required />
              <div className="text-[7px] font-black text-emerald-600 uppercase tracking-widest ml-1">Margin: {singleMargin}%</div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
          <button type="submit" className="flex-1 py-4 rounded-2xl bg-brand-dark text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-dark/20 active:scale-95 transition-all">Save Product</button>
        </div>
      </form>
    </div>
  );
}
