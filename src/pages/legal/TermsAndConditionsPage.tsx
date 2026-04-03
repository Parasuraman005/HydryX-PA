import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsAndConditionsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-8 max-w-2xl mx-auto pb-32">
      <div className="flex items-center gap-3 px-1">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100 active:scale-90 transition-all">
          <ArrowLeft size={18} className="text-slate-900" strokeWidth={3} />
        </button>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Legal</p>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter">Terms & Conditions</h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50"></div>
        
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <FileText size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Terms & Conditions</h1>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Last Updated: March 2026</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <CheckCircle size={16} strokeWidth={3} />
              <h3 className="text-xs font-black uppercase tracking-widest">Acceptance of Terms</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              By accessing and using this application, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the application.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <AlertCircle size={16} strokeWidth={3} />
              <h3 className="text-xs font-black uppercase tracking-widest">User Responsibilities</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate and complete information.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <HelpCircle size={16} strokeWidth={3} />
              <h3 className="text-xs font-black uppercase tracking-widest">Limitation of Liability</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              PA SOFTWARES shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the application.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <FileText size={16} strokeWidth={3} />
              <h3 className="text-xs font-black uppercase tracking-widest">Changes to Terms</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              We reserve the right to modify these terms at any time. Your continued use of the application after any such changes constitutes your acceptance of the new terms.
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
