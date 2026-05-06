/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Currency = 'USD' | 'FCFA' | 'TND';
export type Language = 'en' | 'fr' | 'ar';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'revenue' | 'expense';
  category: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  category: string;
  minThreshold: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'lead' | 'active' | 'inactive';
  lastContact: string;
  revenue: number;
}

export type View = 'dashboard' | 'accounting' | 'inventory' | 'crm';
