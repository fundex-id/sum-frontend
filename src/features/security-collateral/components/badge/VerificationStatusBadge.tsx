import React from 'react';
import { VerificationStatus } from '../../types/verification.enum';

export interface VerificationStatusBadgeProps {
  status?: VerificationStatus | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function VerificationStatusBadge({ status, size = 'md' }: VerificationStatusBadgeProps) {
  const getStatusStyle = (statusVal?: VerificationStatus | null) => {
    if (!statusVal) return 'bg-slate-100 text-slate-500 border-slate-200';
    
    const styles: Record<VerificationStatus, string> = {
      SUBMITTED: 'bg-slate-100 text-slate-700 border-slate-300',
      UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-300',
      VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      DECLINED: 'bg-rose-50 text-rose-700 border-rose-300',
    };
    return styles[statusVal] || 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const baseStyles = 'font-bold rounded-md border-2 tracking-wide whitespace-nowrap uppercase shrink-0 inline-flex items-center justify-center';
  
  const sizeStyles = {
    xs: 'text-[8px] px-1.5 py-[1px]',
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[11px] px-2 py-1',
    lg: 'text-[13px] px-2.5 py-1.5',
    xl: 'text-[15px] px-3 py-2',
  };

  const colorStyles = getStatusStyle(status);
  const displayStatus = status ? status.replace(/_/g, ' ') : '-';

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${colorStyles}`}>
      {displayStatus}
    </span>
  );
}