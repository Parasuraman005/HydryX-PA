import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, X, CheckCircle, FileText, MessageSquare, ArrowUpDown, Trash2, Download, Plus, Save, Phone, Building2, MapPin, Hash, User, Calendar, CreditCard, Droplets, Banknote, History, ChevronRight, BarChart3, Users, Truck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCompany } from '../../contexts/CompanyContext';
import { useData } from '../../contexts/DataContext';
import { storage } from '../../lib/storage';
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
  const text = "Hello " + sale.customer_name + ",\n\nThis is a gentle reminder regarding your pending payment of ₹" + sale.credit_amount + " for water delivery.\n\nPlease settle the amount at your earliest convenience.\n\nThank you,\nV V WATER SUPPLY";
  return encodeURIComponent(text);
};

export default function CreditDataPage() {
  const { companyInfo } = useCompany();
  const { customers, sales, refreshData } = useData();
  const [enrichedSales, setEnrichedSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<'high' | 'low'>('high');
  const [settlement, setSettlement] = useState<any | null>(null);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI'>('Cash');
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const navigate = useNavigate();

  const [showDownload, setShowDownload] = useState<any | null>(null);

  const closeSettlement = () => {
    setSettlement(null);
    setReceivedAmount('');
    setPaymentMode('Cash');
    setSettlementDate(new Date().toISOString().split('T')[0]);
  };

  const generateWhatsAppMessage = (sale: Sale) => {
    const customer = customers.find(c => c.id === sale.customer_id);
    const normalRate = customer?.normal_rate || 0;
    const bisleriRate = customer?.bisleri_rate || 0;
    
    // Aggregate all unpaid sales for this customer
    const customerSales = sales.filter(s => s.customer_id === sale.customer_id && s.credit_amount > 0);
    
    let normalCount = 0;
    let bisleriCount = 0;
    let total = 0;
    let dates: Date[] = [];
    
    customerSales.forEach(s => {
      total += s.credit_amount;
      dates.push(new Date(s.date));
      if (s.product_details) {
        const parts = s.product_details.split(', ');
        parts.forEach(part => {
          if (part.includes('Normal Can')) {
            const match = part.match(/x (\d+)/);
            if (match) normalCount += parseInt(match[1]);
          } else if (part.includes('Bisleri Can')) {
            const match = part.match(/x (\d+)/);
            if (match) bisleriCount += parseInt(match[1]);
          }
        });
      }
    });

    // Sort dates to find from and to
    dates.sort((a, b) => a.getTime() - b.getTime());
    const fromDate = dates.length > 0 ? dates[0].toLocaleDateString() : new Date(sale.date).toLocaleDateString();
    const toDate = dates.length > 0 ? dates[dates.length - 1].toLocaleDateString() : new Date(sale.date).toLocaleDateString();

    const shopName = companyInfo?.name || 'Shop Name';
    const address = companyInfo?.address || '';
    const phone1 = companyInfo?.phone1 || '';
    const phone2 = companyInfo?.phone2 || '';
    const website1 = companyInfo?.website1 || '';
    const website2 = companyInfo?.website2 || '';
    const upiId = companyInfo?.upiId || '';
    const upiNumber = companyInfo?.upiNumber || '';

    let msg = `From ${shopName}\n`;
    if (address) msg += `${address}\n`;
    
    let contactLine = 'Contact : ';
    if (phone1) contactLine += phone1;
    if (phone1 && phone2) contactLine += ' ,';
    if (phone2) contactLine += phone2;
    if (phone1 || phone2) msg += `${contactLine}\n`;
    
    if (website1) msg += `${website1}\n`;
    if (website2) msg += `${website2}\n`;
    
    msg += `\nBilling Period: ${fromDate} to ${toDate}\n`;
    if (normalCount > 0) {
      msg += `Normal Cans (₹${normalRate} per can): ${normalCount}\n`;
    }
    if (bisleriCount > 0) {
      msg += `Bisleri Cans (₹${bisleriRate} per can): ${bisleriCount}\n`;
    }
    msg += `Total Amount Payable: ₹${total}\n`;
    msg += `You may complete the payment using the details below:\n`;
    msg += `UPI ID: ${upiId}\n`;
    msg += `UPI Number: ${upiNumber}\n`;
    msg += `Once the payment is made, kindly share the screenshot for verification.\n`;
    msg += `If you have already completed the payment, please disregard this message.\n`;

    return encodeURIComponent(msg);
  };

  useEffect(() => {
    // Enrich sales with customer data (apartment_name, phone, whatsapp)
    const enriched = sales.map((s: Sale) => {
      const customer = customers.find((c: Customer) => c.id === s.customer_id);
      return {
        ...s,
        apartment_name: customer?.apartment_name || '',
        phone: customer?.phone || '',
        whatsapp: customer?.whatsapp || ''
      };
    });
    setEnrichedSales(enriched);
  }, [sales, customers]);

  const apartments = Array.from(new Set(customers.map(c => c.apartment_name?.toUpperCase()))).filter(Boolean) as string[];

  const aggregatedSales = Object.values(enrichedSales.reduce((acc: any, sale) => {
    if (sale.credit_amount <= 0) return acc;
    
    if (!acc[sale.customer_id]) {
      acc[sale.customer_id] = {
        ...sale,
        credit_amount: 0,
        sales: []
      };
    }
    acc[sale.customer_id].credit_amount += sale.credit_amount;
    acc[sale.customer_id].sales.push(sale);
    return acc;
  }, {})).filter((agg: any) => {
    const matchesCategory = category === 'All' || agg.apartment_name?.toUpperCase() === category;
    const matchesSearch = agg.customer_name?.toLowerCase().includes(search.toLowerCase()) || 
                          agg.flat_no?.toLowerCase().includes(search.toLowerCase()) ||
                          agg.phone?.includes(search);
    return agg.credit_amount > 0 && matchesCategory && matchesSearch;
  });

  const sortedAggregated = aggregatedSales.sort((a: any, b: any) => sort === 'high' ? b.credit_amount - a.credit_amount : a.credit_amount - b.credit_amount);

  const handleSettlement = async () => {
    if (!settlement) return;
    const amount = parseFloat(receivedAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    try {
      // Distribute the received amount across the customer's credit sales (FIFO)
      let remainingAmount = amount;
      const creditSales = [...settlement.sales].filter((s: any) => s.credit_amount > 0).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const settlementRecords: Sale[] = [];

      for (const sale of creditSales) {
        if (remainingAmount <= 0) break;
        const settleFromThisSale = Math.min(sale.credit_amount, remainingAmount);
        const newCredit = sale.credit_amount - settleFromThisSale;
        remainingAmount -= settleFromThisSale;

        // 1. Create the settlement record for this specific sale
        const newSale = storage.addSale({
          customer_id: settlement.customer_id,
          product_details: `Credit Settlement for Sale #${sale.id}`,
          amount_received: settleFromThisSale,
          credit_amount: -settleFromThisSale,
          total_amount: 0,
          payment_mode: paymentMode,
          date: settlementDate,
          type: 'Billing'
        });

        // 2. Update the original sale's credit_amount
        storage.updateSale(sale.id, { credit_amount: newCredit });

        const newRecord: any = {
          id: newSale.id,
          customer_id: settlement.customer_id,
          customer_name: settlement.customer_name,
          product_details: `Credit Settlement for Sale #${sale.id}`,
          amount_received: settleFromThisSale,
          credit_amount: -settleFromThisSale,
          total_amount: 0,
          payment_mode: paymentMode,
          date: settlementDate,
          type: 'Billing',
          flat_no: settlement.flat_no,
          phone: (settlement as any).phone,
          whatsapp: (settlement as any).whatsapp,
          apartment_name: (settlement as any).apartment_name
        };
        settlementRecords.push(newRecord);
        
        // Update local state for this sale
        // setSales(prev => prev.map(s => s.id === sale.id ? { ...s, credit_amount: newCredit } : s));
      }

      // Handle extra payment (advance)
      if (remainingAmount > 0) {
        const newSale = storage.addSale({
          customer_id: settlement.customer_id,
          product_details: `Advance Payment`,
          amount_received: remainingAmount,
          credit_amount: -remainingAmount,
          total_amount: 0,
          payment_mode: paymentMode,
          date: settlementDate,
          type: 'Billing'
        });
        
        const advanceRecord: any = {
          id: newSale.id,
          customer_id: settlement.customer_id,
          customer_name: settlement.customer_name,
          product_details: `Advance Payment`,
          amount_received: remainingAmount,
          credit_amount: -remainingAmount,
          total_amount: 0,
          payment_mode: paymentMode,
          date: settlementDate,
          type: 'Billing',
          flat_no: settlement.flat_no,
          phone: (settlement as any).phone,
          whatsapp: (settlement as any).whatsapp,
          apartment_name: (settlement as any).apartment_name
        };
        settlementRecords.push(advanceRecord);
      }

      refreshData();

      // For the receipt, we'll use a virtual sale that represents the total payment
      const totalSettledSale = { 
        ...settlement, 
        credit_amount: settlement.credit_amount - amount,
        amount_received: amount,
        date: settlementDate,
        payment_mode: paymentMode,
        product_details: `Total Credit Settlement: ₹${amount}`
      };
      
      setShowDownload(totalSettledSale);
      closeSettlement();
    } catch (error) {
      console.error("Error processing settlement:", error);
      alert("Failed to process settlement. Please try again.");
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDeleteSettlement = async (id: number) => {
    // Find the settlement to revert its effect on the original sale
    const deletedSettlement = sales.find(s => s.id === id);
    if (deletedSettlement && deletedSettlement.product_details?.includes('Credit Settlement for Sale #')) {
      const originalSaleId = parseInt(deletedSettlement.product_details.split('#')[1]);
      const amount = deletedSettlement.amount_received;
      
      const originalSale = sales.find(s => s.id === originalSaleId);
      if (originalSale) {
        const revertedCreditAmount = originalSale.credit_amount + amount;
        storage.updateSale(originalSaleId, { credit_amount: revertedCreditAmount });
      }
    }
    
    storage.deleteSale(id);
    refreshData();
    setDeleteConfirmId(null);
  };

  const generatePDF = (sale: Sale) => {
    const customer = customers.find(c => c.id === sale.customer_id);
    const normalRate = customer?.normal_rate || 0;
    const bisleriRate = customer?.bisleri_rate || 0;
    
    const customerSales = sales.filter(s => s.customer_id === sale.customer_id && s.credit_amount > 0);
    customerSales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const fromDate = customerSales.length > 0 ? new Date(customerSales[0].date).toLocaleDateString() : new Date(sale.date).toLocaleDateString();
    const toDate = customerSales.length > 0 ? new Date(customerSales[customerSales.length - 1].date).toLocaleDateString() : new Date(sale.date).toLocaleDateString();

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const brandColor: [number, number, number] = [0, 86, 179]; // Brand Blue
    const textColor = [0, 0, 0]; // Black

    // --- Header Section ---
    if (companyInfo?.logo) {
      try {
        doc.addImage(companyInfo.logo, 'PNG', 15, 10, 20, 20);
      } catch (e) {
        console.error("Error adding logo to PDF", e);
      }
    }

    doc.setFontSize(32);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(companyInfo?.name?.toUpperCase() || "V V WATER SUPPLY", 15, 25);

    // Invoice Note Box
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.8);
    doc.rect(165, 15, 30, 12);
    doc.setFontSize(9);
    doc.text("INVOICE", 180, 20, { align: "center" });
    doc.text("NOTE", 180, 24, { align: "center" });

    // Address & GSTIN
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Address : ", 15, 33);
    doc.setFont("helvetica", "normal");
    doc.text(`${companyInfo?.address || "address"}`, 35, 33);
    
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN: ", 120, 33);
    doc.setFont("helvetica", "normal");
    doc.text(`${companyInfo?.gstin || "gstin"}`, 135, 33);

    // Contact as
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("Contact as : ", 15, 40);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${companyInfo?.phone1 || "phone no 1"}   ${companyInfo?.phone2 || "phone no 2"}`, 40, 40);

    // --- Bill To & Billing Date Section ---
    doc.setFontSize(13);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 15, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`CUSTOMER NAME : ${customer?.name || (customerSales[0]?.customer_name || "")}`, 15, 57);
    doc.text(`Address : ${customer?.flat_no || (customerSales[0]?.flat_no || "")}, ${customer?.apartment_name || (customerSales[0]?.apartment_name || "")}`, 15, 63);
    doc.text(`Phone no : ${customer?.phone || (customerSales[0]?.phone || "")}`, 15, 69);

    // Billing Date
    doc.setFontSize(13);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Billing Date :", 130, 50);
    
    doc.setFontSize(12);
    doc.text("From :", 137, 57);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${fromDate}`, 152, 57);
    
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("To :", 137, 63);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${toDate}`, 152, 63);

    // --- Table Section ---
    const startY = 80;
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.6);
    doc.line(15, startY, 195, startY); // Top line
    
    doc.setFontSize(11);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("No.", 15, startY + 6);
    doc.text("DATE", 40, startY + 6);
    doc.text("Type", 85, startY + 6);
    doc.text("Rate", 130, startY + 6);
    doc.text("QTY", 160, startY + 6);
    doc.text("Amount", 195, startY + 6, { align: "right" });

    doc.line(15, startY + 9, 195, startY + 9); // Bottom line of header

    // Table Body
    let currentY = startY + 16;
    let totalQty = 0;
    let totalAmount = 0;
    let rowNum = 1;

    customerSales.forEach(s => {
      if (s.product_details) {
        const parts = s.product_details.split(', ');
        parts.forEach(part => {
          let type = '';
          let qty = 0;
          let rate = 0;
          
          if (part.includes('Normal Can')) {
            type = 'Normal';
            const match = part.match(/x (\d+)/);
            if (match) qty = parseInt(match[1]);
            rate = normalRate;
          } else if (part.includes('Bisleri Can')) {
            type = 'Bisleri';
            const match = part.match(/x (\d+)/);
            if (match) qty = parseInt(match[1]);
            rate = bisleriRate;
          }

          if (qty > 0) {
            const amount = qty * rate;
            totalQty += qty;
            totalAmount += amount;

            doc.setFontSize(10);
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFont("helvetica", "normal");

            doc.text(rowNum.toString(), 15, currentY);
            doc.text(new Date(s.date).toLocaleDateString(), 40, currentY);
            doc.text(type, 85, currentY);
            doc.text(`₹${rate}`, 130, currentY);
            doc.text(qty.toString(), 160, currentY);
            doc.text(`₹${amount.toFixed(2)}`, 195, currentY, { align: "right" });
            
            currentY += 8;
            rowNum++;

            // Page break check
            if (currentY > 270) {
              doc.addPage();
              currentY = 20;
            }
          }
        });
      }
    });

    // --- Summary Section ---
    const summaryY = 200;
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.6);
    doc.line(15, summaryY, 195, summaryY); // Top line
    
    doc.setFontSize(11);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 40, summaryY + 6);
    doc.text("Count", 160, summaryY + 6, { align: "center" });
    doc.text("Amount", 195, summaryY + 6, { align: "right" });
    
    doc.line(15, summaryY + 9, 195, summaryY + 9); // Bottom line
    
    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${totalQty}`, 160, summaryY + 15, { align: "center" });
    doc.text(`₹${totalAmount.toFixed(2)}`, 195, summaryY + 15, { align: "right" });

    // Net Payment Box
    const boxY = summaryY + 25;
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(1);
    doc.rect(15, boxY, 100, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Net Payment", 20, boxY + 8);
    doc.setFontSize(20);
    doc.text("Rs. ₹ " + totalAmount.toFixed(2), 20, boxY + 18);
    
    // For Payment Section (Right of box)
    doc.setFontSize(10);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("For Payment", 115, boxY + 5);
    
    doc.text("UPI NAME : ", 115, boxY + 12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${companyInfo?.upiId || companyInfo?.name || "Upi name"}`, 145, boxY + 12);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("UPI NUMBER : ", 115, boxY + 19);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${companyInfo?.upiNumber || companyInfo?.phone1 || "Upi NUMBER"}`, 145, boxY + 19);

    // Signatures
    const signY = boxY + 40;
    doc.setFontSize(10);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`For ${companyInfo?.name?.toUpperCase() || "V.V WATER SUPPLY"}`, 15, signY);
    doc.setFontSize(8);
    doc.text("SEAL / SIGNATURE", 15, signY + 5);

    doc.setFontSize(10);
    doc.text("RECEIVED BY", 100, signY, { align: "center" });

    // Footer
    const footerY = 285;
    doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.rect(0, footerY - 10, 210, 20, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`HydryX • Developed & Designed By PA SOFTWARES`, 15, footerY);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${companyInfo?.website1 || "Website link 1"}`, 195, footerY, { align: "right" });

    doc.save(`credit_note_${customer?.name || (customerSales[0]?.customer_name || "customer")}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 space-y-6 pb-safe">
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/customer-hub')} className="p-2 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-400 hover:text-brand-dark transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            {companyInfo?.logo && (
              <div className="w-10 h-10 bg-white rounded-xl border border-blue-100 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                <img src={companyInfo.logo} alt="Company Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="space-y-0.5">
              <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Management</p>
              <h2 className="text-xl font-black text-brand-dark tracking-tighter">Credit Ledgers</h2>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/customer-hub/credit/history')} className="w-12 h-12 rounded-full bg-white border border-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg group">
          <History size={20} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-blue-100 shadow-sm space-y-1">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Total Pending</p>
          <p className="text-xl font-black text-rose-600 font-mono">₹{sales.reduce((acc: number, s: any) => s.credit_amount > 0 ? acc + s.credit_amount : acc, 0)}</p>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-brand-dark transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, flat, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-blue-100 bg-white outline-none focus:ring-4 focus:ring-brand-dark/5 focus:border-brand-dark/20 text-xs font-bold transition-all shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>
        <button 
          onClick={() => setSort(sort === 'high' ? 'low' : 'high')}
          className="bg-white w-12 flex items-center justify-center rounded-xl border border-blue-100 text-blue-600 active:scale-95 transition-all shadow-sm hover:border-blue-200"
          title={`Sort: ${sort === 'high' ? 'High to Low' : 'Low to High'}`}
        >
          <ArrowUpDown size={16} />
        </button>
      </div>
      
      {/* Category Circular Boxes */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        <button 
          onClick={() => setCategory('All')}
          className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${category === 'All' ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'bg-white text-blue-400 border border-blue-100 hover:border-blue-200'}`}
        >
          All Units
        </button>
        {apartments.map(apt => (
          <button 
            key={apt} 
            onClick={() => setCategory(apt)}
            className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${category === apt ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'bg-white text-blue-400 border border-blue-100 hover:border-blue-200'}`}
          >
            {apt}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-3 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">S.No</th>
                <th className="px-3 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Customers Name</th>
                <th className="px-3 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Pending</th>
                <th className="px-3 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedAggregated.map((s: any, idx: number) => (
                <tr key={s.customer_id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-3 py-3 text-[9px] font-bold text-slate-300 font-mono">{idx + 1}</td>
                  <td className="px-3 py-3" onClick={() => setSelectedCustomer(s)}>
                    <div className="font-black text-brand-dark text-[11px] cursor-pointer group-hover:text-blue-600 transition-colors truncate max-w-[100px]">{s.customer_name}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Flat: {s.flat_no}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-rose-600 text-[11px] font-black font-mono tracking-tighter">₹{s.credit_amount}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => setSettlement(s)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Settlement"><CheckCircle size={14} /></button>
                      <a 
                        href={`https://wa.me/${((s as any).whatsapp || (s as any).phone || '').replace(/\D/g, '').length === 10 ? '91' + ((s as any).whatsapp || (s as any).phone || '').replace(/\D/g, '') : ((s as any).whatsapp || (s as any).phone || '').replace(/\D/g, '')}?text=${generateWhatsAppMessage(s)}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="WhatsApp"
                      >
                        <MessageSquare size={14} />
                      </a>
                      <button onClick={() => generatePDF(s)} className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Invoice"><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Modal */}
      {settlement && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-[320px] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-brand-dark uppercase tracking-tight">Settlement</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{settlement.customer_name}</p>
              </div>
              <button onClick={closeSettlement} className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors"><X size={18} className="text-slate-400" /></button>
            </div>
            
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100/50 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-rose-100/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-0.5 relative z-10">Total Pending Amount</p>
              <p className="text-2xl font-black text-rose-700 font-mono relative z-10">₹{settlement.credit_amount}</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Received Amount</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  autoFocus
                  value={receivedAmount} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (parseFloat(val) > settlement.credit_amount) {
                      setReceivedAmount(settlement.credit_amount.toString());
                    } else {
                      setReceivedAmount(val);
                    }
                  }} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold outline-none focus:bg-white transition-all" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Mode</label>
                <div className="flex gap-2">
                  <button onClick={() => setPaymentMode('Cash')} className={`flex-1 py-2 rounded-xl border font-black text-[8px] uppercase tracking-widest transition-all ${paymentMode === 'Cash' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-400 border-slate-100'}`}>Cash</button>
                  <button onClick={() => setPaymentMode('UPI')} className={`flex-1 py-2 rounded-xl border font-black text-[8px] uppercase tracking-widest transition-all ${paymentMode === 'UPI' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-400 border-slate-100'}`}>UPI</button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={closeSettlement}
                className="flex-1 py-3 rounded-2xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSettlement} 
                disabled={!receivedAmount || parseFloat(receivedAmount) <= 0}
                className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all ${!receivedAmount || parseFloat(receivedAmount) <= 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-emerald-600/10'}`}
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Download Invoice Modal (Post Settlement) */}
      <AnimatePresence>
        {showDownload && (
          <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-[280px] rounded-3xl p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-brand-dark uppercase tracking-tight">Payment Received</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Settlement successful</p>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => { generatePDF(showDownload); setShowDownload(null); }}
                  className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Download size={12} /> Download Receipt
                </button>
              </div>

              <button 
                onClick={() => setShowDownload(null)} 
                className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-dark transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col relative">
            <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-50 rounded-full transition-colors z-20"><X size={20} className="text-slate-400" /></button>
            
            <div className="shrink-0 space-y-1">
              <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">{selectedCustomer.customer_name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedCustomer.flat_no} • {selectedCustomer.apartment_name}</p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 -mx-2 px-2">
              <table className="w-full text-left text-[10px]">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[8px]">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Cans</th>
                    <th className="py-3 px-2 text-center">Count</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sales
                    .filter(s => s.customer_id === selectedCustomer.customer_id && s.credit_amount > 0)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(s => {
                      const customer = customers.find(c => c.id === s.customer_id);
                      const normalRate = customer?.normal_rate || 0;
                      const bisleriRate = customer?.bisleri_rate || 0;
                      
                      // Parse product details and adjust counts based on remaining credit_amount
                      // This is an approximation for multi-product sales, but works perfectly for single-product sales
                      const parts = s.product_details.split(', ');
                      let remainingCredit = s.credit_amount;

                      return parts.map((part, pIdx) => {
                        if (remainingCredit <= 0) return null;

                        let type = '';
                        let originalCount = 0;
                        let rate = 0;
                        
                        if (part.includes('Normal Can')) {
                          type = 'Normal Can';
                          const match = part.match(/x (\d+)/);
                          if (match) originalCount = parseInt(match[1]);
                          rate = normalRate;
                        } else if (part.includes('Bisleri Can')) {
                          type = 'Bisleri Can';
                          const match = part.match(/x (\d+)/);
                          if (match) originalCount = parseInt(match[1]);
                          rate = bisleriRate;
                        }

                        if (originalCount === 0) return null;

                        // Calculate how much of the remaining credit belongs to this part
                        const partTotal = originalCount * rate;
                        const actualAmountForThisPart = Math.min(remainingCredit, partTotal);
                        const actualCount = Math.ceil(actualAmountForThisPart / rate);
                        
                        remainingCredit -= actualAmountForThisPart;

                        if (actualCount <= 0) return null;

                        return (
                          <tr key={`${s.id}-${pIdx}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-2 font-mono text-slate-500 whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</td>
                            <td className="py-3 px-2 font-bold text-slate-700">{type}</td>
                            <td className="py-3 px-2 text-center font-mono font-black text-slate-600">{actualCount}</td>
                            <td className="py-3 px-2 text-right font-mono font-black text-rose-600">₹{actualAmountForThisPart}</td>
                          </tr>
                        );
                      });
                    })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 shrink-0">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100/50 text-center">
                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Normal Cans</p>
                <p className="text-sm font-black text-blue-700 font-mono">
                  {sales
                    .filter(s => s.customer_id === selectedCustomer.customer_id && s.credit_amount > 0)
                    .reduce((acc, s) => {
                      const customer = customers.find(c => c.id === s.customer_id);
                      const rate = customer?.normal_rate || 0;
                      if (rate === 0) return acc;
                      
                      const parts = s.product_details.split(', ');
                      let remainingCredit = s.credit_amount;
                      let normalCount = 0;
                      
                      parts.forEach(part => {
                        if (part.includes('Normal Can')) {
                          const match = part.match(/x (\d+)/);
                          if (match) {
                            const originalCount = parseInt(match[1]);
                            const partTotal = originalCount * rate;
                            const actualAmount = Math.min(remainingCredit, partTotal);
                            normalCount += Math.ceil(actualAmount / rate);
                            remainingCredit -= actualAmount;
                          }
                        } else if (part.includes('Bisleri Can')) {
                          const bRate = customer?.bisleri_rate || 0;
                          const match = part.match(/x (\d+)/);
                          if (match) {
                            const originalCount = parseInt(match[1]);
                            remainingCredit -= Math.min(remainingCredit, originalCount * bRate);
                          }
                        }
                      });
                      return acc + normalCount;
                    }, 0)}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100/50 text-center">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Bisleri Cans</p>
                <p className="text-sm font-black text-emerald-700 font-mono">
                  {sales
                    .filter(s => s.customer_id === selectedCustomer.customer_id && s.credit_amount > 0)
                    .reduce((acc, s) => {
                      const customer = customers.find(c => c.id === s.customer_id);
                      const rate = customer?.bisleri_rate || 0;
                      if (rate === 0) return acc;
                      
                      const parts = s.product_details.split(', ');
                      let remainingCredit = s.credit_amount;
                      let bisleriCount = 0;
                      
                      parts.forEach(part => {
                        if (part.includes('Bisleri Can')) {
                          const match = part.match(/x (\d+)/);
                          if (match) {
                            const originalCount = parseInt(match[1]);
                            const partTotal = originalCount * rate;
                            const actualAmount = Math.min(remainingCredit, partTotal);
                            bisleriCount += Math.ceil(actualAmount / rate);
                            remainingCredit -= actualAmount;
                          }
                        } else if (part.includes('Normal Can')) {
                          const nRate = customer?.normal_rate || 0;
                          const match = part.match(/x (\d+)/);
                          if (match) {
                            const originalCount = parseInt(match[1]);
                            remainingCredit -= Math.min(remainingCredit, originalCount * nRate);
                          }
                        }
                      });
                      return acc + bisleriCount;
                    }, 0)}
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100/50 text-center">
                <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Pending</p>
                <p className="text-sm font-black text-rose-700 font-mono">₹{selectedCustomer.credit_amount}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
