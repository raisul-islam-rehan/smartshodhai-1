
import React, { useState } from 'react';
import { LayoutGrid, Package, ShoppingCart, Users, BarChart3, MessageSquare, Menu, Bell, LogOut, Camera } from 'lucide-react';
import { Product, Order, SalesData, Customer, User, ScanResult } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SALES_DATA, INITIAL_CUSTOMERS, CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import AIAssistant from './components/AIAssistant';
import Customers from './components/Customers';
import Analytics from './components/Analytics';
import Auth from './components/Auth';
import InventoryScanner from './components/InventoryScanner';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [salesData, setSalesData] = useState<SalesData[]>(INITIAL_SALES_DATA);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'scanner', label: 'Scan Stock', icon: Camera, badge: 'AI' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare, badge: 'Smart' },
  ];

  const handleLogin = (user: { name: string; email: string; role: 'Admin' | 'Staff' }) => {
    setCurrentUser({ ...user, id: 'u1' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProduct,
      id: `p-${Date.now()}`
    };
    setProducts([...products, product]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const handleScanConfirm = (result: ScanResult) => {
    const updatedProducts = [...products];
    const newItemsForOrder: any[] = [];

    result.items.forEach(item => {
      const idx = updatedProducts.findIndex(p => p.id === item.existingProductId);
      if (idx !== -1) {
        // Update existing stock
        if (result.intent === 'Incoming') {
          updatedProducts[idx].quantity += item.quantity;
        } else if (result.intent === 'Outgoing') {
          updatedProducts[idx].quantity = Math.max(0, updatedProducts[idx].quantity - item.quantity);
        }
        newItemsForOrder.push({
          productId: updatedProducts[idx].id,
          name: updatedProducts[idx].name,
          quantity: item.quantity,
          price: updatedProducts[idx].sellingPrice
        });
      } else {
        // Create new product
        const newProd: Product = {
          id: `p-scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: item.name,
          category: CATEGORIES.includes(item.category) ? item.category : CATEGORIES[0],
          costPrice: item.suggestedSellingPrice ? item.suggestedSellingPrice * 0.8 : 0,
          sellingPrice: item.suggestedSellingPrice || 0,
          quantity: item.quantity,
          minStockLevel: 5
        };
        updatedProducts.push(newProd);
        newItemsForOrder.push({
          productId: newProd.id,
          name: newProd.name,
          quantity: item.quantity,
          price: newProd.sellingPrice
        });
      }
    });

    setProducts(updatedProducts);

    // Create a record if it was a sale (outgoing)
    if (result.intent === 'Outgoing' && newItemsForOrder.length > 0) {
      const totalAmount = newItemsForOrder.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      const newOrder: Order = {
        id: `ord-ai-${Date.now()}`,
        customerId: customers[0].id,
        customerName: customers[0].name,
        items: newItemsForOrder,
        totalAmount,
        status: 'Processing',
        paymentStatus: result.dueAmount ? 'Due' : 'Paid',
        createdAt: new Date().toISOString()
      };
      setOrders([newOrder, ...orders]);
      
      // Update customer due if applicable
      if (result.dueAmount) {
        const customer = customers.find(c => c.id === newOrder.customerId);
        if (customer) {
          handleUpdateCustomer({
            ...customer,
            currentDue: (customer.currentDue || 0) + result.dueAmount
          });
        }
      }
    }

    setActiveTab('inventory');
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard products={products} orders={orders} salesData={salesData} customers={customers} />;
      case 'inventory':
        return <Inventory products={products} onAdd={handleAddProduct} onEdit={() => {}} onDelete={handleDeleteProduct} />;
      case 'orders':
        return <Orders orders={orders} onUpdateOrder={handleUpdateOrder} />;
      case 'scanner':
        return <InventoryScanner existingProducts={products} onConfirm={handleScanConfirm} onCancel={() => setActiveTab('dashboard')} />;
      case 'customers':
        return <Customers customers={customers} orders={orders} onUpdateCustomer={handleUpdateCustomer} />;
      case 'analytics':
        return <Analytics salesData={salesData} products={products} orders={orders} customers={customers} />;
      case 'ai-assistant':
        return <AIAssistant products={products} orders={orders} customers={customers} />;
      default:
        return <Dashboard products={products} orders={orders} salesData={salesData} customers={customers} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">SmartShodhai</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Bangladesh</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600 font-bold'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{currentUser.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 rounded-lg">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 lg:block hidden">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">৳ {(products.reduce((acc, p) => acc + (p.quantity * p.sellingPrice), 0)).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Stock Value</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
