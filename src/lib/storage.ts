import { Customer, Sale, Load, Deposit, CompanyInfo, QuickAction, Supplier } from '../types';

const STORAGE_KEY = 'hydryx_data';

interface AppData {
  customers: Customer[];
  products: any[];
  sales: Sale[];
  loads: Load[];
  deposits: Deposit[];
  suppliers: Supplier[];
  settings: {
    company_info: CompanyInfo;
    quick_actions: QuickAction[];
  };
}

const DEFAULT_DATA: AppData = {
  customers: [],
  products: [
    { id: 1, name: "300ml bottle", rate: 7, stock: 0 },
    { id: 2, name: "500ml bottle", rate: 10, stock: 0 },
    { id: 3, name: "1 litre bottle", rate: 20, stock: 0 },
    { id: 4, name: "5 litre bottle", rate: 70, stock: 0 },
    { id: 5, name: "10 litre bottle", rate: 110, stock: 0 },
    { id: 6, name: "300 ml case (20)pcs", rate: 165, stock: 0 },
    { id: 7, name: "500ml case (22)pcs", rate: 240, stock: 0 },
    { id: 8, name: "1 litre case (12)pcs", rate: 216, stock: 0 }
  ],
  sales: [],
  loads: [],
  deposits: [],
  suppliers: [],
  settings: {
    company_info: {
      name: 'V V water supply',
      proprietor: 'A.venkat',
      gstin: '',
      phone1: '8667458845',
      phone2: '8778585712',
      whatsapp: '8667458845',
      address: 'gems park(opp) near by baba temple mogappair west ch-600 037',
      website1: '',
      website2: '',
      upiId: 'nakshathra12.05.17@oksbi',
      upiNumber: '8778585712',
      holderName: 'sowmiya'
    },
    quick_actions: [
      { id: "1", label: "New Entry", path: "/entry", icon: "PlusCircle", color: "blue" },
      { id: "3", label: "Credit Customer", path: "/customer-hub/credit", icon: "Users", color: "emerald" },
      { id: "4", label: "Product Details", path: "/products", icon: "Package", color: "amber" }
    ]
  }
};

