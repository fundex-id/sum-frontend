// src/components/ui/FeeWithTax.tsx
import React from 'react';
// Pastikan import Big jika tipenya digunakan
// import Big from 'big.js'; 
import { formatRupiah } from '../../utils/currency';

type FeeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type FeeWeight = 'light' | 'normal' | 'semibold' | 'bold' | 'extrabold';
type FeeColor = 'black' | 'green' | 'blue' | 'red' | 'yellow' | 'gray'; // 👈 Tipe baru untuk warna

interface FeeWithTaxProps {
  base: number | string | Big;
  tax?: number | string | Big;
  size?: FeeSize; 
  weight?: FeeWeight;
  color?: FeeColor; // 👈 Prop baru untuk menentukan warna
  withRp?: boolean;
}

const sizeFee: Record<FeeSize, string> = {
  'xs': 'text-[8px]',
  'sm': 'text-[10px]',
  'md': 'text-[12px]',
  'lg': 'text-[14px]',
  'xl': 'text-[16px]',
};

const sizeTax: Record<FeeSize, string> = {
  'xs': 'text-[8px] font-light',
  'sm': 'text-[9px] font-normal',
  'md': 'text-[10px] font-normal',
  'lg': 'text-[10px] font-medium',
  'xl': 'text-[11px] font-medium',
};

// 👈 Mapping margin-top dinamis agar jarak merapat saat ukuran mengecil
const sizeTaxMargin: Record<FeeSize, string> = {
  'xs': 'mt-[9px]',
  'sm': 'mt-[12px]',
  'md': 'mt-[16px]',
  'lg': 'mt-[18px]',
  'xl': 'mt-[120px]',
};

const sizeWeight: Record<FeeWeight, string> = {
  'light': 'font-light',
  'normal': 'font-normal',
  'semibold': 'font-semibold',
  'bold': 'font-bold',
  'extrabold': 'font-extrabold',
};

// 👇 Mapping warna untuk nilai base (utama)
const colorBaseMap: Record<FeeColor, string> = {
  black: 'text-slate-800',
  green: 'text-emerald-700', 
  blue: 'text-blue-700',
  red: 'text-rose-700',
  yellow: 'text-amber-700',
  gray: 'text-gray-600',
};

// 👇 Mapping warna untuk nilai pajak (tax)
const colorTaxMap: Record<FeeColor, string> = {
  black: 'text-gray-500',
  green: 'text-emerald-500',
  blue: 'text-blue-500',
  red: 'text-rose-500',
  yellow: 'text-amber-600',
  gray: 'text-gray-500',
};

export default function FeeWithTax({ 
  base, 
  tax = 0, 
  size = 'md', 
  weight = 'normal', 
  color = 'black', 
  withRp = true
}: FeeWithTaxProps) {
  return (
    <div className="relative flex flex-col items-end">
      {/* 👈 Implementasi mapping colorBaseMap pada class base */}
      <span className={`font-mono ${colorBaseMap[color]} ${sizeFee[size]} ${sizeWeight[weight]}`}>
        {formatRupiah(base, withRp)}
      </span>
      
      {/* Defensive rendering: Hanya render tax jika ada nilainya dan di atas 0 */}
      {tax != null && tax > 0 && (
        // 👈 Menggunakan sizeTaxMargin[size] untuk jarak dinamis & menghapus class 'fixed'
        <span className={`absolute ${sizeTaxMargin[size]} ${colorTaxMap[color]} font-sans tracking-tight ${sizeTax[size]}`}>
          +ppn {formatRupiah(tax, withRp)}
        </span>
      )}
    </div>
  );
}