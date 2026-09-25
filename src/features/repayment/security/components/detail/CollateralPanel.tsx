import React from 'react';
import { Link } from 'react-router-dom';
import InvoiceStatusBadge from '../../../schedule/components/badges/InvoiceStatusBadge'; // Sesuaikan import dengan path Anda
import CheckOrCross from './CheckOrCross'; // Sesuaikan import dengan path Anda
import { formatRupiah } from '../../../../../utils/currency';
import CollateralStatusBadge from '../../../collateral/components/badge/CollateralBadge';
import { toTitleCase } from '../../../../../utils/formatter';
import { SecurityCollateralItemResponse } from '../../../collateral/dtos/security-collateral.dto';
import { toSafeBig } from '../../../../../utils/number';
import VerificationStatusIcon from '../../../collateral/components/badge/VerificationStatusIcon';

interface CollateralPanelProps {
    securityCollaterals: SecurityCollateralItemResponse[]; // Silakan sesuaikan tipe ini dengan SecurityCollateral[] jika ada
}
export default function CollateralPanel({ securityCollaterals }: CollateralPanelProps) {


    // Mapping Data Agunan (Collaterals) dari API
  const collaterals = securityCollaterals.map(col => ({
    id: col.id,
    type: col.collateralType ? col.collateralType.replace(/_/g, ' ') : '-',
    value: toSafeBig(col.collateralValueEstimated || '0'),
    status: col.collateralStatus,
    verLegalStatus: col.verificationLegalStatus,
    verDocStatus: col.verificationDocumentStatus,
    verFieldStatus: col.verificationFieldStatus,
    verValueStatus: col.verificationValueStatus,

  }));

  return (
    <div className="w-full lg:w-1/2 bg-white rounded-xl border-2 border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex justify-between items-end mb-4 border-b-2 border-slate-100 pb-2">
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Daftar Agunan (Kolateral)</h3>
            
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {collaterals.length === 0 ? (
              <div className="flex justify-center items-center h-full text-[11px] font-medium text-slate-400 py-6">
                Belum ada data agunan terdaftar.
              </div>
            ) : (
              <table className="w-full table-fixed text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-[9px] text-slate-500 uppercase tracking-wider border-y border-slate-200">

                    <th className="w-8 py-2 px-2 font-bold">No</th>  
                    <th className="w-24 py-2 px-2 font-bold">Tipe</th>
                    <th className="py-2 px-2 pr-2 font-bold text-center">Estimasi Nilai</th>
                    <th className="w-8 py-2 px-2 font-bold text-center" title="Verifikasi Dokumen">Dok</th>
                    <th className="w-8 py-2 px-2 font-bold text-center" title="Verifikasi Legal">Leg</th>
                    <th className="w-8 py-2 px-2 font-bold text-center" title="Verifikasi Nilai">Nil</th>
                    <th className="w-8 py-2 px-2 font-bold text-center" title="Verifikasi Lapangan">Lap</th>
                    <th className="w-24 py-2 px-0.5 font-bold text-center">Status</th>  
                  </tr>
                </thead>
                <tbody className="text-[12px] font-medium text-slate-700 divide-y divide-slate-100">
                  {collaterals.map((col, idx) => (
                    <tr key={col.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className='py-2 px-0.5 text-center align-top'>
                        {idx+1}
                      </td>
                      <td className="py-2 px-2 align-top">
                        <p className="font-semibold text-slate-700 mb-1 whitespace-normal break-words max-w-xs">{toTitleCase(col.type)} </p>
                      </td>
                      <td className="py-2 px-2 align-top text-right font-mono font-bold text-slate-800 align-top">
                        {formatRupiah(col.value)}</td>
                      <td className="py-2 px-2 align-top"><VerificationStatusIcon status={col.verDocStatus || null} size="xs"/></td>
                      <td className="py-2 px-2 align-top"><VerificationStatusIcon status={col.verLegalStatus || null} size="xs"/></td>
                      <td className="py-2 px-2 align-top"><VerificationStatusIcon status={col.verValueStatus || null} size="xs"/></td>
                      <td className="py-2 px-2 align-top"><VerificationStatusIcon status={col.verFieldStatus || null} size="xs"/></td>
                      <td className='py-2 px-0.5 text-center align-top'>
                        <CollateralStatusBadge status={col.status} size='sm' />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex justify-end m-2">
            <Link 
            to={`collaterals`} 
            className="text-[10px] font-semibold text-gray-600 hover:text-blue-800 hover:underline transition-colors duration-150"
            >
            Lihat Detail &gt;
            </Link>
          </div>
          
        </div>
  );
};
