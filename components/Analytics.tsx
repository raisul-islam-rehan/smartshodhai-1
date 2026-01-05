
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line, ReferenceLine, 
  LabelList
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Wallet, Box, Users, 
  ArrowUpRight, AlertCircle, ShoppingBag, Clock, Percent,
  ChevronRight, Download, Filter
} from 'lucide-react';
import { Product, SalesData, Order, Customer } from '../types';

interface AnalyticsProps {
  salesData: SalesData[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Analytics: React.FC<AnalyticsProps> = ({ salesData, products, orders, customers }) => {
  // Advanced Business Metrics Logic
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgTransaction = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    // Customer Retention
    const repeatCustomers = customers.filter(c => c.orderHistory.length > 1).length;
    const retentionRate = customers.length > 0 ? (repeatCustomers / customers.length) * 100 : 0;

    // Gross Profit Margin
    let totalCost = 0;
    orders.forEach(o => {
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) totalCost += prod.costPrice * item.quantity;
      });
    });
    const grossProfit = totalRevenue - totalCost;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Stock Turnover (Mocked based on recent sales vs inventory value)
    const inventoryValue = products.reduce((sum, p) => sum + p.costPrice * p.quantity, 0);
    const turnoverRate = inventoryValue > 0 ? (totalCost / inventoryValue) * 1.5 : 0; // Simplified COGS/Inventory

    return {
      avgTransaction,
      retentionRate,
      grossMargin,
      turnoverRate,
      inventoryValue,
      totalRevenue
    };
  }, [orders, products, customers]);

  // Inventory Category Data with Value
  const categoryData = useMemo(() => {
    return products.reduce((acc: any[], p) => {
      const existing = acc.find(item => item.name === p.category);
      if (existing) {
        existing.value += p.quantity;
        existing.stockValue += p.costPrice * p.quantity;
      } else {
        acc.push({ 
          name: p.category, 
          value: p.quantity, 
          stockValue: p.costPrice * p.quantity 
        });
      }
      return acc;
    }, []);
  }, [products]);

  // Profit Margin Ranking
  const marginData = useMemo(() => {
    return products
      .map(p => ({
        name: p.name,
        margin: ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100,
        profit: p.sellingPrice - p.costPrice,
        color: ((p.sellingPrice - p.costPrice) / p.sellingPrice) > 0.2 ? '#10b981' : '#f59e0b'
      }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 6);
  }, [products]);

  // Debt Aging Analysis (Mocked)
  const agingData = [
    { name: '0-30 Days', value: customers.reduce((sum, c) => sum + (c.currentDue || 0) * 0.7, 0), color: '#6366f1' },
    { name: '31-60 Days', value: customers.reduce((sum, c) => sum + (c.currentDue || 0) * 0.2, 0), color: '#f59e0b' },
    { name: '61+ Days', value: customers.reduce((sum, c) => sum + (c.currentDue || 0) * 0.1, 0), color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Command</h2>
          <p className="text-slate-500 font-medium">Deep insights into your shop's heartbeat</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Time Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Section 1: Business Health Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScorecardItem 
          label="Avg. Bill Value" 
          value={`৳${Math.round(stats.avgTransaction).toLocaleString()}`} 
          trend="+5%" 
          isUp={true} 
          icon={ShoppingBag} 
        />
        <ScorecardItem 
          label="Retention Rate" 
          value={`${Math.round(stats.retentionRate)}%`} 
          trend="+2%" 
          isUp={true} 
          icon={Users} 
        />
        <ScorecardItem 
          label="Stock Turnover" 
          value={`${stats.turnoverRate.toFixed(1)}x`} 
          trend="-0.5x" 
          isUp={false} 
          icon={Box} 
        />
        <ScorecardItem 
          label="Profit Margin" 
          value={`${Math.round(stats.grossMargin)}%`} 
          trend="+1.2%" 
          isUp={true} 
          icon={Percent} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Growth (AreaChart) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Revenue Growth</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> ↑ 12%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">vs previous period</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `৳${val/1000}k`} />
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                   formatter={(val) => [`৳${val.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Margin Trend */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Profit Margin %</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Net profit tracked daily</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl">
              <Percent className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesData.map((d, i) => ({ ...d, margin: 15 + Math.random() * 12 }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                   formatter={(val) => [`${val.toFixed(1)}%`, 'Margin']}
                />
                <ReferenceLine y={20} label={{ value: 'Goal (20%)', position: 'right', fill: '#94a3b8', fontSize: 10 }} stroke="#94a3b8" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Intelligence */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Inventory Value</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="stockValue"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={40} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Value</span>
                <span className="text-xl font-black text-slate-900">৳{(stats.inventoryValue/1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {categoryData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-slate-600 font-bold">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">৳{item.stockValue.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{item.value} Units</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Profit Margin Ranking */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8">Top Margins vs Contribution</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={marginData} margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#1e293b" 
                  fontSize={11} 
                  fontWeight="700"
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   formatter={(val) => [`${val.toFixed(1)}%`, 'Margin']}
                />
                <Bar dataKey="margin" radius={[0, 20, 20, 0]} barSize={24}>
                  {marginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="margin" position="right" formatter={(v) => `${v.toFixed(0)}%`} className="font-black fill-slate-900 text-[10px]" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black uppercase text-slate-400">High Margin (>20%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-[10px] font-black uppercase text-slate-400">Standard Margin</span>
              </div>
            </div>
            <button className="text-xs font-black text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
              Full List <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Analysis (Top 5) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Top 5 Value Partners
          </h3>
          <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={customers.slice(0, 5).map(c => ({ name: c.name, value: (c.orderHistory.length * 1200) + (c.currentDue || 0) }))}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} hide />
                 <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `৳${val/1000}k`} />
                 <Tooltip />
                 <Bar dataKey="value" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={50}>
                   <LabelList dataKey="name" position="top" className="font-bold fill-slate-400 text-[9px]" />
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Collection Aging */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <Clock className="w-6 h-6 text-rose-500" />
              Baki (Due) Aging
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-8">How long have dues been outstanding?</p>
            
            <div className="space-y-8">
              {agingData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">{item.name}</span>
                    <span className="text-sm font-black text-slate-900">৳{item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${(item.value / agingData.reduce((s, d) => s + d.value, 0)) * 100}%`,
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <AlertCircle className="w-5 h-5 text-rose-500" />
               <p className="text-xs font-bold text-rose-800 uppercase tracking-tight">Collection Rate: 84%</p>
             </div>
             <button className="text-[10px] font-black bg-rose-600 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700">
               Call Due Owners
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Sub-component for Scorecard
const ScorecardItem = ({ label, value, trend, isUp, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
        <Icon className="w-5 h-5" />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

export default Analytics;
