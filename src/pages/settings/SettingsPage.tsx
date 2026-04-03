import React, { useState, useRef } from 'react';
import { ShieldCheck, FileText, MoreHorizontal, ChevronRight, Building2, Download, Upload } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';

interface SettingsPageProps {
  onLogout: () => void;
}

const SettingsPage = ({ onLogout }: SettingsPageProps) => {
  const { companyInfo, setCompanyInfo } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async () => {
    setIsSaving(true);
    const settings = storage.getSettings();
    storage.saveSettings({
      ...settings,
      company_info: companyInfo
    });
    setIsSaving(false);
    alert('Settings updated successfully!');
  };

  const handleExport = () => {
    storage.exportData();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importData(content);
      if (success) {
        alert('Data imported successfully! The page will now reload.');
        window.location.reload();
      } else {
        alert('Invalid backup file. Please try again.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-brand-dark">Settings</h2>
        <button 
          onClick={handleUpdate}
          disabled={isSaving}
          className="bg-brand-dark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all duration-300 ease-in-out disabled:opacity-50"
        >
          {isSaving ? 'SAVING...' : 'UPDATE'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Company Name</label>
            <input 
              type="text" 
              value={companyInfo?.name || ''}
              onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Proprietor Name</label>
            <input 
              type="text" 
              value={companyInfo?.proprietor || ''}
              onChange={e => setCompanyInfo({...companyInfo, proprietor: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">GSTIN</label>
            <input 
              type="text" 
              value={companyInfo?.gstin || ''}
              onChange={e => setCompanyInfo({...companyInfo, gstin: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Phone 1</label>
            <input 
              type="text" 
              value={companyInfo?.phone1 || ''}
              onChange={e => setCompanyInfo({...companyInfo, phone1: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Phone 2</label>
            <input 
              type="text" 
              value={companyInfo?.phone2 || ''}
              onChange={e => setCompanyInfo({...companyInfo, phone2: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">WhatsApp</label>
            <input 
              type="text" 
              value={companyInfo?.whatsapp || ''}
              onChange={e => setCompanyInfo({...companyInfo, whatsapp: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">UPI ID</label>
            <input 
              type="text" 
              value={companyInfo?.upiId || ''}
              onChange={e => setCompanyInfo({...companyInfo, upiId: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">UPI Number</label>
            <input 
              type="text" 
              value={companyInfo?.upiNumber || ''}
              onChange={e => setCompanyInfo({...companyInfo, upiNumber: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Holder Name</label>
            <input 
              type="text" 
              value={companyInfo?.holderName || ''}
              onChange={e => setCompanyInfo({...companyInfo, holderName: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Address</label>
            <textarea 
              value={companyInfo?.address || ''}
              onChange={e => setCompanyInfo({...companyInfo, address: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium h-16"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Website Link 1</label>
            <input 
              type="text" 
              value={companyInfo?.website1 || ''}
              onChange={e => setCompanyInfo({...companyInfo, website1: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Website Link 2</label>
            <input 
              type="text" 
              value={companyInfo?.website2 || ''}
              onChange={e => setCompanyInfo({...companyInfo, website2: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-brand-medium"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">General Settings</h3>
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/general-profile')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-light text-brand-dark rounded-lg">
                <Building2 size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700">General Profile</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
          <button 
            onClick={() => navigate('/privacy-policy')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ShieldCheck size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700">Privacy Policy</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
          <button 
            onClick={() => navigate('/terms-and-conditions')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileText size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700">Terms & Conditions</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
          <button 
            onClick={() => navigate('/hydryx')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ShieldCheck size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700">About HydryX</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
          <button 
            onClick={() => navigate('/about-us')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <MoreHorizontal size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700">About Us (Developer)</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backup & Restore</h3>
        <div className="space-y-2">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Download size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700">Export Data (JSON)</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Upload size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700">Import Data (JSON)</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full bg-red-50 text-red-600 py-3 rounded-2xl font-bold text-sm shadow-sm border border-red-100 active:scale-95 transition-all duration-300 ease-in-out"
      >
        LOGOUT
      </button>
    </div>
  );
};

export default SettingsPage;
