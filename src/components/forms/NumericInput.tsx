import React, { useState, useEffect } from 'react';

type NumericValue = number | string | null | undefined;

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: NumericValue;
  onValueChange: (val: number | null) => void; // null = kosong
  hasError?: boolean;
}

const isBlank = (v: NumericValue) =>
  v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));

const formatToIndonesian = (val: NumericValue): string => {
  if (isBlank(val)) return '';          // 0 / "0" TIDAK dianggap kosong
  const [intPart, decPart] = String(val).split('.');
  const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decPart !== undefined ? `${intFmt},${decPart}` : intFmt;
};

const parseDisplay = (display: string): number | null => {
  if (display === '') return null;
  const n = parseFloat(display.replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(n) ? null : n;
};

export const NumericInput: React.FC<NumericInputProps> = ({
  value, onValueChange, hasError, className, disabled, onBlur, ...props
}) => {
  const [displayValue, setDisplayValue] = useState(() => formatToIndonesian(value));

  useEffect(() => {
    const current = parseDisplay(displayValue);
    const incoming = isBlank(value) ? null : Number(value);
    // Update layar hanya jika nilai asli berbeda (bukan sekadar beda tipe string/number)
    if (current !== incoming) setDisplayValue(formatToIndonesian(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9,]/g, '');

    const parts = raw.split(',');
    if (parts.length > 2) raw = parts[0] + ',' + parts.slice(1).join('');

    const finalParts = raw.split(',');
    finalParts[0] = finalParts[0].replace(/\./g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formatted = finalParts.join(',');

    setDisplayValue(formatted);
    onValueChange(parseDisplay(formatted)); // '' -> null, "0" -> 0
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setDisplayValue(formatToIndonesian(value)); // rapikan koma gantung, 0 tetap "0"
    onBlur?.(e);
  };

  const baseClass = "w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors";
  const errorClass = hasError ? "border-red-500 bg-red-50" : "border-slate-200";
  const disabledClass = disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white text-slate-700";

  return (
    <input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className={`${baseClass} ${errorClass} ${disabledClass} ${className || ''}`}
    />
  );
};