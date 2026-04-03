import React, { useState, useRef } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Upload, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../lib/storage';

const allPossibleActions = [
  { id: '1', label: 'New Entry', path: '/entry', icon: 'PlusCircle', color: 'blue' },
  { id: '3', label: 'Credit Customer', path: '/customer-hub/credit', icon: 'Users', color: 'emerald' },
  { id: '4', label: 'Reports', path: '/report', icon: 'FileText', color: 'amber' },
  { id: '5', label: 'Customer Hub', path: '/customer-hub', icon: 'Users', color: 'indigo' },
  { id: '8', label: 'Add Product', path: '/report/new-product', icon: 'Plus', color: 'emerald' },
  { id: '9', label: 'Daily Summary', path: '/report/billing', icon: 'CheckCircle', color: 'purple' },
];

export default function QuickSettingsPage() {
  const { quickActions, setQuickActions } = useCompany();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Settings Saved Successfully!');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAction = (action: any) => {
    if (quickActions.find((a: any) => a.id === action.id)) {
      setQuickActions(quickActions.filter((a: any) => a.id !== action.id));
    } else if (quickActions.length < 9) {
      setQuickActions([...quickActions, action]);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const settings = storage.getSettings();
    storage.saveSettings({
      ...settings,
      quick_actions: quickActions
    });
    setIsSaving(false);
    showNotification('Settings Saved Successfully!');
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleExportData = () => {
    storage.exportData();
    showNotification('Data Exported Successfully!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importData(content);
      if (success) {
        showNotification('Data Imported Successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert("Invalid backup file format.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 pb-safe max-w-2xl mx-auto">
      <div className="flex justify-between items-end px-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-400 hover:text-brand-dark transition-all active:scale-90">
            <ArrowLeft size={18} />
          </button>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Customization</p>
            <h2 className="text-xl font-black text-brand-dark tracking-tighter">Quick Settings</h2>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-dark text-white px-5 py-2.5 rounded-xl text-[10px] font-black shadow-xl shadow-brand-dark/20 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-28 left-4 right-4 bg-emerald-600 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 text-xs"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
            <span className="font-bold uppercase tracking-widest">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2rem] shadow-sm border border-blue-100 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage Quick Actions</h3>
          <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">{quickActions.length}/9 Selected</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {allPossibleActions.map((action) => {
            const isActive = quickActions.find((a: any) => a.id === action.id);
            return (
              <button 
                key={action.id}
                onClick={() => toggleAction(action)}
                className={cn(
                  "p-4 rounded-2xl border text-[9px] font-black transition-all flex flex-col items-center justify-center gap-2 aspect-square text-center leading-tight uppercase tracking-tighter",
                  isActive 
                    ? "bg-brand-dark text-white border-brand-dark shadow-lg shadow-brand-dark/20 scale-[1.02]" 
                    : "bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
                )}
              >
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-blue-100 p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Management</h3>
          <p className="text-[10px] font-bold text-slate-400">Backup or restore your application data. Since the app runs entirely in your browser, it's highly recommended to export your data regularly.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleExportData}
            className="p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all flex flex-col items-center justify-center gap-2 text-center active:scale-95"
          >
            <Download size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Export Backup</span>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex flex-col items-center justify-center gap-2 text-center active:scale-95"
          >
            <Upload size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Import Backup</span>
          </button>
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImportData}
          />
        </div>
      </div>
    </div>
  );
}
