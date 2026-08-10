import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RepaymentScheduleForm from './RepaymentScheduleForm';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { repaymentScheduleService } from '../../services/repaymentScheduleService';
import { RepaymentScheduleEditFormResponse, RepaymentScheduleFormRequest } from '../../dtos/repayment-schedule.dto';
import { InvoiceStatus, ScheduleType } from '../../types/repayment-schedule.enum';
import { RepaymentSecurityDetailResponse } from '../../../repayment-security/dtos/repayment-security.dto';


interface EditWrapperProps {
  scheduleId: string;
  repaymentSecurity: RepaymentSecurityDetailResponse;
  onSuccess?: ()=> void;
}

export default function RepaymentScheduleEditWrapper({ scheduleId, repaymentSecurity, onSuccess}: EditWrapperProps) {
  const [initialData, setInitialData] = useState<RepaymentScheduleFormRequest | null>(null);

  const { closePanel } = useSidePanel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // State Modal Konfirmasi

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const response = await repaymentScheduleService.getRepaymentScheduleEditForm(scheduleId);
        // Ngambil data.item berdasarkan format JSON yang lo kasih
        if (response.data && response.data.item) {
          
          const repaymentScheduleRes: RepaymentScheduleEditFormResponse = response.data.item;
          const currentData: RepaymentScheduleFormRequest = {
            repaymentSecurityId: repaymentSecurity.id,
            scheduleType: repaymentScheduleRes?.scheduleType || null, // Default value
            scheduleSequence: repaymentScheduleRes?.scheduleSequence || 0, // Default urutan pertama
            scheduleDate: repaymentScheduleRes?.scheduleDate || '', 
            invoiceDate: repaymentScheduleRes?.invoiceDate || '', 
            invoiceNumber: repaymentScheduleRes?.invoiceNumber || '-',
            invoiceSentTrial: repaymentScheduleRes?.invoiceSentTrial || 0,
            invoiceStatus: repaymentScheduleRes?.invoiceStatus || null, // Default jadwal baru biasanya Draft
            invoiceNotes: repaymentScheduleRes?.invoiceNotes || '',
            invoiceFeeAdministration: repaymentScheduleRes?.invoiceFeeAdministration || '',
            invoiceFeeAdministrationTax: repaymentScheduleRes?.invoiceFeeAdministrationTax || '',
            invoiceFeeProvision: repaymentScheduleRes?.invoiceFeeProvision || '',
            invoiceFeeProvisionTax: repaymentScheduleRes?.invoiceFeeProvisionTax || '',
            invoiceFeePlatform: repaymentScheduleRes?.invoiceFeePlatform || '',
            invoiceFeePlatformTax: repaymentScheduleRes?.invoiceFeePlatformTax || '',
            invoiceFeeServicing: repaymentScheduleRes?.invoiceFeeServicing || '',
            invoiceFeeServicingTax: repaymentScheduleRes?.invoiceFeeServicingTax || '',
            invoiceFeeMonitoring: repaymentScheduleRes?.invoiceFeeMonitoring || '',
            invoiceFeeMonitoringTax: repaymentScheduleRes?.invoiceFeeMonitoringTax || '',
            invoiceFeeOther: repaymentScheduleRes?.invoiceFeeOther || '',
            invoiceFeeOtherTax: repaymentScheduleRes?.invoiceFeeOtherTax || '',
            invoiceSinkingFund: repaymentScheduleRes?.invoiceSinkingFund || '',
            invoiceYield: repaymentScheduleRes?.invoiceYield || '',
            invoiceActualLoss: repaymentScheduleRes?.invoiceActualLoss || '',
            invoicePenalty: repaymentScheduleRes?.invoicePenalty || '',
            invoiceTotal: repaymentScheduleRes?.invoiceTotal || '',
            invoiceTotalTax: repaymentScheduleRes?.invoiceTotalTax || '',
            invoiceTotalWithTax: repaymentScheduleRes?.invoiceTotalWithTax || '',
          };
          setInitialData(currentData);
        }
      } catch (error) {
        console.error("Gagal memuat data jadwal", error);
        // Lo bisa tambahin toast notification error di sini
      }
    };

    if (scheduleId) {
      fetchScheduleData();
    }
  }, [scheduleId]);

  const handleUpdateSubmit = async (formData: RepaymentScheduleFormRequest) => {

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

      // await new Promise((resolve) => setTimeout(resolve, 5000));
      // Memanggil fungsi POST API dari service 
      await repaymentScheduleService.updateRepaymentSchedule(scheduleId, payloadData);
      
      console.log('Berhasil mengedit jadwal untuk Schedule ID:', scheduleId);
      
      // Bisa tambahkan Toast Notification (Success) di sini
      if (onSuccess){
        onSuccess();
      }
      closePanel(); // Langsung tutup side panel setelah berhasil
    } catch (error: any) {
      console.error("Gagal mengedit jadwal :", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      );
      // Bisa tambahkan Toast Notification (Error) di sini
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {

      // await new Promise((resolve) => setTimeout(resolve, 5000));
      // Memanggil fungsi menghapus
      await repaymentScheduleService.deleteRepaymentSchedule(scheduleId);
      
      console.log('Berhasil menghapus jadwal untuk Schedule ID:', scheduleId);
      
      // Bisa tambahkan Toast Notification (Success) di sini
      if (onSuccess){
        onSuccess();
      }
      closePanel(); // Langsung tutup side panel setelah berhasil

      //Navigate
      navigate('/repayment/securities/'+repaymentSecurity.id, { 
        replace: true, 
        // state: { message: 'Data berhasil dihapus!' } 
      });
    } catch (error: any) {
      console.error("Gagal menghapus jadwal :", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menghapus data."
      );
      // Bisa tambahkan Toast Notification (Error) di sini
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative bg-white">
      {initialData ? (
        <RepaymentScheduleForm 
          mode='edit'
          initialData={initialData}
          repaymentSecurity={repaymentSecurity}
          onSubmit={handleUpdateSubmit} 
          onCancel={closePanel}
          onDelete={handleDelete}
          isLoading={isSubmitting} 
          submissionError={submissionError}
        />
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 space-y-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 animate-pulse">Sedang memuat data jadwal...</p>
        </div>
      )}

      
    </div>
  );
}