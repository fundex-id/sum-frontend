import React from 'react';
import { ContractStatus } from '../../types/repayment-security.enum'; // Sesuaikan dengan path file Anda

export interface ContractStatusBadgeProps {
  status?: ContractStatus | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function ContractStatusBadge({ status, size = 'md' }: ContractStatusBadgeProps) {
  // Fungsi Helper untuk warna sesuai status
  const getStatusStyle = (statusVal?: ContractStatus | null) => {
    if (!statusVal) return 'bg-slate-100 text-slate-600 border-slate-200'; // Default jika null
    
    const styles: Record<string, string> = {
      PERFORMING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      OBSERVATION: 'bg-amber-50 text-amber-700 border-amber-300',
      SUBSTANDARD: 'bg-orange-50 text-orange-700 border-orange-300',
      DOUBTFUL: 'bg-rose-50 text-rose-700 border-rose-300',
      DEFAULTED: 'bg-slate-800 text-white border-slate-700',
      FINISHED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    
    return styles[statusVal] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  // Base styling (tanpa pengaturan ukuran agar ukuran bisa dinamis)
  const baseStyles = 'font-bold rounded-md border-2 tracking-wide whitespace-nowrap uppercase shrink-0 inline-flex items-center justify-center';
  
  // Mapping varian ukuran
  const sizeStyles = {
    xs: 'text-[8px] px-1.5 py-[1px]',
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[12px] px-2 py-1',
    lg: 'text-[14px] px-2.5 py-1.5',
  };

  const colorStyles = getStatusStyle(status);

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${colorStyles}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}