
import { Customer, Order, OrderStatus, PaymentStatus, Product, FinancialTransaction, Employee } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    phone: '(11) 99999-9999',
    email: 'carlos@email.com',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '1985-05-20',
    gender: 'M',
    profession: 'Analista de Sistemas',
    address: {
      zipCode: '01001-000',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Apto 45',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    },
    notes: 'Cliente prefere lentes Transitions.',
    prescriptions: [
      {
        id: 'p1',
        date: '2022-05-10', // Expired date (more than 1 year ago)
        doctorName: 'Dr. Roberto Visão',
        od: { spherical: '-2.00', cylinder: '-0.50', axis: '180', pd: '32', height: '18' },
        oe: { spherical: '-1.75', cylinder: '-0.75', axis: '175', pd: '32', height: '18' },
      }
    ]
  },
  {
    id: '2',
    name: 'Ana Souza',
    phone: '(21) 98888-8888',
    email: 'ana.s@email.com',
    cpf: '987.654.321-11',
    profession: 'Professora',
    birthDate: '1990-12-10',
    prescriptions: [
      {
        id: 'p2',
        date: '2024-01-20',
        doctorName: 'Dra. Clara Lentes',
        od: { spherical: '+1.50', cylinder: '0.00', axis: '0', add: '+2.00', pd: '31' },
        oe: { spherical: '+1.50', cylinder: '0.00', axis: '0', add: '+2.00', pd: '31' },
      }
    ]
  },
  {
    id: '3',
    name: 'Mariana Oliveira',
    phone: '(31) 97777-7777',
    email: 'mariana@email.com',
    birthDate: new Date().toISOString().split('T')[0], // Birthday today for demo
    profession: 'Advogada',
    address: {
        zipCode: '30130-000',
        street: 'Rua da Bahia',
        number: '500',
        neighborhood: 'Centro',
        city: 'Belo Horizonte',
        state: 'MG'
    },
    prescriptions: []
  },
  {
    id: '4',
    name: 'Pedro Santos',
    phone: '(41) 96666-6666',
    email: 'pedro@email.com',
    birthDate: '1982-05-15', // Same month as Carlos for grouping
    profession: 'Engenheiro',
    prescriptions: []
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'OS-2024-001',
    customerId: '1',
    customerName: 'Carlos Silva',
    date: '2023-10-16',
    status: OrderStatus.RECEIVED_AT_STORE,
    totalAmount: 1200,
    paidAmount: 1200,
    paymentStatus: PaymentStatus.PAID,
    prescriptionId: 'p1',
    frameModel: 'Ray-Ban Aviator',
    lensType: 'Multifocal Digital',
    deliveryDate: '2023-10-25'
  },
  {
    id: 'OS-2024-002',
    customerId: '2',
    customerName: 'Ana Souza',
    date: '2024-01-21',
    status: OrderStatus.SENT_TO_LAB,
    totalAmount: 2500,
    paidAmount: 1250,
    paymentStatus: PaymentStatus.PARTIAL,
    prescriptionId: 'p2',
    frameModel: 'Vogue Eyewear',
    lensType: 'Varilux Comfort',
    deliveryDate: '2024-02-01'
  },
  {
    id: 'OS-2024-003',
    customerId: '1',
    customerName: 'Carlos Silva',
    date: '2024-02-15',
    status: OrderStatus.PENDING,
    totalAmount: 800,
    paidAmount: 0,
    paymentStatus: PaymentStatus.PENDING,
    prescriptionId: 'p1',
    frameModel: 'Oakley',
    lensType: 'Visão Simples',
    deliveryDate: '2024-02-20'
  }
];

// --- Mock ERP Data ---

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'ARM-001',
    barcode: '789123456001',
    name: 'Armação Ray-Ban Aviator Classic',
    category: 'FRAME',
    brand: 'Ray-Ban',
    costPrice: 350.00,
    salesPrice: 790.00,
    stockLevel: 12,
    minStockLevel: 5,
    soldCount: 45
  },
  {
    id: 'prod-2',
    code: 'ARM-002',
    barcode: '789123456002',
    name: 'Armação Vogue CatEye',
    category: 'FRAME',
    brand: 'Vogue',
    costPrice: 280.00,
    salesPrice: 650.00,
    stockLevel: 3, // Low Stock
    minStockLevel: 4,
    soldCount: 28
  },
  {
    id: 'prod-3',
    code: 'LEN-001',
    barcode: '789123456003',
    name: 'Lente Multifocal Digital Premium',
    category: 'LENS',
    brand: 'Essilor',
    costPrice: 400.00,
    salesPrice: 1200.00,
    stockLevel: 100,
    minStockLevel: 10,
    soldCount: 60
  },
  {
    id: 'prod-4',
    code: 'ACC-001',
    barcode: '789123456004',
    name: 'Spray Limpa Lentes 50ml',
    category: 'ACCESSORY',
    brand: 'CleanView',
    costPrice: 8.50,
    salesPrice: 25.00,
    stockLevel: 45,
    minStockLevel: 20,
    soldCount: 150
  }
];

export const MOCK_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'TR-001',
    date: new Date().toISOString().split('T')[0], // Today
    description: 'Pagamento Fornecedor Luxottica',
    type: 'OUT',
    category: 'SUPPLIER',
    amount: 3500.00,
    status: 'PENDING',
    paymentMethod: 'BOLETO'
  },
  {
    id: 'TR-002',
    date: new Date().toISOString().split('T')[0], // Today
    description: 'Venda Balcão - Spray e Flanela',
    type: 'IN',
    category: 'SALES',
    amount: 85.00,
    status: 'PAID',
    paymentMethod: 'PIX'
  },
  {
    id: 'TR-003',
    date: '2024-03-10',
    description: 'Conta de Energia - Cemig',
    type: 'OUT',
    category: 'UTILITIES',
    amount: 450.00,
    status: 'PAID',
    paymentMethod: 'BOLETO'
  },
  {
    id: 'TR-004',
    date: new Date().toISOString().split('T')[0],
    description: 'Entrada Parcial OS-2024-005',
    type: 'IN',
    category: 'SALES',
    amount: 600.00,
    status: 'PAID',
    paymentMethod: 'CREDIT'
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Mariana Costa', role: 'Vendedora', salesTotal: 15400 },
  { id: 'emp-2', name: 'João Pedro', role: 'Vendedor', salesTotal: 12350 },
  { id: 'emp-3', name: 'Fernanda Lima', role: 'Gerente', salesTotal: 9800 },
];

// Chart Data Sets
export const SALES_DATA_MONTHLY = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Abr', value: 2780 },
  { name: 'Mai', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

export const SALES_DATA_WEEKLY = [
  { name: 'Sem 1', value: 1200 },
  { name: 'Sem 2', value: 1500 },
  { name: 'Sem 3', value: 980 },
  { name: 'Sem 4', value: 2100 },
];

export const SALES_DATA_DAILY = [
  { name: 'Seg', value: 450 },
  { name: 'Ter', value: 320 },
  { name: 'Qua', value: 550 },
  { name: 'Qui', value: 400 },
  { name: 'Sex', value: 800 },
  { name: 'Sáb', value: 1200 },
  { name: 'Dom', value: 100 },
];
