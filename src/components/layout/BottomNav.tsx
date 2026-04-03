import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Users, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: Home, label: 'HOME' },
    { path: '/entry', icon: PlusCircle, label: 'ENTRY' },
    { path: '/customer-hub/credit', icon: Receipt, label: 'CREDIT' },
    { path: '/customer-hub', icon: Users, label: 'HUB' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-4 py-2 flex items-center justify-around z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        let isActive = false;
        if (item.path === '/') {
          isActive = location.pathname === '/';
        } else if (item.path === '/customer-hub') {
          isActive = location.pathname === '/customer-hub' || (location.pathname.startsWith('/customer-hub/') && !location.pathname.startsWith('/customer-hub/credit'));
        } else {
          isActive = location.pathname.startsWith(item.path);
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative flex flex-col items-center gap-1 p-2 transition-all duration-300",
              isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 bg-blue-50/50 rounded-2xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon 
              size={20} 
              className={cn(
                "transition-transform duration-300",
                isActive ? "scale-110 stroke-[2.5px]" : "scale-100"
              )} 
            />
            <span className={cn(
              "text-[9px] font-black tracking-widest uppercase transition-all duration-300",
              isActive ? "opacity-100 translate-y-0" : "opacity-60"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
