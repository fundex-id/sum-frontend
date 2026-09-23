// src/components/repayment/RepaymentSecurityForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { RepaymentSecurityFormRequest, SecurityLookupResponse } from '../../dtos/repayment-security.dto';
import { ContractStatus, SecurityContract, SecurityType } from '../../types/repayment-security.enum';
import { Big } from 'big.js'; 
import { FormGroup, ConfirmModal, Select, Input, NumberField, Toggle, FormFooter, FormHeader, TextArea} from '../../../../components/forms/index';
import { toSafeBig } from '../../../../utils/number';
import { repaymentSecurityService } from '../../services/repaymentSecurityService';
import { FileInput } from '../../../../components/forms/FileInput';
import { FieldValidationConfig, validateFormFields } from '../../../../utils/form';
import { LoadingForm } from '../../../../components/forms/LoadingForm';
import { DeleteDataSection } from '../../../../components/forms/DeleteDataSection';


export interface RepaymentSecurityFormProps {
  mode: 'add' | 'edit' ;
  initialData: RepaymentSecurityFormRequest; // Opsional (jika form bisa dipakai untuk Create juga)
  onSubmit: (data: RepaymentSecurityFormRequest) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading: boolean;
  submissionError?: string | null; 
}

// --- KOMPONEN UTAMA ---
export default function RepaymentSecurityForm ({ mode, initialData, onSubmit, onCancel, onDelete, isLoading, submissionError = null }: RepaymentSecurityFormProps) {
  // export default function RepaymentSecurityForm({ initialData, onSubmit, isLoading, onCancel }: RepaymentSecurityFormProps) {
  const { closePanel } = useSidePanel();
  const [formData, setFormData] = useState<RepaymentSecurityFormRequest>(initialData);
 

  const [securities, setSecurities] = useState<SecurityLookupResponse[]>([]);
  const [selectedLookupId, setSelectedLookupId] = useState('');
  
  const [validationError, setValidationError] = useState<string>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]); 

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const maxPrecision = 2;
  const maxPrecisionPct = 4;

  const oldFile = useRef(formData.contractDocumentUrl ? String(formData.contractDocumentUrl) : undefined);

  const isEditMode = mode === 'edit';

  // FETCH Data Security
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const res = await repaymentSecurityService.getRepaymentSecurityLookup();
        
        if (res.statusCode === 200 && res.data) {
          setSecurities(res.data.items);
          
          // Set lookup default ID jika sedang edit
          if (formData.securityCode) {
            const matched = res.data.items.find((s: any) => s.securityCode === formData.securityCode);
            if (matched) setSelectedLookupId(matched.id);
          }
        }
      } catch (err) {
        console.error("Failed fetching lookup", err);
      }
    };
  
    fetchLookupData();
  }, [formData.securityCode]);

  // AUTO CALCULATE DURATION
  const countMonths = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  };

  // useEffect(() => {
  //   if (formData.contractStartDate && formData.contractEndDate) {
  //     const duration = countMonths(formData.contractStartDate, formData.contractEndDate);
  //     console.log('[onchangedate] formData.contractStartDate : ',formData.contractStartDate);
  //     console.log('[onchangedate] formData.contractEndDate : ',formData.contractEndDate);
  //     console.log('[onchangedate] duration : ',duration);
  //     if (duration !== formData.contractDurationInMonths) {
  //       setFormData(prev => {
  //         const fund = new Big(prev.contractUnderlyingFund || 0);
  //         const rate = new Big(prev.contractYieldRateAnnually || 0);
  //         const durationInMonths = Number(duration) || 0;
  //         const feeMonitoringMonthly = new Big(prev.contractFeeMonitoringMonthly || 0);
  //         const feeMonitoringMonthlyPercentage = new Big(prev.contractFeeMonitoringPercentageMonthly || 0);
          
  //         // fund * (rate / 100) * (duration / 12)
  //         const yieldAmt : Big = fund.times(rate.div(100)).div(12).times(durationInMonths);
          
  //         return {
  //           ...prev,
  //           contractDurationInMonths: durationInMonths,
  //           contractYieldAmount: yieldAmt.round(maxPrecision).toString(),
  //           contractFeeMonitoring: feeMonitoringMonthly.times(duration).round(maxPrecision).toString(),
  //           contractFeeMonitoringPercentage: feeMonitoringMonthlyPercentage.times(duration).round(maxPrecisionPct).toString(),
  //         };
  //       });
  //     }
  //   }
  // }, [formData.contractStartDate, formData.contractEndDate]);

  useEffect(() => {
    const hasStart = !!formData.contractStartDate;
    const hasEnd = !!formData.contractEndDate;
  
    if (formData.contractStartDate && formData.contractEndDate) {
      // Di sini TypeScript tahu keduanya pasti `string`, bukan `string | null`
      const duration = countMonths(formData.contractStartDate, formData.contractEndDate);
      if (duration !== formData.contractDurationInMonths) {
        setFormData(prev => {
          const fund = new Big(prev.contractUnderlyingFund || 0);
          const rate = new Big(prev.contractYieldRateAnnually || 0);
          const durationInMonths = Number(duration) || 0;
          const feeMonitoringMonthly = new Big(prev.contractFeeMonitoringMonthly || 0);
          const feeMonitoringMonthlyPercentage = new Big(prev.contractFeeMonitoringPercentageMonthly || 0);
  
          const yieldAmt: Big = fund.times(rate.div(100)).div(12).times(durationInMonths);
  
          return {
            ...prev,
            contractDurationInMonths: durationInMonths,
            contractYieldAmount: yieldAmt.round(maxPrecision).toString(),
            contractFeeMonitoring: feeMonitoringMonthly.times(duration).round(maxPrecision).toString(),
            contractFeeMonitoringPercentage: feeMonitoringMonthlyPercentage.times(duration).round(maxPrecisionPct).toString(),
          };
        });
      }
    } else if (hasStart !== hasEnd) {
      // Hanya salah satu terisi -> kosongkan durasi jadi null (bukan 0), disabled
      if (formData.contractDurationInMonths !== null) {
        setFormData(prev => ({
          ...prev,
          contractDurationInMonths: null,
        }));
      }
    }
    // Kalau keduanya kosong: jangan sentuh value, biarkan user isi manual
  }, [formData.contractStartDate, formData.contractEndDate]);

  // GROUP 3 KALKULATOR
  const handleGroup3Change = (field: keyof RepaymentSecurityFormRequest, val: number) => {

    const prefixField = field.replace(/Percentage.*$/, '');
    if (validationErrors.some(errorKey => errorKey.includes(prefixField))) {
      setValidationErrors((prevErrors) => 
        prevErrors.filter((errorKey) => !errorKey.includes(prefixField))
      );
    }
    

    let newData = { ...formData, [field]: val };
    const fundRaw = field === 'contractUnderlyingFund' ? val : formData.contractUnderlyingFund;
    const fund = toSafeBig(fundRaw);
    const isFundZero = fund.eq(0);
    const duration = toSafeBig(formData.contractDurationInMonths);

    if (['contractUnderlyingFund', 'contractYieldRateAnnually'].includes(field)) {
       const rateRaw = field === 'contractYieldRateAnnually' ? val : formData.contractYieldRateAnnually;
       
       const yieldRate = !isFundZero?toSafeBig(rateRaw):new Big(0);
       const yieldAmount = !isFundZero?fund.times(yieldRate.div(100)).times(duration.div(12)):new Big(0);

       newData.contractYieldRateAnnually = yieldRate.gt(0)?yieldRate.round(maxPrecisionPct).toString():'';
       newData.contractYieldAmount = yieldAmount.gt(0)?yieldAmount.round(maxPrecision).toString():'';
    }

    const calculateFee = (nameBase: string) => {
      const feeField = `contractFee${nameBase}` as keyof RepaymentSecurityFormRequest;
      const pctField = `contractFee${nameBase}Percentage` as keyof RepaymentSecurityFormRequest;

      // console.log('feeField : ',feeField);
      // console.log('pctField : ',pctField);

      // Pastikan variabel 'fund' sudah berupa objek Big sebelum masuk ke blok ini
      // Contoh: const fund = new Big(fundRawString);

      if (field === feeField) {
        // Logika Lama: fund > 0 ? (val / fund) * 100 : 0
        // Logika Big.js: Mengonversi val ke string, dibagi fund, dikali 100
        newData[pctField] = fund.gt(0)
          ? toSafeBig(val.toFixed(maxPrecision)).div(fund).times(100).round(maxPrecisionPct).toString() // Menghasilkan string persentase (4 desimal)
          : "0";
          
      } else if (field === pctField) {
        // Logika Lama: (val / 100) * fund
        // Logika Big.js: Mengonversi val ke string, dibagi 100, dikali fund
        newData[feeField] = toSafeBig(val.toFixed(maxPrecisionPct)).div(100).times(fund).round(maxPrecision).toString(); // Menghasilkan string nominal uang (2 desimal)
      }

      
      // if (field === feeField) {
      //   newData[pctField] = fund > 0 ? (val / fund) * 100 : 0 as any;
      // } else if (field === pctField) {
      //   newData[feeField] = (val / 100) * fund as any;
      // }
    };

    calculateFee('Administration');
    calculateFee('Provision');
    calculateFee('Platform');
    calculateFee('Servicing');

// Asumsi persiapan variabel pendukung di luar scope IF:
// const fund = new Big(field === 'contractUnderlyingFund' ? val.toString() : formData.contractUnderlyingFund);
const durationBig = new Big(duration.toString());

  if (field === 'contractFeeMonitoringMonthly') {
    const valBig = new Big(val.toString());
    
    const pctMonthly = fund.gt(0) ? valBig.div(fund).times(100) : new Big('0');
    newData.contractFeeMonitoringPercentageMonthly = pctMonthly.round(maxPrecisionPct).toString();
    const feeMonitoring = valBig.times(durationBig);
    newData.contractFeeMonitoring = feeMonitoring.round(maxPrecision).toString();
    newData.contractFeeMonitoringPercentage = pctMonthly.times(durationBig).round(maxPrecisionPct).toString();
  } else if (field === 'contractFeeMonitoringPercentageMonthly') {
    const valBig = toSafeBig(val.toString());
    const feeMonthly = valBig.div(100).times(fund);
    newData.contractFeeMonitoringMonthly = feeMonthly.round(maxPrecision).toString();
    newData.contractFeeMonitoring = feeMonthly.times(durationBig).round(maxPrecision).toString();
    newData.contractFeeMonitoringPercentage = valBig.times(durationBig).round(maxPrecisionPct).toString()
  }

  if (field === 'contractUnderlyingFund') {
    // Ambil persentase dari formData (string), ubah ke desimal (/100), lalu kalikan dengan fund
   
    const feeAdminPct = !isFundZero?toSafeBig(formData.contractFeeAdministrationPercentage):new Big(0);
    const feeProvPct = !isFundZero?toSafeBig(formData.contractFeeProvisionPercentage):new Big(0);
    const feePlatPct = !isFundZero?toSafeBig(formData.contractFeePlatformPercentage):new Big(0);
    const feeServPct = !isFundZero?toSafeBig(formData.contractFeeServicingPercentage):new Big(0);
    const feeMonMonthlyPct = !isFundZero?toSafeBig(formData.contractFeeMonitoringPercentageMonthly):new Big(0);

    newData.contractFeeAdministrationPercentage = feeAdminPct.gt(0)?feeAdminPct.round(maxPrecisionPct).toString():'';
    newData.contractFeeProvisionPercentage = feeProvPct.gt(0)?feeProvPct.round(maxPrecisionPct).toString():'';
    newData.contractFeePlatformPercentage = feePlatPct.gt(0)?feePlatPct.round(maxPrecisionPct).toString():'';
    newData.contractFeeServicingPercentage = feeServPct.gt(0)?feeServPct.round(maxPrecisionPct).toString():'';
    newData.contractFeeMonitoringPercentageMonthly = feeMonMonthlyPct.gt(0)?feeMonMonthlyPct.round(maxPrecisionPct).toString():'';
    newData.contractFeeMonitoringPercentage = feeMonMonthlyPct.gt(0)?feeMonMonthlyPct.times(durationBig).round(maxPrecisionPct).toString():'';


    const feeAdmin = !isFundZero?feeAdminPct.div(100).times(fund):new Big(0);
    const feeProv = !isFundZero?feeProvPct.div(100).times(fund):new Big(0);
    const feePlat = !isFundZero?feePlatPct.div(100).times(fund):new Big(0);
    const feeServ = !isFundZero?feeServPct.div(100).times(fund):new Big(0);
    const feeMonMonthly = !isFundZero?feeMonMonthlyPct.div(100).times(fund):new Big(0);

    newData.contractFeeAdministration = feeAdmin.gt(0)?feeAdmin.round(maxPrecision).toString():'';
    newData.contractFeeProvision = feeProv.gt(0)?feeProv.round(maxPrecision).toString():'';
    newData.contractFeePlatform = feePlat.gt(0)?feePlat.round(maxPrecision).toString():'';
    newData.contractFeeServicing = feeServ.gt(0)?feeServ.round(maxPrecision).toString():'';
    newData.contractFeeMonitoringMonthly = feeMonMonthly.gt(0)?feeMonMonthly.round(maxPrecision).toString():'';
    newData.contractFeeMonitoring = feeMonMonthly.gt(0)?feeMonMonthly.times(durationBig).round(maxPrecision).toString():'';
  }

    setFormData(newData);
  };

  // VALIDASI FORM
  const handleSecuritySelect = (e: any) => {

    if (validationErrors.includes('securityName')) {
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'securityName'));
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'securityType'));
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'investeeName'));
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'investeeNameLegal'));
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'investeeAddress'));
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'investeeTelephone'));
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== 'investeePostalCode'));
    }


    const valId = e.target.value;
    setSelectedLookupId(valId);
    
    const item = securities.find(s => s.id === valId);
    
    if (item) {
      // Gunakan fungsi (prev) agar tidak rentan terhadap bug state usang
      setFormData(prev => ({
        ...prev,
        investeeId: item.investeeId,
        investeeName: item.investeeName,
        investeeNameLegal: item.investeeNameLegal,
        investeeIconUrl: item.investeeIconUrl,
        investeeAddress: item.investeeAddress,
        investeeTelephone: item.investeeTelephone,
        investeePostalCode: item.investeePostalCode,
        securityId: item.securityId,
        securityType: item?.securityType || null,
        securityContract: Object.values(SecurityContract).includes(item?.securityContract as SecurityContract)
                          ? (item.securityContract as SecurityContract)
                          : SecurityContract.UNSPECIFIED,
        securityName: item.securityName, 
        securityCode: item.securityCode,
        securitySeries: item.securitySeries,
        securityPhase: item.securityPhase,
        securitySequence: item.securitySequence,
      }));
    } else {
      setFormData(prev => ({ 
        ...prev,
        investeeId: '',
        investeeName: '',
        investeeNameLegal: '',
        investeeIconUrl: '',
        investeeAddress: '',
        investeeTelephone: '',
        investeePostalCode: '',
        securityId: '',
        securityType: '',
        securityContract: '',
        securityName: '',
        securityCode: '',
        securitySeries: null,
        securityPhase: null,
        securitySequence: null, })); 
    }
  };

  const handleChange = (field: keyof RepaymentSecurityFormRequest) => (valueOrEvent: any) => {

    if (validationErrors.includes(field)) {
      setValidationErrors((prevErrors) => prevErrors.filter((key) => key !== field));
    }

    let value = valueOrEvent;
  
    // Cek apakah parameter berupa event bawaan DOM (memiliki properti 'target')
    if (valueOrEvent && valueOrEvent.target !== undefined) {
      const target = valueOrEvent.target;
      
      // Sesuaikan cara pengambilan nilai berdasarkan tipe input HTML
      if (target.type === 'checkbox') {
        value = target.checked;
      } else if (target.type === 'file') {
        value = target.files && target.files.length > 0 ? target.files[0] : null; 
      } else {
        value = target.value;
      }
    }
  
    // Update state formData secara fungsional
    setFormData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleTimeDurationChange = (field: 'contractStartDate' | 'contractEndDate' | 'contractDurationInMonths') => (valueOrEvent: any) => {

    // --- Ekstrak value baru (support raw value atau native event) ---
    let value = valueOrEvent;
    if (valueOrEvent && valueOrEvent.target !== undefined) {
      value = valueOrEvent.target.value;
    }
  
    
    // --- Normalisasi value sesuai tipe field ---
    let normalizedValue: any = value;
    if (field === 'contractDurationInMonths') {
      normalizedValue = value === '' ? null : Number(value);
    }

    // --- Update formData ---
    setFormData(prev => ({
      ...prev,
      [field]: normalizedValue,
    }));

    // --- Normalisasi validationErrors ---
    if (field === 'contractStartDate' || field === 'contractEndDate') {
      const newStart = field === 'contractStartDate' ? normalizedValue : formData.contractStartDate;
      const newEnd = field === 'contractEndDate' ? normalizedValue : formData.contractEndDate;

      const hasStart = !!newStart;
      const hasEnd = !!newEnd;
      const otherDateField = field === 'contractStartDate' ? 'contractEndDate' : 'contractStartDate';

      setValidationErrors(prevErrors => 
        prevErrors.filter(key => {
          if (key === field) return false; // hilangkan error field yang sedang diedit
          if (hasStart && hasEnd && (key === otherDateField || key === 'contractDurationInMonths')) {
            return false; // kedua tanggal lengkap -> bersihkan pasangan + duration
          }
          return true;
        })
      );
    } else {
      // field === 'contractDurationInMonths'
      setValidationErrors(prevErrors => prevErrors.filter(key => key !== field));
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

  const isError = (field: keyof RepaymentSecurityFormRequest) => {
    return validationErrors.includes(field)
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
    // const missingFields: string[] = [];
    // const missingKeys: string[] = [];

    const requiredFields: FieldValidationConfig<typeof formData>[] = [
      { key: 'investeeName', label: 'Nama Penerbit' }, 
      { key: 'investeeNameLegal', label: 'Nama Legal Penerbit' },
      { key: 'securityName', label: 'Nama efek', type: 'select' },
      { key: 'securityType', label: 'Tipe Efek' },
      // { key: 'securityContract', label: 'Kontrak Efek' },
      // { key: 'securityCode', label: 'Kode Efek' },
      // { key: 'securitySequence', label: 'Sequence' },
      // { key: 'securitySeries', label: 'Series' },
      // { key: 'securityPhase', label: 'Phase' },
      // { key: 'investeeIconUrl', label: 'Icon URL' },
      { key: 'investeeAddress', label: 'Alamat Penerbit' },
      { key: 'investeeTelephone', label: 'Telepon' },
      { key: 'investeePostalCode', label: 'Kode Pos' },

       // --- Bidirectional dependency: salah satu terisi -> yang lain wajib ---
      { 
        key: 'contractStartDate', label: 'Waktu Mulai Efek', type: 'date', optional: true,
        dependencies: [{ key: 'contractEndDate', label: 'Waktu Selesai Efek', type: 'date' }]
      },
      { 
        key: 'contractEndDate', label: 'Waktu Selesai Efek', type: 'date', optional: true,
        dependencies: [{ key: 'contractStartDate', label: 'Waktu Mulai Efek', type: 'date' }]
      },

      { key: 'contractDurationInMonths', label: 'Durasi Kontrak (Bulan)', type:'numeric-input' },
      { key: 'contractStatus', label: 'Status', type: 'select' },
      { key: 'contractUnderlyingFund', label: 'Jumlah Pendanaan', type: 'numeric-input',
          dependencies: [
            { key: 'contractYieldRateAnnually', label: 'Yield per tahun (%)', type: 'numeric-input'},
            { key: 'contractFeeAdministrationPercentage', label: '(%) Biaya Administrasi', type: 'numeric-input' },
            { key: 'contractFeeAdministration', label: 'Biaya Administrasi', type: 'numeric-input' },
            { key: 'contractFeeProvisionPercentage', label: '(%) Biaya Provisi', type: 'numeric-input' },
            { key: 'contractFeeProvision', label: 'Biaya Provisi', type: 'numeric-input' },
            { key: 'contractFeePlatformPercentage', label: '(%) Biaya Platform', type: 'numeric-input' },
            { key: 'contractFeePlatform', label: 'Biaya Platform', type: 'numeric-input' },
            { key: 'contractFeeServicingPercentage', label: '(%) Biaya Servicing', type: 'numeric-input' },
            { key: 'contractFeeServicing', label: 'Biaya Servicing', type: 'numeric-input' },
            { key: 'contractFeeMonitoringPercentageMonthly', label: '(%) Biaya Monitoring (per bulan)', type: 'numeric-input' },
            { key: 'contractFeeMonitoringMonthly', label: 'Biaya Monitoring (per bulan)', type: 'numeric-input' },
            { key: 'contractFeeMonitoringPercentage', label: '(%) Biaya Monitoring', type: 'numeric-input' },
            { key: 'contractFeeMonitoring', label: 'Biaya Monitoring', type: 'numeric-input' },
            
          ]},
      { key: 'contractTaxPpn', label: 'Pajak Pertambahan Nilai (Ppn)', type: 'numeric-input' },
      { key: 'contractTaxFactor', label: 'Faktor Pengali Pajak', type: 'numeric-input' },
      { key: 'contractTaxYield', label: 'Pajak Kupon/Dividen', type: 'numeric-input' },
      { key: 'contractPenaltyPercentageDaily', label: 'Denda Keterlambatan (Perhari)', type: 'numeric-input' },
      // { key: 'contractEscrowBank', label: 'Bank Escrow', type: 'select' },
      // { key: 'contractEscrowAccount', label: 'Rekening Escrow', type: 'numeric-input' },
      // { key: 'contractVaBank', label: 'Bank Virtual Account', type: 'numeric-input' },
      // { key: 'contractVaNumber', label: 'Nomor Virtual Account', type: 'numeric-input' },
      // { key: 'contractContactEmail', label: 'Email Penerbit'},
      // { key: 'contractContactWhatsapp', label: 'WhatsApp Penerbit'},
      ...(formData.scheduleUpfrontFlag ? [{ key: 'scheduleUpfrontDate' as const, label: 'Tanggal Upfront Fee', type: 'date' as const }] : []),
      ...(formData.scheduleInstallmentFlag ? [{ key: 'scheduleInstallmentDate' as const, label: 'Tanggal Installment Fee', type: 'date' as const }] : []),
    ];

    // 2. Lakukan validasi menggunakan helper
    const { isValid, missingFields, missingKeys } = validateFormFields(formData, requiredFields);
    

    if (!isValid) {
      setValidationError(`Silakan lengkapi: ${missingFields.join(', ')}`);
      setValidationErrors(missingKeys);
      return false;
    }
  
    setValidationError('');
    setValidationErrors([]);
    return true;



    // if (!isEmptyField(formData.scheduleType, 'select')) { 

    //   if (isEmptyField(formData.invoiceTotalWithTax, 'numeric-input')) { 
    //     missingFields.push('Total Tagihan'); 
    //     missingKeys.push('invoiceTotal'); 
    //   }

    //   if (isEmptyField(formData.invoiceTotalWithTax, 'numeric-input')) { 
    //     missingFields.push('Total Tagihan & Pajak'); 
    //     missingKeys.push('invoiceTotalWithTax'); 
    //   }
    // }

    // if (missingFields.length > 0) {
    //   setValidationError(`Silakan lengkapi: ${missingFields.join(', ')}`);
    //   setValidationErrors(missingKeys);
    //   return false;
    // }

    // setValidationError('');
    // setValidationErrors([]);
    // return true;
  };

  // const isGroup3Active = formData.contractUnderlyingFund > 0 && formData.contractDurationInMonths > 0;

  // Pastikan datanya valid sebelum dibungkus (mencegah error jika string kosong atau null)
  const fundStr = formData.contractUnderlyingFund || '0';
  const durationStr = formData.contractDurationInMonths || '0';

  const hasStartDate = !!formData.contractStartDate;
  const hasEndDate = !!formData.contractEndDate;
  // Editable HANYA kalau kedua tanggal masih kosong
  const isDurationDisabled = hasStartDate || hasEndDate;

  const hasSecurityType = !!selectedLookupId && !!securities.find(s => s.id === selectedLookupId)?.securityType;
  const hasSecurityCode = !!selectedLookupId && !!securities.find(s => s.id === selectedLookupId)?.securityCode;
  
  
  const isGroup3Active = new Big(fundStr).gt(0) && new Big(durationStr).gt(0);


  return (
    // Struktur flex-col dengan height penuh agar header dan footer menempel (fixed position / sticky)
    <div className="flex flex-col h-full bg-slate-white relative">
      
      {/* HEADER: Fixed di Atas */}
      <FormHeader 
        title={isEditMode ? 'Ubah Data Pembayaran' : 'Tambah Data Pembayaran'}
        subtitle={isEditMode 
            ? 'Ubah data pembayaran di bawah ini dengan benar.' 
            : 'Lengkapi data pembayaran di bawah ini dengan benar.'}
      />

      {/* BODY FORM: Scrollable */}
      <div className="flex-1 overflow-y-auto mx-2 ">
        <form className="max-w-6xl mx-auto">

          <div className="relative space-y-6 transition-all duration-300 px-8 pb-8 mt-4">

            {isDeleting && (
              <div className="absolute inset-y-[-30px] inset-x-[0px] z-10 bg-white opacity-65 bcursor-not-allowed" />
            )}
            
            {/* HIDDEN FIELD */}
            <input type="hidden" value={formData.investeeId} name="investeeId"/>
            <input type="hidden" value={formData.securityId} name="securityId"/>
            <input type="hidden" value={formData.restructOrder || 0} name="restructOrder"/>
            <input type="hidden" value={formData.restructParentSecurityId || ''} name="restructParentSecurityId"/>
            <input type="hidden" value={formData.restructOriginalSecurityId || ''} name="restructOriginalSecurityId"/>

            <FormGroup title="PENERBIT DAN EFEK">
              <Select 
                label="Nama Efek" 
                hasError={isError('securityName')} name="securityName"
                value={selectedLookupId ?? ''} colSpan="2" disabled={isEditMode}
                onChange={handleSecuritySelect}
              >
                <option value="">-- Pilih Security Name --</option>
                {securities.map(s => <option key={s.id} value={s.id}>{s.securityName} - {s.securityCode}</option>)}
              </Select>
              <Input label="Nama Penerbit" name="investeeName" hasError={isError('investeeName')} onChange={handleChange('investeeName')} value={formData.investeeName} />
              <Input label="Nama Legal Penerbit" name="investeeNameLegal" hasError={isError('investeeNameLegal')}  onChange={handleChange('investeeNameLegal')} value={formData.investeeNameLegal} />

              <Select 
                label="Tipe Efek" 
                hasError={isError('securityType')} name="securityType"
                value={formData.securityType}  disabled={hasSecurityType}
                onChange={handleChange('securityType')}
              >
                  <option value="">-- Pilih Tipe Efek --</option>
                  <option value={SecurityType.SAHAM}>Saham</option>
                  <option value={SecurityType.SUKUK}>Sukuk</option>
                  <option value={SecurityType.OBLIGASI}>Obligasi</option>
              </Select>
              <Select 
                label="Kontrak Efek" 
                hasError={isError('securityContract')} name="securityContract"
                value={formData.securityContract}  disabled={isEditMode}
                onChange={handleChange('securityContract')}
              >
                  <option value="">-- Pilih Kontrak Efek --</option>
                  <option value={SecurityContract.IJARAH}>Ijarah</option>
                  <option value={SecurityContract.MURABAHAH}>Murabahah</option>
                  <option value={SecurityContract.MUDHARABAH}>Mudharabah</option>
                  <option value={SecurityContract.MUSYARAKAH}>Musyarakah</option>
                  <option value={SecurityContract.WAKALAH}>Wakalah</option>
                  <option value={SecurityContract.WAKALAH_BIL_ISTITSMAR}>Wakalah Bil Istitsmar</option>
                  <option value={SecurityContract.ISTISNA}>Istisna</option>
                  <option value={SecurityContract.MUSYARAKAH_MUTANAQISHAH}>Musyarakah Mutanaqishah</option>

                  <option value={SecurityContract.SHARE_PURCHASE}>Share Purchase</option>
                  <option value={SecurityContract.SHARE_SUBSCRIPTION}>Share Subscription</option>
                  <option value={SecurityContract.SHARE_BUYBACK}>Share Buyback</option>
                  <option value={SecurityContract.CONVERTIBLE_NOTE}>Convertible Note</option>

                  <option value={SecurityContract.UNSPECIFIED}>Belum Ditentukan</option>
                  <option value={SecurityContract.OTHER}>Lainnya</option>
              </Select>
              
              <Input 
                label="Kode Efek" 
                name="securityCode" 
                disabled={hasSecurityCode} 
                value={formData.securityCode ?? ''} 
                onChange={handleChange('securityCode')}
              />
              <Input label="Squence" name="securitySequence" value={formData.securitySequence} onChange={handleChange('securitySequence')}/>
              <Input label="Series" name="securitySeries" value={formData.securitySeries}  onChange={handleChange('securitySeries')}/>
              <Input label="Phase" name="securityPhase" value={formData.securityPhase} onChange={handleChange('securityPhase')}/>
              
              <TextArea label="Alamat" name="investeeAddress" colSpan="2" value={formData.investeeAddress} hasError={isError('investeeAddress')}  onChange={handleChange('investeeAddress')}/>
              <Input label="Telepon" name="investeeTelephone" value={formData.investeeTelephone} hasError={isError('investeeTelephone')}  onChange={handleChange('investeeTelephone')}/>
              <Input label="Kode Pos" name="investeePostalCode" value={formData.investeePostalCode} hasError={isError('investeePostalCode')}  onChange={handleChange('investeePostalCode')}/>
             
              
            </FormGroup>

            <FormGroup title="JANGKA WAKTU">
              <Input type="date" label="Waktu Mulai Efek" disabled={isEditMode} 
                      hasError={isError('contractStartDate')} value={formData.contractStartDate} 
                      name="contractStartDate" onChange={handleTimeDurationChange('contractStartDate')} />

              <Input type="date" label="Waktu Selesai Efek" disabled={isEditMode} 
                      hasError={isError('contractEndDate')} value={formData.contractEndDate} 
                      name="contractEndDate" onChange={handleTimeDurationChange('contractEndDate')} />

            
              <Input label="Contract Duration (Months)" 
                    type="number" disabled={isDurationDisabled}
                    name="contractDurationInMonths"
                    hasError={isError('contractDurationInMonths')} 
                    value={
                      formData.contractDurationInMonths === 0 || formData.contractDurationInMonths === null
                        ? ""
                        : formData.contractDurationInMonths
                    }
                    onChange={handleTimeDurationChange('contractDurationInMonths')} />
              
              <Select label="Contract Status" hasError={isError('contractStatus')} 
                      value={formData.contractStatus ?? ""} name="contractStatus"
                      onChange={handleChange("contractStatus")}>
                <option value="">-- Pilih Contract Status --</option>
                <option value={ContractStatus.PERFORMING}>Performing</option>
                <option value={ContractStatus.OBSERVATION}>Observation</option>
                <option value={ContractStatus.SUBSTANDARD}>Substandard</option>
                <option value={ContractStatus.DOUBTFUL}>Doubtful</option>
                <option value={ContractStatus.DEFAULTED}>Defaulted</option>
              </Select>
            </FormGroup>

            <FormGroup title="PENDANAAN & KUPON/DIVIDEN">
              <NumberField label="Underlying Fund" disabled={isEditMode} 
                            hasError={isError('contractUnderlyingFund')} name="contractUnderlyingFund"
                            value={formData.contractUnderlyingFund} 
                            onValueChange={(v: number) => handleGroup3Change('contractUnderlyingFund', v)} 
                            colSpan="2"/>
              
              <NumberField label="Yield Rate Annually (%)" 
                            hasError={isError('contractYieldRateAnnually')} name="contractYieldRateAnnually"
                            disabled={!isGroup3Active || isEditMode} value={formData.contractYieldRateAnnually} 
                            onValueChange={(v: number) => handleGroup3Change('contractYieldRateAnnually', v)} 
                            isPercentage={true}/>
              <NumberField label="Yield Amount" hasError={isError('contractYieldAmount')}  disabled value={formData.contractYieldAmount} onValueChange={() => {}} />

            </FormGroup>

            <FormGroup title="BIAYA-BIAYA">
              <NumberField label="(%) Biaya Administrasi" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeeAdministrationPercentage')} name="contractFeeAdministrationPercentage"
                            value={formData.contractFeeAdministrationPercentage} 
                            onValueChange={(val: number) => handleGroup3Change('contractFeeAdministrationPercentage', val)} 
                            isPercentage={true}/>
              <NumberField label="Biaya Administrasi" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeeAdministration')} 
                            value={formData.contractFeeAdministration} name="contractFeeAdministration"
                            onValueChange={(val: number) => handleGroup3Change('contractFeeAdministration', val)} />
            
              <NumberField label="(%) Biaya Provisi" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeeProvisionPercentage')} name="contractFeeProvisionPercentage"
                            value={formData.contractFeeProvisionPercentage} 
                            onValueChange={(val: number) => handleGroup3Change('contractFeeProvisionPercentage', val)} 
                            isPercentage={true}/>
              <NumberField label="Biaya Provisi" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeeProvision')} 
                            value={formData.contractFeeProvision} name="contractFeeProvision"
                            onValueChange={(val: number) => handleGroup3Change('contractFeeProvision', val)} />
            
              <NumberField label="(%) Biaya Platform" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeePlatformPercentage')} name="contractFeePlatformPercentage"
                            value={formData.contractFeePlatformPercentage} 
                            onValueChange={(val: number) => handleGroup3Change('contractFeePlatformPercentage', val)} 
                            isPercentage={true}/>
              <NumberField label="Biaya Platform" disabled={!isGroup3Active} 
                            hasError={isError('contractFeePlatform')} name="contractFeePlatform"
                            value={formData.contractFeePlatform} 
                            onValueChange={(val: number) => handleGroup3Change('contractFeePlatform', val)} />
                        
              <NumberField label="(%) Biaya Servicing" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeeServicingPercentage')} name="contractFeeServicingPercentage"
                            value={formData.contractFeeServicingPercentage} 
                            onValueChange={(val: number) => handleGroup3Change('contractFeeServicingPercentage', val)} 
                            isPercentage={true}/>
              <NumberField label="Biaya Servicing" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeeServicing')} name="contractFeeServicing"
                            value={formData.contractFeeServicing} 
                            onValueChange={(val: number) => handleGroup3Change('contractFeeServicing', val)} />
              
              <NumberField label="(%) Biaya Monitoring (per bulan)" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeeMonitoringPercentageMonthly')} name="contractFeeMonitoringPercentageMonthly"
                            value={formData.contractFeeMonitoringPercentageMonthly} 
                            onValueChange={(val: number) => handleGroup3Change('contractFeeMonitoringPercentageMonthly', val)} 
                            isPercentage={true}/>

              <NumberField label="Biaya Monitoring (per bulan)" disabled={!isGroup3Active || isEditMode} 
                            hasError={isError('contractFeeMonitoringMonthly')} name="contractFeeMonitoringMonthly"
                            value={formData.contractFeeMonitoringMonthly} 
                            onValueChange={(val: number) => handleGroup3Change('contractFeeMonitoringMonthly', val)} />
                        
              <NumberField label="(%) Total Biaya Monitoring" disabled 
                            hasError={isError('contractFeeMonitoringPercentage')} name="contractFeeMonitoringPercentage"
                            value={formData.contractFeeMonitoringPercentage}  
                            onValueChange={() => {}} isPercentage={true}/>
              <NumberField label="Total Biaya Monitoring" disabled 
                            hasError={isError('contractFeeMonitoring')} name="contractFeeMonitoring"
                            value={formData.contractFeeMonitoring} onValueChange={() => {}} />
            </FormGroup>

            <FormGroup title="PAJAK DAN DENDA">
              <Select label="Pajak Pertambahan Nilai (Ppn)" disabled={isEditMode} 
                      isPercentage={true} hasError={isError('contractTaxPpn')} 
                      value={formData.contractTaxPpn ?? ''} name="contractTaxPpn"
                      onChange={handleChange('contractTaxPpn')}>
                <option value="">-- Pilih Tax PPN --</option>
                <option value="0.1">10</option>
                <option value="0.11">11</option>
                <option value="0.12">12</option>
              </Select>
              <Select label="Faktor Pengali Pajak" disabled={isEditMode} 
                      hasError={isError('contractTaxFactor')} value={formData.contractTaxFactor ?? ''} 
                      name="contractTaxFactor" onChange={handleChange('contractTaxFactor')}>
                <option value="">-- Pilih Tax Factor --</option>
                <option value="1">1</option>
                <option value="0.916667">11/12</option>
              </Select>
              <Select label="Pajak Kupon/Dividen" disabled={isEditMode} 
                      isPercentage={true} hasError={isError('contractTaxYield')} 
                      value={formData.contractTaxYield ?? ''} name="contractTaxYield"
                      onChange={handleChange('contractTaxYield')}>
                <option value="">-- Pilih Tax Yield --</option>
                <option value="0.1">10</option>
                <option value="0.15">15</option>
                <option value="0.2">20</option>
              </Select>
              <Select label="Denda Keterlambatan (Perhari)" disabled={isEditMode} 
                      hasError={isError('contractPenaltyPercentageDaily')} 
                      value={formData.contractPenaltyPercentageDaily ?? ''} 
                      name="contractPenaltyPercentageDaily"
                      onChange={handleChange('contractPenaltyPercentageDaily')}>
                <option value="">-- Pilih Penalty --</option>
                <option value="0.0005">0,5/1000</option>
                <option value="0.001">1/1000</option>
                <option value="0.002">2/1000</option>
                <option value="0.003">3/1000</option>
                <option value="0.004">4/1000</option>
                <option value="0.005">5/1000</option>
              </Select>
            </FormGroup>

            <FormGroup title="PEMBAYARAN DAN KONTAK">
              <Select label="Bank Escrow" 
                      hasError={isError('contractEscrowBank')} name="contractEscrowBank"
                      value={formData.contractEscrowBank ?? ''} 
                      onChange={(e: any) => setFormData({...formData, contractEscrowBank: e.target.value})}>
                <option value="">-- Pilih Escrow Bank --</option>
                <option value="BJBS">BJB Syariah</option>
                <option value="Mega Syariah">Bank Mega Syariah</option>
                <option value="KEB Hana">Bank Keb Hana</option>
              </Select>
              <Input label="Rekening Escrow" inputType="alphanumeric" 
                      hasError={isError('contractEscrowAccount')} name="contractEscrowAccount"
                      value={formData.contractEscrowAccount ?? ''} 
                      onChange={(e: any) => setFormData({...formData, contractEscrowAccount: e.target.value})} />
              <Select label="Bank Virtual Account" hasError={isError('contractVaBank')} value={formData.contractVaBank} onChange={(e: any) => setFormData({...formData, contractVaBank: e.target.value})}>
                <option value="">-- Pilih VA Bank --</option>
                <option value="BCA">BCA</option>
                <option value="BNI">BNI</option>
                <option value="BRI">BRI</option>
                <option value="Mandiri">Mandiri</option>
              </Select>
              <Input label="Nomor Virtual Account" inputType="alphanumeric" 
                      hasError={isError('contractVaNumber')} name="contractVaNumber"
                      value={formData.contractVaNumber} 
                      onChange={(e: any) => setFormData({...formData, contractVaNumber: e.target.value})} />
              <Input label="Email Penerbit" inputType="email" 
                      hasError={isError('contractContactEmail')} name="contractContactEmail"
                      value={formData.contractContactEmail} 
                      onChange={(e: any) => setFormData({...formData, contractContactEmail: e.target.value})} />
              <Input label="WhatsApp Penerbit" inputType="tel" hasError={isError('contractContactWhatsapp')} value={formData.contractContactWhatsapp} onChange={(e: any) => setFormData({...formData, contractContactWhatsapp: e.target.value})} />
            </FormGroup>

            <FormGroup title="DOKUMEN PERJANJIAN">
              <Input label="Document Number" name="contractDocumentNumber"
                      value={formData.contractDocumentNumber} 
                      onChange={(e: any) => setFormData({...formData, contractDocumentNumber: e.target.value})} 
                      colSpan="2"/>
              <Input label="Document Title" name="contractDocumentTitle"
                      value={formData.contractDocumentTitle} 
                      onChange={(e: any) => setFormData({...formData, contractDocumentTitle: e.target.value})} 
                      colSpan="2"/>
              <FileInput 
                  label="Upload Dokumen" name="contractDocumentUrl" colSpan="2"
                  hasError={false} // Ubah ke true jika validasi gagal
                  oldFile={oldFile.current}
                  maxSizeMb={5} // Maksimal 2MB (jika diabaikan, otomatis 5MB)
                  allowedTypes={['.pdf']} // Hanya izinkan tipe ini
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({
                      ...formData, 
                      contractDocumentUrl: e.target.files ? e.target.files[0] : null
                    })
                  }
                />
            </FormGroup>

            {!isEditMode && (
              <FormGroup title="BUAT JADWAL TAGIHAN?">
                {/* ---- BARIS 1: UPFRONT FEE ---- */}
                <Toggle 
                  label="Upfront Fee" name="scheduleUpfrontFlag"
                  checked={formData.scheduleUpfrontFlag} 
                  onChange={(val: boolean) => setFormData({...formData, scheduleUpfrontFlag: val})}
                />
                
                {/* Gunakan class 'invisible' saat toggle OFF agar grid kolom tidak rusak & UI tidak melompat */}
                <div className={formData.scheduleUpfrontFlag ? 'visible' : 'invisible'}>
                  <Input 
                    type="date" name="scheduleUpfrontDate"
                    hasError={isError('scheduleUpfrontDate')} 
                    value={formData.scheduleUpfrontDate} 
                    onChange={(e: any) => setFormData({...formData, scheduleUpfrontDate: e.target.value})} 
                  />
                </div>

                {/* ---- BARIS 2: CICILAN ---- */}
                <Toggle 
                  label="Cicilan" name="scheduleInstallmentFlag"
                  checked={formData.scheduleInstallmentFlag} 
                  onChange={(val: boolean) => setFormData({...formData, scheduleInstallmentFlag: val})}
                />

                <div className={formData.scheduleInstallmentFlag ? 'visible' : 'invisible'}>
                  {/* Solusi Tanggal & Bulan: 
                    Karena type="date" wajib pakai tahun, kita ubah ke type="text" dengan placeholder 
                    jika memang benar-benar tidak ingin melihat angka tahun di UI.
                  */}
                  <Input 
                    inputType="date" name="scheduleInstallmentDate"
                    hasError={isError('scheduleInstallmentDate')} 
                    value={formData.scheduleInstallmentDate} 
                    onChange={(e: any) => setFormData({...formData, scheduleInstallmentDate: e.target.value})} 
                  />
                </div>
              </FormGroup>
            )}
          </div>
          {/*Area Deletion (Danger Zone) - Hanya muncul saat Edit Mode */}
          {isEditMode && (<DeleteDataSection isDeleting={isDeleting} onDeleting={setIsDeleting}/>)}
          
        </form>
      </div>

      {/* FOOTER: Fixed di Bawah */}
        <FormFooter 
        mode={mode}
        validationError={validationError}
        submissionError={submissionError}
        isLoading={isLoading}
        isDeleting={isDeleting}
        handlePreSubmit={handlePreSubmit}
        closePanel={closePanel}
        />

        <ConfirmModal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        mode={isDeleting?'delete':mode}
        />

        <LoadingForm isLoading={isLoading} />
    </div>
    
  );
};