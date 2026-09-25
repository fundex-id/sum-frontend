import React, { useState } from 'react';
import { useSidePanel } from '../../../../../contexts/SidePanelContext';
import { ScheduleType, InvoiceStatus } from '../../types/repayment-schedule.enum';
import { RepaymentScheduleFormRequest } from '../../dtos/repayment-schedule.dto';
import { FormGroup, ConfirmModal, Select, Input, NumberField, Toggle, TextArea } from '../../../../../components/forms/index';
import { calculateDays, formatDateForInput, toD, toDate } from '../../../../../utils/date';
import { RepaymentSecurityDetailResponse, RepaymentSecuritySummaryResponse } from '../../../security/dtos/repayment-security.dto';
import { toSafeBig } from '../../../../../utils/number';
import { InvoiceInfo, RepaymentScheduleSummary } from '../../types/repayment-schedule.type';
import { addDays, subDays, parseISO } from 'date-fns';
import FormFooter from '../../../../../components/forms/FormFooter';
import FormHeader from '../../../../../components/forms/FormHeader';
import { FieldValidationConfig, isEmptyField, validateFormFields } from '../../../../../utils/form';
import { LoadingForm } from '../../../../../components/forms/LoadingForm';
import { DeleteDataSection } from '../../../../../components/forms/DeleteDataSection';


interface RepaymentScheduleFormProps {
  mode: 'add' | 'edit';
  initialData: RepaymentScheduleFormRequest;
  repaymentSecurity: RepaymentSecurityDetailResponse;
  lastUpfront?: InvoiceInfo;
  lastInstallment?: InvoiceInfo;
  onSubmit: (data: RepaymentScheduleFormRequest) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading: boolean;
  submissionError?: string | null; 
}

