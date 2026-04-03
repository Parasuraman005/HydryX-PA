import React, { useState } from 'react';
import { Save, Camera, Building2, User, Phone, MapPin, Globe, CreditCard, Hash, ArrowLeft } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';

export default function GeneralProfilePage() {
  const { companyInfo, setCompanyInfo } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const settings = storage.getSettings();
      storage.saveSettings({
        ...settings,
        company_info: companyInfo
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyInfo({ ...companyInfo, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const fields = [
    { key: 'name', label: 'Shop Name', icon: Building2, placeholder: 'Enter shop name' },
    { key: 'proprietor', label: 'Proprietor', icon: User, placeholder: 'Enter proprietor name' },
    { key: 'address', label: 'Address', icon: MapPin, placeholder: 'Enter full address', isTextArea: true },
    { key: 'phone1', label: 'Phone Number 1', icon: Phone, placeholder: 'Enter primary phone' },
    { key: 'phone2', label: 'Phone 2', icon: Phone, placeholder: 'Enter secondary phone' },
    { key: 'gstin', label: 'GST In', icon: Hash, placeholder: 'Enter GST number' },
    { key: 'upiId', label: 'UPI ID', icon: CreditCard, placeholder: 'Enter UPI ID' },
    { key: 'upiNumber', label: 'UPI Number', icon: Phone, placeholder: 'Enter UPI number' },
    { key: 'holderName', label: 'Holder Name', icon: User, placeholder: 'Enter holder name' },
    { key: 'website1', label: 'Website Link 1', icon: Globe, placeholder: 'Enter primary website URL' },
    { key: 'website2', label: 'Website Link 2', icon: Globe, placeholder: 'Enter secondary website URL' },
  ];

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-32 pb-safe">
      <div className="flex items-center gap-3 px-1">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100 active:scale-90 transition-all">
          <ArrowLeft size={18} className="text-brand-dark" strokeWidth={3} />
        </button>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Settings</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">General Profile</h2>
        </div>
      </div>

      {/* Logo Upload Section */}
      <div className="bg-white rounded-[2rem] border border-blue-100 shadow-sm p-8 flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
        
        <div className="relative group">
          <div className="w-28 h-28 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-blue-300">
            {companyInfo?.logo ? (
              <img src={companyInfo.logo} alt="Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-slate-300 flex flex-col items-center gap-2">
                <Building2 size={32} strokeWidth={1.5} />
                <span className="text-[9px] font-black uppercase tracking-widest">Logo</span>
              </div>
            )}
            <label className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]">
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <Camera size={24} className="text-white mb-1" />
              <span className="text-white text-[9px] font-black uppercase tracking-widest">Upload</span>
            </label>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-black text-brand-dark tracking-tighter uppercase leading-none">{companyInfo?.name || 'Your Shop Name'}</h3>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Business Identity</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-[2rem] border border-blue-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field) => (
            <div key={field.key} className={field.isTextArea ? "md:col-span-2 space-y-2" : "space-y-2"}>
              <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <field.icon size={10} className="text-blue-500" />
                {field.label}
              </label>
              {field.isTextArea ? (
                <textarea 
                  value={companyInfo?.[field.key] || ''}
                  onChange={e => setCompanyInfo({...companyInfo, [field.key]: e.target.value})}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-xs font-black text-slate-700 placeholder:text-slate-300 h-24 resize-none"
                />
              ) : (
                <input 
                  type="text" 
                  value={companyInfo?.[field.key] || ''}
                  onChange={e => setCompanyInfo({...companyInfo, [field.key]: e.target.value})}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-xs font-black text-slate-700 placeholder:text-slate-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Update Button */}
      <div className="pt-4">
        <button 
          onClick={handleUpdate}
          disabled={isSaving}
          className="w-full bg-brand-dark text-white py-5 rounded-[1.5rem] font-black text-sm shadow-2xl shadow-brand-dark/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.3em]"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={20} />
          )}
          {isSaving ? 'Updating...' : 'Update Profile'}
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
              <Save size={18} />
            </div>
            <span className="font-bold uppercase tracking-widest">Profile Updated Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] pt-8">
        DEVELOPED & DESIGNED BY PA SOFTWARES
      </div>
    </div>
  );
}
