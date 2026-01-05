
import { Product, Customer, Order, SalesData } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Fresh Milk 1L', category: 'Dairy', costPrice: 85, sellingPrice: 95, quantity: 50, minStockLevel: 10 },
  { id: '2', name: 'Teer Soyabean Oil 5L', category: 'Cooking Oil', costPrice: 780, sellingPrice: 820, quantity: 5, minStockLevel: 10 },
  { id: '3', name: 'PRAN Frooto 250ml', category: 'Beverages', costPrice: 22, sellingPrice: 25, quantity: 120, minStockLevel: 24 },
  { id: '4', name: 'Chashi Aromatic Rice 5kg', category: 'Rice', costPrice: 550, sellingPrice: 620, quantity: 30, minStockLevel: 5 },
  { id: '5', name: 'ACI Salt 1kg', category: 'Spices', costPrice: 35, sellingPrice: 40, quantity: 100, minStockLevel: 20 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Rahim Store', phone: '01711223344', address: 'Dhanmondi, Dhaka', orderHistory: ['ord-101'], currentDue: 0 },
  { id: 'c2', name: 'Mayer Doa General Store', phone: '01855667788', address: 'Mirpur 10, Dhaka', orderHistory: ['ord-102'], currentDue: 540 },
  { id: 'c3', name: 'Popular Super Shop', phone: '01922334455', address: 'Banani, Dhaka', orderHistory: [], currentDue: 2100 },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    customerId: 'c1',
    customerName: 'Rahim Store',
    items: [{ productId: '1', name: 'Fresh Milk 1L', quantity: 10, price: 95 }],
    totalAmount: 950,
    status: 'Delivered',
    paymentStatus: 'Paid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ord-102',
    customerId: 'c2',
    customerName: 'Mayer Doa General Store',
    items: [{ productId: '2', name: 'Teer Soyabean Oil 5L', quantity: 2, price: 820 }],
    totalAmount: 1640,
    status: 'Processing',
    paymentStatus: 'Partial',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

export const INITIAL_SALES_DATA: SalesData[] = [
  { date: '2023-10-01', amount: 15000 },
  { date: '2023-10-02', amount: 12000 },
  { date: '2023-10-03', amount: 18500 },
  { date: '2023-10-04', amount: 9000 },
  { date: '2023-10-05', amount: 22000 },
  { date: '2023-10-06', amount: 14000 },
  { date: '2023-10-07', amount: 25000 },
];

export const CATEGORIES = ['Dairy', 'Cooking Oil', 'Beverages', 'Rice', 'Spices', 'Snacks', 'Personal Care'];
