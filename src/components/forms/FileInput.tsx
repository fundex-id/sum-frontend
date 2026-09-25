import React, { useState } from 'react';
import { resolveS3Url } from '../../utils/url';

const colSpanClasses: Record<string, string> = {
  "1": "col-span-1",
  "2": "col-span-2",
};

// 1. Update Props khusus FileInputProps
export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hasError?: boolean;
  errorMessage?: string; // Teks error dari luar (jika ada)
  colSpan?: "1" | "2";
  oldFile?: string;
  maxSizeMb?: number; // Default 5 MB
  allowedTypes?: string[]; // Contoh: ['.pdf', '.png', '.jpg'] atau ['image/jpeg', 'application/pdf']
  onErrorValidation?: (errorMsg: string) => void; // Callback jika validasi gagal
}

export const FileInput = ({ 
  label, 
  hasError, 
  errorMessage,
  colSpan = "2", 
  oldFile, 
  maxSizeMb = 5,
  allowedTypes,
  onErrorValidation,
  onChange,
  ...props 
}: FileInputProps) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Formatting 'accept' attribute jika allowedTypes dikirim sebagai Array
  const acceptAttribute = props.accept || (allowedTypes ? allowedTypes.join(',') : undefined);

  // Helper untuk memvalidasi tipe file berdasarkan file extension / mime type
  const isValidFileType = (file: File, allowed: string[]) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    return allowed.some((type) => {
      const cleanType = type.trim().toLowerCase();
      
      // Jika format ekstensi (misal: '.pdf')
      if (cleanType.startsWith('.')) {
        return fileName.endsWith(cleanType);
      }
      // Jika format wildcard mime-type (misal: 'image/*')
      if (cleanType.endsWith('/*')) {
        const category = cleanType.split('/')[0];
        return fileType.startsWith(`${category}/`);
      }
      // Jika format mime-type penuh (misal: 'application/pdf')
      return fileType === cleanType;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setInternalError(null);

    if (file) {
      // 1. Validasi Ukuran File (MB -> Bytes)
      const maxSizeBytes = maxSizeMb * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const errorMsg = `Ukuran file melebihi batas maksimum ${maxSizeMb} MB.`;
        setInternalError(errorMsg);
        e.target.value = ''; // Reset input file
        if (onErrorValidation) onErrorValidation(errorMsg);
        return;
      }

      // 2. Validasi Tipe File
      if (allowedTypes && allowedTypes.length > 0) {
        if (!isValidFileType(file, allowedTypes)) {
          const formattedTypes = allowedTypes.join(', ');
          const errorMsg = `Tipe file tidak diizinkan. Format yang diperbolehkan: ${formattedTypes}`;
          setInternalError(errorMsg);
          e.target.value = ''; // Reset input file
          if (onErrorValidation) onErrorValidation(errorMsg);
          return;
        }
      }
    }

    // Panggil event onChange bawaan jika lulus validasi
    if (onChange) {
      onChange(e);
    }
  };

  const activeError = hasError || !!internalError || !!errorMessage;
  const displayErrorMessage = internalError || errorMessage;

  const wrapperBaseClass = "pb-4 border-b-2 rounded-lg transition-colors";
  
  const inputBaseClass = `
    w-full text-xs focus:outline-none 
    file:mr-4 file:py-2 file:px-4 
    file:rounded-lg file:border file:border-slate-300 
    file:text-[10px] file:font-semibold 
    file:bg-slate-50 file:text-slate-700 
    hover:file:bg-slate-100 
    file:transition-all file:cursor-pointer
    file:shadow-none
  `;
  
  const disabledClass = props.disabled 
    ? "text-slate-400 cursor-not-allowed file:bg-slate-50 file:border-slate-200 file:text-slate-400 file:cursor-not-allowed hover:file:bg-slate-50" 
    : "text-slate-600 cursor-pointer";

  return (
    <div className={`${colSpanClasses[colSpan] || ""} ${wrapperBaseClass} `}>

      <div className="flex flex-row gap-2">
        {label && (
          <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">
            {label}
          </label>
        )}
        <label className="text-[10px] text-slate-400">
          Maks. {maxSizeMb} MB {allowedTypes && allowedTypes.length > 0 && `(${allowedTypes.join(', ')})`}
        </label>
      </div>
      
      <input 
        type="file" 
        accept={acceptAttribute}
        className={`${inputBaseClass} ${disabledClass}`} 
        onChange={handleFileChange}
        {...props} 
      />

      {/* Helper Text Informasi Batasan File */}

      {/* Pesan Error Validasi */}
      {activeError && displayErrorMessage && (
        <p className="mt-1.5 text-[9px] font-light text-red-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {displayErrorMessage}
        </p>
      )}

      {/* Link File Sebelumnya */}
      {oldFile && (
        <div className="mt-1.5">
          <a 
            href={resolveS3Url(oldFile) ?? '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            File sebelumnya
          </a>
        </div>
      )}
    </div>
  );
};