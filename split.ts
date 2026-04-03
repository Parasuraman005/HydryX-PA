import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync(path.join(process.cwd(), 'src/pages/CustomerHub.tsx'), 'utf-8');

const components = [
  'PaymentHistoryPage',
  'DepositPage',
  'ReturnListPage',
  'CustomerDataPage',
  'CreditDataPage',
  'CustomerReportPage',
  'AddNewCustomerPage'
];

let remainingContent = fileContent;

components.forEach(comp => {
  const regex = new RegExp(`function ${comp}\\(\\) \\{[\\s\\S]*?\\n\\}\\n`, 'g');
  const match = remainingContent.match(regex);
  if (match) {
    const componentCode = match[0];
    
    // Create basic imports
    const imports = `import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, X, CheckCircle, FileText, MessageSquare, ArrowUpDown, Trash2, Download, Plus, Save, Phone, Building2, MapPin, Hash, User, Calendar, CreditCard, Droplets, Banknote, History, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Types
interface Customer {
  id: number;
  name: string;
  phone: string;
  whatsapp?: string;
  flat_no: string;
  apartment_name: string;
  normal_rate: number;
  bisleri_rate: number;
  type: string;
  deposit_amount: number;
  advance_balance: number;
}

interface Sale {
  id: number;
  customer_id: number;
  customer_name?: string;
  product_details: string;
  amount_received: number;
  credit_amount: number;
  total_amount: number;
  payment_mode: string;
  date: string;
  type: string;
  flat_no?: string;
}

interface Stats {
  totalCustomers: number;
  totalDepositCustomers: number;
  totalDepositAmount: number;
}

const generateWhatsAppMessage = (sale: any) => {
  const text = "Hello " + sale.customer_name + ",\\n\\nThis is a gentle reminder regarding your pending payment of ₹" + sale.credit_amount + " for water delivery.\\n\\nPlease settle the amount at your earliest convenience.\\n\\nThank you,\\nV V WATER SUPPLY";
  return encodeURIComponent(text);
};

`;

    fs.writeFileSync(path.join(process.cwd(), `src/pages/customer-hub/${comp}.tsx`), imports + componentCode);
    remainingContent = remainingContent.replace(regex, '');
  }
});

// Update CustomerHub.tsx
const newImports = components.map(c => `import ${c} from './customer-hub/${c}';`).join('\n');
remainingContent = remainingContent.replace(/import HubMain from '\.\/customer-hub\/HubMain';/, `import HubMain from './customer-hub/HubMain';\n${newImports}`);

fs.writeFileSync(path.join(process.cwd(), 'src/pages/CustomerHub.tsx'), remainingContent);
console.log('Split complete!');
