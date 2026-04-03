import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../lib/storage';

const CompanyContext = createContext<any>(null);

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [quickActions, setQuickActions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = storage.getSettings();
        if (settings.company_info) setCompanyInfo(settings.company_info);
        if (settings.quick_actions) setQuickActions(settings.quick_actions);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const updateCompanyInfo = (newInfo: any) => {
    const settings = storage.getSettings();
    storage.saveSettings({ ...settings, company_info: newInfo });
    setCompanyInfo(newInfo);
  };

  const updateQuickActions = (newActions: any[]) => {
    const settings = storage.getSettings();
    storage.saveSettings({ ...settings, quick_actions: newActions });
    setQuickActions(newActions);
  };

  return (
    <CompanyContext.Provider value={{ 
      companyInfo, 
      setCompanyInfo: updateCompanyInfo, 
      quickActions, 
      setQuickActions: updateQuickActions 
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
