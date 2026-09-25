import React from 'react';
// Pastikan path import enum ini disesuaikan dengan struktur folder kamu
import { ReceiptStatus } from '../../types/repayment-receipt.enum'; 

export interface ReceiptStatusBadgeProps {
  status?: ReceiptStatus | null; 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; 
}

export default function ReceiptStatusBadge({ status, size = 'md' }: ReceiptStatusBadgeProps) {
  // Fungsi Helper untuk mapping warna berdasarkan status receipt
  const getStatusStyle = (statusVal?: ReceiptStatus | null) => {
    if (!statusVal) return 'bg-slate-100 text-slate-500 border-slate-200'; // Default jika null
    
    // Palet warna disesuaikan dengan urgensi status transaksi
    const styles: Record<ReceiptStatus, string> = {
      SUCCESS: 'bg-emerald-100 text-emerald-700 border-emerald-300', // Hijau sukses
      FAILED: 'bg-rose-50 text-rose-700 border-rose-300', // Merah bahaya/gagal
      REVERSED: 'bg-zinc-100 text-zinc-600 border-zinc-300', // Abu-abu netral (dikembalikan/dibatalkan)
    };
    
    return styles[statusVal] || 'bg-slate-100 text-slate-500 border-slate-200';
  };

  // Base styling untuk label (mengikuti benchmark InvoiceStatusBadge)
  const baseStyles = 'font-bold rounded-md border-2 tracking-wide whitespace-nowrap uppercase shrink-0 inline-flex items-center justify-center';
  
  // Mapping varian ukuran
  const sizeStyles = {
    xs: 'text-[8px] px-1.5 py-[1px]',
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[11px] px-2 py-1',
    lg: 'text-[13px] px-2.5 py-1.5',
    xl: 'text-[15px] px-3 py-2', 
  };

  const colorStyles = getStatusStyle(status);
  
  // Menghilangkan underscore untuk render teks jika kedepannya ada status multi-kata
  const displayStatus = status ? status.replace(/_/g, ' ') : 'UNKNOWN';

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${colorStyles}`}>
      {displayStatus}
    </span>
  );
}