export const storage = {
  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return DEFAULT_DATA;
    }
    return JSON.parse(data);
  },

  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Customers
  getCustomers: () => storage.getData().customers,
  addCustomer: (customer: Omit<Customer, 'id'>) => {
    const data = storage.getData();
    const newCustomer = { ...customer, id: Date.now() } as Customer;
    data.customers.push(newCustomer);
    storage.saveData(data);
    return newCustomer;
  },
  updateCustomer: (id: number, updates: Partial<Customer>) => {
    const data = storage.getData();
    const idx = data.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.customers[idx] = { ...data.customers[idx], ...updates };
      storage.saveData(data);
      return data.customers[idx];
    }
    return null;
  },
  deleteCustomer: (id: number) => {
    const data = storage.getData();
    data.customers = data.customers.filter(c => c.id !== id);
    storage.saveData(data);
  },

  // Products
  getProducts: () => storage.getData().products,
  addProduct: (product: any) => {
    const data = storage.getData();
    const newProduct = { ...product, id: Date.now(), stock: product.stock || 0 };
    data.products.push(newProduct);
    storage.saveData(data);
    return newProduct;
  },
  updateProduct: (id: number, updates: any) => {
    const data = storage.getData();
    const idx = data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      data.products[idx] = { ...data.products[idx], ...updates };
      storage.saveData(data);
      return data.products[idx];
    }
    return null;
  },
  deleteProduct: (id: number) => {
    const data = storage.getData();
    data.products = data.products.filter(p => p.id !== id);
    storage.saveData(data);
  },

  // Sales
  getSales: () => {
    const data = storage.getData();
    return data.sales.map(s => {
      const customer = data.customers.find(c => c.id === s.customer_id);
      return {
        ...s,
        customer_name: customer?.name || s.customer_name || 'Walk-in',
        flat_no: customer?.flat_no || s.flat_no,
        phone: customer?.phone || s.phone,
        whatsapp: customer?.whatsapp || s.whatsapp,
        apartment_name: customer?.apartment_name || s.apartment_name
      };
    });
  },
  addSale: (sale: Omit<Sale, 'id'>) => {
    const data = storage.getData();
    let customerDetails = {};
    if (sale.customer_id) {
      const customer = data.customers.find(c => c.id === sale.customer_id);
      if (customer) {
        customerDetails = {
          customer_name: customer.name,
          flat_no: customer.flat_no,
          apartment_name: customer.apartment_name,
          phone: customer.phone,
          whatsapp: customer.whatsapp
        };
      }
    }
    const newSale = { 
      ...customerDetails,
      ...sale, 
      id: Date.now(), 
      date: sale.date || new Date().toISOString() 
    } as Sale;
    data.sales.push(newSale);
    storage.saveData(data);
    return newSale;
  },
  updateSale: (id: number, updates: Partial<Sale>) => {
    const data = storage.getData();
    const idx = data.sales.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.sales[idx] = { ...data.sales[idx], ...updates };
      storage.saveData(data);
      return data.sales[idx];
    }
    return null;
  },
  deleteSale: (id: number) => {
    const data = storage.getData();
    const saleToDelete = data.sales.find(s => s.id === id);
    if (saleToDelete) {
      if (saleToDelete.product_details?.includes('Credit Settlement for Sale #')) {
        const originalSaleId = parseInt(saleToDelete.product_details.split('#')[1]);
        const originalSale = data.sales.find(s => s.id === originalSaleId);
        if (originalSale) {
          originalSale.credit_amount += saleToDelete.amount_received;
        }
      }
      data.sales = data.sales.filter(s => {
        if (s.product_details?.includes(`Credit Settlement for Sale #${id}`)) return false;
        return s.id !== id;
      });
      storage.saveData(data);
    }
  },

  // Loads
  getLoads: () => storage.getData().loads,
  addLoad: (load: Omit<Load, 'id'>) => {
    const data = storage.getData();
    const newLoad = { ...load, id: Date.now(), date: load.date || new Date().toISOString() } as Load;
    data.loads.push(newLoad);
    storage.saveData(data);
    return newLoad;
  },
  updateLoad: (id: number, updates: Partial<Load>) => {
    const data = storage.getData();
    const idx = data.loads.findIndex(l => l.id === id);
    if (idx !== -1) {
      data.loads[idx] = { ...data.loads[idx], ...updates };
      storage.saveData(data);
      return data.loads[idx];
    }
    return null;
  },

  // Deposits
  getDeposits: () => {
    const data = storage.getData();
    return data.deposits.map(d => {
      const customer = data.customers.find(c => c.id === d.customer_id);
      return { ...d, customer_name: customer?.name, phone: customer?.phone, flat_no: customer?.flat_no };
    });
  },
  addDeposit: (deposit: Omit<Deposit, 'id'>) => {
    const data = storage.getData();
    const newDeposit = { ...deposit, id: Date.now(), date: deposit.date || new Date().toISOString() } as Deposit;
    data.deposits.push(newDeposit);
    
    if (deposit.customer_id) {
      const customer = data.customers.find(c => c.id === deposit.customer_id);
      if (customer) {
        if (deposit.type === 'Return') {
          customer.deposit_amount = (customer.deposit_amount || 0) - deposit.amount;
          if (customer.deposit_amount <= 0) {
            customer.type = 'Non Deposit';
          }
        } else if (deposit.type === 'Deposit') {
          customer.deposit_amount = (customer.deposit_amount || 0) + deposit.amount;
          customer.type = 'Deposit';
        }
      }
    }
    storage.saveData(data);
    return newDeposit;
  },

  // Settings
  getSettings: () => storage.getData().settings,
  saveSettings: (settings: AppData['settings']) => {
    const data = storage.getData();
    data.settings = settings;
    storage.saveData(data);
  },

  // Export/Import
  exportData: () => {
    const data = storage.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydryx_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      // Basic validation
      if (data.customers && data.sales && data.settings) {
        storage.saveData(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  },

  // Stats
  getStats: () => {
    const data = storage.getData();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const calculateMonthStats = (m: number, y: number) => {
      return data.sales.filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === m && d.getFullYear() === y;
      }).reduce((acc, s) => acc + s.amount_received, 0);
    };

    return {
      totalCustomers: data.customers.length,
      totalDepositAmount: data.customers.reduce((acc, c) => acc + (c.deposit_amount || 0), 0),
      totalDepositCustomers: data.customers.filter(c => (c.deposit_amount || 0) > 0).length,
      totalCreditAmount: data.sales.reduce((acc, s) => s.credit_amount > 0 ? acc + s.credit_amount : acc, 0),
      
      currentMonth: {
        name: monthNames[currentMonth],
        total: calculateMonthStats(currentMonth, currentYear)
      },
      lastMonth: {
        name: monthNames[lastMonth],
        total: calculateMonthStats(lastMonth, lastMonthYear)
      },

      today: {
        sale_cash_upi: data.sales.filter(s => s.date.startsWith(todayStr) && s.type === 'Entry').reduce((acc, s) => acc + s.amount_received, 0),
        cash: data.sales.filter(s => s.date.startsWith(todayStr) && s.payment_mode === 'Cash').reduce((acc, s) => acc + s.amount_received, 0),
        upi: data.sales.filter(s => s.date.startsWith(todayStr) && s.payment_mode === 'UPI').reduce((acc, s) => acc + s.amount_received, 0),
        credit_received: data.sales.filter(s => s.date.startsWith(todayStr) && s.type === 'Billing').reduce((acc, s) => acc + s.amount_received, 0),
        overall_sale: data.sales.filter(s => s.date.startsWith(todayStr)).reduce((acc, s) => acc + s.amount_received, 0)
      }
    };
  }
};
