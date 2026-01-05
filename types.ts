
export type Role = 'Admin' | 'Staff';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  minStockLevel: number;
}

export type OrderStatus = 'Processing' | 'Ready' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Partial' | 'Due';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  orderHistory: string[]; // Order IDs
  currentDue?: number;
}

export interface SalesData {
  date: string;
  amount: number;
}

export type AIModelType = 'fast' | 'think' | 'image' | 'tts';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
  image?: string;
  audioUrl?: string;
}

export type ScanMode = 'product' | 'book';

export interface DetectedItem {
  name: string;
  brand: string;
  quantity: number;
  price?: number;
  confidence: number;
  isExisting: boolean;
  existingProductId?: string;
  category: string;
  suggestedSellingPrice?: number;
}

export interface ScanResult {
  mode: ScanMode;
  intent: 'Incoming' | 'Outgoing' | 'Audit';
  items: DetectedItem[];
  summary: string;
  customerName?: string;
  dueAmount?: number;
  totalAmount?: number;
}
