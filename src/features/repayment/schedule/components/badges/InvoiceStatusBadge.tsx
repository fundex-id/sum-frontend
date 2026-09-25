import React from 'react';
import { InvoiceStatus } from '../../types/repayment-schedule.enum';


// 2. Interface Props
export interface InvoiceStatusBadgeProps {
  status?: InvoiceStatus | null; 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // 👈 Ditambahkan ukuran xl
}

export default function InvoiceStatusBadge({ status, size = 'md' }: InvoiceStatusBadgeProps) {
  // Fungsi Helper untuk mapping warna berdasarkan status invoice
  const getStatusStyle = (statusVal?: InvoiceStatus | null) => {
    if (!statusVal) return 'bg-slate-100 text-slate-500 border-slate-200'; // Default jika null
    
    // Palet warna disesuaikan dengan urgensi status
    const styles: Record<InvoiceStatus, string> = {
      DRAFT: 'bg-slate-100 text-slate-700 border-slate-300', 
      UNPAID: 'bg-amber-50 text-amber-700 border-amber-300', 
      PARTIAL: 'bg-lime-50 text-lime-700 border-lime-400', 
      PAID: 'bg-emerald-100 text-emerald-700 border-emerald-300', 
      OVERDUE: 'bg-rose-50 text-rose-700 border-rose-300', 
      VOID: 'bg-zinc-300 text-zinc-500 border-zinc-400', 
      WRITE_OFF: 'bg-slate-500 text-white border-slate-600', 
    };
    
    return styles[statusVal] || 'bg-slate-100 text-slate-500 border-slate-200';
  };

  // Base styling untuk label
  const baseStyles = 'font-bold rounded-md border-2 tracking-wide whitespace-nowrap uppercase shrink-0 inline-flex items-center justify-center';
  
  // Mapping varian ukuran (termasuk penambahan xl)
  const sizeStyles = {
    xs: 'text-[8px] px-1.5 py-[1px]',
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[11px] px-2 py-1',
    lg: 'text-[13px] px-2.5 py-1.5',
    xl: 'text-[15px] px-3 py-2', // 👈 Ukuran xl baru
  };

  const colorStyles = getStatusStyle(status);
  
  // Menghilangkan underscore untuk render teks (misal: "WRITE_OFF" jadi "WRITE OFF")
  const displayStatus = status ? status.replace(/_/g, ' ') : 'UNKNOWN';

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${colorStyles}`}>
      {displayStatus}
    </span>
  );
}