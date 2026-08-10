import React, { useRef, useState } from 'react';
import { SecurityCollateralFormRequest } from '../../dtos/security-collateral.dto';
import { CollateralType, CollateralStatus, VerificationStatus } from '../../types/security-collateral.enum';

// Sesuaikan path import komponen UI di bawah ini dengan struktur folder Anda
import { NumericInput, FormGroup, ConfirmModal, Select, Input, NumberField, Toggle, TextArea, FormFooter, FormHeader, FileInput } from '../../../../components/forms/index';
import { formatDateForInput } from '../../../../utils/date';
import { LoadingForm } from '../../../../components/forms/LoadingForm';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { FieldValidationConfig, validateFormFields } from '../../../../utils/form';
import { DeleteDataSection } from '../../../../components/forms/DeleteDataSection';

type TabType = 'document' | 'legal' | 'field' | 'value';

interface SecurityCollateralFormProps {
  mode: 'add' | 'edit';
  initialData: SecurityCollateralFormRequest;
  onSubmit: (data: SecurityCollateralFormRequest) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading: boolean;
  submissionError?: string | null; 
}

export default function SecurityCollateralForm({ mode, initialData, onSubmit, onCancel, onDelete, isLoading, submissionError }: SecurityCollateralFormProps) {
  const { closePanel } = useSidePanel();
  const [formData, setFormData] = useState<SecurityCollateralFormRequest>(initialData);

  const [validationError, setValidationError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]); 

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const oldFile = useRef(formData.documentUrl ? String(formData.documentUrl) : undefined);

  const [isDeleting, setIsDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('document'); // State untuk fitur Tab

  const isEditMode = mode === 'edit';

  const handleChange = (field: keyof SecurityCollateralFormRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleChange('documentUrl', e.target.files[0]);
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDeleting){
      setShowConfirmModal(true);
    } else {
      // Panggil fungsi validasi
      const isValid = validateForm();
      
      // Jika valid, baru tampilkan modal konfirmasi
      if (isValid) {
        setShowConfirmModal(true);
      }
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    if (isDeleting && onDelete) {
      onDelete();
    } else {
      onSubmit(formData);
    }
  };

  const validateForm = (): boolean => {
    const requiredFields: FieldValidationConfig<typeof formData>[] = [
      { key: 'collateralType', label: 'Tipe Kolateral', type:'select' }, 
      { key: 'collateralStatus', label: 'Status Kolateral', type: 'select' },
      { key: 'collateralDescription', label: 'Deskripsi Kolateral', type: 'textarea' },
      { key: 'collateralValueEstimated', label: 'Estimasi Nilai Kolateral', type: 'numeric-input' },
    ];
  
    const { isValid, missingFields, missingKeys } = validateFormFields(formData, requiredFields);
  
    if (!isValid) {
      setValidationError(`Silakan lengkapi: ${missingFields.join(', ')}`);
      setValidationErrors(missingKeys);
      return false;
    }
  
    setValidationError('');
    setValidationErrors([]);
    return true;
  };

  const isError = (field: keyof SecurityCollateralFormRequest) => {
    return validationErrors.includes(field)
  };

  // Helper untuk me-render Group Verifikasi secara dinamis sesuai active tab
  const renderVerificationGroup = (group: 'Document' | 'Legal' | 'Field' | 'Value', title: string) => (
    <FormGroup title={`Verifikasi ${title}`} colRatio="1:1">
      <Input 
        label={`Waktu Verifikasi ${title}`}
        type="date" name={`verification${group}At`}
        value={formatDateForInput(formData[`verification${group}At` as keyof SecurityCollateralFormRequest] || 'SUBMITTED')} 
        onChange={(e: any) => handleChange(`verification${group}At` as keyof SecurityCollateralFormRequest, e.target.value)} 
      />
  
      <Input 
        label={`Diverifikasi ${title} oleh`}
        type="text" name={`verification${group}By`}
        value={formData[`verification${group}By` as keyof SecurityCollateralFormRequest] || ''} 
        onChange={(e: any) => handleChange(`verification${group}By` as keyof SecurityCollateralFormRequest, e.target.value)} 
      />
      <Select 
        label={`Status Verifikasi ${title}`}
        name={`verification${group}Status`}
        value={formData[`verification${group}Status` as keyof SecurityCollateralFormRequest] || ''} 
        onChange={(e: any) => handleChange(`verification${group}Status` as keyof SecurityCollateralFormRequest, e.target.value)}
      >
        {Object.values(VerificationStatus).map(status => (
          <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
        ))}
      </Select>

      <TextArea 
        label={`Catatan Verifikasi ${title}`}
        colSpan="1" name={`verification${group}Notes`}
        value={formData[`verification${group}Notes` as keyof SecurityCollateralFormRequest] || ''} 
        onChange={(e: any) => handleChange(`verification${group}Notes` as keyof SecurityCollateralFormRequest, e.target.value)} 
      />
    </FormGroup>
  );

  return (
    <>
      <form className="flex flex-col h-full bg-white">
        {/* Header */}
        <FormHeader 
          title={isEditMode ? 'Edit Kolateral' : 'Catat Kolateral Baru'}
          subtitle={isEditMode 
              ? 'Ubah data kolateral di bawah ini dengan benar.' 
              : 'Lengkapi data kolateral di bawah ini dengan benar.'}
          />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative space-y-8 transition-all duration-300 px-8 pb-8 mt-4">

          {isDeleting && (
                <div className="absolute inset-y-[-30px] inset-x-[0px] z-10 bg-white opacity-65 bcursor-not-allowed" />
              )}
          
          {/* BAGIAN INFORMASI UTAMA: TIDAK ADA YANG DIUBAH */}
          <FormGroup title="INFORMASI KOLATERAL" colRatio="1:1">
            <Select 
              label="Tipe Kolateral" name="collateralType"
              hasError={isError('collateralType')}
              value={formData.collateralType} 
              onChange={(e: any) => handleChange('collateralType', e.target.value)}
            >
              <option value="">-- Pilih Tipe --</option>
              {Object.values(CollateralType).map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </Select>
            <Select 
              label="Status Kolateral" name="collateralStatus"
              hasError={isError('collateralStatus')}
              value={formData.collateralStatus} 
              onChange={(e: any) => handleChange('collateralStatus', e.target.value)}
            >
              <option value="">-- Pilih Status --</option>
              {Object.values(CollateralStatus).map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </Select>

            <div className="col-span-2">
              <FileInput 
                  label="Dokumen Bukti Pembayaran"
                  colSpan="2" name="receiptDocumentUrl"
                  hasError={false} // Ubah ke true jika validasi gagal
                  oldFile={oldFile.current}
                  allowedTypes={['.pdf','.png','.jpg','.gif','.jpeg']} // Hanya izinkan tipe ini
                  maxSizeMb={5} // Maksimal 2MB (jika diabaikan, otomatis 5MB)
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({
                      ...formData, 
                      documentUrl: e.target.files ? e.target.files[0] : null
                    })
                  }
                />
              
              {/* Link ini akan tetap muncul jika formData.documentUrl berisi string URL (biasanya saat mode Edit mengambil dari database) */}
              {typeof formData.documentUrl === 'string' && formData.documentUrl !== '' && (
                <p className="text-[10px] text-blue-500 mt-1 hover:underline">
                  <a href={formData.documentUrl} target="_blank" rel="noreferrer">
                    Lihat dokumen saat ini
                  </a>
                </p>
              )}
               
            </div>
            
            <TextArea 
              label="Deskripsi Kolateral" name="collateralDescription"
              hasError={isError('collateralDescription')} colSpan="2" 
              value={formData.collateralDescription || ''} 
              onChange={(e: any) => handleChange('collateralDescription', e.target.value)} 
              placeholder="Jelaskan kondisi, letak, ukuran, dll..." 
            />
            <NumberField 
              label="Estimasi Nilai Kolateral" name="collateralValueEstimated"
              hasError={isError('collateralValueEstimated')}
              value={Number(formData.collateralValueEstimated)} 
              onValueChange={(val: number) => handleChange('collateralValueEstimated', val.toString())} 
            />
            <Input 
              label="Waktu Eksekusi" 
              type="date" 
              value={formatDateForInput(formData.executionTime || '')} 
              onChange={(e: any) => handleChange('executionTime', e.target.value)} 
            />
          </FormGroup>

          {/* TAB MENU VERIFIKASI */}
          <div className="mt-8 border-b border-slate-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {[
                { id: 'document', label: 'Dokumen' },
                { id: 'legal', label: 'Legal' },
                { id: 'field', label: 'Lapangan' },
                { id: 'value', label: 'Nilai' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-xs transition-colors focus:outline-none
                    ${activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* TAB CONTENTS (RENDER KONDISIONAL) */}
          <div className="mt-6">
            {activeTab === 'document' && renderVerificationGroup('Document', 'Dokumen')}
            {activeTab === 'legal' && renderVerificationGroup('Legal', 'Legal')}
            {activeTab === 'field' && renderVerificationGroup('Field', 'Lapangan')}
            {activeTab === 'value' && renderVerificationGroup('Value', 'Nilai')}
          </div>

          </div>

          {isEditMode && (<DeleteDataSection isDeleting={isDeleting} onDeleting={setIsDeleting}/>)}

        </div>

          <FormFooter 
          mode={mode}
          validationError={validationError}
          submissionError={submissionError}
          handlePreSubmit={handlePreSubmit}
          isLoading={isLoading}
          isDeleting={isDeleting}
          closePanel={closePanel}
          />

          <ConfirmModal 
            isOpen={showConfirmModal} 
            onClose={() => setShowConfirmModal(false)} 
            onConfirm={handleConfirmSubmit} 
            mode={isDeleting?'delete':mode}
          />

         <LoadingForm isLoading={isLoading} />
      </form>

      
    </>
  );
}