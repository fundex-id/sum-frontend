// src/components/repayment/RepaymentReceiptCreateWrapper.tsx
import React, { useState } from 'react';
import RepaymentReceiptForm from './RepaymentReceiptForm';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { repaymentReceiptService } from '../../services/repaymentReceiptService';
import { ReceiptStatus } from '../../types/repayment-receipt.enum';
import { InvoiceSummaryWithPenaltyBig } from '../../../repayment-schedule/types/repayment-schedule.type';
import { RepaymentReceiptFormRequest } from '../../dtos/repayment-receipt.dto';
import { mapDtoToFormData } from '../../../../utils/form';
import { InvoiceRemainingBalanceResponse } from '../../../repayment-schedule/dtos/repayment-schedule.dto';

interface Props {
  invoiceSummary: InvoiceSummaryWithPenaltyBig;
  invoiceRemaining: InvoiceRemainingBalanceResponse;
  onSuccess?: ()=> void;
}

export default function RepaymentReceiptCreateWrapper({invoiceSummary, invoiceRemaining, onSuccess }: Props) {
  const { closePanel } = useSidePanel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // DUMMY Data Tagihan untuk Acuan Kalkulasi (Anggap data dari Schedule API)
  const initialData: RepaymentReceiptFormRequest = {
    repaymentScheduleId: invoiceSummary.id,
    receiptDate: '',
    receiptStatus: null,
    receiptMethod: null,
    receiptNotes: '',
    receiptDocumentUrl: '',
    receiptTotalWithTax: '',
    receiptTotal: '',
    receiptTotalTax: '',
    receiptFeeAdministration: '',
    receiptFeeAdministrationTax: '',
    receiptFeeProvision: '',
    receiptFeeProvisionTax: '',
    receiptFeePlatform: '',
    receiptFeePlatformTax: '',
    receiptFeeServicing: '',
    receiptFeeServicingTax: '',
    receiptFeeMonitoring: '',
    receiptFeeMonitoringTax: '',
    receiptFeeOther: '',
    receiptFeeOtherTax: '',
    receiptSinkingFund: '',
    receiptYield: '',
    receiptActualLoss: '',
    receiptPenalty: ''
  };

  const handleCreateSubmit = async (formData: RepaymentReceiptFormRequest) => {
    setIsSubmitting(true);
    setSubmissionError(null); 

    const payloadData : RepaymentReceiptFormRequest = {
      ...formData,
      receiptMethod: formData.receiptMethod === '' ? null : formData.receiptMethod,
      receiptNotes: formData.receiptNotes === '' ? null : formData.receiptNotes,
    };

    // console.log('dudu payload : ',payloadData);

    const isFileUploaded = formData.receiptDocumentUrl instanceof File

    try {
      // await repaymentReceiptService.createRepaymentReceipt(invoiceSummary.id, formData);
      if (isFileUploaded){
        const payloadFormData = mapDtoToFormData(payloadData);
        await repaymentReceiptService.createRepaymentReceipt(invoiceSummary.id, payloadFormData);
      } else {
        await repaymentReceiptService.createRepaymentReceipt(invoiceSummary.id, payloadData);
      }

      if (onSuccess){
        onSuccess();
      }
      closePanel();
    } catch (error: any) {
      console.error("Gagal create penerimaan", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RepaymentReceiptForm 
      mode='add'
      initialData={initialData}
      invoiceSummary={invoiceSummary}
      invoiceRemaining={invoiceRemaining}
      onSubmit={handleCreateSubmit} 
      onCancel={closePanel} 
      isLoading={isSubmitting} 
      submissionError = {submissionError}
    />
  );
}