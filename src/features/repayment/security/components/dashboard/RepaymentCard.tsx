// src/components/repayment/RepaymentCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {useSidePanel} from '../../../../../contexts/SidePanelContext';
import RepaymentSecurityCreateWrapper from '../form/RepaymentSecurityCreateWrapper';
import { toFrontendPercentage } from '../../../../../utils/finance';
import { formatRupiah } from '../../../../../utils/currency';
import { formatCompactDate } from '../../../../../utils/date';
import ContractStatusBadge from '../badges/ContractStatusBadge';
import SecurityTypeBadge from '../badges/SecurityTypeBadge';
import { SecurityType } from '../../types/repayment-security.enum';
import { RepaymentSecurityCardResponse } from '../../dtos/repayment-security.dto';

interface Props {
  data: RepaymentSecurityCardResponse | null;
  url?: string;
  onDataChanged?: ()=> void;
}


export default function RepaymentCard({ data, url, onDataChanged }: Props) {
  // Jika data null, jangan render card biasa, melainkan render card "Tambah Data"

  const { openPanel, closePanel, isOpen } = useSidePanel();
  
  
  if (!data) {
    return (
      <button 
        type="button"
        // onClick={() => openPanel('Tambah Data Repayment Baru', <RepaymentSecurityForm mode="add" />)}
        onClick={() => openPanel(<RepaymentSecurityCreateWrapper onSuccess={onDataChanged}/>)}
        
        className="group relative flex flex-col items-center justify-center p-4 min-h-[220px] h-full w-full bg-gradient-to-br from-amber-50/40 to-white border-2 border-dashed border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-md hover:from-amber-50/80 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden"
      >
        {/* Efek Glow Aksen di Pojok Kanan Atas */}
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-100/50 rounded-full blur-xl group-hover:bg-amber-200/60 transition-colors"></div>
        
        {/* Ikon Relevan (Dokumen + Plus) */}
        <div className="flex items-center justify-center w-10 h-10 mb-2.5 bg-amber-100 rounded-full text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm z-10">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            {/* Menggambarkan Dokumen dengan Tanda Tambah di Tengahnya */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        {/* Text Area */}
        <div className="text-center z-10">
          <p className="font-bold text-xs text-amber-900 group-hover:text-amber-700 transition-colors">
            Tambahkan data pembayaran baru
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Buat profil repayment security
          </p>
        </div>
      </button>
    );
  }
  // Formatters





  // Dummy Progress Calculation
  const sinkingFundProgress = Math.round(100 * Number(data.receiptSinkingFundSum) / Number(data.contractUnderlyingFund)); 
  const circleRadius = 14; 
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (sinkingFundProgress / 100) * circleCircumference;

  return (
    <div className="bg-white p-3 rounded-xl border-2 border-slate-200 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group">
      
      {/* HEADER: Title & Status */}
      <div className="flex justify-between items-start gap-2 border-b-2 border-slate-100 pb-2 mb-2">
        <div className="min-w-0 pr-2">
          <h3 className="text-[13px] font-bold text-slate-700 leading-tight truncate group-hover:text-slate-900 transition-colors" title={data.investeeName}>
            {data.investeeName}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate" title={data.investeeNameLegal}>
            {data.investeeNameLegal}
          </p>
        </div>
        <ContractStatusBadge status={data.contractStatus || null} size='sm' />
       
      </div>

      {/* BODY: Security Info & Financials */}
      <div className="space-y-2 grow">
        <div className="flex items-center gap-1.5">
          <SecurityTypeBadge type={data.securityType || null} size='sm' /> 
          <span className="text-[11px] font-semibold text-slate-600 truncate" title={data.securityName}>
            {data.securityName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border-2 border-slate-100">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pendanaan</p>
            <p className="text-[13px] font-bold text-slate-700 font-mono mt-0.5">
              {formatRupiah(data.contractUnderlyingFund)}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {data.securityType === SecurityType.SUKUK ? 'Kupon' : 'Dividen'}
            </p>
            <p className="text-[13px] font-bold text-emerald-600 font-mono mt-0.5">
              {toFrontendPercentage(data.contractYieldRateAnnually)}% <span className="text-[9px] text-slate-400 font-sans font-medium">p.a.</span>
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER: 3 Columns Layout (Di-adjust jadi items-stretch & justify-between) */}
      <div className="mt-3 pt-2.5 border-t-2 border-slate-100 flex items-stretch justify-between gap-2">
        
        {/* Kolom 1: Durasi & Range Tanggal */}
        <div className="flex flex-col justify-between leading-tight min-w-0">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Durasi: {data.contractDurationInMonths} Bulan
          </span>
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-slate-600 font-medium">
              <span className="text-slate-400 inline-block w-11">Mulai:</span> 
              <span className="font-mono">{formatCompactDate(data.contractStartDate)}</span>
            </div>
            <div className="text-[10px] text-slate-600 font-medium">
              <span className="text-slate-400 inline-block w-11">Selesai:</span> 
              <span className="font-mono">{formatCompactDate(data.contractEndDate)}</span>
            </div>
          </div>
        </div>

        {/* Kolom 2: Doughnut Chart Centered */}
        <div className="flex flex-col items-center justify-between shrink-0">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Sinking Fund
          </span>
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle cx="16" cy="16" r={circleRadius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-300" />
              <circle 
                cx="16" cy="16" r={circleRadius} 
                stroke="currentColor" strokeWidth="3" fill="transparent" 
                className={`${
                    sinkingFundProgress < 100 ? "text-orange-500" : "text-green-500"
                  } transition-all duration-1000 ease-out`}
                strokeDasharray={circleCircumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[8px] font-bold text-slate-600">{sinkingFundProgress.toFixed(0)}%</span>
          </div>
        </div>

        {/* Kolom 3: Button Bottom Right */}
      
        <div className="shrink-0 flex flex-col justify-end">
          <Link 
            to={`${url}`} 
            className="flex items-center gap-1.5 text-[10px] font-bold bg-white text-slate-700 border-2 border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
          >
            Lihat detil
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>

    </div>
  );
}

