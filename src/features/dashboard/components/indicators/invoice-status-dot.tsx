import React from 'react';
import { InvoiceStatus } from '../../../repayment/schedule/types/repayment-schedule.enum';


export interface InvoiceStatusDotProps {
  status: InvoiceStatus;
  /** Teks di samping dot. Kalau tidak diisi, pakai label default Bahasa Indonesia per status. */
  label?: string;
  /** Sembunyikan teks, tampilkan dot saja. */
  hideLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

// Warna dot SENGAJA disamakan dengan palet InvoiceStatusBadge
// (features/repayment-schedule/components/badge/InvoiceStatusBadge.tsx),
// hanya diambil versi solid (bg-*-500) karena di sini yang dirender cuma titik kecil, bukan pill.
const DOT_COLOR: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-400',
  UNPAID: 'bg-amber-400',
  PARTIAL: 'bg-lime-500',
  PAID: 'bg-emerald-500',
  OVERDUE: 'bg-rose-500',
  VOID: 'bg-zinc-400',
  WRITE_OFF: 'bg-slate-600',
};

// Label default per status — dipakai kalau prop `label` tidak diisi manual
const DEFAULT_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  UNPAID: 'Belum Dibayar',
  PARTIAL: 'Sebagian',
  PAID: 'Lunas',
  OVERDUE: 'Terlambat',
  VOID: 'Void',
  WRITE_OFF: 'Write Off',
};

const DOT_SIZE: Record<NonNullable<InvoiceStatusDotProps['size']>, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
};

/**
 * Indikator status invoice berupa titik warna kecil (bukan badge/pill).
 * Dipakai khusus di dashboard: legend kalender & tooltip saat hover tanggal.
 */
export default function InvoiceStatusDot({ status, label, hideLabel, size = 'sm', className = '' }: InvoiceStatusDotProps) {
  const text = label ?? DEFAULT_LABEL[status] ?? status;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`inline-block rounded-full shrink-0 ${DOT_SIZE[size]} ${DOT_COLOR[status] ?? 'bg-slate-400'}`}></span>
      {!hideLabel && <span className="leading-none">{text}</span>}
    </span>
  );
}