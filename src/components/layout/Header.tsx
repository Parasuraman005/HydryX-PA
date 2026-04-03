import React, { useState } from 'react';
import { Menu, User, X, ShieldCheck, FileText, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useCompany } from '../../contexts/CompanyContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { companyInfo } = useCompany();

  const handleNav = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 pt-safe flex items-center justify-between z-30 shadow-sm">
        {/* Left: Hamburger Menu */}
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-sm transition-all active:scale-95"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
        
        {/* Middle: App Logo and Name */}
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shadow-blue-100 overflow-hidden">
            <img src="/hydryX-logo.png" alt="HydryX Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
          </div>
          <span className="text-xl font-black text-blue-950 tracking-tighter">HydryX</span>
        </div>
        
        {/* Right: Shop Logo */}
        <button 
          onClick={() => navigate('/general-profile')} 
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all overflow-hidden"
        >
          {companyInfo?.logo ? (
            <img 
              src={companyInfo.logo} 
              alt="Shop Logo" 
              className="w-full h-full object-contain p-1" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <User size={24} className="text-slate-400" />
          )}
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-16 left-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleNav('/hydryx')}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-md shadow-blue-200 overflow-hidden">
                    <img src="/hydryX-logo.png" alt="HydryX Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">HydryX</span>
                </button>
                
                {companyInfo?.logo && (
                  <button 
                    onClick={() => handleNav('/general-profile')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-md shadow-slate-200 overflow-hidden">
                      <img src={companyInfo.logo} alt="Company Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[120px]">{companyInfo.name}</span>
                  </button>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white rounded-full transition-colors shadow-sm">
                <X size={14} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-2 space-y-0.5">
              <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Menu</p>
              <Link 
                to="/about-us"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
              >
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center shadow-sm overflow-hidden border border-slate-100">
                  <img src="/pa-logo.png" alt="PA Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[11px] font-bold">PA SOFTWARES</span>
              </Link>
              <Link 
                to="/general-profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
              >
                <User size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">General Profile</span>
              </Link>
              <Link 
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
              >
                <Settings size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Settings</span>
              </Link>
              <Link 
                to="/privacy-policy"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
              >
                <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Privacy Policy</span>
              </Link>
              <Link 
                to="/terms-and-conditions"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
              >
                <FileText size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Terms & Conditions</span>
              </Link>
            </div>

            <div className="p-3 bg-slate-50/50 border-t border-slate-50">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">v1.0.4</p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
