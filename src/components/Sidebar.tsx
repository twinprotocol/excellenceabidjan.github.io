/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Wallet, Boxes, Users, Settings, LogOut, ChartNoAxesCombined } from 'lucide-react';
import { cn, t } from '../utils';
import { View, Language } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  lang: Language;
}

export default function Sidebar({ currentView, onNavigate, lang }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as View, label: t('dashboard', lang), icon: LayoutDashboard },
    { id: 'accounting' as View, label: t('accounting', lang), icon: Wallet },
    { id: 'inventory' as View, label: t('inventory', lang), icon: Boxes },
    { id: 'crm' as View, label: t('crm', lang), icon: Users },
  ];

  return (
    <aside className="w-64 border-r border-brand-border bg-brand-sidebar min-h-screen flex flex-col h-full shadow-2xl lg:shadow-none">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
          <ChartNoAxesCombined size={18} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white uppercase italic">Nexis ERP</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] mb-2">{t('operational', lang)}</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
              currentView === item.id 
                ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
                : "text-brand-text-secondary hover:bg-white/[0.03] hover:text-white"
            )}
          >
            <item.icon size={18} className={cn(
              "transition-opacity",
              currentView === item.id ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            )} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-border">
        <div className="flex items-center gap-3 p-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-xs font-bold text-white uppercase italic">
            NX
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">System Control</p>
            <p className="text-[10px] text-brand-text-secondary uppercase">Administrator</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary hover:text-white transition-colors">
          <Settings size={14} />
          {t('settings', lang)}
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-red-500/80 hover:text-red-500 transition-colors">
          <LogOut size={14} />
          {t('logout', lang)}
        </button>
      </div>
    </aside>
  );
}
