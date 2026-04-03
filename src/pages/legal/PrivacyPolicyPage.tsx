import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-8 max-w-2xl mx-auto pb-32">
      <div className="flex items-center gap-3 px-1">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100 active:scale-90 transition-all">
          <ArrowLeft size={18} className="text-slate-900" strokeWidth={3} />
        </button>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Legal</p>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter">Privacy Policy</h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50"></div>
        
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Privacy Policy</h1>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Last Updated: March 2026</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Eye size={16} strokeWidth={3} />
              <h3 className="text-xs font-black uppercase tracking-widest">Introduction</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our application.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Lock size={16} strokeWidth={3} />
              <h3 className="text-xs font-black uppercase tracking-widest">Data Collection</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              We collect information that you provide directly to us, such as your shop name, proprietor details, and contact information. We also collect data related to your business operations to provide our services.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <FileText size={16} strokeWidth={3} />
              <h3 className="text-xs font-black uppercase tracking-widest">Data Usage</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Your data is used solely to provide and improve our services, manage your account, and communicate with you. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <ShieldCheck size={16} strokeWidth={3} />
              <h3 className="text-xs font-black uppercase tracking-widest">Security</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">© 2026 PA SOFTWARES</p>
      </div>
    </div>
  );
}
