import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wallet, Users, FileText, UserPlus, BarChart3, Receipt } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function HubMain() {
  const navigate = useNavigate();
  const menus = [
    { title: "Deposit", path: "deposit", icon: Wallet, color: "bg-blue-50 text-blue-600", desc: "Security deposits" },
    { title: "Data", path: "data", icon: Users, color: "bg-emerald-50 text-emerald-600", desc: "Full directory" },
    { title: "Products", path: "/products", icon: FileText, color: "bg-indigo-50 text-indigo-600", desc: "Inventory" },
    { title: "Add New", path: "add", icon: UserPlus, color: "bg-purple-50 text-purple-600", desc: "Register account" },
    { title: "Reports", path: "/report", icon: BarChart3, color: "bg-amber-50 text-amber-600", desc: "Sales analytics" },
    { title: "Credit", path: "credit", icon: Receipt, color: "bg-rose-50 text-rose-600", desc: "Pending payments" },
  ];

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="space-y-0.5">
        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Management</p>
        <h2 className="text-2xl font-black text-brand-dark tracking-tighter">Customer Hub</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {menus.map((menu, idx) => (
          <motion.div
            key={menu.path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <button
              onClick={() => navigate(menu.path)}
              className="w-full group relative bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all duration-300 flex flex-col items-center gap-4 text-center overflow-hidden h-full min-h-[140px] hover:border-blue-200 hover:shadow-md"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:bg-blue-50 transition-colors"></div>
              <div className={cn("p-4 rounded-2xl relative z-10 shadow-sm transition-transform group-hover:scale-110", menu.color)}>
                <menu.icon size={24} strokeWidth={2.5} />
              </div>
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest block">{menu.title}</span>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter opacity-60">{menu.desc}</p>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
