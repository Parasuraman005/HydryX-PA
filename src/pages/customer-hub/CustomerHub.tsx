import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Search, Phone, Plus, MessageSquare, FileText, ChevronRight, ArrowLeft, CheckCircle, Edit, X, Save, UserPlus, BarChart3, Wallet, Users, Receipt, Download, MapPin, ArrowUpDown } from 'lucide-react';
import { Customer, Deposit, Sale, Stats } from '../../types';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { useCompany } from '../../contexts/CompanyContext';
import { useData } from '../../contexts/DataContext';
import { cn } from '../../lib/utils';

import HubMain from './HubMain';
import PaymentHistoryPage from './PaymentHistoryPage';
import DepositPage from './DepositPage';
import ReturnListPage from './ReturnListPage';
import CustomerDataPage from './CustomerDataPage';
import CreditDataPage from './CreditDataPage';
import CustomerReportPage from './CustomerReportPage';
import AddNewCustomerPage from './AddNewCustomerPage';



export default function CustomerHub() {
  return (
    <Routes>
      <Route path="/" element={<HubMain />} />
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/data" element={<CustomerDataPage />} />
      <Route path="/credit" element={<CreditDataPage />} />
      <Route path="/credit/history" element={<PaymentHistoryPage />} />
      <Route path="/add" element={<AddNewCustomerPage />} />
      <Route path="/report/:id" element={<CustomerReportPage />} />
      <Route path="/deposit/returns" element={<ReturnListPage />} />
    </Routes>
  );
}
