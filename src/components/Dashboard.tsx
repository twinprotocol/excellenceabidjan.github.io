/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
} from 'recharts';
import { TrendingUp, Package, Users, Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { Transaction, Product, Customer, Language, Currency } from '../types';
import { cn, t, formatCurrency } from '../utils';

interface DashboardProps {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  lang: Language;
  currency: Currency;
}

export default function Dashboard({ transactions, products, customers, lang, currency }: DashboardProps) {
  const totalRevenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalAssets = products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const activeCustomers = customers.filter(c => c.status === 'active').length;

  const chartData = [
    { name: 'W1', revenue: 4000, expenses: 2400 },
    { name: 'W2', revenue: 3000, expenses: 1398 },
    { name: 'W3', revenue: 2000, expenses: 3200 },
    { name: 'W4', revenue: 2780, expenses: 3908 },
  ];

  const StatPanel = ({ title, value, icon: Icon, trend, color, accentColor }: any) => (
    <div className="card p-5 lg:p-6 flex flex-col gap-4 group hover:border-brand-accent transition-all">
      <div className="flex justify-between items-start">
        <span className="text-brand-text-secondary text-[10px] lg:text-xs font-bold uppercase tracking-widest">{title}</span>
        <div className={`p-2 rounded-lg bg-brand-surface border border-brand-border ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <h3 className="text-xl lg:text-2xl font-bold font-mono text-white tracking-tighter">{value}</h3>
        {trend && (
          <span className={cn(
            "text-xs font-bold flex items-center mb-1",
            trend > 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-2 border border-brand-border">
        <div className={cn("h-full transition-all duration-1000", accentColor)} style={{ width: '45%' }}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">{t('overview', lang)}</h1>
          <p className="text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] mt-1">Operational Health & Real-time Metrics</p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-full uppercase italic w-fit">
          <Activity size={10} className="animate-pulse" />
          {lang === 'ar' ? 'النظام يعمل بكفاءة' : 'System: Optimized'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPanel 
          title={t('revenue', lang)} 
          value={formatCurrency(totalRevenue, currency)} 
          icon={TrendingUp} 
          trend={12} 
          color="text-emerald-500" 
          accentColor="bg-emerald-500"
        />
        <StatPanel 
          title={t('expenses', lang)} 
          value={formatCurrency(totalExpenses, currency)} 
          icon={Wallet} 
          trend={-4} 
          color="text-red-500" 
          accentColor="bg-red-500"
        />
        <StatPanel 
          title={t('stock_health', lang)} 
          value={formatCurrency(totalAssets, currency)} 
          icon={Package} 
          trend={8} 
          color="text-brand-accent" 
          accentColor="bg-brand-accent"
        />
        <StatPanel 
          title={t('active_leads', lang)} 
          value={activeCustomers} 
          icon={Users} 
          trend={15} 
          color="text-amber-500" 
          accentColor="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-6 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-8 border-b border-brand-border pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest italic">{t('performance' as any, lang) || 'Performance Analytics'}</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
              <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262629" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tick={{ fill: '#94A3B8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tick={{ fill: '#94A3B8' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ 
                    backgroundColor: '#0F0F11', 
                    border: '1px solid #262629', 
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="revenue" fill="#EBFF00" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="expenses" fill="#1F1F23" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-brand-border pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest italic">{t('stock_health', lang)}</h3>
            <button className="text-[10px] font-bold text-brand-text-secondary hover:text-white transition-colors uppercase">{t('overview', lang)}</button>
          </div>
          <div className="space-y-6">
            {products.length > 0 ? products.slice(0, 5).map(product => {
              const isLow = product.quantity <= product.minThreshold;
              return (
                <div key={product.id} className="space-y-2">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-xs text-slate-300 uppercase truncate pr-4">{product.name}</span>
                    <span className={cn(
                      "text-[10px] font-bold",
                      isLow ? "text-amber-500" : "text-brand-text-secondary"
                    )}>
                      {product.quantity} UNITS
                    </span>
                  </div>
                  <div className="h-1 w-full bg-[#0F0F11] border border-brand-border rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-700",
                        isLow ? "bg-amber-500" : "bg-brand-accent"
                      )}
                      style={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="flex-1 flex flex-col items-center justify-center text-brand-text-secondary py-12">
                <Package size={40} className="mb-4 opacity-10" />
                <p className="text-xs italic uppercase tracking-widest">No inventory data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-brand-sidebar/50">
          <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">{t('ledger', lang)}</h3>
          <button className="text-[10px] font-bold uppercase text-brand-text-secondary hover:text-white transition-colors">{t('overview', lang)}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-brand-text-secondary text-[10px] uppercase tracking-widest border-b border-brand-border bg-brand-sidebar/20">
                <th className="px-6 py-4">{t('date', lang)}</th>
                <th className="px-6 py-4">{t('description', lang)}</th>
                <th className="px-6 py-4">{t('amount', lang)}</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {transactions.length > 0 ? transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="border-b border-brand-border/50 hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 font-mono text-brand-text-secondary">{t.date}</td>
                  <td className="px-6 py-4 text-slate-300 font-medium uppercase">{t.description}</td>
                  <td className={cn(
                    "px-6 py-4 font-mono font-bold",
                    t.type === 'revenue' ? "text-emerald-500" : "text-white"
                  )}>
                    {t.type === 'revenue' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border",
                      t.type === 'revenue' ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-500" : "bg-slate-900 border-brand-border text-slate-400"
                    )}>
                      {t.type === 'revenue' ? 'Settled' : 'Unconfirmed'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-brand-text-secondary italic text-xs uppercase tracking-widest">
                    No recent ledger entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
