
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
  pd?: string; // Pupillary Distance
  height?: string; // Fitting Height
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  od: EyePrescription; // Right Eye
  oe: EyePrescription; // Left Eye
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
  frameNotes?: string;
  lensType: string;
  lensNotes?: string;
  deliveryDate: string;
}

export interface KPIData {
  totalSales: number;
  ordersCount: number;
  pendingLabs: number;
  averageTicket: number;
}

export interface ChartData {
  name: string;
  value: number;
}

// --- ERP New Types ---

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
  soldCount: number; // For ranking
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
