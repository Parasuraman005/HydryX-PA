import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, CheckCircle, Download, X, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Customer } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import { useCompany } from '../../contexts/CompanyContext';
import { useData } from '../../contexts/DataContext';
import { storage } from '../../lib/storage';

export default function EntryPage() {
  const { companyInfo } = useCompany();
  const { customers, products, refreshData } = useData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const customerIdParam = searchParams.get('customerId');
  
  const [mode, setMode] = useState<'Entry' | 'Billing'>('Entry');
  const [search, setSearch] = useState('');
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const [canType, setCanType] = useState<'Normal' | 'Bisleri'>('Normal');
  const [paymentType, setPaymentType] = useState<'Paid' | 'Credit'>('Paid');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI'>('Cash');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [billingQuantities, setBillingQuantities] = useState<Record<number, number>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    if (customerIdParam && customers.length > 0) {
      const customer = customers.find((c: Customer) => c.id === parseInt(customerIdParam));
      if (customer) {
        setSearch(customer.name);
        setQuantities({ [customer.id]: 1 });
      }
    }
  }, [customerIdParam, customers]);

  const apartments = Array.from(new Set(customers.map(c => c.apartment_name?.toLowerCase()))).filter(Boolean) as string[];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.flat_no.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesApartment = !selectedApartment || c.apartment_name?.toLowerCase() === selectedApartment.toLowerCase();
    return matchesSearch && matchesApartment;
  });

  const handleQtyChange = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const handleSaveEntry = async () => {
    const entries = Object.entries(quantities).filter(([_, qty]) => (qty as number) > 0);
    if (entries.length === 0) {
      alert("Please add at least one quantity before saving.");
      return;
    }

    try {
      for (const [id, qty] of entries) {
        const customer = customers.find(c => c.id === parseInt(id));
        if (!customer) continue;

        const rate = canType === 'Normal' ? customer.normal_rate : customer.bisleri_rate;
        const total = rate * (qty as number);
        const amountReceived = paymentType === 'Paid' ? total : 0;
        const creditAmount = paymentType === 'Credit' ? total : 0;

        storage.addSale({
          customer_id: customer.id,
          product_details: `${canType} Can x ${qty} @ ${rate} = ${total}`,
          amount_received: amountReceived,
          credit_amount: creditAmount,
          total_amount: total,
          payment_mode: paymentType === 'Paid' ? paymentMode : 'Credit',
          type: 'Entry',
          date: new Date().toISOString()
        });
      }
      refreshData();

      setSuccessMsg(`Saved! Total Received: ₹${Object.entries(quantities).reduce((acc: number, [id, qty]) => {
        const c = customers.find(cust => cust.id === parseInt(id));
        if (!c || paymentType === 'Credit') return acc;
        return acc + (canType === 'Normal' ? c.normal_rate : c.bisleri_rate) * (qty as number);
      }, 0)}`);
      setQuantities({});
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    }
  };

  // Billing Mode State
  const [billingForm, setBillingForm] = useState({ name: '', phone: '' });
  const [productSearch, setProductSearch] = useState('');
  const [customRates, setCustomRates] = useState<Record<number, number>>({});

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleBillingQtyChange = (id: number, qty: number) => {
    setBillingQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, qty)
    }));
  };

  const handleCustomRateChange = (id: number, rate: number) => {
    setCustomRates(prev => ({
      ...prev,
      [id]: rate
    }));
  };

  const generatePDF = (data: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const brandColor: [number, number, number] = [0, 86, 179]; // Brand Blue
    const textColor = [0, 0, 0]; // Black

    // --- Header Section ---
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

    // Prop & GSTIN
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Prop. ", 15, 33);
    doc.setFont("helvetica", "normal");
    doc.text(`< ${companyInfo?.proprietor || "Propertior name"} >`, 26, 33);
    
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN: ", 90, 33);
    doc.setFont("helvetica", "normal");
    doc.text(`< ${companyInfo?.gstin || "gst in"} >`, 105, 33);

    // Address
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("Address : ", 15, 40);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${companyInfo?.address || "address"} >`, 35, 40);

    // Contact as
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("Contact as : ", 15, 46);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${companyInfo?.phone1 || "phone no 1"} >  < ${companyInfo?.phone2 || "phone no 2"} >`, 40, 46);

    // --- Bill To & Billing Date Section ---
    doc.setFontSize(13);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 15, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`CUSTOMER NAME : ${data.name || "Walk-in"}`, 15, 62);
    doc.text(`Address : ${data.address || ""}`, 15, 68);
    doc.text(`Phone no : ${data.phone || ""}`, 15, 74);

    // Billing Date
    doc.setFontSize(13);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Billing Date :", 130, 55);
    
    doc.setFontSize(12);
    doc.text("From :", 137, 62);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${new Date().toLocaleDateString()} >`, 152, 62);
    
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("To :", 137, 68);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${new Date().toLocaleDateString()} >`, 152, 68);

    // --- Table Section ---
    const startY = 85;
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

    data.products.forEach((p: any) => {
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      
      doc.text(`${rowNum}`, 15, currentY);
      doc.text(new Date().toLocaleDateString(), 40, currentY);
      doc.text(p.name, 85, currentY);
      doc.text(`₹${p.rate}`, 130, currentY);
      doc.text(`${p.qty}`, 160, currentY);
      doc.text(`₹${p.total.toFixed(2)}`, 195, currentY, { align: "right" });
      
      totalQty += p.qty;
      totalAmount += p.total;
      currentY += 8;
      rowNum++;
    });

    // --- Summary Section ---
    const finalY = Math.max(currentY + 10, 200);
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(1);
    doc.rect(15, finalY, 180, 16);
    
    doc.setFontSize(22);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Net Payment Rs. ₹", 20, finalY + 11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${totalAmount.toFixed(2)}`, 90, finalY + 11);
    
    doc.setLineWidth(1);
    doc.line(140, finalY, 140, finalY + 16); // Vertical separator
    
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${totalQty}`, 160, finalY + 8, { align: "center" });
    doc.setFontSize(8);
    doc.text("Count", 160, finalY + 13, { align: "center" });

    doc.setFontSize(10);
    doc.text(`${totalAmount.toFixed(2)}`, 180, finalY + 8, { align: "center" });
    doc.setFontSize(8);
    doc.text("Total amount", 180, finalY + 13, { align: "center" });

    // --- Footer Section ---
    const footerY = 230;
    doc.setFontSize(12);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("For Payment", 15, footerY);
    
    doc.setFontSize(11);
    doc.text("UPI NAME : ", 15, footerY + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${companyInfo?.upiId || companyInfo?.name || "Upi name"} >`, 45, footerY + 8);
    
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("UPI NUMBER : ", 15, footerY + 16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${companyInfo?.upiNumber || companyInfo?.phone1 || "Upi NUMBER"} >`, 45, footerY + 16);

    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`For ${companyInfo?.name?.toUpperCase() || "V.V WATER SUPPLY"}`, 115, footerY + 16);
    doc.text("RECEIVED BY", 165, footerY + 16);

    // Bottom Bar
    const bottomY = 280;
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.4);
    doc.line(15, bottomY - 5, 195, bottomY - 5);
    
    doc.setFontSize(9);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("DEVELOPED & DESIGNED BY PA SOFTWARES", 15, bottomY);
    
    doc.text(`< ${companyInfo?.website1 || "Website link 1"} >`, 195, bottomY, { align: "right" });

    doc.save(`invoice_${data.name || 'walkin'}.pdf`);
  };

  const handleSaveBilling = async () => {
    const entries = Object.entries(billingQuantities).filter(([_, qty]) => (qty as number) > 0);
    if (entries.length === 0) {
      alert("Please add at least one product quantity before saving.");
      return;
    }

    try {
      let totalBill = 0;
      let productDetails = [];
      let productsList = [];

      for (const [id, qty] of entries) {
        const product = products.find(p => p.id === parseInt(id));
        if (!product) continue;
        const total = product.rate * (qty as number);
        totalBill += total;
        productDetails.push(`${product.name} x ${qty} @ ${product.rate} = ${total}`);
        productsList.push({ name: product.name, qty, rate: product.rate, total });

        // Update stock on server
        storage.updateProduct(product.id, { stock: Math.max(0, product.stock - (qty as number)) });
      }

      storage.addSale({
        customer_id: null, // Walk-in
        customer_name: billingForm.name || 'Walk-in',
        phone: billingForm.phone,
        product_details: productDetails.join(', '),
        amount_received: totalBill,
        credit_amount: 0,
        total_amount: totalBill,
        payment_mode: paymentMode,
        type: 'Billing',
        date: new Date().toISOString()
      });

      setInvoiceData({
        name: billingForm.name,
        phone: billingForm.phone,
        products: productsList,
        totalBill
      });
      setShowInvoiceModal(true);
      setBillingQuantities({});
      setBillingForm({ name: '', phone: '' });
      setProductSearch('');
      // Refresh products to get updated stock
      refreshData();
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to save bill. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-blue-50/50">
      <div className="flex-grow">
        {/* Header Section */}
        <div className="bg-white border-b border-blue-100 p-4 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-400 hover:text-brand-dark transition-all active:scale-90">
                <ArrowLeft size={18} />
              </button>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Operations</p>
                <h2 className="text-xl font-black text-brand-dark tracking-tighter">Entry Hub</h2>
              </div>
            </div>
            <div className="flex bg-blue-100/50 p-1 rounded-xl border border-blue-100 backdrop-blur-sm">
              <button 
                onClick={() => setMode('Entry')}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'Entry' ? 'bg-white text-brand-dark shadow-sm border border-blue-100' : 'text-blue-400 hover:text-blue-600'}`}
              >
                Delivery
              </button>
              <button 
                onClick={() => setMode('Billing')}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'Billing' ? 'bg-white text-brand-dark shadow-sm border border-blue-100' : 'text-blue-400 hover:text-blue-600'}`}
              >
                Billing
              </button>
            </div>
          </div>

          {mode === 'Entry' && (
            <div className="space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-dark transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Customer, Flat, Phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:ring-4 focus:ring-brand-dark/5 focus:border-brand-dark/20 text-sm font-bold transition-all"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                <button 
                  onClick={() => setSelectedApartment(null)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${!selectedApartment ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}
                >
                  All Apartments
                </button>
                {apartments.map(apt => (
                  <button 
                    key={apt}
                    onClick={() => setSelectedApartment(apt)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${selectedApartment?.toLowerCase() === apt.toLowerCase() ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}
                  >
                    {apt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {mode === 'Entry' ? (
          <div className="p-2 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                <button onClick={() => setCanType('Normal')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${canType === 'Normal' ? 'bg-brand-dark text-white shadow-md' : 'text-slate-400'}`}>Normal</button>
                <button onClick={() => setCanType('Bisleri')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${canType === 'Bisleri' ? 'bg-brand-dark text-white shadow-md' : 'text-slate-400'}`}>Bisleri</button>
              </div>
              <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                <button onClick={() => setPaymentType('Paid')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${paymentType === 'Paid' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>PAID</button>
                <button onClick={() => setPaymentType('Credit')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${paymentType === 'Credit' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400'}`}>CREDIT</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">#</th>
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Rate</th>
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-2">Amt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredCustomers.map((c, idx) => {
                      const rate = canType === 'Normal' ? c.normal_rate : c.bisleri_rate;
                      const qty = quantities[c.id] || 0;
                      return (
                        <tr key={c.id} className={`transition-colors ${qty > 0 ? 'bg-brand-dark/5' : 'hover:bg-slate-50/30'}`}>
                          <td className="p-1 text-center text-[9px] font-bold text-slate-300">{idx + 1}</td>
                          <td className="p-1">
                            <div className="font-black text-brand-dark text-[10px] truncate max-w-[80px]">{c.name}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Flat: {c.flat_no}</div>
                          </td>
                          <td className="p-1 text-center font-black text-brand-dark text-[10px]">₹{rate}</td>
                          <td className="p-1">
                            <div className="flex items-center justify-center gap-0.5">
                              <button 
                                onClick={() => handleQtyChange(c.id, -1)} 
                                className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md text-slate-500 active:scale-90 transition-all hover:bg-slate-200"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="w-5 text-center font-black text-brand-dark text-xs">{qty}</span>
                              <button 
                                onClick={() => handleQtyChange(c.id, 1)} 
                                className="w-6 h-6 flex items-center justify-center bg-brand-dark/10 rounded-md text-brand-dark active:scale-90 transition-all hover:bg-brand-dark/20"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </td>
                          <td className="p-1 text-right pr-2 font-black text-brand-dark text-[10px]">₹{rate * qty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-0 space-y-0">
            <div className="bg-white p-3 border-b border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Walk-in name"
                    value={billingForm.name}
                    onChange={(e) => setBillingForm({...billingForm, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-[10px] font-black focus:bg-white focus:ring-2 focus:ring-brand-dark/5 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Contact number"
                    value={billingForm.phone}
                    onChange={(e) => setBillingForm({...billingForm, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-[10px] font-black focus:bg-white focus:ring-2 focus:ring-brand-dark/5 transition-all"
                  />
                </div>
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-dark transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="Search Products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 outline-none text-[10px] font-black focus:bg-white focus:ring-2 focus:ring-brand-dark/5 transition-all"
                />
              </div>
            </div>

            <div className="bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">#</th>
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Rate</th>
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-2">Amt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredProducts.map((p, idx) => {
                      const qty = billingQuantities[p.id] || 0;
                      return (
                        <tr key={p.id} className={`transition-colors ${qty > 0 ? 'bg-brand-dark/5' : 'hover:bg-slate-50/30'}`}>
                          <td className="p-1 text-center text-[8px] font-bold text-slate-300">{idx + 1}</td>
                          <td className="p-1 font-black text-brand-dark text-[9px] truncate max-w-[100px]">{p.name}</td>
                          <td className="p-1 text-center">
                            <input 
                              type="number" 
                              value={customRates[p.id] ?? p.rate}
                              onChange={(e) => handleCustomRateChange(p.id, parseFloat(e.target.value) || 0)}
                              className="w-10 px-1 py-0.5 border border-slate-100 rounded-md text-[9px] font-black text-center outline-none focus:ring-2 focus:ring-brand-dark/5 bg-slate-50/50 focus:bg-white transition-all"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <input 
                              type="number" 
                              value={qty || ''}
                              onChange={(e) => handleBillingQtyChange(p.id, parseInt(e.target.value) || 0)}
                              className="w-8 px-1 py-0.5 border border-slate-100 rounded-md text-[9px] font-black text-center outline-none focus:ring-2 focus:ring-brand-dark/5 bg-slate-50/50 focus:bg-white transition-all"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-1 text-right pr-2 font-black text-brand-dark text-[9px]">₹{(customRates[p.id] ?? p.rate) * qty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions - Minimized */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-3 pb-safe space-y-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[1.5rem] z-40">
        {mode === 'Entry' ? (
          <>
            {paymentType === 'Paid' && (
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => setPaymentMode('Cash')} 
                  className={`flex-1 py-1 rounded-lg border font-black text-[8px] uppercase tracking-widest transition-all duration-300 ${paymentMode === 'Cash' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                >
                  Cash
                </button>
                <button 
                  onClick={() => setPaymentMode('UPI')} 
                  className={`flex-1 py-1 rounded-lg border font-black text-[8px] uppercase tracking-widest transition-all duration-300 ${paymentMode === 'UPI' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                >
                  UPI
                </button>
              </div>
            )}
            <button 
              onClick={handleSaveEntry}
              className={`w-full ${paymentType === 'Paid' ? 'bg-emerald-600' : 'bg-rose-600'} text-white py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
            >
              <CheckCircle size={12} />
              {paymentType === 'Paid' ? 'CONFIRM PAID ENTRY' : 'SAVE CREDIT ENTRY'}
            </button>
          </>
        ) : (
          <>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => setPaymentMode('Cash')} 
                className={`flex-1 py-1 rounded-lg border font-black text-[8px] uppercase tracking-widest transition-all duration-300 ${paymentMode === 'Cash' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
              >
                Cash
              </button>
              <button 
                onClick={() => setPaymentMode('UPI')} 
                className={`flex-1 py-1 rounded-lg border font-black text-[8px] uppercase tracking-widest transition-all duration-300 ${paymentMode === 'UPI' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
              >
                UPI
              </button>
            </div>
            <button 
              onClick={handleSaveBilling}
              className="w-full bg-brand-dark text-white py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Download size={12} />
              GENERATE BILL
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {showInvoiceModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-[280px] shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-brand-dark uppercase tracking-tight">Success!</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Transaction completed</p>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => { generatePDF(invoiceData); setShowInvoiceModal(false); }}
                  className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Download size={12} /> Download Invoice
                </button>
              </div>

              <button 
                onClick={() => setShowInvoiceModal(false)} 
                className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-dark transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {successMsg && (
        <div className="fixed bottom-28 left-4 right-4 bg-emerald-600 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle size={18} />
          </div>
          <span className="font-bold">{successMsg}</span>
        </div>
      )}
    </div>
  );
}
