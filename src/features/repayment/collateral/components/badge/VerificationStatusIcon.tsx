import React from 'react';
import { VerificationStatus } from '../../types/verification.enum';

export interface VerificationStatusIconProps {
  status?: VerificationStatus | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string; // Opsional untuk margin, dll
}

export default function VerificationStatusIcon({ status, size = 'md', className = '' }: VerificationStatusIconProps) {
  // 1. Mapping size ke ukuran w & h Tailwind
  const sizeStyles = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  // 2. Mapping warna sesuai benchmark (menggunakan text-color untuk mewarnai SVG)
  const getColorStyle = (statusVal?: VerificationStatus | null) => {
    if (!statusVal) return 'text-slate-400';
    
    const styles: Record<VerificationStatus, string> = {
      SUBMITTED: 'text-slate-400',
      UNDER_REVIEW: 'text-amber-500',
      VERIFIED: 'text-emerald-500',
      DECLINED: 'text-rose-500',
    };
    return styles[statusVal] || 'text-slate-400';
  };

  const iconClass = `${sizeStyles[size]} ${getColorStyle(status)} shrink-0 ${className}`;

  // 3. Render SVG spesifik per status (SEMUA PAKAI STROKE 3PX UNTUK KONSISTENSI)
  switch (status) {
    case 'SUBMITTED':
      // Icon Dash (-)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      );
      
    case 'UNDER_REVIEW':
      // BARU: Icon Kaca Pembesar (Pemeriksaan)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      );
      
    case 'VERIFIED':
      // Icon Check
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      );
      
    case 'DECLINED':
      // Icon Cross (X)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      );
      
    default:
      // Fallback
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      );
  }
}