export default function RepaymentScheduleForm({ mode, initialData, repaymentSecurity, lastUpfront, lastInstallment, onSubmit, onCancel, onDelete, isLoading, submissionError=null }: RepaymentScheduleFormProps) {
  const { closePanel } = useSidePanel();
  const [formData, setFormData] = useState<RepaymentScheduleFormRequest>(initialData);
  
  const [validationError, setValidationError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // State tambahan untuk menandai field yang error

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cek apakah modenya edit, field-field tertentu akan di disable
  const isEditMode = mode === 'edit';

  // Cek jika status invoice dipilih dan bernilai selain DRAFT atau kosong
  const isInvoiceNonDraft = Boolean(formData.invoiceStatus && formData.invoiceStatus !== InvoiceStatus.DRAFT);

  const daysOverdue = isEditMode ? calculateDays(null, formData.scheduleDate) : 0;
  const isInvoiceOverdue = !!daysOverdue && daysOverdue > 0;

  const taxPpn = toSafeBig(repaymentSecurity.contractTaxPpn);
  const taxFactor = toSafeBig(repaymentSecurity.contractTaxFactor);
  const taxRate = taxPpn.times(taxFactor).round(4)

  const minScheduleDate = (() => {
    if (formData.scheduleType === ScheduleType.UPFRONT) {
      return lastUpfront?.scheduleDate ? addDays(parseISO(lastUpfront.scheduleDate), 1) : null;
    }
    if (formData.scheduleType === ScheduleType.INSTALLMENT) {
      return lastInstallment?.scheduleDate ? addDays(parseISO(lastInstallment.scheduleDate), 1) : null;
    }
    return null; // Nilai default jika belum memilih type apa pun
  })();

  const maxInvoiceDate = (() => {
    // Pastikan formData.scheduleDate sudah memiliki nilai (tidak kosong)
      // 1. Parse string tanggal jadwal menjadi objek Date
      return  formData?.scheduleDate ? subDays(parseISO(formData.scheduleDate), 1) : null;
    
  })();

  const calculateTaxesAndTotals = (data: RepaymentScheduleFormRequest): RepaymentScheduleFormRequest => {
    const feeAdmin = toSafeBig(data.invoiceFeeAdministration);
    const feeProv = toSafeBig(data.invoiceFeeProvision);
    const feePlat = toSafeBig(data.invoiceFeePlatform);
    const feeServ = toSafeBig(data.invoiceFeeServicing);
    const feeMon = toSafeBig(data.invoiceFeeMonitoring);
    const feeOther = toSafeBig(data.invoiceFeeOther);
    const sinkingFund = toSafeBig(data.invoiceSinkingFund);
    const yieldVal = toSafeBig(data.invoiceYield);
    const actualLoss = toSafeBig(data.invoiceActualLoss);
    const penalty = toSafeBig(data.invoicePenalty);

    const taxAdmin = feeAdmin.times(taxRate);
    const taxProv = feeProv.times(taxRate);
    const taxPlat = feePlat.times(taxRate);
    const taxServ = feeServ.times(taxRate);
    const taxMon = feeMon.times(taxRate);
    const taxOther = feeOther.times(taxRate);

    const totalBase = feeAdmin.plus(feeProv).plus(feePlat).plus(feeServ)
      .plus(feeMon).plus(feeOther).plus(sinkingFund).plus(yieldVal)
      .plus(actualLoss).plus(penalty);

    const totalTax = taxAdmin.plus(taxProv).plus(taxPlat).plus(taxServ)
      .plus(taxMon).plus(taxOther);

    const totalWithTax = totalBase.plus(totalTax);

    const precision = 2;

    return {
      ...data,
      invoiceFeeAdministration: feeAdmin.gt(0)?feeAdmin.round(precision).toString():'',
      invoiceFeeAdministrationTax: taxAdmin.gt(0)?taxAdmin.round(precision).toString():'',

      invoiceFeeProvision: feeProv.gt(0)?feeProv.round(precision).toString():'',
      invoiceFeeProvisionTax: taxProv.gt(0)?taxProv.round(precision).toString():'',

      invoiceFeePlatform: feePlat.gt(0)?feePlat.round(precision).toString():'',
      invoiceFeePlatformTax: taxPlat.gt(0)?taxPlat.round(precision).toString():'',

      invoiceFeeServicing: feeServ.gt(0)?feeServ.round(precision).toString():'',
      invoiceFeeServicingTax: taxServ.gt(0)?taxServ.round(precision).toString():'',

      invoiceFeeMonitoring: feeMon.gt(0)?feeMon.round(precision).toString():'',
      invoiceFeeMonitoringTax: taxMon.gt(0)?taxMon.round(precision).toString():'',

      invoiceFeeOther: feeOther.gt(0)?feeOther.round(precision).toString():'',
      invoiceFeeOtherTax: taxOther.gt(0)?taxOther.round(precision).toString():'',

      invoiceSinkingFund: sinkingFund.gt(0)?sinkingFund.round(precision).toString():'',
      invoiceYield: yieldVal.gt(0)?yieldVal.round(precision).toString():'',

      invoiceActualLoss: actualLoss.gt(0)?actualLoss.round(precision).toString():'',
      invoicePenalty: penalty.gt(0)?penalty.round(precision).toString():'',

      invoiceTotal: totalBase.gt(0)?totalBase.round(precision).toString():'',
      invoiceTotalTax: totalTax.gt(0)?totalTax.round(precision).toString():'',
      invoiceTotalWithTax: totalWithTax.gt(0)?totalWithTax.round(precision).toString():'',
    };
  };

  const handleChange =  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (validationErrors.includes(name)) {
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== name));

      if (name === 'scheduleDate') {
        if (validationErrors.includes('invoiceDate')) {
          setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'invoiceDate'));
        }
      }
    }

    if (name === 'scheduleType') {
      let newData = { ...formData, [name]: value };
      
      // Jika diubah via form Select, reset nilai grup yang tidak relevan menjadi 0
      if (value === ScheduleType.UPFRONT) {
        newData.invoiceFeeMonitoring = '0';
        newData.invoiceFeeMonitoringTax = '0';
        newData.invoiceSinkingFund = '0';
        newData.invoiceYield = '0';
        newData.scheduleSequence = Number(lastUpfront?.scheduleSequence || 0) + 1;
        newData.scheduleDate = '';
        newData.invoiceDate = '';
      } else if (value === ScheduleType.INSTALLMENT) {
        newData.invoiceFeeAdministration = '0';
        newData.invoiceFeeAdministrationTax = '0';
        newData.invoiceFeeProvision = '0';
        newData.invoiceFeeProvisionTax = '0';
        newData.invoiceFeePlatform = '0';
        newData.invoiceFeePlatformTax = '0';
        newData.invoiceFeeServicing = '0';
        newData.invoiceFeeServicingTax = '0';
        newData.scheduleSequence = Number(lastInstallment?.scheduleSequence || 0) + 1;
        newData.scheduleDate = '';
        newData.invoiceDate = '';
      } else { //value == ''
        newData.invoiceFeeMonitoring = '0';
        newData.invoiceFeeMonitoringTax = '0';
        newData.invoiceSinkingFund = '0';
        newData.invoiceYield = '0';
        newData.invoiceFeeAdministration = '0';
        newData.invoiceFeeAdministrationTax = '0';
        newData.invoiceFeeProvision = '0';
        newData.invoiceFeeProvisionTax = '0';
        newData.invoiceFeePlatform = '0';
        newData.invoiceFeePlatformTax = '0';
        newData.invoiceFeeServicing = '0';
        newData.invoiceFeeServicingTax = '0';
        newData.scheduleSequence = 0;
        newData.scheduleDate = '';
        newData.invoiceDate = '';
      }
      
      // Kalkulasi ulang total ketika form di-reset menjadi 0
      setFormData(calculateTaxesAndTotals(newData));
    } else if (name === 'scheduleDate') {
      let newData = { ...formData, [name]: value };
      
      // Auto assign Tanggal Invoice ke H-7 dari Tanggal Jadwal
      if (value) {
        const scheduleD = new Date(value);
        if (!isNaN(scheduleD.getTime())) {
          const invoiceD = new Date(scheduleD);
          invoiceD.setDate(invoiceD.getDate() - 7);
          
          const yyyy = invoiceD.getFullYear();
          const mm = String(invoiceD.getMonth() + 1).padStart(2, '0');
          const dd = String(invoiceD.getDate()).padStart(2, '0');
          newData.invoiceDate = `${yyyy}-${mm}-${dd}`;
        }
      }
      setFormData(newData);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNumericChange = (name: keyof RepaymentScheduleFormRequest, val: number) => {
    const newData = { ...formData, [name]: val.toString() };
    setFormData(calculateTaxesAndTotals(newData));
  };

  // 2. Event Handler Form Submission
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

  // 3. Event Handler untuk Modal Confirmation
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
      { 
        key: 'scheduleType', label: 'Tipe Jadwal', type: 'select',
        dependencies: [
          { key: 'invoiceTotal', label: 'Total Tagihan', type: 'numeric-input' },
          { key: 'invoiceTotalWithTax', label: 'Total Tagihan & Pajak', type: 'numeric-input' },
        ]
      },
      { key: 'scheduleSequence', label: 'Urutan Jadwal' }, // Tipe default 'input'
      { key: 'scheduleDate', label: 'Tanggal Jadwal', type: 'date' },
      { key: 'invoiceDate', label: 'Tanggal Invoice', type: 'date' },
      { key: 'invoiceStatus', label: 'Status Invoice', type: 'select' },
      { key: 'invoiceNotes', label: 'Catatan Invoice' },
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

  const isError = (field: keyof RepaymentScheduleFormRequest) => {
    return validationErrors.includes(field)
  };


  return (
    <>
      <form className="flex flex-col h-full bg-white ">
        {/* Header */}
        <FormHeader 
        title={isEditMode ? 'Ubah Jadwal Pembayaran' : 'Tambah Jadwal Pembayaran'}
        subtitle={isEditMode 
            ? 'Ubah data jadwal pembayaran di bawah ini dengan benar.' 
            : 'Lengkapi data jadwal pembayaran di bawah ini dengan benar.'}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          <div className="relative space-y-6 transition-all duration-300 px-6 mx-2 pb-8 mt-4">

              {isDeleting && (
                <div className="absolute inset-y-[-30px] inset-x-[0px] z-10 bg-white opacity-65 bcursor-not-allowed" />
              )}
            
              {/* Hidden Fields */}

              <input type="hidden" name="repaymentSecurityId" value={formData.repaymentSecurityId} />

              {/* Info Dasar */}
              <FormGroup title="INFORMASI DASAR">
                <Select label="Tipe Jadwal" name="scheduleType"
                        value={formData.scheduleType ?? ""} 
                        hasError={isError('scheduleType')} 
                        onChange={handleChange} disabled={isEditMode} 
                        colSpan="1">
                  <option value="">-- Pilih Jenis Pembayaran --</option>
                  <option value={ScheduleType.UPFRONT}>UPFRONT</option>
                  <option value={ScheduleType.INSTALLMENT}>INSTALLMENT</option>
                </Select>

                <Input label="Urutan Jadwal" name="scheduleSequence" type="number" 
                        value={formData.scheduleSequence} onChange={handleChange} disabled={true} 
                        hasError={isError('scheduleSequence')}
                        colSpan="1" />

                <Input label="Tanggal Jadwal" name="scheduleDate" type="date" 
                        min={formatDateForInput(minScheduleDate)} 
                        value={formatDateForInput(formData.scheduleDate)} 
                        hasError={isError('scheduleDate')}
                        onChange={handleChange} disabled={isEditMode} colSpan="1" />
                
                <Input label="Tanggal Invoice" name="invoiceDate" type="date" 
                        max={formatDateForInput(maxInvoiceDate)}
                        value={formatDateForInput(formData.invoiceDate)} 
                        onChange={handleChange} disabled={isEditMode} 
                        hasError={isError('invoiceDate')} colSpan="1" />
                <Input label="Nomor Invoice" name="invoiceNumber" 
                        value={formData.invoiceNumber} onChange={handleChange} 
                        disabled={true} colSpan="1" />
                <Input label="Invoice Sent Trial"  name="invoiceSentTrial" 
                        type="number" value={formData.invoiceSentTrial} 
                        onChange={handleChange} disabled={true} colSpan="1" />
                
                <Select label="Status Invoice" name="invoiceStatus" 
                        value={formData.invoiceStatus ?? ''} onChange={handleChange} 
                        hasError={isError('invoiceStatus')} colSpan="2">

                    <option key='default' value="">-- Pilih Jenis Status --</option>
                      {Object.values(InvoiceStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                </Select>


                <TextArea label="Catatan Invoice" name="invoiceNotes" 
                    value={formData.invoiceNotes} 
                    hasError={isError('invoiceNotes')}
                    onChange={handleChange} 
                    rows={3} colSpan="2"/>
              </FormGroup>
      
              {/* UPFRONT FEE */}
              {formData.scheduleType === ScheduleType.UPFRONT && (
                <FormGroup title="UPFRONT FEE">
                  <NumberField label="Fee Administration" name="invoiceFeeAdministration"
                                value={formData.invoiceFeeAdministration} 
                                onValueChange={(val: number) => handleNumericChange('invoiceFeeAdministration', val)} 
                                disabled={isInvoiceNonDraft} />
                  <NumberField label="Tax Administration" name="invoiceFeeAdministrationTax"
                                value={formData.invoiceFeeAdministrationTax} 
                                onValueChange={() => {}} disabled />
                  
                  <NumberField label="Fee Provision" name="invoiceFeeProvision"
                                value={formData.invoiceFeeProvision} 
                                onValueChange={(val: number) => handleNumericChange('invoiceFeeProvision', val)} 
                                disabled={isInvoiceNonDraft} />

                  <NumberField label="Tax Provision" name="invoiceFeeProvisionTax"
                                value={formData.invoiceFeeProvisionTax} 
                                onValueChange={() => {}} disabled />

                  <NumberField label="Fee Platform" name="invoiceFeePlatform"
                                value={formData.invoiceFeePlatform} 
                                onValueChange={(val: number) => handleNumericChange('invoiceFeePlatform', val)} 
                                disabled={isInvoiceNonDraft} />

                  <NumberField label="Tax Platform" name="invoiceFeePlatformTax"
                                value={formData.invoiceFeePlatformTax} 
                                onValueChange={() => {}} disabled />

                  <NumberField label="Fee Servicing" name="invoiceFeeServicing"
                                value={formData.invoiceFeeServicing}
                                onValueChange={(val: number) => handleNumericChange('invoiceFeeServicing', val)} 
                                disabled={isInvoiceNonDraft} />

                  <NumberField label="Tax Servicing" name="invoiceFeeServicingTax"
                                value={formData.invoiceFeeServicingTax} 
                                onValueChange={() => {}} disabled />

                  {/* Pemisah untuk kelompok Fee Other */}
                  <div className="col-span-2 w-full border-b border-slate-200 mt-2 pt-4"></div>

                  {/* invoiceFeeOther ikut gabung di grup UPFRONT */}
                  <NumberField label="Fee Other" name="invoiceFeeOther"
                                value={formData.invoiceFeeOther} 
                                onValueChange={(val: number) => handleNumericChange('invoiceFeeOther', val)} 
                                disabled={isInvoiceNonDraft} />
                  <NumberField label="Tax Other" name="invoiceFeeOtherTax"
                                value={formData.invoiceFeeOtherTax} 
                                onValueChange={() => {}} disabled />
                </FormGroup>
              )}

              {/* INSTALLMENT FEE & OTHERS */}
              {formData.scheduleType === ScheduleType.INSTALLMENT && (
                <FormGroup title="INSTALLMENT FEE">
                  <NumberField label="Fee Monitoring" name="invoiceFeeMonitoring"
                                value={formData.invoiceFeeMonitoring} 
                                onValueChange={(val: number) => handleNumericChange('invoiceFeeMonitoring', val)} 
                                disabled={isInvoiceNonDraft} />
                  <NumberField label="Tax Monitoring" name="invoiceFeeMonitoringTax"
                                value={formData.invoiceFeeMonitoringTax} 
                                onValueChange={() => {}} disabled />

                  <NumberField label="Sinking Fund (Pokok)" name="invoiceSinkingFund"
                                value={formData.invoiceSinkingFund} 
                                onValueChange={(val: number) => handleNumericChange('invoiceSinkingFund', val)} 
                                disabled={isInvoiceNonDraft} />
                  <NumberField label="Yield (Kupon)" name="invoiceYield"
                                value={formData.invoiceYield} 
                                onValueChange={(val: number) => handleNumericChange('invoiceYield', val)} 
                                disabled={isInvoiceNonDraft} />

                  {/* Pemisah untuk kelompok Fee Other */}
                  <div className="col-span-2 w-full border-b border-slate-200 pt-4"></div>

                  {/* invoiceFeeOther ikut gabung di grup INSTALLMENT */}
                  <NumberField label="Fee Other" name="invoiceFeeOther"
                                value={formData.invoiceFeeOther} 
                                onValueChange={(val: number) => handleNumericChange('invoiceFeeOther', val)} 
                                disabled={isInvoiceNonDraft} />
                  <NumberField label="Tax Other" name="invoiceFeeOtherTax"
                                value={formData.invoiceFeeOtherTax} 
                                onValueChange={() => {}} disabled />
                </FormGroup>
              )}

              {/* DENDA & KERUGIAN (Hanya Muncul Jika Schedule Type Dipilih) */}
              {formData.scheduleType && (
                <FormGroup title="DENDA & KERUGIAN">
                  <NumberField label="Actual Loss" name="invoiceActualLoss"
                                value={formData.invoiceActualLoss} 
                                onValueChange={(val: number) => handleNumericChange('invoiceActualLoss', val)} 
                                disabled={!isEditMode ||  !isInvoiceOverdue} />
                  <NumberField label="Penalty" name="invoicePenalty"
                                value={formData.invoicePenalty} 
                                onValueChange={(val: number) => handleNumericChange('invoicePenalty', val)} 
                                disabled={true} />
                </FormGroup>
              )}

              {/* TOTAL (Hanya Muncul Jika Schedule Type Dipilih) */}
              {formData.scheduleType && (
                <FormGroup title="TOTAL">
                  <NumberField label="Total Tagihan" name="invoiceTotal"
                                value={formData.invoiceTotal} 
                                onValueChange={() => {}} disabled className="font-medium text-amber-700" 
                                hasError={isError('invoiceTotal')} />

                  <NumberField label="Total Pajak" name="invoiceTotalTax"
                                value={formData.invoiceTotalTax} 
                                onValueChange={() => {}} disabled className="font-medium text-rose-600" />
                  
                  <NumberField 
                    colSpan="2" 
                    label="Total Tagihan Beserta Pajak" name="invoiceTotalWithTax"
                    value={formData.invoiceTotalWithTax} 
                    onValueChange={() => {}} 
                    hasError={isError('invoiceTotalWithTax')} 
                    disabled 
                    className="font-semibold text-lg text-emerald-700 bg-emerald-50 border-emerald-200" 
                  />
                </FormGroup>
              )}
              </div>

          {/*Area Deletion (Danger Zone) - Hanya muncul saat Edit Mode */}
          {isEditMode && (<DeleteDataSection isDeleting={isDeleting} onDeleting={setIsDeleting}/>)}
          
        </div>

        {/* Footer */}
        
        {/* FOOTER: Fixed di Bawah */}
        <FormFooter 
        mode={mode}
        validationError={validationError}
        submissionError={submissionError}
        handlePreSubmit={handlePreSubmit}
        isLoading={isLoading}
        isDeleting={isDeleting}
        closePanel={closePanel}
        />

        {/* Confirmation Modal */}
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