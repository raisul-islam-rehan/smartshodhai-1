
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, AlertCircle, TrendingUp, Wallet, Package } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';

interface InventoryProps {
  products: Product[];
  onAdd: (p: Omit<Product, 'id'>) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', category: CATEGORIES[0], costPrice: 0, sellingPrice: 0, quantity: 0, minStockLevel: 5
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: CATEGORIES[0], costPrice: 0, sellingPrice: 0, quantity: 0, minStockLevel: 5 });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onEdit({ ...editingProduct, ...formData } as Product);
    } else {
      onAdd(formData as Omit<Product, 'id'>);
    }
    setShowModal(false);
  };

  // Business Math for the modal
  const stats = useMemo(() => {
    const cost = formData.costPrice || 0;
    const sell = formData.sellingPrice || 0;
    const qty = formData.quantity || 0;
    
    const profit = sell - cost;
    const margin = cost > 0 ? (profit / cost) * 100 : 0;
    const totalValue = cost * qty;
    const isLow = qty <= (formData.minStockLevel || 0);

    return { profit, margin, totalValue, isLow };
  }, [formData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Stock</h2>
          <p className="text-sm text-slate-500">Manage your items and track profit margins</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center space-x-2 px-5 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-white bg-white transition-all font-medium">
            <Filter className="w-4 h-4" />
            <span>Filter List</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-400 text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Stock Qty</th>
                <th className="px-6 py-4">Selling Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const isLow = product.quantity <= product.minStockLevel;
                return (
                  <tr key={product.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 mb-0.5">{product.name}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
                        {product.quantity} units
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-extrabold text-slate-900">৳{product.sellingPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLow ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(product.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {editingProduct ? 'Update Product' : 'Add New Item'}
                </h3>
                <p className="text-sm text-slate-500">Fill in the details for your shop inventory</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs Section */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Fresh Milk 1L"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                      <select 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Alert Level</label>
                      <input 
                        type="number" 
                        placeholder="Min Stock"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.minStockLevel}
                        onChange={e => setFormData({...formData, minStockLevel: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Buying Price (৳)</label>
                      <input 
                        required
                        type="number" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        value={formData.costPrice}
                        onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Selling Price (৳)</label>
                      <input 
                        required
                        type="number" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
                        value={formData.sellingPrice}
                        onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Store Stock (Qty)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                {/* Business Analysis Section */}
                <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Business Math
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Profit Margin</span>
                        <span className={`text-lg font-black ${stats.margin > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {stats.margin.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Stock Value (Cost)</span>
                        <span className="text-lg font-black text-slate-900">৳{stats.totalValue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className={`p-4 rounded-xl flex items-start gap-3 ${stats.isLow ? 'bg-red-100 border border-red-200' : 'bg-emerald-100 border border-emerald-200'}`}>
                        {stats.isLow ? (
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        ) : (
                          <Package className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`text-sm font-bold ${stats.isLow ? 'text-red-800' : 'text-emerald-800'}`}>
                            {stats.isLow ? 'Low Stock Alert' : 'Stock Healthy'}
                          </p>
                          <p className={`text-xs ${stats.isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                            {stats.isLow ? 'Current quantity is at or below alert level.' : 'You have enough stock for now.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-5 h-5" />
                      Confirm & Save Details
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

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default Inventory;
