import React from 'react';
import { RepaymentSecurity } from '../../../types';
import InfoRow from '../../../../../components/ui/InfoRow';
import { toFrontendPercentage } from '../../../../../utils/finance';

interface RevenueSectionProps {
  data: RepaymentSecurity;
  formatRupiah: (numStr: string | number) => string;
}

export default function RevenueSection({ data, formatRupiah }: RevenueSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Informasi Pendapatan & Nilai</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <InfoRow label="Nilai Pendanaan (Underlying Fund)" value={formatRupiah(data.contractUnderlyingFund)} />
        <InfoRow label="Estimasi Imbal Hasil (Yield)" value={formatRupiah(data.contractYieldAmount)} />
        <InfoRow label="Persentase Imbal Hasil (Tahunan)" value={`${toFrontendPercentage(data.contractYieldRateAnnually)}%`} />
        <InfoRow label="Total Diterima (Sinking Fund)" value={formatRupiah(data.sumReceiptSinkingFund || 0)} />
      </div>
    </div>
  );
}