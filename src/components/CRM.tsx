/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Mail, Phone, ExternalLink, Calendar, Search, Filter, MoreHorizontal, TrendingUp } from 'lucide-react';
import { Customer, Language, Currency } from '../types';
import { cn, t, formatCurrency } from '../utils';

interface CRMProps {
  customers: Customer[];
  onUpdateStatus: (id: string, status: Customer['status']) => void;
  lang: Language;
  currency: Currency;
}

export default function CRM({ customers, onAddCustomer, lang, currency }: CRMProps & { onAddCustomer: (c: Omit<Customer, 'id'>) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    company: '',
    status: 'lead',
    lastContact: new Date().toISOString().split('T')[0],
    revenue: 0
  });

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomer(newCustomer);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">{t('crm', lang)}</h1>
          <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] mt-1">Client Management & Relations</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-accent text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold uppercase text-[10px] hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
        >
          <Users size={14} /> {t('add_contact', lang)}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary group-focus-within:text-brand-accent transition-colors" size={16} />
          <input 
            type="text" 
            placeholder={t('search', lang)} 
            className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent transition-all text-sm text-white placeholder:text-brand-text-secondary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 border border-brand-border rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase text-brand-text-secondary hover:text-white transition-all">
          <Filter size={14} /> {lang === 'ar' ? 'تصفية' : 'Refine'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="card p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary mb-6">Pipeline Velocity</h2>
            <div className="space-y-6">
              {[
                { label: 'Leads', count: customers.filter(c => c.status === 'lead').length, color: 'bg-amber-500' },
                { label: 'Active', count: customers.filter(c => c.status === 'active').length, color: 'bg-emerald-500' },
                { label: 'Inactive', count: customers.filter(c => c.status === 'inactive').length, color: 'bg-slate-500' },
              ].map(stage => (
                <div key={stage.label}>
                  <div className="flex justify-between items-center mb-1.5 font-mono">
                    <span className="text-[10px] font-bold uppercase text-white">{stage.label}</span>
                    <span className="text-[10px] text-brand-text-secondary uppercase">{stage.count} entities</span>
                  </div>
                  <div className="h-1 w-full bg-[#0F0F11] rounded-full overflow-hidden border border-brand-border/30">
                    <div 
                      className={cn("h-full transition-all duration-1000", stage.color)}
                      style={{ width: `${(stage.count / (customers.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-brand-border">
              <p className="text-[10px] uppercase text-brand-text-secondary font-bold mb-2">Aggregate Value</p>
              <p className="text-2xl font-bold font-mono text-white tracking-widest">{formatCurrency(customers.reduce((acc, c) => acc + c.revenue, 0), currency)}</p>
            </div>
          </div>
          
          <div className="bg-brand-accent p-6 rounded-2xl flex items-center justify-between text-black border border-white/10 shadow-xl shadow-brand-accent/20">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">Win Probability</p>
              <p className="text-2xl font-bold font-mono mt-1">{customers.length > 0 ? '42.8%' : '0.0%'}</p>
            </div>
            <TrendingUp size={24} className="opacity-40" />
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="card divide-y divide-brand-border/50">
            {filtered.length > 0 ? filtered.map((customer) => (
              <div key={customer.id} className="p-5 lg:p-6 hover:bg-white/[0.01] transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-sidebar border border-brand-border flex items-center justify-center font-bold text-lg uppercase italic text-brand-accent rounded-xl">
                      {customer.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-white uppercase tracking-tight text-sm lg:text-base leading-none mb-1.5">{customer.name}</h3>
                      <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest italic">{customer.company}</p>
                      <div className="flex items-center gap-3 mt-4 text-slate-500">
                        <button className="hover:text-brand-accent transition-colors"><Mail size={14} /></button>
                        <button className="hover:text-brand-accent transition-colors"><Phone size={14} /></button>
                        <button className="hover:text-brand-accent transition-colors"><ExternalLink size={14} /></button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:text-right flex sm:flex-col justify-between items-end sm:items-end gap-2">
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 border rounded-full font-mono",
                      customer.status === 'active' ? "bg-emerald-900/10 border-emerald-500/20 text-emerald-500" : 
                      customer.status === 'lead' ? "bg-amber-900/10 border-amber-500/20 text-amber-500" :
                      "bg-slate-900 border-brand-border text-slate-400"
                    )}>
                      {customer.status}
                    </span>
                    <div className="text-right">
                      <p className="text-[9px] uppercase text-brand-text-secondary font-bold tracking-widest leading-none mb-1">Portfolio</p>
                      <p className="font-mono font-bold text-white text-sm lg:text-base">{formatCurrency(customer.revenue, currency)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center text-brand-text-secondary italic text-xs uppercase tracking-widest">
                No active records found in operational pipeline
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-sidebar border border-brand-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-brand-border flex justify-between items-center text-white">
              <h2 className="text-sm font-bold uppercase tracking-widest italic">{t('add_customer' as any, lang)}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-text-secondary hover:text-white transition-colors">
                <MoreHorizontal size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text-secondary uppercase">{t('company' as any, lang)}</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent"
                  value={newCustomer.company}
                  onChange={e => setNewCustomer({...newCustomer, company: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">{t('status' as any, lang)}</label>
                  <select 
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-white focus:outline-none focus:border-brand-accent"
                    value={newCustomer.status}
                    onChange={e => setNewCustomer({...newCustomer, status: e.target.value as any})}
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Revenue</label>
                  <input 
                    type="number" 
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-brand-accent"
                    value={newCustomer.revenue || ''}
                    onChange={e => setNewCustomer({...newCustomer, revenue: parseFloat(e.target.value)})}
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