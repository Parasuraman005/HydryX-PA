export interface Customer {
  id: number;
  name: string;
  phone: string;
  whatsapp: string;
  flat_no: string;
  apartment_name: string;
  deposit_amount: number;
  normal_rate: number;
  bisleri_rate: number;
  type: 'Deposit' | 'Non Deposit';
  advance_balance: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  rate: number;
  stock: number;
}

export interface Sale {
  id: number;
  customer_id: number;
  customer_name?: string;
  flat_no?: string;
  apartment_name?: string;
  phone?: string;
  whatsapp?: string;
  product_details: string;
  amount_received: number;
  credit_amount: number;
  total_amount: number;
  payment_mode: string;
  type: 'Entry' | 'Billing';
  date: string;
}

export interface Load {
  id: number;
  supplier_name: string;
  phone?: string;
  details: string;
  amount: number;
  type: 'Paid' | 'Pending';
  date: string;
}

export interface Deposit {
  id: number;
  customer_id: number;
  customer_name: string;
  phone: string;
  flat_no: string;
  amount: number;
  date: string;
  ref: string;
  type: 'Deposit' | 'Return';
}

export interface Stats {
  totalCustomers: number;
  totalDepositAmount: number;
  totalDepositCustomers: number;
  totalCreditAmount: number;
  totalCreditReceived: number;
}

export interface CompanyInfo {
  logo?: string;
  name: string;
  proprietor: string;
  gstin: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  address: string;
  website1?: string;
  website2?: string;
  upiId?: string;
  upiNumber?: string;
  holderName?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  path: string;
  icon: string;
  color: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  gstin: string;
  address: string;
  created_at: string;
}

