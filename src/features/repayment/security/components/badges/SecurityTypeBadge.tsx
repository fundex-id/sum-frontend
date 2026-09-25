import React from 'react';
import { SecurityType } from '../../types/repayment-security.enum'; // Sesuaikan dengan path file Anda

export interface SecurityTypeBadgeProps {
  type?: SecurityType | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function SecurityTypeBadge({ type, size = 'md' }: SecurityTypeBadgeProps) {
  // Fungsi Helper untuk warna sesuai tipe (Input disesuaikan menjadi SecurityType)
  const getTypeStyle = (typeVal?: SecurityType | null) => {
    if (!typeVal) return 'bg-blue-50 text-blue-600 border-blue-200'; // Default jika null

    const styles: Record<string, string> = {
      SUKUK: 'bg-blue-50 text-blue-600 border-blue-200',
      SAHAM: 'bg-rose-50 text-rose-600 border-rose-200',
    };
    
    return styles[typeVal] || 'bg-blue-50 text-blue-600 border-blue-200';
  };

  // Base styling
  const baseStyles = 'font-bold rounded border-2 shrink-0 inline-flex items-center justify-center uppercase';
  
  // Mapping varian ukuran
  const sizeStyles = {
    xs: 'text-[8px] px-1 py-[1px]',
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[12px] px-2 py-0.5',
    lg: 'text-[14px] px-2.5 py-1',
  };

  const colorStyles = getTypeStyle(type);

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${colorStyles}`}>
      {type || 'UNKNOWN'}
    </span>
  );
}