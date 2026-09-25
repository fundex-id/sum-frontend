// src/components/repayment/RepaymentReceiptForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Big } from 'big.js';
import { useSidePanel } from '../../../../../contexts/SidePanelContext';
import { FormGroup, ConfirmModal, Select, Input, NumberField, Toggle, TextArea } from '../../../../../components/forms/index';
import { RepaymentReceiptFormRequest } from '../../dtos/repayment-receipt.dto';
import { ReceiptMethod, ReceiptStatus, ScheduleType } from '../../types/repayment-receipt.enum';
import { InvoiceSummaryWithPenaltyBig } from '../../../schedule/types/repayment-schedule.type';
import { formatDateForInput } from '../../../../../utils/date';
import { toSafeBig } from '../../../../../utils/number';
import FormFooter from '../../../../../components/forms/FormFooter';
import { FileInput } from '../../../../../components/forms/FileInput';
import FormHeader from '../../../../../components/forms/FormHeader';
import { LoadingForm } from '../../../../../components/forms/LoadingForm';
import { FieldValidationConfig, validateFormFields } from '../../../../../utils/form';
import { DeleteDataSection } from '../../../../../components/forms/DeleteDataSection';
import { InvoiceRemainingBalanceResponse } from '../../../schedule/dtos/repayment-schedule.dto';

interface Props {
  mode: 'add' | 'edit';
  initialData: RepaymentReceiptFormRequest;
  invoiceSummary: InvoiceSummaryWithPenaltyBig; // Dummy/Target Schedule data for waterfall limits
  invoiceRemaining: InvoiceRemainingBalanceResponse;
  onSubmit: (data: RepaymentReceiptFormRequest) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading: boolean;
  submissionError?: string | null; 
}

