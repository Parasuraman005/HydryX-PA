import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LoginPageProps {
  onLogin: (user: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);

  const handleKeyPress = (key: string) => {
    if (isError) setIsError(false);
    
    if (key === 'C') {
      setPin('');
    } else if (key === 'D') {
      setPin(pin.slice(0, -1));
    } else {
      if (pin.length < 4) {
        const newPin = pin + key;
        setPin(newPin);
        if (newPin === '1205') {
          onLogin('admin');
        } else if (newPin.length === 4) {
          setIsError(true);
          setTimeout(() => {
            setPin('');
            setIsError(false);
          }, 600);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[340px] flex flex-col items-center">
        {/* App Logo & Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-brand-dark/20 mb-4 overflow-hidden">
            <img src="/hydryX-logo.png" alt="Hydryx Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">HYDRYX</h1>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Management System</p>
        </div>

        <motion.div 
          animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 border border-blue-100 mb-8 w-full"
        >
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all duration-300",
                  isError ? "border-rose-500 bg-rose-50 text-rose-600" : "border-blue-100 bg-blue-50/50 text-brand-dark",
                  pin[i] && !isError ? "border-blue-500 bg-blue-50" : ""
                )}
              >
                {pin[i] ? '●' : ''}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button key={num} onClick={() => handleKeyPress(num.toString())} className="h-14 rounded-2xl bg-blue-50 text-brand-dark font-black text-xl hover:bg-blue-100 active:scale-90 transition-all">
                {num}
              </button>
            ))}
            <button onClick={() => handleKeyPress('C')} className="h-14 rounded-2xl bg-rose-50 text-rose-600 font-black text-xl hover:bg-rose-100 active:scale-90 transition-all">C</button>
            <button onClick={() => handleKeyPress('0')} className="h-14 rounded-2xl bg-blue-50 text-brand-dark font-black text-xl hover:bg-blue-100 active:scale-90 transition-all">0</button>
            <button onClick={() => handleKeyPress('D')} className="h-14 rounded-2xl bg-slate-100 text-slate-600 font-black text-xl hover:bg-slate-200 active:scale-90 transition-all">⌫</button>
          </div>
        </motion.div>
        
        {isError && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4"
          >
            Incorrect PIN. Please try again.
          </motion.p>
        )}
        
        {/* Footer */}
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DEVELOPED & DESIGNED BY PA SOFTWARES</p>
      </div>
    </div>
  );
};

export default LoginPage;
