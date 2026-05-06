/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react';
import { Transaction, Language, Currency } from '../types';
import { cn, t, formatCurrency } from '../utils';

interface AccountingProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  lang: Language;
  currency: Currency;
}

export default function Accounting({ transactions, onAddTransaction, lang, currency }: AccountingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'revenue',
    category: 'General'
  });

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction(newTransaction);
    setIsModalOpen(false);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'revenue',
      category: 'General'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">{t('accounting', lang)}</h1>
          <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest mt-1">Fiscal Records & Ledger</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-accent text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold uppercase text-xs hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
        >
          <Plus size={16} />
          {t('new_transaction', lang)}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary group-focus-within:text-brand-accent transition-colors" size={16} />
          <input 
            type="text" 
            placeholder={t('search', lang)} 
            className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent transition-all text-sm text-white placeholder:text-brand-text-secondary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 lg:flex-none px-4 py-2 border border-brand-border rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase text-brand-text-secondary hover:text-white hover:bg-white/[0.03] transition-all">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scroll-area">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-sidebar/50 text-brand-text-secondary uppercase text-[10px] tracking-[0.2em] font-bold border-b border-brand-border">
                <th className="px-6 py-4">{t('date', lang)}</th>
                <th className="px-6 py-4">{t('description', lang)}</th>
                <th className="px-6 py-4">{t('category', lang)}</th>
                <th className="px-6 py-4 text-right">{t('amount', lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border font-mono">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-brand-text-secondary">{t.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {t.type === 'revenue' ? (
                        <ArrowUpCircle size={14} className="text-emerald-500" />
                      ) : (
                        <ArrowDownCircle size={14} className="text-red-500" />
                      )}
                      <span className="text-xs lg:text-sm font-medium text-brand-text-primary uppercase truncate max-w-[200px]">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-bold uppercase bg-brand-sidebar text-brand-text-secondary px-2 py-1 rounded-full border border-brand-border">
                      {t.category}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold text-xs lg:text-sm",
                    t.type === 'revenue' ? "text-emerald-500" : "text-white"
                  )}>
                    {t.type === 'revenue' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-brand-text-secondary italic text-xs uppercase tracking-widest">
                    No matching records available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-sidebar border border-brand-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest italic">{t('new_transaction', lang)}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-text-secondary hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text-secondary uppercase">{t('description', lang)}</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent"
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">{t('amount', lang)}</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-brand-accent"
                    value={newTransaction.amount || ''}
                    onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Type</label>
                  <select 
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-white focus:outline-none focus:border-brand-accent"
                    value={newTransaction.type}
                    onChange={e => setNewTransaction({...newTransaction, type: e.target.value as 'revenue' | 'expense'})}
                  >
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text-secondary uppercase">{t('category', lang)}</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent"
                  value={newTransaction.category}
                  onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                />
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
