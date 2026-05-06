/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Currency, Language } from './types';
import { translations, TranslationKey } from './i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: Currency) {
  const symbol = currency === 'USD' ? '$' : currency === 'FCFA' ? 'FCFA' : 'TND';
  
  if (currency === 'FCFA') {
    return `${amount.toLocaleString()} ${symbol}`;
  }
  if (currency === 'TND') {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 3 })} ${symbol}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations['en'][key] || key;
}
