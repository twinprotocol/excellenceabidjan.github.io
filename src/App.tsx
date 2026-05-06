/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as XLSX from 'xlsx';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Accounting from './components/Accounting';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import { View, Transaction, Product, Customer, Language, Currency } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_PRODUCTS, INITIAL_CUSTOMERS } from './constants';
import { Bell, Download, Globe, Menu, Coins, Activity } from 'lucide-react';
import { t } from './utils';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  
  const [lang, setLang] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('nexis_erp_v3_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.t) setTransactions(data.t);
        if (data.p) setProducts(data.p);
        if (data.c) setCustomers(data.c);
        if (data.lang) setLang(data.lang);
        if (data.currency) setCurrency(data.currency);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexis_erp_v3_data', JSON.stringify({
      t: transactions,
      p: products,
      c: customers,
      lang,
      currency
    }));
  }, [transactions, products, customers, lang, currency]);

  const handleUpdateStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
    ));
  };

  const handleAddTransaction = (newT: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newT,
      id: `TRX-${Date.now()}`
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleAddProduct = (newP: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newP,
      id: `PRD-${Date.now()}`
    };
    setProducts(prev => [...prev, product]);
  };

  const handleAddCustomer = (newC: Omit<Customer, 'id'>) => {
    const customer: Customer = {
      ...newC,
      id: `CST-${Date.now()}`
    };
    setCustomers(prev => [...prev, customer]);
  };

  const exportToExcel = () => {
    const today = new Date().toISOString().split('T')[0];
    const dataToExport = transactions.length > 0 ? transactions : [{ status: 'No data' }];
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    
    XLSX.writeFile(workbook, `Nexis_ERP_Export_${today}.xlsx`);
  };

  const renderView = () => {
    const commonProps = { lang, currency };
    switch (currentView) {
      case 'dashboard': 
        return <Dashboard transactions={transactions} products={products} customers={customers} {...commonProps} />;
      case 'accounting': 
        return <Accounting transactions={transactions} onAddTransaction={handleAddTransaction} {...commonProps} />;
      case 'inventory': 
        return <Inventory products={products} onUpdateStock={handleUpdateStock} onAddProduct={handleAddProduct} {...commonProps} />;
      case 'crm': 
        return <CRM customers={customers} onAddCustomer={handleAddCustomer} onUpdateStatus={() => {}} {...commonProps} />;
      default: 
        return <Dashboard transactions={transactions} products={products} customers={customers} {...commonProps} />;
    }
  };

  return (
    <div className={`flex bg-brand-bg min-h-screen font-sans text-brand-text-primary ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} lang={lang} />
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-50 w-64 lg:hidden shadow-2xl`}
            >
              <Sidebar currentView={currentView} onNavigate={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} lang={lang} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-brand-border bg-brand-sidebar flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-brand-text-secondary hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm lg:text-lg font-bold text-white uppercase italic tracking-tight">
              {t(currentView as any, lang)}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            {/* L10n & Currency Selectors */}
            <div className="flex items-center gap-1 bg-brand-surface p-1 rounded-xl border border-brand-border">
              <div className="flex items-center gap-1 px-1 lg:px-2 border-r border-brand-border">
                <Globe size={12} className="text-brand-text-secondary" />
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="bg-transparent text-[9px] lg:text-[10px] font-bold text-white focus:outline-none cursor-pointer appearance-none lg:appearance-auto uppercase"
                >
                  <option value="en" className="bg-brand-sidebar">EN</option>
                  <option value="fr" className="bg-brand-sidebar">FR</option>
                  <option value="ar" className="bg-brand-sidebar">AR</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-1 lg:px-2">
                <Coins size={12} className="text-brand-text-secondary" />
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-transparent text-[9px] lg:text-[10px] font-bold text-white focus:outline-none cursor-pointer appearance-none lg:appearance-auto"
                >
                  <option value="USD" className="bg-brand-sidebar">USD</option>
                  <option value="FCFA" className="bg-brand-sidebar">CFA</option>
                  <option value="TND" className="bg-brand-sidebar">TND</option>
                </select>
              </div>
            </div>

            <button 
              onClick={exportToExcel}
              title={t('export_excel', lang)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-brand-accent/20"
            >
              <Download size={14} />
              Excel
            </button>

            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-brand-text-secondary hover:text-white relative transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-accent rounded-full border border-brand-sidebar"></span>
              
              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute top-full ${lang === 'ar' ? 'left-0' : 'right-0'} mt-2 w-72 bg-brand-sidebar border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden`}
                  >
                    <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-surface/50">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">{t('notifications' as any, lang)}</h3>
                    </div>
                    <div className="p-6 text-center text-[10px] text-brand-text-secondary uppercase tracking-widest italic">
                      {t('no_notifications' as any, lang)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + lang}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <footer className="h-10 bg-brand-sidebar border-t border-brand-border flex items-center justify-between px-4 lg:px-8 text-[9px] uppercase tracking-[0.2em] text-brand-text-secondary font-mono">
          <div className="truncate hidden sm:block">Nexus Core ERP v3.0 | Status: <span className="text-emerald-500">Live</span></div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => {
                if(confirm("Factory reset? All data will be lost.")) {
                  localStorage.removeItem('nexis_erp_v3_data');
                  window.location.reload();
                }
              }}
              className="text-red-500/30 hover:text-red-500 transition-colors uppercase font-bold text-[8px] italic"
            >
              [ Wipe Memory ]
            </button>
            <span className="opacity-30">|</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
              Relay Online
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
