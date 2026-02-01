
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Customer, Order, Product, FinancialTransaction, Employee, Supplier } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { MOCK_EMPLOYEES } from '../constants';

interface DataContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  removeOrder: (id: string) => void;

  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateProductStock: (id: string, quantity: number) => void;

  transactions: FinancialTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  addTransaction: (transaction: FinancialTransaction) => void;

  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  addSupplier: (supplier: Supplier) => void;
  removeSupplier: (id: string) => void;

  employees: Employee[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees] = useState<Employee[]>([]); 

  useEffect(() => {
    if (isAuthenticated && user?.tenantId) {
      loadData();
    } else {
      // Clear data on logout
      setCustomers([]);
      setOrders([]);
      setProducts([]);
      setTransactions([]);
      setSuppliers([]);
    }
  }, [isAuthenticated, user?.tenantId]);

  const loadData = async () => {
    // 1. Customers
    const { data: custData } = await supabase.from('customers').select('*');
    if (custData) setCustomers(custData.map(mapCustomerFromDB));

    // 2. Products
    const { data: prodData } = await supabase.from('products').select('*');
    if (prodData) setProducts(prodData.map(mapProductFromDB));

    // 3. Orders
    const { data: ordData } = await supabase.from('orders').select('*');
    if (ordData) setOrders(ordData.map(mapOrderFromDB));

    // 4. Transactions
    const { data: transData } = await supabase.from('financial_transactions').select('*');
    if (transData) setTransactions(transData.map(mapTransactionFromDB));

    // 5. Suppliers
    const { data: suppData } = await supabase.from('suppliers').select('*');
    if (suppData) setSuppliers(suppData.map(mapSupplierFromDB));
  };

  // -- Mappers --
  const mapCustomerFromDB = (db: any): Customer => ({
    id: db.id,
    name: db.name,
    phone: db.phone,
    email: db.email,
    cpf: db.cpf,
    rg: db.rg,
    birthDate: db.birth_date,
    gender: db.gender,
    profession: db.profession,
    address: db.address,
    creditLimit: db.credit_limit,
    creditStatus: db.credit_status,
    notes: db.notes,
    prescriptions: []
  });

  const mapProductFromDB = (db: any): Product => ({
    id: db.id,
    code: db.code,
    barcode: db.barcode,
    name: db.name,
    category: db.category,
    brand: db.brand,
    costPrice: db.cost_price,
    salesPrice: db.sales_price,
    stockLevel: db.stock_level,
    minStockLevel: db.min_stock_level,
    soldCount: db.sold_count
  });

  const mapOrderFromDB = (db: any): Order => ({
     id: db.id,
     customerId: db.customer_id,
     customerName: db.customer_name,
     date: db.date,
     status: db.status,
     totalAmount: db.total_amount,
     paidAmount: db.paid_amount,
     paymentStatus: db.payment_status,
     prescriptionId: db.prescription_id,
     frameModel: db.frame_model,
     lensType: db.lens_type,
     deliveryDate: db.delivery_date
  });

  const mapTransactionFromDB = (db: any): FinancialTransaction => ({
      id: db.id,
      date: db.date,
      description: db.description,
      type: db.type,
      category: db.category,
      amount: db.amount,
      status: db.status,
      paymentMethod: db.payment_method
  });

  const mapSupplierFromDB = (db: any): Supplier => ({
      id: db.id,
      name: db.name,
      cnpj: db.cnpj,
      contactName: db.contact_name,
      phone: db.phone,
      email: db.email
  });

  // -- Actions --

  const addCustomer = async (customer: Customer) => {
    if (!user?.tenantId) return;
    const dbPayload = {
        tenant_id: user.tenantId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        cpf: customer.cpf,
        profession: customer.profession,
        address: customer.address,
        credit_limit: customer.creditLimit,
        credit_status: customer.creditStatus,
        notes: customer.notes
    };
    const { data, error } = await supabase.from('customers').insert([dbPayload]).select().single();
    if (data && !error) {
        setCustomers(prev => [...prev, mapCustomerFromDB(data)]);
    }
  };

  const updateCustomer = async (customer: Customer) => {
    const dbPayload = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        cpf: customer.cpf,
        profession: customer.profession,
        address: customer.address,
        credit_limit: customer.creditLimit,
        credit_status: customer.creditStatus,
        notes: customer.notes
    };
    const { error } = await supabase.from('customers').update(dbPayload).eq('id', customer.id);
    if (!error) {
        setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    }
  };

  const addOrder = async (order: Order) => {
    if (!user?.tenantId) return;
    const dbPayload = {
       tenant_id: user.tenantId,
       customer_id: order.customerId,
       customer_name: order.customerName,
       date: order.date,
       status: order.status,
       total_amount: order.totalAmount,
       paid_amount: order.paidAmount,
       payment_status: order.paymentStatus,
       prescription_id: order.prescriptionId,
       frame_model: order.frameModel,
       lens_type: order.lensType,
       delivery_date: order.deliveryDate
    };
    const { data, error } = await supabase.from('orders').insert([dbPayload]).select().single();
    if (data && !error) {
        setOrders(prev => [...prev, mapOrderFromDB(data)]);
    }
  };

  const updateOrder = async (order: Order) => {
      // Simplification: update everything
      const dbPayload = {
         status: order.status,
         paid_amount: order.paidAmount,
         payment_status: order.paymentStatus
      };
      const { error } = await supabase.from('orders').update(dbPayload).eq('id', order.id);
      if (!error) {
        setOrders(prev => prev.map(o => o.id === order.id ? order : o));
      }
  };

  const removeOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) {
        setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const updateProductStock = async (id: string, quantity: number) => {
    // We need to fetch current stock to update safely, or use an RPC.
    // For now, optimistic update + DB update
    setProducts(prev => prev.map(p => {
        if (p.id === id) return { ...p, stockLevel: p.stockLevel + quantity };
        return p;
    }));

    const product = products.find(p => p.id === id);
    if (product) {
        await supabase.from('products').update({ stock_level: product.stockLevel + quantity }).eq('id', id);
    }
  };

  const addTransaction = async (transaction: FinancialTransaction) => {
    if (!user?.tenantId) return;
    const dbPayload = {
        tenant_id: user.tenantId,
        date: transaction.date,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        status: transaction.status,
        payment_method: transaction.paymentMethod
    };
    const { data, error } = await supabase.from('financial_transactions').insert([dbPayload]).select().single();
    if (data && !error) {
        setTransactions(prev => [...prev, mapTransactionFromDB(data)]);
    }
  };

  const addSupplier = async (supplier: Supplier) => {
    if (!user?.tenantId) return;
    const dbPayload = {
        tenant_id: user.tenantId,
        name: supplier.name,
        cnpj: supplier.cnpj,
        contact_name: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email
    };
    const { data, error } = await supabase.from('suppliers').insert([dbPayload]).select().single();
    if (data && !error) {
        setSuppliers(prev => [...prev, mapSupplierFromDB(data)]);
    }
  };

  const removeSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (!error) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <DataContext.Provider value={{
      customers, setCustomers, addCustomer, updateCustomer,
      orders, setOrders, addOrder, updateOrder,
      products, setProducts, updateProductStock,
      transactions, setTransactions, addTransaction,
      suppliers, setSuppliers, addSupplier, removeSupplier,
      removeOrder,
      employees
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
