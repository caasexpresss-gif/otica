
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Customer, Order, Product, FinancialTransaction, Employee, Supplier, Prescription } from '../types';
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
  addProduct: (product: Omit<Product, 'id' | 'soldCount'>) => void;
  updateProductStock: (id: string, quantity: number) => void;

  transactions: FinancialTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  addTransaction: (transaction: FinancialTransaction) => void;

  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  addSupplier: (supplier: Supplier) => void;
  removeSupplier: (id: string) => void;

  addPrescription: (customerId: string, prescription: Prescription) => void;

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

  const mapPrescriptionFromDB = (db: any): Prescription => ({
      id: db.id,
      date: db.date,
      doctorName: db.doctor_name,
      od: {
        spherical: db.od_spherical,
        cylinder: db.od_cylinder,
        axis: db.od_axis,
        add: db.od_add,
        pd: db.od_pd,
        height: db.od_height
      },
      oe: {
        spherical: db.oe_spherical,
        cylinder: db.oe_cylinder,
        axis: db.oe_axis,
        add: db.oe_add,
        pd: db.oe_pd,
        height: db.oe_height
      },
      notes: db.notes
  });

  const loadData = async () => {
    // 1. Customers
    const { data: custData } = await supabase.from('customers').select('*');

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

    // 6. Prescriptions (Fetch all and map to customers)
    const { data: prescData } = await supabase.from('prescriptions').select('*');
    if (custData && prescData) {
        const customersWithPrescriptions = custData.map(c => {
             const cPrescriptions = prescData
                .filter(p => p.customer_id === c.id)
                .map(mapPrescriptionFromDB);
             
             return {
                 ...mapCustomerFromDB(c),
                 prescriptions: cPrescriptions
             };
        });
        setCustomers(customersWithPrescriptions);
    } else if (custData) {
        setCustomers(custData.map(mapCustomerFromDB));
    }
  };

  // -- Actions --

  const addCustomer = async (customer: Customer) => {
    if (!user?.tenantId) return;
    const dbPayload = {
        tenant_id: user.tenantId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        cpf: customer.cpf,
        rg: customer.rg,
        birth_date: customer.birthDate,
        gender: customer.gender,
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
        birth_date: customer.birthDate,
        gender: customer.gender,
        rg: customer.rg,
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

  const addProduct = async (product: Omit<Product, 'id' | 'soldCount'>) => {
    if (!user?.tenantId) return;
    const dbPayload = {
        tenant_id: user.tenantId,
        code: product.code,
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        brand: product.brand,
        cost_price: product.costPrice,
        sales_price: product.salesPrice,
        stock_level: product.stockLevel,
        min_stock_level: product.minStockLevel,
        sold_count: 0
    };
    const { data, error } = await supabase.from('products').insert([dbPayload]).select().single();
    if (data && !error) {
        setProducts(prev => [...prev, mapProductFromDB(data)]);
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

  const addPrescription = async (customerId: string, prescription: Prescription) => {
      // Note: Prescription type has 'id', but we let DB generate it? 
      // Usually UI generates temp ID. We should omit ID for insert or use it if UUID.
      // Assuming customerId is passed separately or inside prescription? 
      // The current Prescription interface doesn't have customerId.
      
      const dbPayload = {
          customer_id: customerId,
          date: prescription.date,
          doctor_name: prescription.doctorName,
          od_spherical: prescription.od.spherical,
          od_cylinder: prescription.od.cylinder,
          od_axis: prescription.od.axis,
          od_add: prescription.od.add,
          od_pd: prescription.od.pd,
          od_height: prescription.od.height,
          oe_spherical: prescription.oe.spherical,
          oe_cylinder: prescription.oe.cylinder,
          oe_axis: prescription.oe.axis,
          oe_add: prescription.oe.add,
          oe_pd: prescription.oe.pd,
          oe_height: prescription.oe.height,
          notes: prescription.notes
      };

      const { data, error } = await supabase.from('prescriptions').insert([dbPayload]).select().single();
      
      if (data && !error) {
          const newPrescription = mapPrescriptionFromDB(data);
          setCustomers(prev => prev.map(c => {
              if (c.id === customerId) {
                  return { ...c, prescriptions: [newPrescription, ...c.prescriptions] };
              }
              return c;
          }));
      } else {
          console.error("Error adding prescription:", error);
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
      products, setProducts, updateProductStock, addProduct,
      transactions, setTransactions, addTransaction,
      suppliers, setSuppliers, addSupplier, removeSupplier,
      addPrescription, // Exposed
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
