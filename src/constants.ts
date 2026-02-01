
import { Customer, Order, Product, FinancialTransaction, Employee } from './types';

// Empty arrays - data comes from Supabase
export const MOCK_CUSTOMERS: Customer[] = [];
export const MOCK_ORDERS: Order[] = [];
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_TRANSACTIONS: FinancialTransaction[] = [];
export const MOCK_EMPLOYEES: Employee[] = [];

// Chart Data Sets (used for demo charts when no real data exists)
export const SALES_DATA_MONTHLY = [
  { name: 'Jan', value: 0 },
  { name: 'Fev', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Abr', value: 0 },
  { name: 'Mai', value: 0 },
  { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 },
];

export const SALES_DATA_WEEKLY = [
  { name: 'Sem 1', value: 0 },
  { name: 'Sem 2', value: 0 },
  { name: 'Sem 3', value: 0 },
  { name: 'Sem 4', value: 0 },
];

export const SALES_DATA_DAILY = [
  { name: 'Seg', value: 0 },
  { name: 'Ter', value: 0 },
  { name: 'Qua', value: 0 },
  { name: 'Qui', value: 0 },
  { name: 'Sex', value: 0 },
  { name: 'Sáb', value: 0 },
  { name: 'Dom', value: 0 },
];
