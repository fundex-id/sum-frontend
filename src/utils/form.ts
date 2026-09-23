// src/common/helpers/mapDtoToFormData.ts

/**
 * Memetakan object DTO dari Form menjadi FormData siap kirim ke NestJS
 * Fungsi ini sudah otomatis mendeteksi kolom file spesifik di aplikasi
 */
export const mapDtoToFormData = (dtoPayload: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.keys(dtoPayload).forEach((key) => {
    const value = dtoPayload[key];

    // Sekarang KITA HANYA MENGABAIKAN undefined
    if (value !== undefined) {
      
      // PEMETAAN OTOMATIS: Deteksi file
      if ((key.toLowerCase().includes('url') || key.toLowerCase().includes('file') || key.toLowerCase().includes('document')) && value instanceof File) {
        formData.append(key, value);
      } 
      else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      }
      else if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      }
      else if (value === null) {
        // Eksplisit mengirim null sebagai string "null"
        formData.append(key, 'null');
      }
      else {
        // Blok ini sekarang akan menangani string kosong "", angka 0, dan teks biasa
        // FormData secara otomatis akan menjadikannya string.
        formData.append(key, value);
      }

    }
  });

  return formData;
};

export const mapDtoToFormDataOLD = (dtoPayload: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.keys(dtoPayload).forEach((key) => {
    const value = dtoPayload[key];

    // Abaikan jika null, undefined, atau string kosong
    if (value !== null && value !== undefined && value !== '') {
      
      // PEMETAAN OTOMATIS: Deteksi semua key yang mengandung kata 'Url', 'File', atau 'Document'
      // dan pastikan nilainya adalah object File mentah dari browser
      if ((key.toLowerCase().includes('url') || key.toLowerCase().includes('file')) && value instanceof File) {
        formData.append(key, value);
      } 
      else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      }
      else if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      }
      else {
        formData.append(key, value);
      }

    }
  });

  return formData;
};

  export type FormInputType = 
  | 'input' 
  | 'textarea' 
  | 'select' 
  | 'date' 
  | 'file' 
  | 'checkbox' 
  | 'array'
  | 'numeric-input'; // Diubah menjadi 'numeric-input'

/**
 * Helper untuk mengecek apakah sebuah field form kosong.
 * @param field Nilai dari input yang akan dicek
 * @param type Tipe input form (default: 'input')
 * @returns boolean true jika kosong, false jika ada isinya
 */
export const isEmptyField = (field: any, type: FormInputType = 'input'): boolean => {
  // 1. Cek nilai dasar (null / undefined) yang berlaku untuk semua tipe
  if (field === undefined || field === null) return true;

  // 2. Evaluasi spesifik berdasarkan tipe
  switch (type) {
    case 'numeric-input': // Disesuaikan menjadi 'numeric-input'
      // Dianggap belum diisi jika nilainya 0 (number) atau "0" (string)
      if (field === 0 || field === '0') return true;
      // Tangani juga jika user mengetik lalu menghapus isi input (string kosong)
      if (typeof field === 'string' && field.trim() === '') return true;
      // Opsional: Cek NaN jika form numeric sempat dikonversi secara keliru
      if (typeof field === 'number' && Number.isNaN(field)) return true;
      return false;

    case 'date':
      if (typeof field === 'string') {
        const trimmed = field.trim();
        return trimmed === '' || trimmed === 'dd/mm/yyyy' || trimmed === 'mm/dd/yyyy';
      }
      return false;

    case 'select':
      // Menangani Select yang value-nya string atau number
      if (typeof field === 'string' || typeof field === 'number') {
        const val = String(field).trim();
        // "-1" sering digunakan programmer sebagai value default "Pilih Salah Satu..."
        return val === '' || val === '-1'; 
      }
      return false;

    case 'checkbox':
      // Checkbox wajib biasanya dianggap "kosong/invalid" jika nilainya false
      return field === false;

    case 'file':
      // File native dari browser (HTML5)
      if (field instanceof FileList) return field.length === 0;
      // Array file (misal dari React Dropzone)
      if (Array.isArray(field)) return field.length === 0;
      // Jika berupa single File object (ada properti name dan size)
      if (typeof field === 'object' && field !== null && 'name' in field) return false; 
      
      // Jika lolos dari semua itu tapi tipenya file, anggap kosong untuk aman
      return true; 

    case 'array':
      // Multi-select / Tag Input
      if (Array.isArray(field)) return field.length === 0;
      return false;

    case 'textarea':
    case 'input':
    default:
      // Pengecekan standar untuk text, number, email, password, dll
      if (typeof field === 'string') return field.trim() === '';
      
      // Cek untuk object kosong {} (opsional tapi berguna)
      if (typeof field === 'object' && !Array.isArray(field)) {
        return Object.keys(field).length === 0;
      }
      
      return false;
  }
};

// src/utils/formValidation.ts

export interface FieldValidationConfig<T> {
  key: keyof T;
  label: string;
  type?: FormInputType;
  optional?: boolean; // <-- BARU: kalau true, field ini boleh kosong tanpa dianggap error
  dependencies?: FieldValidationConfig<T>[]; 
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  missingKeys: string[];
}

export const validateFormFields_OLD = <T extends Record<string, any>>(
  formData: T,
  fields: FieldValidationConfig<T>[]
): ValidationResult => {
  const missingFields: string[] = [];
  const missingKeys: string[] = [];

  fields.forEach((fieldConfig) => {
    const { key, label, type = 'input', dependencies } = fieldConfig;
    
    // Cek field parent (utama)
    const isParentEmpty = isEmptyField(formData[key], type);

    if (isParentEmpty) {
      // Jika parent kosong, catat error parent-nya saja (anaknya diabaikan)
      missingFields.push(label);
      missingKeys.push(key as string);
    } else {
      // Jika parent SUDAH TERISI, barulah kita cek field nested-nya (dependencies)
      if (dependencies && dependencies.length > 0) {
        dependencies.forEach((childConfig) => {
          const childType = childConfig.type || 'input';
          
          if (isEmptyField(formData[childConfig.key], childType)) {
            missingFields.push(childConfig.label);
            missingKeys.push(childConfig.key as string);
          }
        });
      }
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    missingKeys,
  };
};

export const validateFormFields = <T extends Record<string, any>>(
  formData: T,
  fields: FieldValidationConfig<T>[]
): ValidationResult => {
  const missingFields: string[] = [];
  const missingKeys: string[] = [];

  fields.forEach((fieldConfig) => {
    const { key, label, type = 'input', optional = false, dependencies } = fieldConfig;
    
    const isParentEmpty = isEmptyField(formData[key], type);

    if (isParentEmpty) {
      // Kalau field ini optional dan kosong, LEWATI sepenuhnya
      // (tidak dianggap error, dan dependency-nya juga tidak perlu dicek)
      if (optional) return;

      missingFields.push(label);
      missingKeys.push(key as string);
    } else {
      // Parent terisi -> cek dependencies seperti biasa
      if (dependencies && dependencies.length > 0) {
        dependencies.forEach((childConfig) => {
          const childType = childConfig.type || 'input';
          
          if (isEmptyField(formData[childConfig.key], childType)) {
            missingFields.push(childConfig.label);
            missingKeys.push(childConfig.key as string);
          }
        });
      }
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    missingKeys,
  };
};