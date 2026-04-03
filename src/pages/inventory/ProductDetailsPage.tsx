import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { useData } from '../../contexts/DataContext';

export default function ProductDetailsPage() {
  const { products, refreshData } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', rate: 0 });
  const navigate = useNavigate();

  const handleAdd = async () => {
    storage.addProduct(newProduct);
    refreshData();
    setShowAddModal(false);
    setNewProduct({ name: '', rate: 0 });
  };

  const handleDelete = async (id: number) => {
    storage.deleteProduct(id);
    refreshData();
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-5xl mx-auto">
      <div className="flex justify-between items-end px-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-400 hover:text-brand-dark transition-all active:scale-90">
            <ArrowLeft size={18} />
          </button>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Inventory</p>
            <h2 className="text-xl font-black text-brand-dark tracking-tighter">Product Details</h2>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="bg-brand-dark text-white px-4 py-2 rounded-xl shadow-lg shadow-brand-dark/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={14} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">Add New</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center w-16">S.no</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Name</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product, idx) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-[10px] font-black text-slate-400 text-center">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-black text-brand-dark text-[11px] truncate max-w-[150px] uppercase tracking-tighter">{product.name}</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rate: ₹{product.rate}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors active:scale-90 mx-auto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-[2rem] w-full max-w-sm space-y-6 shadow-2xl border border-white/20">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-brand-dark tracking-tighter">Add New Product</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter product information</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. 20L Premium" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  className="w-full px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 focus:bg-white outline-none font-black text-sm focus:ring-4 focus:ring-brand-dark/5 transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate (₹)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={newProduct.rate || ''} 
                  onChange={e => setNewProduct({...newProduct, rate: parseFloat(e.target.value) || 0})} 
                  className="w-full px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 focus:bg-white outline-none font-black text-sm focus:ring-4 focus:ring-brand-dark/5 transition-all" 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd} 
                className="flex-1 py-3.5 bg-brand-dark text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-dark/20 active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
