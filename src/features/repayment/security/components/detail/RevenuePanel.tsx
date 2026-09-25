
import { Big } from 'big.js';
import React from 'react';
import { formatPercentage, formatRupiah } from '../../../../../utils/currency';
import { calculateTax, toFrontendPercentage } from '../../../../../utils/finance';
import { toSafeBig } from '../../../../../utils/number';
import { RepaymentSecurityWithSinkingFundResponse } from '../../dtos/repayment-security.dto';
import RevenueRow from './RevenueRow';
// Import komponen UI yang dibutuhkan oleh tabel panel summary Anda seperti FeeWithTax, InfoRow, atau formatter

interface RevenueProps {
  repaymentSecurity: RepaymentSecurityWithSinkingFundResponse; // Ganti 'any' dengan tipe data summary yang relevan (RepaymentSecurity, dsb)
}

// export default function CollateralSection({ collaterals, formatRupiah }: CollateralPanelProps) {
export default function RevenuePanel({ repaymentSecurity }: RevenueProps) {

const taxPpn = toSafeBig(repaymentSecurity.contractTaxPpn);
const taxFactor = toSafeBig(repaymentSecurity.contractTaxFactor);
const duration = Number(repaymentSecurity.contractDurationInMonths)

const feeAdmin = toSafeBig(repaymentSecurity.contractFeeAdministration);
const feeAdminPct = toSafeBig(repaymentSecurity.contractFeeAdministrationPercentage);
const feeAdminTax = toSafeBig(calculateTax(feeAdmin, taxPpn, taxFactor));

const feeProvision = toSafeBig(repaymentSecurity.contractFeeProvision);
const feeProvisionPct = toSafeBig(repaymentSecurity.contractFeeProvisionPercentage);
const feeProvisionTax = toSafeBig(calculateTax(feeProvision, taxPpn, taxFactor));

const feePlatform = toSafeBig(repaymentSecurity.contractFeePlatform);
const feePlatformPct = toSafeBig(repaymentSecurity.contractFeePlatformPercentage);
const feePlatformTax = toSafeBig(calculateTax(feePlatform, taxPpn, taxFactor));

const feeServicing = toSafeBig(repaymentSecurity.contractFeeServicing);
const feeServicingPct = toSafeBig(repaymentSecurity.contractFeeServicingPercentage);
const feeServicingTax = toSafeBig(calculateTax(feeServicing, taxPpn, taxFactor));

const feeMonitoring = toSafeBig(repaymentSecurity.contractFeeMonitoring);
const feeMonitoringPctMonthly = toSafeBig(repaymentSecurity.contractFeeMonitoringPercentageMonthly);
const feeMonitoringPct = feeMonitoringPctMonthly.times(duration);
const feeMonitoringTax = toSafeBig(calculateTax(feeMonitoring, taxPpn, taxFactor));

const totalFee = feeAdmin.plus(feeProvision).plus(feePlatform).plus(feeServicing).plus(feeMonitoring);
const totalPct = feeAdminPct.plus(feeProvisionPct).plus(feePlatformPct).plus(feeServicingPct).plus(feeMonitoringPct);
const totalTax = feeAdminTax.plus(feeProvisionTax).plus(feePlatformTax).plus(feeServicingTax).plus(feeMonitoringTax);



  return (

      <div className="w-full lg:w-1/2 bg-white rounded-xl border-2 border-slate-200 shadow-sm p-5 flex flex-col">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-4 border-b-2 border-slate-100 pb-2">Rincian Potensi Pendapatan Platform</h3>
          
          <div className="flex-1 flex flex-col gap-3">
             <RevenueRow label="Biaya Administrasi" value={feeAdmin} percentage={feeAdminPct} tax={feeAdminTax}/>
             <RevenueRow label="Biaya Provisi" value={feeProvision} percentage={feeProvisionPct} tax={feeProvisionTax}/>
             <RevenueRow label="Biaya Platform" value={feePlatform} percentage={feePlatformPct} tax={feePlatformTax}/>
             <RevenueRow label={"Biaya Pelayanan (Servicing)"} value={feeServicing} percentage={feeServicingPct} tax={feeServicingTax}/>
             <RevenueRow label={`Biaya Pemantauan ${duration} Bulan`} value={feeMonitoring} percentage={feeMonitoringPct} tax={feeMonitoringTax}/>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-300 flex flex-col bg-blue-50 ">
            <RevenueRow label='POTENSI REVENUE' value={totalFee} percentage={totalPct} tax={totalTax} size='lg' /> 
          </div>
        </div>

  );
};
