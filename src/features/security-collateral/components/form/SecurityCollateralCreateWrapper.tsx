import React, { useState } from 'react';
import SecurityCollateralForm from './SecurityCollateralForm';
import { securityCollateralService } from '../../services/securityCollateralService';
import { SecurityCollateralFormRequest } from '../../dtos/security-collateral.dto';
import { CollateralType, CollateralStatus, VerificationStatus } from '../../types/security-collateral.enum';
import { useSidePanel } from '../../../../contexts/SidePanelContext'; // Sesuaikan
import { RepaymentSecuritySummaryResponse } from '../../../repayment-security/dtos/repayment-security.dto';
import { mapDtoToFormData } from '../../../../utils/form';

interface CreateWrapperProps {
  repaymentSecuritySummary : RepaymentSecuritySummaryResponse;
  onSuccess?: ()=> void;
}

export default function SecurityCollateralCreateWrapper({ repaymentSecuritySummary, onSuccess }: CreateWrapperProps) {
  const { closePanel } = useSidePanel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const initialData: SecurityCollateralFormRequest = {
    repaymentSecurityId: repaymentSecuritySummary.id,
    collateralType: '',
    collateralDescription: '',
    collateralValueEstimated: '0',
    collateralStatus: '',
    executionTime: '',
    documentUrl: '',
    
    verificationDocumentStatus: VerificationStatus.SUBMITTED,
    verificationDocumentNotes: '',
    verificationDocumentBy: '',
    verificationDocumentAt: '',
    
    verificationFieldStatus: VerificationStatus.SUBMITTED,
    verificationFieldNotes: '',
    verificationFieldBy: '',
    verificationFieldAt: '',
    
    verificationLegalStatus: VerificationStatus.SUBMITTED,
    verificationLegalNotes: '',
    verificationLegalBy: '',
    verificationLegalAt: '',
    
    verificationValueStatus: VerificationStatus.SUBMITTED,
    verificationValueNotes: '',
    verificationValueBy: '',
    verificationValueAt: ''
  };

  const handleCreateSubmit = async (formData: SecurityCollateralFormRequest) => {
    setIsSubmitting(true);
    setSubmissionError(null); 

    const payloadData : SecurityCollateralFormRequest = {
      ...formData,
      collateralStatus: formData.collateralStatus === '' ? null : formData.collateralStatus,
      collateralDescription: formData.collateralDescription === '' ? null : formData.collateralDescription,
      executionTime: formData.executionTime === '' ? null : formData.executionTime,

      verificationDocumentAt: formData.verificationDocumentAt === '' ? null : formData.verificationDocumentAt,
      verificationDocumentBy: formData.verificationDocumentBy === '' ? null : formData.verificationDocumentBy,
      verificationDocumentNotes: formData.verificationDocumentNotes === '' ? null : formData.verificationDocumentNotes,
      verificationDocumentStatus: formData.verificationDocumentStatus === '' ? null : formData.verificationDocumentStatus,

      verificationFieldAt: formData.verificationFieldAt === '' ? null : formData.verificationFieldAt,
      verificationFieldBy: formData.verificationFieldBy === '' ? null : formData.verificationFieldBy,
      verificationFieldNotes: formData.verificationFieldNotes === '' ? null : formData.verificationFieldNotes,
      verificationFieldStatus: formData.verificationFieldStatus === '' ? null : formData.verificationFieldStatus,

      verificationLegalAt: formData.verificationLegalAt === '' ? null : formData.verificationLegalAt,
      verificationLegalBy: formData.verificationLegalBy === '' ? null : formData.verificationLegalBy,
      verificationLegalNotes: formData.verificationLegalNotes === '' ? null : formData.verificationLegalNotes,
      verificationLegalStatus: formData.verificationLegalStatus === '' ? null : formData.verificationLegalStatus,

      verificationValueAt: formData.verificationValueAt === '' ? null : formData.verificationValueAt,
      verificationValueBy: formData.verificationValueBy === '' ? null : formData.verificationValueBy,
      verificationValueNotes: formData.verificationValueNotes === '' ? null : formData.verificationValueNotes,
      verificationValueStatus: formData.verificationValueStatus === '' ? null : formData.verificationValueStatus,
    };

    // console.log('dudu payload : ',payloadData);

    const isFileUploaded = formData.documentUrl instanceof File

    try {
      // await repaymentReceiptService.createRepaymentReceipt(invoiceSummary.id, formData);
      if (isFileUploaded){
        const payloadFormData = mapDtoToFormData(payloadData);
        await securityCollateralService.createSecurityCollateral(repaymentSecuritySummary.id, payloadFormData);
      } else {
        await securityCollateralService.createSecurityCollateral(repaymentSecuritySummary.id, payloadData);
      }

      if (onSuccess){
        onSuccess();
      }
      closePanel();
    } catch (error: any) {
      console.error("Gagal create data kolaetral", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SecurityCollateralForm 
      mode="add"
      initialData={initialData}
      onSubmit={handleCreateSubmit} 
      onCancel={closePanel} 
      isLoading={isSubmitting} 
      submissionError = {submissionError}
    />
  );
}