
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  ShoppingCart, Package, AlertTriangle, Users, TrendingUp, 
  Coins, Wallet, Star, ArrowUpRight, X, Phone, User as UserIcon,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { Product, Order, SalesData, Customer } from '../types';

interface DashboardProps {
  products: Product[];
  orders: Order[];
  salesData: SalesData[];
  customers: Customer[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, orders, salesData, customers }) => {
  const [showBakiModal, setShowBakiModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  const metrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Today's Orders
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt).getTime();
      return orderDate >= startOfToday && o.status !== 'Cancelled';
    });

    // Today's Sales
    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Today's Profit
    let todayProfit = 0;
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const unitProfit = item.price - product.costPrice;
          todayProfit += unitProfit * item.quantity;
        }
      });
    });

    // Total Dues (Baki)
    const bakiCustomers = customers.filter(c => (c.currentDue || 0) > 0);
    const totalDues = bakiCustomers.reduce((sum, c) => sum + (c.currentDue || 0), 0);

    // Low Stock Items
    const lowStockItems = products.filter(p => p.quantity <= p.minStockLevel);
    const lowStockCount = lowStockItems.length;

    // Today's Top Selling Item
    const todayItemSales: Record<string, { name: string, qty: number }> = {};
    todayOrders.forEach(o => {
      o.items.forEach(item => {
        if (!todayItemSales[item.productId]) {
          todayItemSales[item.productId] = { name: item.name, qty: 0 };
        }
        todayItemSales[item.productId].qty += item.quantity;
      });
    });

    const topItem = Object.values(todayItemSales).sort((a, b) => b.qty - a.qty)[0];

    return {
      todaySales,
      todayProfit,
      totalDues,
      lowStockCount,
      lowStockItems,
      bakiCustomers,
      topItemName: topItem?.name || 'No sales today',
      topItemQty: topItem?.qty || 0
    };
  }, [products, orders, customers]);

  const cards = [
    { 
      label: "Today's Sales", 
      value: `৳${metrics.todaySales.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      description: 'Daily revenue',
      onClick: null
    },
    { 
      label: "Today's Profit", 
      value: `৳${metrics.todayProfit.toLocaleString()}`, 
      icon: Coins, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      description: 'Net income',
      onClick: null
    },
    { 
      label: 'Total Baki (Due)', 
      value: `৳${metrics.totalDues.toLocaleString()}`, 
      icon: Wallet, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      description: 'Click to see who owes',
      onClick: () => setShowBakiModal(true)
    },
    { 
      label: 'Stock Alerts', 
      value: metrics.lowStockCount, 
      icon: AlertTriangle, 
      color: metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400', 
      bg: metrics.lowStockCount > 0 ? 'bg-amber-50' : 'bg-slate-50',
      description: 'Click to see items',
      onClick: () => setShowStockModal(true)
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shop Hishab</h2>
          <p className="text-sm text-slate-500">Business overview for today</p>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 shadow-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          Live Updates
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <button 
            key={idx} 
            onClick={card.onClick || undefined}
            disabled={!card.onClick}
            className={`bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between text-left transition-all ${card.onClick ? 'hover:shadow-md hover:border-indigo-200 active:scale-[0.98]' : 'cursor-default'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.bg} p-3 rounded-2xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              {card.onClick && <ArrowUpRight className="w-4 h-4 text-slate-300" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{card.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{card.value}</p>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">{card.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Last 7 Days</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `৳${val > 999 ? (val/1000).toFixed(1) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`৳${value.toLocaleString()}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Product Card - Updated for Today */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10">
            <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 backdrop-blur-md">
              <Star className="w-6 h-6 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Today's Star Product</p>
            <h3 className="text-2xl font-black mb-1 truncate">{metrics.topItemName}</h3>
            <p className="text-sm font-medium opacity-80">{metrics.topItemQty} units sold today</p>
          </div>
          <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
              Check Inventory
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Stock Alert Banner */}
      {metrics.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-900 leading-tight">Urgent Stock Warning</p>
            <p className="text-sm text-amber-700 font-medium mt-1">
              Bhai, these items are running out: {metrics.lowStockItems.slice(0, 3).map(p => `${p.name} (${p.quantity} units left)`).join(', ')}
              {metrics.lowStockCount > 3 ? ` and ${metrics.lowStockCount - 3} more.` : '.'}
            </p>
          </div>
          <button 
            onClick={() => setShowStockModal(true)}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-200/50 hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Review All
          </button>
        </div>
      )}

      {/* Modals for Drill-Down */}
      
      {/* Baki Modal */}
      {showBakiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Baki (Due) List</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Total Outstanding: ৳{metrics.totalDues.toLocaleString()}</p>
              </div>
              <button onClick={() => setShowBakiModal(false)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
              {metrics.bakiCustomers.map(customer => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-rose-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{customer.name}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                        <Phone className="w-2.5 h-2.5" /> {customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-rose-600">৳{customer.currentDue?.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Due</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 rounded-b-[2.5rem]">
              <button onClick={() => setShowBakiModal(false)} className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-amber-50/30">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Restock Alerts</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{metrics.lowStockCount} Items running low</p>
              </div>
              <button onClick={() => setShowStockModal(false)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
              {metrics.lowStockItems.map(product => {
                const isOutOfStock = product.quantity === 0;
                return (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOutOfStock ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                        {isOutOfStock ? <AlertCircle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${isOutOfStock ? 'text-rose-600' : 'text-amber-600'}`}>
                        {product.quantity} PCS
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Min: {product.minStockLevel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 bg-slate-50 rounded-b-[2.5rem]">
              <button onClick={() => setShowStockModal(false)} className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">
                Close Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
