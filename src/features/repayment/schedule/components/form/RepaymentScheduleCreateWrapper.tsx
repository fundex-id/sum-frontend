import React, { useState } from 'react';
import RepaymentScheduleForm from './RepaymentScheduleForm';
import { useSidePanel } from '../../../../../contexts/SidePanelContext';
import { repaymentScheduleService } from '../../services/repaymentScheduleService';
import { ScheduleType, InvoiceStatus } from '../../types/repayment-schedule.enum';
import { RepaymentScheduleEditFormResponse, RepaymentScheduleFormRequest } from '../../dtos/repayment-schedule.dto';
import { RepaymentSecurityDetailResponse, RepaymentSecuritySummaryResponse, RepaymentSecurityWithSinkingFundResponse } from '../../../security/dtos/repayment-security.dto'
import { InvoiceInfo } from '../../types/repayment-schedule.type';



interface CreateWrapperProps {
  repaymentSecurity: RepaymentSecurityDetailResponse;
  lastInstallment?: InvoiceInfo;
  lastUpfront?: InvoiceInfo;
  onSuccess?: ()=> void;
}

export default function RepaymentScheduleCreateWrapper({ repaymentSecurity, lastUpfront, lastInstallment, onSuccess }: CreateWrapperProps) {
  const { closePanel } = useSidePanel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Buat default state yang aman untuk form baru agar kalkulasi Big.js tidak error (NaN)



  const defaultInitialData: RepaymentScheduleFormRequest = {
    repaymentSecurityId: repaymentSecurity.securityId,
    scheduleType: null, // Default value
    scheduleSequence: 0, // Default urutan pertama
    scheduleDate: '', 
    invoiceDate: '', 
    invoiceNumber: '-',
    invoiceSentTrial: 0,
    invoiceStatus: null, // Default jadwal baru biasanya Draft
    invoiceNotes: '',
    invoiceFeeAdministration: '',
    invoiceFeeAdministrationTax: '',
    invoiceFeeProvision: '',
    invoiceFeeProvisionTax: '',
    invoiceFeePlatform: '',
    invoiceFeePlatformTax: '',
    invoiceFeeServicing: '',
    invoiceFeeServicingTax: '',
    invoiceFeeMonitoring: '',
    invoiceFeeMonitoringTax: '',
    invoiceFeeOther: '',
    invoiceFeeOtherTax: '',
    invoiceSinkingFund: '',
    invoiceYield: '',
    invoiceActualLoss: '',
    invoicePenalty: '',
    invoiceTotal: '',
    invoiceTotalTax: '',
    invoiceTotalWithTax: '',
  };

  const handleCreateSubmit = async (formData: RepaymentScheduleFormRequest) => {

    if (!repaymentSecurity.id) {
      console.error("Error: repaymentSecurityId tidak ditemukan!");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null); 

    const payloadData : RepaymentScheduleFormRequest = {
      ...formData,
      invoiceStatus: formData.invoiceStatus === '' ? null : formData.invoiceStatus,
      scheduleType: formData.scheduleType === '' ? null : formData.scheduleType,
      invoiceNumber: formData.invoiceNumber === '-' ? null : formData.invoiceNumber,
      invoiceDate: formData.invoiceDate === '' ? null : formData.invoiceDate,
    };

    try {
      // Memanggil fungsi POST API dari service 
      await repaymentScheduleService.createRepaymentSchedule(repaymentSecurity.id, payloadData);
      
      console.log('Berhasil membuat jadwal baru untuk Security ID:', repaymentSecurity.id);

      if (onSuccess){
        onSuccess();
      }
      
      // Bisa tambahkan Toast Notification (Success) di sini
      closePanel(); // Langsung tutup side panel setelah berhasil
    } catch (error: any) {
      console.error("Gagal membuat jadwal baru:", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      );
      // Bisa tambahkan Toast Notification (Error) di sini
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative bg-white">
      <RepaymentScheduleForm 
        mode='add'
        initialData={defaultInitialData}
        repaymentSecurity={repaymentSecurity}
        lastUpfront={lastUpfront}
        lastInstallment={lastInstallment}
        onSubmit={handleCreateSubmit} 
        onCancel={closePanel} 
        isLoading={isSubmitting} 
        submissionError={submissionError}

      />
    </div>
  );
}