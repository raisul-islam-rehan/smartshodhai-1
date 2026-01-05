
import React, { useState } from 'react';
import { 
  User, Phone, MapPin, History, Plus, ChevronRight, 
  Wallet, Calendar, ShoppingBag, ArrowLeft, CheckCircle2,
  X, DollarSign, Receipt
} from 'lucide-react';
import { Customer, Order } from '../types';

interface CustomersProps {
  customers: Customer[];
  orders: Order[];
  onUpdateCustomer?: (customer: Customer) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, orders, onUpdateCustomer }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !onUpdateCustomer) return;

    const amount = parseFloat(paymentAmount) || 0;
    const updatedCustomer = {
      ...selectedCustomer,
      currentDue: Math.max(0, (selectedCustomer.currentDue || 0) - amount)
    };

    onUpdateCustomer(updatedCustomer);
    setSelectedCustomer(updatedCustomer);
    setShowPaymentModal(false);
    setPaymentAmount('');
  };

  const getCustomerOrders = (customerId: string) => {
    return orders.filter(o => o.customerId === customerId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Detail View Component
  if (selectedCustomer) {
    const customerOrders = getCustomerOrders(selectedCustomer.id);
    const lastOrder = customerOrders[0];
    const totalDue = selectedCustomer.currentDue || 0;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCustomer(null)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h2>
            <p className="text-sm text-slate-500">Customer Profile & History</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Due Balance Card */}
          <div className={`p-6 rounded-3xl border ${totalDue > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${totalDue > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <Wallet className="w-6 h-6" />
              </div>
              {totalDue > 0 && (
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                >
                  Receive Money
                </button>
              )}
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Baki (Due)</p>
            <p className={`text-3xl font-black ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ৳{totalDue.toLocaleString()}
            </p>
          </div>

          {/* Last Visit Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 w-fit mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Last Shopping</p>
            <p className="text-xl font-black text-slate-900">
              {lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString() : 'No orders yet'}
            </p>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 w-fit mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Phone Number</p>
            <p className="text-xl font-black text-slate-900">{selectedCustomer.phone}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Purchase History
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {customerOrders.length} Orders Total
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {customerOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">This customer hasn't bought anything yet.</p>
              </div>
            ) : (
              customerOrders.map(order => (
                <div key={order.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Order #{order.id}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">৳{order.totalAmount.toLocaleString()}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'Delivered' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Receipt Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Receive Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleReceivePayment} className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Customer: <span className="font-bold text-slate-900">{selectedCustomer.name}</span></p>
                  <p className="text-sm text-slate-500 mb-6">Current Baki: <span className="font-bold text-rose-600">৳{totalDue.toLocaleString()}</span></p>
                  
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">How much did they pay?</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                    <input 
                      autoFocus
                      type="number" 
                      required
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-black text-slate-900"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm & Update Balance
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List View Component
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Management</h2>
          <p className="text-sm text-slate-500">Monitor debts and purchase patterns</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-100 font-semibold transition-all">
          <Plus className="w-5 h-5" />
          <span>Add New Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => {
          const totalDue = customer.currentDue || 0;
          return (
            <button 
              key={customer.id} 
              onClick={() => setSelectedCustomer(customer)}
              className="w-full text-left bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <User className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                  </div>
                  {totalDue > 0 && (
                    <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-200">
                      Baki (Due)
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{customer.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Phone className="w-3 h-3 mr-2" />
                    <span>{customer.phone}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Current Balance</p>
                  <p className={`text-xl font-black ${totalDue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    ৳{totalDue.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-indigo-50 transition-colors">
                <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <History className="w-4 h-4" />
                  View History
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Customers;
