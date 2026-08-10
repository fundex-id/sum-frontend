import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RepaymentSecurityForm from './RepaymentSecurityForm';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { repaymentSecurityService } from '../../services/repaymentSecurityService'; // Sesuaikan path
import { RepaymentSecurityEditFormResponse, RepaymentSecurityFormRequest } from '../../dtos/repayment-security.dto';
import { formatDateForInput } from '../../../../utils/date';
import { Big } from 'big.js';
import { mapDtoToFormData } from '../../../../utils/form';
import { toSafeBig } from '../../../../utils/number';

interface EditWrapperProps {
  repaymentId: string;
  onSuccess?: () => void;
}

export default function RepaymentSecurityEditWrapper({ repaymentId, onSuccess }: EditWrapperProps) {
  const { closePanel } = useSidePanel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<RepaymentSecurityFormRequest | null>(null);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorFetch(null);
        // Memanggil API GET lewat Service
        const response = await repaymentSecurityService.getRepaymentSecurityEditForm(repaymentId);

        // console.log('[RepaymentSecurityEditWrapper] response : ',response);

        if (response.data && response.data.item) {

          const repaymentSecurityRes = response.data.item;

          const durationInmonths = Number (repaymentSecurityRes?.contractDurationInMonths || 0);
          const underlyingFund = new Big(repaymentSecurityRes?.contractUnderlyingFund || '0');
          const yieldAmount = new Big(repaymentSecurityRes?.contractYieldAmount || '0');
          const yieldRateAnnually = new Big(repaymentSecurityRes?.contractYieldRateAnnually || '0').times(100);
          const feeAdministration = new Big(repaymentSecurityRes?.contractFeeAdministration || '0');
          const feeAdministrationPercentage = new Big(repaymentSecurityRes?.contractFeeAdministrationPercentage || '0').times(100);
          const feeProvision = new Big(repaymentSecurityRes?.contractFeeProvision || '0');
          const feeProvisionPercentage = new Big(repaymentSecurityRes?.contractFeeProvisionPercentage || '0').times(100);
          const feePlatform = new Big(repaymentSecurityRes?.contractFeePlatform || '0');
          const feePlatformPercentage = new Big(repaymentSecurityRes?.contractFeePlatformPercentage || '0').times(100);
          const feeServicing = new Big(repaymentSecurityRes?.contractFeeServicing || '0');
          const feeServicingPercentage = new Big(repaymentSecurityRes?.contractFeeServicingPercentage || '0').times(100);
          const feeMonitoring = new Big(repaymentSecurityRes?.contractFeeMonitoring || '0');
          const feeMonitoringPercentageMonthly = new Big(repaymentSecurityRes?.contractFeeMonitoringPercentageMonthly || '0').times(100);
          const feeMonitoringMonthly = feeMonitoringPercentageMonthly.times(underlyingFund).div(100);
          const feeMonitoringPercentage = feeMonitoringPercentageMonthly.times(durationInmonths);

          const maxPrecision = 2;
          const maxPrecisionPct = 4;

          const currentData: RepaymentSecurityFormRequest = {
            investeeId: repaymentSecurityRes?.investeeId || '',
            investeeName: repaymentSecurityRes?.investeeName || '',
            investeeNameLegal: repaymentSecurityRes?.investeeNameLegal || '',
            investeeIconUrl: repaymentSecurityRes?.investeeIconUrl || '',
            securityId: repaymentSecurityRes?.securityId || '',
            securityType: repaymentSecurityRes?.securityType || null,
            securityName: repaymentSecurityRes?.securityName || '',
            securityCode: repaymentSecurityRes?.securityCode || '',
            securitySeries: repaymentSecurityRes?.securitySeries || 0,
            securityPhase: repaymentSecurityRes?.securityPhase || 0,
            securitySequence: repaymentSecurityRes?.securitySequence || 0,
            
            contractStartDate: formatDateForInput(repaymentSecurityRes?.contractStartDate) || '',
            contractEndDate: formatDateForInput(repaymentSecurityRes?.contractEndDate) || '',
            contractDurationInMonths: repaymentSecurityRes?.contractDurationInMonths || 0,
            contractStatus: repaymentSecurityRes?.contractStatus || null,
            
            contractUnderlyingFund: underlyingFund.round(maxPrecision).toString(),
            contractYieldAmount: yieldAmount.round(maxPrecision).toString(),
            contractYieldRateAnnually: yieldRateAnnually.round(maxPrecisionPct).toString(),
            contractFeeAdministration: feeAdministration.round(maxPrecision).toString(),
            contractFeeAdministrationPercentage: feeAdministrationPercentage.round(maxPrecisionPct).toString(),
            contractFeeProvision: feeProvision.round(maxPrecision).toString(),
            contractFeeProvisionPercentage: feeProvisionPercentage.round(maxPrecisionPct).toString(),
            contractFeePlatform: feePlatform.round(maxPrecision).toString(),
            contractFeePlatformPercentage: feePlatformPercentage.round(maxPrecisionPct).toString(),
            contractFeeServicing: feeServicing.round(maxPrecision).toString(),
            contractFeeServicingPercentage: feeServicingPercentage.round(maxPrecisionPct).toString(),
            contractFeeMonitoringMonthly: feeMonitoringMonthly.round(maxPrecision).toString(),
            contractFeeMonitoringPercentageMonthly: feeMonitoringPercentageMonthly.round(maxPrecisionPct).toString(),
            contractFeeMonitoring: feeMonitoring.round(maxPrecision).toString(),
            contractFeeMonitoringPercentage: feeMonitoringPercentage.round(maxPrecisionPct).toString(),
  
            contractTaxPpn: repaymentSecurityRes?.contractTaxPpn || '',
            contractTaxFactor: repaymentSecurityRes?.contractTaxFactor || '',
            contractTaxYield: repaymentSecurityRes?.contractTaxYield || '',
            contractPenaltyPercentageDaily: repaymentSecurityRes?.contractPenaltyPercentageDaily || '',
            
            contractEscrowBank: repaymentSecurityRes?.contractEscrowBank || '',
            contractEscrowAccount: repaymentSecurityRes?.contractEscrowAccount || '',
            contractVaBank: repaymentSecurityRes?.contractVaBank || '',
            contractVaNumber: repaymentSecurityRes?.contractVaNumber || '',
            contractContactEmail: repaymentSecurityRes?.contractContactEmail || '',
            contractContactWhatsapp: repaymentSecurityRes?.contractContactWhatsapp || '',
            
            contractDocumentTitle: repaymentSecurityRes?.contractDocumentTitle || '',
            contractDocumentNumber: repaymentSecurityRes?.contractDocumentNumber || '',
            contractDocumentUrl: repaymentSecurityRes?.contractDocumentUrl || '',
            restructOrder: repaymentSecurityRes?.restructOrder || 0,
            restructParentSecurityId: repaymentSecurityRes?.restructParentSecurityId || null,
            restructOriginalSecurityId: repaymentSecurityRes?.restructOriginalSecurityId || null,
  
            scheduleUpfrontFlag: false,
            scheduleUpfrontDate: '',
            scheduleInstallmentFlag: false,
            scheduleInstallmentDate: '',
            };

            console.log('[RepaymentSecurityEditWrapper] currentData : ',currentData);
          
          setInitialData(currentData);
          
          console.log('[RepaymentSecurityEditWrapper] initialData : ',initialData);

        }
      
      } catch (error: any) {
        console.error("Gagal memuat detail kontrak:", error);
        setErrorFetch(error?.response?.data?.message || "Gagal memuat data dari server.");
      }
    };

    if (repaymentId) {
      fetchData();
    }
  }, [repaymentId]);

  const handleEditSubmit = async (formData: RepaymentSecurityFormRequest) => {
    setIsSubmitting(true);
    setSubmissionError(null); 

    const precisionPct = 4;

    const payloadData : RepaymentSecurityFormRequest = {
      ...formData,
      securityType: formData.securityType === '' ? null : formData.securityType,
      contractStatus: formData.contractStatus === '' ? null : formData.contractStatus,

      contractYieldRateAnnually: toSafeBig(formData.contractYieldRateAnnually).div(100).round(precisionPct).toString(),
      contractFeeAdministrationPercentage: toSafeBig(formData.contractFeeAdministrationPercentage).div(100).round(precisionPct).toString(),
      contractFeeProvisionPercentage: toSafeBig(formData.contractFeeProvisionPercentage).div(100).round(precisionPct).toString(),
      contractFeePlatformPercentage: toSafeBig(formData.contractFeePlatformPercentage).div(100).round(precisionPct).toString(),
      contractFeeServicingPercentage: toSafeBig(formData.contractFeeServicingPercentage).div(100).round(precisionPct).toString(),
      contractFeeMonitoringPercentageMonthly: toSafeBig(formData.contractFeeMonitoringPercentageMonthly).div(100).round(precisionPct).toString(),


      contractEscrowBank: formData.contractEscrowBank === '' ? null : formData.contractEscrowBank,
      contractEscrowAccount: formData.contractEscrowAccount === '' ? null : formData.contractEscrowAccount,
      contractVaBank: formData.contractVaBank === '' ? null : formData.contractVaBank,
      contractVaNumber: formData.contractVaNumber === '' ? null : formData.contractVaNumber,
      contractContactEmail: formData.contractContactEmail === '' ? null : formData.contractContactEmail,
      contractContactWhatsapp: formData.contractContactWhatsapp === '' ? null : formData.contractContactWhatsapp,
      contractDocumentTitle: formData.contractDocumentTitle === '' ? null : formData.contractDocumentTitle,
      contractDocumentNumber: formData.contractDocumentNumber === '' ? null : formData.contractDocumentNumber,

      contractStartDate: formData.contractStartDate === '' ? null : formData.contractStartDate,
      contractEndDate: formData.contractEndDate === '' ? null : formData.contractEndDate,
      scheduleUpfrontDate: formData.scheduleUpfrontDate === '' ? null : formData.scheduleUpfrontDate,
      scheduleInstallmentDate: formData.scheduleInstallmentDate === '' ? null : formData.scheduleInstallmentDate,
    };

    const isFileUploaded = formData.contractDocumentUrl instanceof File

    try {
      // Panggil API lewat Service
      if (isFileUploaded){
        const payloadFormData = mapDtoToFormData(payloadData);
        await repaymentSecurityService.updateRepaymentSecurity(repaymentId, payloadFormData);
      } else {
        await repaymentSecurityService.updateRepaymentSecurity(repaymentId, payloadData);
      }

      if (onSuccess){
        onSuccess();
      }

      closePanel();
    } catch (error: any) {
      console.error("Gagal update data", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
  
      await repaymentSecurityService.deleteRepaymentSecurity(repaymentId);
      
      if (onSuccess){
        onSuccess();
      }
      closePanel();
      // 2. Kirim pesan sukses ke halaman list menggunakan state (opsional)
      // 3. Redirect ke halaman list dengan opsi 'replace: true'
      navigate('/repayment/securities', { 
        replace: true, 
        // state: { message: 'Data berhasil dihapus!' } 
      });
    } catch (error: any) {
      console.error("Gagal menghapus repayment security", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menghapus data repayment security."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (Logika error handling dan skeleton loading tetap sama seperti sebelumnya)

  if (!initialData) return <div>Loading...</div>;

  return (
    <RepaymentSecurityForm
      mode='edit'
      initialData={initialData}
      onSubmit={handleEditSubmit}
      onCancel={closePanel}
      onDelete={handleDelete}
      isLoading={isSubmitting}
      submissionError={submissionError}
    />
  );
}