export default function RepaymentReceiptForm({ mode, initialData, invoiceSummary, invoiceRemaining, onSubmit, onCancel, onDelete, isLoading, submissionError }: Props) {
  const { closePanel } = useSidePanel();
  const [formData, setFormData] = useState<RepaymentReceiptFormRequest>(initialData);

  const [validationError, setValidationError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]); 

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const precision = 0;
  const precisionTax = 4;

  const taxRate = invoiceSummary.taxPpn.times(invoiceSummary.taxFactor).round(precisionTax);
  
  const oldFile = useRef(formData.receiptDocumentUrl ? String(formData.receiptDocumentUrl) : undefined);

  const [isDeleting, setIsDeleting] = useState(false);

  const isEditMode = mode === 'edit';

  

  useEffect(() => {
    if (initialData) {
      // Pastikan initialData yang masuk dikalkulasi ulang untuk memastikan sinkronisasi total
      setFormData(calculateTaxesAndTotals(initialData));
    }
  }, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (validationErrors.includes(name)) {
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== name));
    }
    
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Kalkulasi Sentral: Menghitung pajak individu dan merekap semua total
  // Tambahkan 'isTopDown' dengan default false
  const calculateTaxesAndTotals = (formData: RepaymentReceiptFormRequest, isTopDown: boolean = false): RepaymentReceiptFormRequest => {
    
    // ... (Bagian ambil data Base & Non-Taxable tetap sama)
    const feeAdmin = toSafeBig(formData.receiptFeeAdministration).round(precision);
    const feeProv = toSafeBig(formData.receiptFeeProvision).round(precision);
    const feePlat = toSafeBig(formData.receiptFeePlatform).round(precision);
    const feeServ = toSafeBig(formData.receiptFeeServicing).round(precision);
    const feeMon = toSafeBig(formData.receiptFeeMonitoring).round(precision);
    const feeOther = toSafeBig(formData.receiptFeeOther).round(precision);
    
    const sinkingFund = toSafeBig(formData.receiptSinkingFund).round(precision);
    const yieldVal = toSafeBig(formData.receiptYield).round(precision);
    const actualLoss = toSafeBig(formData.receiptActualLoss).round(precision);
    const penalty = toSafeBig(formData.receiptPenalty).round(precision);
  
    const totalBase = feeAdmin.plus(feeProv).plus(feePlat).plus(feeServ)
      .plus(feeMon).plus(feeOther).plus(sinkingFund).plus(yieldVal)
      .plus(actualLoss).plus(penalty).round(precision);
  
    // Kalkulasi Tax Awal
    let taxAdmin = feeAdmin.times(taxRate).round(precision);
    let taxProv = feeProv.times(taxRate).round(precision);
    let taxPlat = feePlat.times(taxRate).round(precision);
    let taxServ = feeServ.times(taxRate).round(precision);
    let taxMon = feeMon.times(taxRate).round(precision);
    let taxOther = feeOther.times(taxRate).round(precision);
  
    let totalTax = taxAdmin.plus(taxProv).plus(taxPlat).plus(taxServ)
      .plus(taxMon).plus(taxOther).round(precision);
  
    // Ambil target Total With Tax (jika isTopDown, nilai ini jadi single source of truth)
    let totalWithTax = toSafeBig(formData.receiptTotalWithTax).round(precision);

    if (isTopDown) {
      // --- TOP DOWN MODE (Waterfall) ---
      // Kunci totalWithTax dari input, paksa Tax-nya yang mengalah mencari selisih!
      const expectedTotalTax = totalWithTax.minus(totalBase);
      
      if (!expectedTotalTax.eq(totalTax)) {
        const diff = expectedTotalTax.minus(totalTax);
        
        // Distribusi selisih murni ke tax pertama yang nilainya ada
        if (taxAdmin.gt(0)) taxAdmin = taxAdmin.plus(diff);
        else if (taxProv.gt(0)) taxProv = taxProv.plus(diff);
        else if (taxPlat.gt(0)) taxPlat = taxPlat.plus(diff);
        else if (taxServ.gt(0)) taxServ = taxServ.plus(diff);
        else if (taxMon.gt(0)) taxMon = taxMon.plus(diff);
        else taxOther = taxOther.plus(diff); // Fallback terakhir
        
        totalTax = expectedTotalTax;
      }
    } else {
      // --- BOTTOM UP MODE (Manual Edit Component) ---
      // Biarkan totalWithTax dihitung normal mengikuti totalBase + totalTax 
      totalWithTax = totalBase.plus(totalTax).round(precision);
    }
  
    return {
      ...formData,
      receiptFeeAdministration: feeAdmin.gt(0)?feeAdmin.round(precision).toString():'',
      receiptFeeAdministrationTax: taxAdmin.gt(0)?taxAdmin.round(precision).toString():'',

      receiptFeeProvision: feeProv.gt(0)?feeProv.round(precision).toString():'',
      receiptFeeProvisionTax: taxProv.gt(0)?taxProv.round(precision).toString():'',

      receiptFeePlatform: feePlat.gt(0)?feePlat.round(precision).toString():'',
      receiptFeePlatformTax: taxPlat.gt(0)?taxPlat.round(precision).toString():'',

      receiptFeeServicing: feeServ.gt(0)?feeServ.round(precision).toString():'',
      receiptFeeServicingTax: taxServ.gt(0)?taxServ.round(precision).toString():'',

      receiptFeeMonitoring: feeMon.gt(0)?feeMon.round(precision).toString():'',
      receiptFeeMonitoringTax: taxMon.gt(0)?taxMon.round(precision).toString():'',

      receiptSinkingFund: sinkingFund.gt(0)?sinkingFund.round(precision).toString():'',
      receiptYield: yieldVal.gt(0)?yieldVal.round(precision).toString():'',

      receiptActualLoss: actualLoss.gt(0)?actualLoss.round(precision).toString():'',
      receiptPenalty: penalty.gt(0)?penalty.round(precision).toString():'',

      receiptFeeOther: feeOther.gt(0)?feeOther.round(precision).toString():'',
      receiptFeeOtherTax: taxOther.gt(0)?taxOther.round(precision).toString():'',

      receiptTotal: totalBase.gt(0)?totalBase.round(precision).toString():'',
      receiptTotalTax: totalTax.gt(0)?totalTax.round(precision).toString():'',
      receiptTotalWithTax: totalWithTax.gt(0)?totalWithTax.round(precision).toString():'', // Nilainya aman tidak akan berkurang!
    };
  };

  // Calculate Waterfall
  const handleTotalWithTaxChange = (val: Big) => {

    if (validationErrors.includes('receiptTotalWithTax')) {
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'receiptTotalWithTax'));
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'receiptTotal'));
    }

    let remTotalWithTax = toSafeBig(val);
    
    // Sisihkan dulu porsi Penalty dan Actual Loss agar tidak tertimpa waterfall
    const penalty = toSafeBig(formData.receiptPenalty);
    const actualLoss = toSafeBig(formData.receiptActualLoss);

    
    const isRemTotalWithTaxNegative = remTotalWithTax.minus(penalty).minus(actualLoss).lt(0);
    
    if (!isRemTotalWithTaxNegative) {
      remTotalWithTax = remTotalWithTax.minus(penalty).minus(actualLoss);
    }
    

    // Reset base components supaya bersih dari manual input sebelumnya
    const newForm = {
      ...formData,
      receiptTotalWithTax: val.toFixed(precision),
      receiptFeeAdministration: '0',
      receiptFeeProvision: '0',
      receiptFeePlatform: '0',
      receiptFeeServicing: '0',
      receiptFeeMonitoring: '0',
      receiptSinkingFund: '0',
      receiptYield: '0',
      receiptFeeOther: '0',
      ...(isRemTotalWithTaxNegative && { receiptActualLoss: '0' }),
      ...(isRemTotalWithTaxNegative && { receiptPenalty: '0' })
      // receiptPenalty: '0',
    };

    if (!invoiceSummary) {
      // 👈 Tembak "true" parameter Top-Down
      setFormData(calculateTaxesAndTotals(newForm, true)); 
      return;
    }

    // Helper: Alokasi proporsional berdasarkan cap tagihan (Invoice)
    const allocComponentBase = (invBase: Big | undefined | null, hasTax: boolean = true) => {
      if (remTotalWithTax.lte(0)) return '0';
      
      const maxBase = toSafeBig(invBase);
      const maxTax = hasTax ? maxBase.times(taxRate) : new Big(0);
      const maxWithTax = maxBase.plus(maxTax);

      if (remTotalWithTax.gte(maxWithTax)) {
        // Alokasikan full
        remTotalWithTax = remTotalWithTax.minus(maxWithTax);
        return maxBase.round(precision).toString();
      } else {
        // Proporsi jika dana tidak cukup
        let allocBase;
        if (hasTax) {
          allocBase = remTotalWithTax.div(new Big(1).plus(taxRate));
        } else {
          allocBase = remTotalWithTax;
        }
        remTotalWithTax = new Big(0);
        return allocBase.round(precision).toString();
      }
    };

    // 3. Distribusi biaya berdasar ScheduleType
    if (invoiceSummary.scheduleType === ScheduleType.UPFRONT) {

      newForm.receiptFeeAdministration = allocComponentBase(toSafeBig(invoiceRemaining.invoiceFeeAdministration), true);
      newForm.receiptFeeProvision = allocComponentBase(toSafeBig(invoiceRemaining.invoiceFeeProvision), true);
      newForm.receiptFeePlatform = allocComponentBase(toSafeBig(invoiceRemaining.invoiceFeePlatform), true);
      newForm.receiptFeeServicing = allocComponentBase(toSafeBig(invoiceRemaining.invoiceFeeServicing), true);
      
      // Jika masih ada sisa/excess dana, distribusikan semua ke Fee Other
      const otherBaseLimit = toSafeBig(invoiceRemaining.invoiceFeeOther);
      if (remTotalWithTax.gt(0)) {
         const allocBaseExcess = remTotalWithTax.div(new Big(1).plus(taxRate));
         newForm.receiptFeeOther = otherBaseLimit.plus(allocBaseExcess).round(precision).toString();
         remTotalWithTax = new Big(0);
      } else {
         newForm.receiptFeeOther = allocComponentBase(toSafeBig(invoiceRemaining.invoiceFeeOther), true);
      }

    } else if (invoiceSummary.scheduleType === ScheduleType.INSTALLMENT) {
      newForm.receiptFeeMonitoring = allocComponentBase(toSafeBig(invoiceRemaining.invoiceFeeMonitoring), true);
      newForm.receiptSinkingFund = allocComponentBase(toSafeBig(invoiceRemaining.invoiceSinkingFund), false);
      newForm.receiptYield = allocComponentBase(toSafeBig(invoiceRemaining.invoiceYield), false);
      
      // Jika masih ada sisa/excess dana, distribusikan semua ke Fee Other
      const otherBaseLimit = toSafeBig(invoiceRemaining.invoiceFeeOther);
      if (remTotalWithTax.gt(0)) {
         const allocBaseExcess = remTotalWithTax.div(new Big(1).plus(taxRate));
         newForm.receiptFeeOther = otherBaseLimit.plus(allocBaseExcess).round(precision).toString();
         remTotalWithTax = new Big(0);
      } else {
         newForm.receiptFeeOther = allocComponentBase(toSafeBig(invoiceRemaining.invoiceFeeOther), true);
      }
    }

    // Wrap-up dengan menghitung ulang semua pajak dan grand total secara presisi
    // setFormData(calculateTaxesAndTotals(newForm));
    setFormData(calculateTaxesAndTotals(newForm, true));
  };

  // Di dalam UseEffect initialData
  useEffect(() => {
    if (initialData) {
      setFormData(calculateTaxesAndTotals(initialData, false)); // 👈 false
    }
  }, [initialData]);

  // Di dalam handler ubah manual
  const handleNumeriChange = (name: keyof RepaymentReceiptFormRequest) => (val: number) => {

    if (validationErrors.includes('receiptTotalWithTax')) {
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'receiptTotalWithTax'));
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'receiptTotal'));
    }

    const newForm = { ...formData, [name]: val.toString() };
    setFormData(calculateTaxesAndTotals(newForm, false)); // 👈 false
  };

  // Logic Jika User Mengedit Manual Field Base Tertentu
  // const handleManualNumber = (name: keyof RepaymentReceiptFormRequest) => (val: number) => {
  //   const newForm = { ...formData, [name]: val.toString() };
  //   setFormData(calculateTaxesAndTotals(newForm));
  // };
  
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
      { key: 'receiptDate', label: 'Tanggal Pembayaran', type:'date' }, 
      { key: 'receiptMethod', label: 'Metode Pembayaran', type: 'select' },
      { key: 'receiptStatus', label: 'Status Pembayaran', type: 'select' },
      { key: 'receiptNotes', label: 'Catatan Pembayaran', type: 'textarea' },
      // { key: 'receiptDocumentUrl', label: 'Dokumen Bukti Pembayaran', type: 'textarea' },
      { key: 'receiptTotal', label: 'Total Pembayaran Diterima', type: 'numeric-input' },
      { key: 'receiptTotalWithTax', label: 'Total Pembayaran Beserta Pajak', type: 'numeric-input' },
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

  const isError = (field: keyof RepaymentReceiptFormRequest) => {
    return validationErrors.includes(field)
  };

  return (
    <>
      <form className="h-full w-full flex flex-col bg-white">
        {/* Header */}
        <FormHeader 
          title={isEditMode ? 'Edit Pembayaran' : 'Catat Pembayaran Baru'}
          subtitle={isEditMode 
              ? 'Ubah data pembayaran di bawah ini dengan benar.' 
              : 'Lengkapi data pembayaran di bawah ini dengan benar. Perhitungan otomatis dilakukan.'}
          />
        
        <div className="flex-1 overflow-y-auto mx-2">

          <div className="relative space-y-6 transition-all duration-300 px-8 pb-8 mt-4">

            {isDeleting && (
                <div className="absolute inset-y-[-30px] inset-x-[0px] z-10 bg-white opacity-65 bcursor-not-allowed" />
              )}

            {/* GROUP 1: Informasi Dasar */}
            <FormGroup title="INFORMASI PENERIMAAN DANA" colRatio="1:1">
              <NumberField label="Sisa Total Tagihan" 
                            name="remainingTotalWithTax"
                            value={invoiceRemaining?.invoiceTotalWithTax} 
                            disabled={true} colSpan="1" />
              <NumberField label="Jumlah Total Tagihan" 
                            name="invoiceTotalWithTax"
                            value={invoiceSummary?.invoiceTotalWithTax.round(precision).toString()} 
                            disabled={true} colSpan="1" />

              <Input label="Tanggal Pembayaran" type="date" 
                      name="receiptDate" hasError={isError('receiptDate')}
                      value={formatDateForInput(formData.receiptDate)} 
                      onChange={handleChange} colSpan="1" />

              <Input label="Jatuh Tempo Pembayaran" type="date" 
                      name="scheduelDate" 
                      disabled
                      value={formatDateForInput(invoiceSummary.scheduleDate)} 
                      onChange={handleChange} colSpan="1" />
              
              <Select label="Metode Pembayaran"
                      name="receiptMethod"  hasError={isError('receiptMethod')}
                      value={formData.receiptMethod ?? ""} 
                      onChange={handleChange} colSpan="1">
                <option key="default" value="">-- Pilih Metode Transfer --</option>
                {Object.values(ReceiptMethod).map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </Select>

              <Select label="Status Pembayaran" 
                      name="receiptStatus" hasError={isError('receiptStatus')}
                      value={formData.receiptStatus} onChange={handleChange} colSpan="1">
                <option key="default" value="">-- Pilih Status Pembayaran --</option>
                {Object.values(ReceiptStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </Select>

              <TextArea label="Catatan Pembayaran" 
                  name="receiptNotes" hasError={isError('receiptNotes')}
                  value={formData.receiptNotes} 
                  onChange={handleChange} 
                  rows={3} colSpan="2"/>

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
                      receiptDocumentUrl: e.target.files ? e.target.files[0] : null
                    })
                  }
                />
            </FormGroup>

            {/* GROUP 2: Rincian Nilai Penerimaan */}
            <FormGroup title="TOTAL PEMBAYARAN DITERIMA" colRatio="1:1">
              <NumberField label="Total Pembayaran Beserta Pajak" 
                            name="receiptTotalWithTax" hasError={isError('receiptTotalWithTax')}
                            value={formData.receiptTotalWithTax} 
                            onValueChange={handleTotalWithTaxChange} 
                            colSpan="2" 
                            className="font-semibold text-lg text-emerald-700 bg-emerald-50 border-emerald-200" 
              />
              <NumberField label="Total Pembayaran Diterima" 
                            name="receiptTotal" hasError={isError('receiptTotal')}
                            value={formData.receiptTotal} disabled colSpan="1" />

              <NumberField label="Total Pajak" name="receiptTotalTax"
                            value={formData.receiptTotalTax} 
                            disabled colSpan="1" />
            </FormGroup>

            {/* Rincian Spesifik Sesuai Schedule */}
            {invoiceSummary.scheduleType === ScheduleType.UPFRONT && (
              <FormGroup title="UPFRONT FEE" colRatio="1:1">
                {invoiceSummary.invoiceFeeAdministration.gt(0) && 
                <>
                  <NumberField label="Biaya Administrasi" name="receiptFeeAdministration"
                                value={formData.receiptFeeAdministration} 
                                onValueChange={handleNumeriChange('receiptFeeAdministrationTax')} />
                  <NumberField label="Pajak Biaya Administrasi" name="receiptFeeAdministrationTax"
                                value={formData.receiptFeeAdministrationTax} 
                                disabled />
                </>}

                {invoiceSummary.invoiceFeeProvision.gt(0) && 
                <>
                  <NumberField label="Biaya Provisi" name="receiptFeeProvision"
                                value={formData.receiptFeeProvision} 
                                onValueChange={handleNumeriChange('receiptFeeProvision')} />
                  <NumberField label="Pajak Biaya Provisi" name="receiptFeeProvisionTax"
                                value={formData.receiptFeeProvisionTax} 
                                disabled />
                </>}

                {invoiceSummary.invoiceFeePlatform.gt(0) && 
                <>
                  <NumberField label="Biaya Platform" name="receiptFeePlatform"
                                value={formData.receiptFeePlatform} 
                                onValueChange={handleNumeriChange('receiptFeePlatform')} />
                  <NumberField label="Pajak Biaya Platform" name="receiptFeePlatformTax"
                                value={formData.receiptFeePlatformTax} 
                                disabled />
                </>}

                {invoiceSummary.invoiceFeeServicing.gt(0) && 
                <>
                  <NumberField label="Biaya Servicing" name="receiptFeeServicing"
                                value={formData.receiptFeeServicing} 
                                onValueChange={handleNumeriChange('receiptFeeServicing')} />
                  <NumberField label="Pajak Biaya Servicing" name="receiptFeeServicingTax"
                                value={formData.receiptFeeServicingTax} 
                                disabled />
                </>}
                
                {/* Pemisah untuk kelompok Fee Other */}
                <div className="col-span-2 w-full border-b border-slate-200 mt-2 pt-4"></div>
                <NumberField label="Biaya Lain-lain" name="receiptFeeOther"
                              value={formData.receiptFeeOther} 
                              onValueChange={handleNumeriChange('receiptFeeOther')} />
                <NumberField label="Pajak Biaya Lain-lain" name="receiptFeeOtherTax"
                              value={formData.receiptFeeOtherTax} 
                              disabled />
              </FormGroup>
            )}

            {invoiceSummary.scheduleType === ScheduleType.INSTALLMENT && (
              <FormGroup title="INSTALLMENT FEE" colRatio="1:1">
                <NumberField label="Biaya Monitoring" name="receiptFeeMonitoring"
                              value={formData.receiptFeeMonitoring} 
                              onValueChange={handleNumeriChange('receiptFeeMonitoring')} />
                <NumberField label="Pajak Biaya Monitoring" name="receiptFeeMonitoringTax"
                              value={formData.receiptFeeMonitoringTax} 
                              disabled />
                <NumberField label="Sinking Fund" name="receiptSinkingFund"
                              value={formData.receiptSinkingFund} 
                              onValueChange={handleNumeriChange('receiptSinkingFund')} />
                <NumberField label="Yield" name="receiptYield"
                              value={formData.receiptYield} 
                              onValueChange={handleNumeriChange('receiptYield')} />
                {/* Pemisah untuk kelompok Fee Other */}
                <div className="col-span-2 w-full border-b border-slate-200 mt-2 pt-4"></div>
                <NumberField label="Biaya Lain-lain" name="receiptFeeOther"
                              value={formData.receiptFeeOther} 
                              onValueChange={handleNumeriChange('receiptFeeOther')} />
                <NumberField label="Pajak Biaya Lain-lain" name="receiptFeeOtherTax"
                              value={formData.receiptFeeOtherTax} 
                              disabled />
              </FormGroup>
            )}

            <FormGroup title="DENDA & KERUGIAN RIIL" colRatio="1:1">
              <NumberField label="Kerugian Riil" name="receiptActualLoss"
                            value={formData.receiptActualLoss} 
                            onValueChange={handleNumeriChange('receiptActualLoss')} />
              <NumberField label="Denda" name="receiptPenalty"
                            value={formData.receiptPenalty} 
                            onValueChange={handleNumeriChange('receiptPenalty')} />
            </FormGroup>
          </div>
          
          {/*Area Deletion (Danger Zone) - Hanya muncul saat Edit Mode */}
          {isEditMode && (<DeleteDataSection isDeleting={isDeleting} onDeleting={setIsDeleting}/>)}

        </div>



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