import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sale, Customer } from '../types';
import { storage } from '../lib/storage';

const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const salesRes = storage.getSales();
      const customersRes = storage.getCustomers();
      const productsRes = storage.getProducts();
      setSales(salesRes);
      setCustomers(customersRes);
      setProducts(productsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ sales, customers, products, loading, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
