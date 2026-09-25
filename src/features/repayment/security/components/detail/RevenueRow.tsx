// =============================================================================
// REUSABLE HELPER COMPONENTS
// =============================================================================

import { Big } from "big.js";
import FeeWithTax from "../../../../../components/ui/FeeWithTax";
import { formatPercentage } from "../../../../../utils/currency";

type FeeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type FeeWeight = 'light' | 'normal' | 'semibold' | 'bold' | 'extrabold';

const sizeLabel: Record<FeeSize, string> = {
  'xs': 'text-[8px]',
  'sm': 'text-[9px]',
  'md': 'text-[12px]',
  'lg': 'text-[14px]',
  'xl': 'text-[15px]',
};

const sizePct: Record<FeeSize, string> = {
  'xs': 'text-[8px]',
  'sm': 'text-[9px]',
  'md': 'text-[11px]',
  'lg': 'text-[13px]',
  'xl': 'text-[14px]',
};

// Helper: Teks Informasi Flat
interface RevenueRowProps {
    label: string; 
    value: string | number | Big; 
    percentage?: string | number | Big; 
    tax?: string | number | Big;
    size?: FeeSize; // 👈 Prop baru untuk mode
    weight?: FeeWeight;
    withRp?: boolean;
}

// Helper: Baris Revenue Summary
export default function RevenueRow({ label, value, percentage, tax, size = 'md', weight = 'normal', withRp = true}: RevenueRowProps) {
    return (
      <div className="flex justify-between items-end border-b border-slate-100 pb-2">
        <span className={`text-[11px] flex-[5] font-semibold text-slate-500 ${sizeLabel[size]}`}>{label}</span>
        <span className="text-[12px] flex-[3] font-bold font-mono text-slate-800">
          <FeeWithTax base={value} tax={tax} size={size} weight={weight} withRp={withRp}/>
        </span>
        <span className={`text-[11px] flex-[1] font-semibold text-slate-500 text-right ${sizePct[size]}`}>{formatPercentage(percentage ?? null)}</span>
      </div>
    );
  }