import React, { useState, useEffect } from 'react';
import SecurityCollateralForm from './SecurityCollateralForm';
import { securityCollateralService } from '../../services/securityCollateralService';
import { SecurityCollateralFormRequest } from '../../dtos/security-collateral.dto';
import { useSidePanel } from '../../../../contexts/SidePanelContext'; // Sesuaikan
import { RepaymentSecuritySummaryResponse } from '../../../repayment-security/dtos/repayment-security.dto';
import { mapDtoToFormData } from '../../../../utils/form';
import { VerificationStatus } from '../../types/security-collateral.enum';

interface EditWrapperProps {
  collateralId: string;
  repaymentSecuritySummary: RepaymentSecuritySummaryResponse;
  onSuccess?: ()=> void;
}

export default function SecurityCollateralEditWrapper({ collateralId, repaymentSecuritySummary, onSuccess }: EditWrapperProps) {
  const { closePanel } = useSidePanel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<SecurityCollateralFormRequest | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await securityCollateralService.getSecurityCollateralItems(repaymentSecuritySummary.id);
        const collateralData = response.data.items.find(item => item.id === collateralId);
        
        if (collateralData) {
          const requestData: SecurityCollateralFormRequest = {
            repaymentSecurityId: collateralData.repaymentSecurityId,
            collateralType: collateralData.collateralType,
            collateralDescription: collateralData.collateralDescription || '',
            collateralValueEstimated: collateralData.collateralValueEstimated || '0',
            collateralStatus: collateralData.collateralStatus || '',
            executionTime: collateralData.executionTime ? collateralData.executionTime.split('T')[0] : '', 
            documentUrl: collateralData.documentUrl || '',
            
            verificationDocumentStatus: collateralData.verificationDocumentStatus || VerificationStatus.SUBMITTED,
            verificationDocumentNotes: collateralData.verificationDocumentNotes || '',
            verificationDocumentBy: collateralData.verificationDocumentBy || '',
            verificationDocumentAt: collateralData.verificationDocumentAt ? collateralData.verificationDocumentAt.slice(0, 16) : '',
            
            verificationFieldStatus: collateralData.verificationFieldStatus || VerificationStatus.SUBMITTED,
            verificationFieldNotes: collateralData.verificationFieldNotes || '',
            verificationFieldBy: collateralData.verificationFieldBy || '',
            verificationFieldAt: collateralData.verificationFieldAt ? collateralData.verificationFieldAt.slice(0, 16) : '',
            
            verificationLegalStatus: collateralData.verificationLegalStatus || VerificationStatus.SUBMITTED,
            verificationLegalNotes: collateralData.verificationLegalNotes || '',
            verificationLegalBy: collateralData.verificationLegalBy || '',
            verificationLegalAt: collateralData.verificationLegalAt ? collateralData.verificationLegalAt.slice(0, 16) : '',
            
            verificationValueStatus: collateralData.verificationValueStatus || VerificationStatus.SUBMITTED,
            verificationValueNotes: collateralData.verificationValueNotes || '',
            verificationValueBy: collateralData.verificationValueBy || '',
            verificationValueAt: collateralData.verificationValueAt ? collateralData.verificationValueAt.slice(0, 16) : ''
          };
          setInitialData(requestData);
        }
      } catch (error) {
        console.error("Gagal menarik data kolateral", error);
      }
    };
    fetchData();
  }, [repaymentSecuritySummary.id, collateralId]);

  // const handleEditSubmit = async (formData: SecurityCollateralFormRequest) => {
  //   setIsSubmitting(true);
  //   try {
  //     await securityCollateralService.updateSecurityCollateral(collateralId, formData);
  //     if (onSuccess){
  //       onSuccess();
  //     }
  //     closePanel();
  //   } catch (error) {
  //     console.error("Gagal update kolateral", error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleEditSubmit = async (formData: SecurityCollateralFormRequest) => {
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

    const isFileUploaded = formData.documentUrl instanceof File

    try {
      // await repaymentReceiptService.updateRepaymentReceipt(receiptId, formData);
      if (isFileUploaded){
        const payloadFormData = mapDtoToFormData(payloadData);
        await securityCollateralService.updateSecurityCollateral(collateralId, payloadFormData);
      } else {
        await securityCollateralService.updateSecurityCollateral(collateralId, payloadData);
      }
      if (onSuccess){
        onSuccess();
      }
      closePanel();
    } catch (error: any) {
      console.error("Gagal update kolateral ", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menyimpan data kolateral."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
  
      await securityCollateralService.deleteSecurityCollateral(collateralId);
      console.log('Berhasil menghapus data kolatreal untuk Collateral ID:', collateralId);
      
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
      console.error("Gagal menghapus data kolateral", error);
      setSubmissionError(
        error?.response?.data?.message || "Terjadi kesalahan saat menghapus data kolateral."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData) {
    return <div className="flex items-center justify-center h-full w-full text-xs text-slate-500">Memuat data...</div>;
  }

  return (
    <SecurityCollateralForm 
      mode="edit"
      initialData={initialData}
      onSubmit={handleEditSubmit} 
      onCancel={closePanel}
      onDelete={handleDelete}
      isLoading={isSubmitting} 
      submissionError={submissionError}
    />
  );
}