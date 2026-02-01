
// Domain Entities

export enum PaymentStatus {
  PENDING = 'Pendente',
  PARTIAL = 'Parcial',
  PAID = 'Pago',
}

export enum OrderStatus {
  PENDING = 'Falta Enviar',
  SENT_TO_LAB = 'Enviado p/ Lab',
  RECEIVED_AT_STORE = 'Já está na Loja',
  DELIVERED = 'Entregue',
}

export interface EyePrescription {
  spherical: string;
  cylinder: string;
  axis: string;
  add?: string;
  pd?: string; 
  height?: string; 
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  od: EyePrescription;
  oe: EyePrescription;
  notes?: string;
}

export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'O';
  profession?: string;
  address?: Address;
  creditLimit?: number;
  creditStatus?: 'APPROVED' | 'DENIED' | 'PENDING';
  notes?: string;
  prescriptions: Prescription[];
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  prescriptionId: string;
  frameModel: string;
  frameNotes?: string; // Observações da armação
  lensType: string;
  lensNotes?: string;  // Observações das lentes
  deliveryDate: string;
}

export type ProductCategory = 'FRAME' | 'LENS' | 'ACCESSORY' | 'SERVICE';

export interface Product {
  id: string;
  code: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  brand: string;
  costPrice: number;
  salesPrice: number;
  stockLevel: number;
  minStockLevel: number;
  soldCount: number;
}

export type TransactionType = 'IN' | 'OUT';
export type TransactionCategory = 'SALES' | 'SUPPLIER' | 'RENT' | 'UTILITIES' | 'SALARY' | 'OTHER';

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  status: 'PAID' | 'PENDING';
  paymentMethod?: 'CREDIT' | 'DEBIT' | 'CASH' | 'PIX' | 'BOLETO';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salesTotal: number;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  contactName: string;
  phone: string;
  email: string;
  products?: string[];
}

export interface Brand {
  id: string;
  name: string;
  supplierId?: string;
}

// SaaS / Multi-tenancy Types

export type UserRole = 'OWNER' | 'MANAGER' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In real app, never store plain text. Using for mock auth only.
  tenantId: string;
  role: UserRole;
  avatar?: string;
}

export interface Tenant {
  id: string;
  name: string;
  cnpj?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  settings?: {
    theme?: string;
    logo?: string;
  }
}

