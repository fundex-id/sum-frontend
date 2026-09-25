import { ContractStatus, SecurityType } from "../features/repayment/security/types/repayment-security.enum";

 // Status Styling Generator
 export const getStatusStyle = (status: ContractStatus | null) => {
    // Jika status null, langsung kembalikan style default
    if (!status) {
      return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  
    const styles: Record<ContractStatus, string> = {
      PERFORMING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      OBSERVATION: 'bg-amber-50 text-amber-700 border-amber-300',
      SUBSTANDARD: 'bg-orange-50 text-orange-700 border-orange-300',
      DOUBTFUL: 'bg-rose-50 text-rose-700 border-rose-300',
      DEFAULTED: 'bg-slate-800 text-white border-slate-700',
    };
  
    // Tetap pakai fallback jika status yang dimasukkan tidak ada di mapping styles
    return styles[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

export const getTypeStyle = (type: SecurityType | null) => {
    return type === SecurityType.SUKUK 
      ? 'bg-blue-50 text-blue-600 border-blue-200' 
      : 'bg-rose-50 text-rose-600 border-rose-200';
  };