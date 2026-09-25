import { CollateralStatus } from "../../types/security-collateral.enum";

export interface CollateralStatusBadgeProps {
    status?: CollateralStatus | null; 
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }
  
  export default function CollateralStatusBadge({ status, size = 'md' }: CollateralStatusBadgeProps) {
    // Fungsi Helper untuk mapping warna berdasarkan status collateral
    const getStatusStyle = (statusVal?: CollateralStatus | null) => {
      if (!statusVal) return 'bg-slate-100 text-slate-500 border-slate-200'; // Default jika null
      
      // Palet warna disesuaikan dengan konteks/tahapan agunan
      const styles: Record<CollateralStatus, string> = {
        IDLE: 'bg-slate-100 text-slate-700 border-slate-300', // Abu-abu netral (Aman / Tidak ada tindakan)
        WARNING: 'bg-amber-50 text-amber-700 border-amber-300', // Kuning (Peringatan awal)
        LITIGATION: 'bg-rose-50 text-rose-700 border-rose-300', // Merah (Masuk jalur hukum/bahaya)
        EXECUTING: 'bg-blue-50 text-blue-700 border-blue-300', // Biru (Sedang dalam proses eksekusi)
        EXECUTED: 'bg-emerald-50 text-emerald-700 border-emerald-300', // Hijau (Selesai dieksekusi)
        RELEASED: 'bg-zinc-100 text-zinc-500 border-zinc-300', // Abu-abu redup (Agunan sudah dikembalikan/lepas)
      };
      
      return styles[statusVal] || 'bg-slate-100 text-slate-500 border-slate-200';
    };
  
    // Base styling untuk label
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
    
    // Render teks: menghilangkan underscore jika ada (berjaga-jaga), dan set 'UNKNOWN' jika null
    const displayStatus = status ? status.replace(/_/g, ' ') : 'UNKNOWN';
  
    return (
      <span className={`${baseStyles} ${sizeStyles[size]} ${colorStyles}`}>
        {displayStatus}
      </span>
    );
  }