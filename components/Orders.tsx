
import React, { useState } from 'react';
import { 
  Package, Truck, XCircle, CheckCircle2, Clock, 
  CreditCard, User as UserIcon, Calendar, ArrowRight,
  ChevronRight, Box, DollarSign, X
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../types';

interface OrdersProps {
  orders: Order[];
  onUpdateOrder?: (order: Order) => void;
}

const Orders: React.FC<OrdersProps> = ({ orders, onUpdateOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getOrderStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return { icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'Cancelled': return { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700 border-red-200' };
      case 'Processing': return { icon: <Clock className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'Ready': return { icon: <Box className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      default: return { icon: null, color: 'bg-slate-100' };
    }
  };

  const getPaymentStatusInfo = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid': return { color: 'bg-emerald-500 text-white' };
      case 'Partial': return { color: 'bg-indigo-500 text-white' };
      case 'Due': return { color: 'bg-rose-500 text-white' };
      default: return { color: 'bg-slate-500 text-white' };
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder && onUpdateOrder) {
      onUpdateOrder(selectedOrder);
    }
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Orders List</h2>
          <p className="text-sm text-slate-500">Track your sales and customer payments</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-100 font-semibold transition-all">
          <Package className="w-5 h-5" />
          <span>Create New Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No orders found yet.</p>
          </div>
        ) : (
          orders.map((order) => {
            const orderStatus = getOrderStatusInfo(order.status);
            const paymentStatus = getPaymentStatusInfo(order.paymentStatus);
            return (
              <button 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <Truck className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-900">#{order.id}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${paymentStatus.color}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <UserIcon className="w-3 h-3" /> {order.customerName}
                    </p>
                  </div>
                </div>

                <div className="flex-1 md:px-8">
                  <div className="flex flex-wrap gap-1.5">
                    {order.items.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-600 font-bold">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-[10px] bg-slate-50 px-2 py-1 rounded-lg text-slate-400 font-bold italic">
                        +{order.items.length - 2} more items
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bill Total</p>
                    <p className="font-black text-slate-900 text-lg">৳{order.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${orderStatus.color}`}>
                    {orderStatus.icon}
                    <span>{order.status}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 hidden md:block group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Order #{selectedOrder.id}</h3>
                  <p className="text-sm text-slate-500">Order placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Summary & Items */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <UserIcon className="w-3 h-3" /> Customer Details
                    </h4>
                    <p className="font-extrabold text-slate-900 text-lg">{selectedOrder.customerName}</p>
                    <p className="text-xs text-slate-500 mt-1">Retail Partner Account</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Items List</h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">
                              {item.quantity}
                            </span>
                            <span className="text-sm font-bold text-slate-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-extrabold text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-400 uppercase">Total Bill</span>
                      <span className="text-xl font-black text-indigo-600">৳{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status Management */}
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-indigo-900/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Truck className="w-3 h-3" /> Order Status
                      </label>
                      <select 
                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-slate-700"
                        value={selectedOrder.status}
                        onChange={e => setSelectedOrder({...selectedOrder, status: e.target.value as OrderStatus})}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Ready">Ready for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-indigo-900/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Payment Status
                      </label>
                      <select 
                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-slate-700"
                        value={selectedOrder.paymentStatus}
                        onChange={e => setSelectedOrder({...selectedOrder, paymentStatus: e.target.value as PaymentStatus})}
                      >
                        <option value="Paid">Fully Paid</option>
                        <option value="Partial">Partial Payment</option>
                        <option value="Due">Payment Due (Baki)</option>
                      </select>
                    </div>

                    <div className="p-4 bg-white/60 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-relaxed">
                        Notice: Updating status will notify the staff and reflect in analytics immediately.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm & Update Order
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
