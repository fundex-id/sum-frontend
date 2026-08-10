// src/components/repayment/RepaymentReceiptEditWrapper.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RepaymentReceiptForm from './RepaymentReceiptForm';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { repaymentReceiptService } from '../../services/repaymentReceiptService';
import { InvoiceSummaryWithPenaltyBig } from '../../../repayment-schedule/types/repayment-schedule.type';
import { RepaymentReceiptEditFormResponse, RepaymentReceiptFormRequest } from '../../dtos/repayment-receipt.dto';
import { mapDtoToFormData } from '../../../../utils/form';

interface Props {
  receiptId: string; // Mengikuti instruksi GET & PUT URL kamu
  invoiceSummary: InvoiceSummaryWithPenaltyBig;
  onSuccess?: ()=> void;
}

export default function RepaymentReceiptEditWrapper({ receiptId, invoiceSummary, onSuccess }: Props) {
  const { closePanel } = useSidePanel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<RepaymentReceiptFormRequest | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceiptDetail = async () => {
      try {
        const response = await repaymentReceiptService.getRepaymentReceiptEditForm(receiptId);

        if (response.data && response.data.item) {
          
          
          const repaymentReceiptRes: RepaymentReceiptEditFormResponse = response.data.item;

          console.log('[RepaymentReceiptEditWrapper] repaymentReceiptRes.receiptDate : ',repaymentReceiptRes.receiptDate);

          const currentData: RepaymentReceiptFormRequest = {
            repaymentScheduleId: repaymentReceiptRes?.repaymentScheduleId,
            receiptDate: repaymentReceiptRes?.receiptDate || '',
            receiptStatus: repaymentReceiptRes?.receiptStatus || '',
            receiptMethod: repaymentReceiptRes?.receiptMethod || null,
            receiptNotes: repaymentReceiptRes?.receiptNotes || '',
            receiptDocumentUrl: repaymentReceiptRes?.receiptDocumentUrl || '',
            receiptTotalWithTax: repaymentReceiptRes?.receiptTotalWithTax || '',
            receiptTotal: repaymentReceiptRes?.receiptTotal || '',
            receiptTotalTax: repaymentReceiptRes?.receiptTotalTax || '',
            receiptFeeAdministration: repaymentReceiptRes?.receiptFeeAdministration || '',
            receiptFeeAdministrationTax: repaymentReceiptRes?.receiptFeeAdministrationTax || '',
            receiptFeeProvision: repaymentReceiptRes?.receiptFeeProvision || '',
            receiptFeeProvisionTax: repaymentReceiptRes?.receiptFeeProvisionTax || '',
            receiptFeePlatform: repaymentReceiptRes?.receiptFeePlatform || '',
            receiptFeePlatformTax: repaymentReceiptRes?.receiptFeePlatformTax || '',
            receiptFeeServicing: repaymentReceiptRes?.receiptFeeServicing || '',
            receiptFeeServicingTax: repaymentReceiptRes?.receiptFeeServicingTax || '',
            receiptFeeMonitoring: repaymentReceiptRes?.receiptFeeMonitoring || '',
            receiptFeeMonitoringTax: repaymentReceiptRes?.receiptFeeMonitoringTax || '',
            receiptFeeOther: repaymentReceiptRes?.receiptFeeOther || '',
            receiptFeeOtherTax: repaymentReceiptRes?.receiptFeeOtherTax || '',
            receiptSinkingFund: repaymentReceiptRes?.receiptSinkingFund || '',
            receiptYield: repaymentReceiptRes?.receiptYield || '',
            receiptActualLoss: repaymentReceiptRes?.receiptActualLoss || '',
            receiptPenalty: repaymentReceiptRes?.receiptPenalty || '',
          };
          setInitialData(currentData);
        }
        
      } catch (error) {
        console.error("Gagal fetch data receipt", error);
      }
    };

    if (receiptId) {
      fetchReceiptDetail();
    }

  }, [receiptId]);

  const handleEditSubmit = async (formData: RepaymentReceiptFormRequest) => {
    setIsSubmitting(true);
    setSubmissionError(null); 

    const payloadData : RepaymentReceiptFormRequest = {
      ...formData,
      receiptMethod: formData.receiptMethod === '' ? null : formData.receiptMethod,
      receiptNotes: formData.receiptNotes === '' ? null : formData.receiptNotes,
    };

    const isFileUploaded = formData.receiptDocumentUrl instanceof File

    try {
      // await repaymentReceiptService.updateRepaymentReceipt(receiptId, formData);
      if (isFileUploaded){
        const payloadFormData = mapDtoToFormData(payloadData);
        await repaymentReceiptService.updateRepaymentReceipt(receiptId, payloadFormData);
      } else {
        await repaymentReceiptService.updateRepaymentReceipt(receiptId, payloadData);
      }
      if (onSuccess){
        onSuccess();
      }
      closePanel();
    } catch (error: any) {
      console.error("Gagal update penerimaan", error);
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
  
      await repaymentReceiptService.deleteRepaymentReceipt(receiptId);
      console.log('Berhasil menghapus bukti pembayaran untuk Receipt ID:', receiptId);
      
      if (onSuccess){
        onSuccess();
      }
      closePanel();

      //Untuk case delete receipt sementara tidak perlu redirect
      // navigate('/dashboard/repayment/'+invoiceSummary.repaymentSecurityId+'/schedules/'+invoiceSummary.id, { 
      //   replace: true, 
      //   // state: { message: 'Data berhasil dihapus!' } 
      // });
      
    } catch (error: any) {
      console.error("Gagal menghapus data bukti pembayaran", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menghapus data bukti pembayaran."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full">
      {initialData ? (
        <RepaymentReceiptForm 
          mode='edit'
          initialData={initialData}
          invoiceSummary={invoiceSummary}
          onSubmit={handleEditSubmit} 
          onCancel={closePanel}
          onDelete={handleDelete}
          isLoading={isSubmitting} 
          submissionError={submissionError}
        />
      ) : (
        <div className="p-6 text-sm text-slate-500">Loading data...</div>
      )}
    </div>
  );
}