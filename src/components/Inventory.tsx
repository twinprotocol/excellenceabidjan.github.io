/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, Minus, Search, Layers } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { cn, t, formatCurrency } from '../utils';

interface InventoryProps {
  products: Product[];
  onUpdateStock: (id: string, delta: number) => void;
  lang: Language;
  currency: Currency;
}

export default function Inventory({ products, onUpdateStock, onAddProduct, lang, currency }: InventoryProps & { onAddProduct: (p: Omit<Product, 'id'>) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: '',
    quantity: 0,
    unitPrice: 0,
    category: 'General',
    minThreshold: 5
  });

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(newProduct);
    setIsModalOpen(false);
    setNewProduct({
      name: '',
      sku: '',
      quantity: 0,
      unitPrice: 0,
      category: 'General',
      minThreshold: 5
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">{t('inventory', lang)}</h1>
          <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] mt-1">Warehouse Control & SKUs</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-brand-surface border border-brand-border text-brand-text-secondary px-4 py-2 rounded-xl flex items-center gap-2 font-bold uppercase text-[10px] hover:text-white transition-all">
            <Layers size={14} /> {t('stock_health', lang)}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-accent text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold uppercase text-[10px] hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
          >
            <Plus size={14} /> {t('add_product', lang)}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-5 flex flex-col justify-between">
          <p className="text-[10px] uppercase tracking-widest text-brand-text-secondary mb-2">{t('total_items', lang)}</p>
          <p className="text-2xl font-bold font-mono text-white leading-none">
            {products.reduce((acc, p) => acc + p.quantity, 0)}
          </p>
        </div>
        <div className="card p-5 flex flex-col justify-between border-amber-900/40">
          <p className="text-[10px] uppercase tracking-widest text-brand-text-secondary mb-2">Alert Thresholds</p>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold font-mono text-amber-500 leading-none">
              {products.filter(p => p.quantity <= p.minThreshold).length}
            </p>
            <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase border border-amber-500/20">Critical</span>
          </div>
        </div>
        <div className="card p-5 flex flex-col justify-between col-span-1 sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] uppercase tracking-widest text-brand-text-secondary mb-2">Asset Valuation</p>
          <p className="text-2xl font-bold font-mono text-emerald-500 leading-none">
            {formatCurrency(totalValue, currency)}
          </p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary group-focus-within:text-brand-accent transition-colors" size={16} />
        <input 
          type="text" 
          placeholder={t('search', lang)} 
          className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent transition-all text-sm text-white placeholder:text-brand-text-secondary font-mono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filtered.length > 0 ? filtered.map((product) => {
          const isLow = product.quantity <= product.minThreshold;
          return (
            <div key={product.id} className="card overflow-hidden group hover:border-brand-accent transition-all">
              <div className="p-4 border-b border-brand-border flex justify-between items-start bg-brand-sidebar/50">
                <div>
                  <span className="text-[9px] font-bold uppercase text-brand-text-secondary block mb-1 font-mono tracking-tighter">{product.sku}</span>
                  <h3 className="font-bold text-white leading-tight uppercase text-xs lg:text-sm truncate max-w-[150px]">{product.name}</h3>
                </div>
                {isLow && <AlertTriangle size={16} className="text-amber-500" />}
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-brand-text-secondary uppercase tracking-widest font-bold">In Stock</span>
                  <div className="text-right">
                    <p className={cn(
                      "font-mono font-bold text-xl lg:text-2xl leading-none",
                      isLow ? "text-amber-500" : "text-white"
                    )}>{product.quantity}</p>
                  </div>
                </div>
                <div className="w-full bg-[#0F0F11] h-1 rounded-full overflow-hidden border border-brand-border">
                  <div 
                    className={cn(
                      "h-full transition-all duration-700",
                      isLow ? "bg-amber-500" : "bg-brand-accent"
                    )}
                    style={{ width: `${Math.min((product.quantity / (product.minThreshold * 4)) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-1">
                  <button 
                    onClick={() => onUpdateStock(product.id, -1)}
                    className="flex-1 bg-brand-surface border border-brand-border py-1.5 flex items-center justify-center text-brand-text-secondary hover:text-white transition-all rounded-lg"
                  >
                    <Minus size={14} />
                  </button>
                  <button 
                    onClick={() => onUpdateStock(product.id, 1)}
                    className="flex-1 bg-brand-accent text-white py-1.5 flex items-center justify-center hover:opacity-90 transition-all rounded-lg"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="px-4 py-2 bg-brand-sidebar border-t border-brand-border flex justify-between items-center text-[10px] font-bold uppercase italic">
                <span className="text-brand-text-secondary truncate pr-2">{product.category}</span>
                <span className="text-brand-text-primary whitespace-nowrap">{formatCurrency(product.unitPrice, currency)}</span>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-brand-text-secondary border-2 border-dashed border-brand-border rounded-2xl">
            <Package size={40} className="mb-4 opacity-10" />
            <p className="text-xs uppercase tracking-[0.2em] italic">Warehouse database is empty</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-sidebar border border-brand-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-brand-border flex justify-between items-center text-white">
              <h2 className="text-sm font-bold uppercase tracking-widest italic">{t('add_product', lang)}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-text-secondary hover:text-white transition-colors">
                <Minus size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Product Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">SKU / ID</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-brand-accent"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Initial Qty</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-brand-accent"
                    value={newProduct.quantity || ''}
                    onChange={e => setNewProduct({...newProduct, quantity: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Unit Price</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-brand-accent"
                    value={newProduct.unitPrice || ''}
                    onChange={e => setNewProduct({...newProduct, unitPrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Min Threshold</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-brand-accent"
                    value={newProduct.minThreshold || ''}
                    onChange={e => setNewProduct({...newProduct, minThreshold: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-brand-border rounded-xl text-xs font-bold uppercase text-brand-text-secondary hover:text-white transition-all"
                >
                  {t('cancel', lang)}
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-accent text-white rounded-xl text-xs font-bold uppercase hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
                >
                  {t('save', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}