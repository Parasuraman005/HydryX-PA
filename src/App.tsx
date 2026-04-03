import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import SplashScreen from './pages/auth/SplashScreen';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/home/HomePage';
import SettingsPage from './pages/settings/SettingsPage';
import ProductDetailsPage from './pages/inventory/ProductDetailsPage';
import EntryPage from './pages/operations/EntryPage';
import CustomerHub from './pages/customer-hub/CustomerHub';
import ReportPage from './pages/reports/ReportPage';
import QuickSettingsPage from './pages/settings/QuickSettingsPage';
import HydryXPage from './pages/operations/HydryXPage';
import GeneralProfilePage from './pages/settings/GeneralProfilePage';
import AboutUsPage from './pages/legal/AboutUsPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/legal/TermsAndConditionsPage';
import { CompanyProvider } from './contexts/CompanyContext';
import { DataProvider } from './contexts/DataContext';

// --- Main App ---

export default function App() {
  const [isSplash, setIsSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  if (isSplash) {
    return <SplashScreen onComplete={() => setIsSplash(false)} />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={(user) => {
      setIsLoggedIn(true);
      setUsername(user);
    }} />;
  }

  return (
    <DataProvider>
      <CompanyProvider>
        <Router>
          <div className="min-h-screen bg-brand-light pb-24 pt-safe">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage username={username} />} />
                <Route path="/customer-hub/*" element={<CustomerHub />} />
                <Route path="/entry" element={<EntryPage />} />
                <Route path="/report/*" element={<ReportPage />} />
                <Route path="/quick-settings" element={<QuickSettingsPage />} />
                <Route path="/products" element={<ProductDetailsPage />} />
                <Route path="/hydryx" element={<HydryXPage />} />
                <Route path="/general-profile" element={<GeneralProfilePage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                <Route path="/settings" element={<SettingsPage onLogout={() => setIsLoggedIn(false)} />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </Router>
      </CompanyProvider>
    </DataProvider>
  );
}
