// src/pages/repayment/ScheduleCalendarPage.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBreadcrumb } from '../../../../contexts/BreadcrumbContext';
import { RepaymentScheduleCalendar } from '../dtos/repayment-schedule.dto';
import { InvoiceStatus, ScheduleType } from '../types/repayment-schedule.enum';
import { repaymentScheduleService } from '../services/repaymentScheduleService';

// --- HELPER UNTUK MENDAPATKAN TANGGAL LOKAL (YYYY-MM-DD) ---
const getLocalStringDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ScheduleCalendarPage() {
  const [schedules, setSchedules] = useState<RepaymentScheduleCalendar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 1. STATE BARU: Menahan tampilan kalender sampai scroll selesai agar tidak ada efek loncat
  const [isPositioning, setIsPositioning] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);

  const { setBreadcrumbs } = useBreadcrumb();
  const todayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Tanggal Hari Ini (Lokal)
  const todayString = getLocalStringDate(new Date());

  const scrollToToday = useCallback((isSmooth: boolean = false) => {
    if (todayRef.current && containerRef.current) {
      const container = containerRef.current;
      const todayElement = todayRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const todayRect = todayElement.getBoundingClientRect();
      
      const targetScroll = container.scrollTop + (todayRect.top - containerRect.top) - 85;
      
      container.scrollTo({
        top: targetScroll > 0 ? targetScroll : 0,
        // Gunakan auto jika false (saat loading awal), smooth jika true (saat tombol diklik)
        behavior: isSmooth ? 'smooth' : 'auto' 
      });
    }
  }, []);

  const fetchRepaymentSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // isPositioning di-set ke true setiap kali mulai fetch data baru
      setIsPositioning(true); 

      // Fetch data dari API Backend via Service
      const res = await repaymentScheduleService.getRepaymentSchedulesCalendar({
        startMonth: -2,
        endMonth: 10,
      });

    //   // Handle pembungkus ApiResponse ({ statusCode, message, data })
    //   const res = Array.isArray(response)
    //     ? response
    //     : response?.data || [];

    //   setSchedules(res);

      setSchedules(res.data.items || []);
      return res.data.items || [];

      
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Gagal Memuat data Calendar';
        setError(errorMessage);
        setIsPositioning(false); // Matikan effect jika error
        return null;
    } 
  }, []);


  useEffect(() => {
    const fetchCalendar = async () => {
        try {
            const [schedulesRes] = await Promise.all([
                fetchRepaymentSchedules()]
            );
        
            if (schedulesRes){
                setBreadcrumbs([
                    { label: 'DASHBOARD', path: '/dashboard/monitoring' },
                    { label: 'REPAYMENT CALENDAR', path: '/dashboard/repayment/calendar' },
                  ]);
            }

        } catch (err: any) {
        // Error handling API sudah ditangani di masing-masing try-catch callback
        console.error("Gagal memuat data calendar:", err);
        } finally {
        setLoading(false); // Matikan loading global setelah SEMUA request selesai
        }
    };
    
    fetchCalendar();

  }, [fetchRepaymentSchedules]);


  useEffect(() => {
    if (!loading && schedules.length > 0) {
      const timer = setTimeout(() => {
        // 1. Melakukan scroll secara INSTAN tanpa animasi
        scrollToToday(false); 
        
        // 2. Beri jeda sesaat agar browser selesai me-render (paint) posisi baru,
        // lalu buka tirai (tampilkan kalender)
        setTimeout(() => {
          setIsPositioning(false);
        }, 50);

      }, 100);
      return () => clearTimeout(timer);
    } else if (!loading && schedules.length === 0) {
      setIsPositioning(false);
    }
  }, [loading, schedules, scrollToToday]);
  

  // --- LOGIC GENERATE CALENDAR MONTHS SECARA DINAMIS (START DATE s/d END DATE) ---
  const calendarMonths = useMemo(() => {
    const now = new Date();

    if (schedules.length === 0) {
      const year = now.getFullYear();
      const month = now.getMonth();
      // Perhitungan firstDayOfWeek saat empty state
      const firstDayRaw = new Date(year, month, 1).getDay();
      const adjustedFirstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

      return [{
        id: `${year}-${month}`,
        name: now.toLocaleString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase(),
        year,
        month,
        daysInMonth: new Date(year, month + 1, 0).getDate(),
        firstDayOfWeek: adjustedFirstDay
      }];
    }

    const validDates = schedules
      .map(s => s.scheduleDate ? new Date(s.scheduleDate) : null)
      .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

    if (validDates.length === 0) {
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDayRaw = new Date(year, month, 1).getDay();
      return [{
        id: `${year}-${month}`,
        name: now.toLocaleString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase(),
        year,
        month,
        daysInMonth: new Date(year, month + 1, 0).getDate(),
        firstDayOfWeek: firstDayRaw === 0 ? 6 : firstDayRaw - 1
      }];
    }

    const minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));

    const startYear = Math.min(minDate.getFullYear(), now.getFullYear());
    const startMonth = minDate.getFullYear() < now.getFullYear() 
      ? minDate.getMonth() 
      : Math.min(minDate.getMonth(), now.getMonth());

    const endYear = Math.max(maxDate.getFullYear(), now.getFullYear());
    const endMonth = maxDate.getFullYear() > now.getFullYear() 
      ? maxDate.getMonth() 
      : Math.max(maxDate.getMonth(), now.getMonth());

    const months = [];
    let currYear = startYear;
    let currMonth = startMonth;

    while (currYear < endYear || (currYear === endYear && currMonth <= endMonth)) {
      const iterDate = new Date(currYear, currMonth, 1);
      const daysInMonth = new Date(currYear, currMonth + 1, 0).getDate();
      
      // 2. LOGIKA MONDAY FIRST: 
      // getDay() bawaan js: 0 = Min, 1 = Sen, ... 6 = Sab
      // Kita ubah: 0 = Sen, 1 = Sel, ... 6 = Min
      const firstDayOfWeekRaw = iterDate.getDay();
      const firstDayOfWeek = firstDayOfWeekRaw === 0 ? 6 : firstDayOfWeekRaw - 1;

      months.push({
        id: `${currYear}-${currMonth}`,
        name: iterDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase(),
        year: currYear,
        month: currMonth,
        daysInMonth,
        firstDayOfWeek
      });

      currMonth++;
      if (currMonth > 11) {
        currMonth = 0;
        currYear++;
      }
    }

    return months;
  }, [schedules]);

  const getStatusColor = (statusVal?: InvoiceStatus | null | '') => {
    if (!statusVal) return 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'; 
    const styles: Record<string, string> = {
      DRAFT: 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400', 
      UNPAID: 'bg-amber-50 text-amber-700 border-amber-300 hover:border-amber-400', 
      PARTIAL: 'bg-lime-50 text-lime-700 border-lime-400 hover:border-lime-500', 
      PAID: 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-400', 
      OVERDUE: 'bg-rose-50 text-rose-700 border-rose-300 hover:border-rose-400', 
      VOID: 'bg-zinc-100 text-zinc-500 border-zinc-400 hover:border-zinc-500', 
      WRITE_OFF: 'bg-slate-200 text-slate-800 border-slate-500 hover:border-slate-600', 
    };
    return styles[statusVal] || 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300';
  };

  const formatScheduleType = (type: string | null | undefined, seq: number) => {
    if (!type) return '';
    const capitalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    return `${capitalized} ${seq}`;
  };

  // 2. FORMAT HARI: Senin menjadi paling depan
  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="mt-12 w-full p-4 flex flex-col h-[calc(100vh-80px)] relative">
      {/* HEADER SECTION */}
      <div className="ml-2 flex-shrink-0">
        <div className="flex flex-col justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">KALENDER PEMBAYARAN PENERBIT</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Pantau estimasi dan jatuh tempo jadwal repayment seluruh penerbit</p>
        </div>
      </div>

      {/* ERROR HANDLER */}
      {error && (
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-sm text-rose-600 font-medium mb-4 flex items-center justify-center flex-shrink-0">
          ⚠️ {error}
        </div>
      )}

      {/* OVERLAY SKELETON / LOADER (Berjalan saat fetching data ATAU saat sedang proses background-scroll) */}
      {(loading || isPositioning) && !error && (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm z-30">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="text-sm font-medium text-slate-400 animate-pulse">
              {loading ? 'Memuat kalender jadwal...' : 'Menyesuaikan tampilan kalender...'}
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR CONTAINER WRAPPER */}
      {/* 1. VISUAL REVEAL: Menggunakan kondisi opacity-0 saat isPositioning masih true */}
      {!error && (
        <div className={`flex-1 absolute top-[80px] bottom-4 left-4 right-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white flex flex-col transition-opacity duration-500 ease-in-out ${
          (loading || isPositioning) ? 'opacity-0 pointer-events-none' : 'opacity-100 z-10'
        }`}>
          
          {/* FLOATING ABSOLUTE BUTTON */}
          <button
            type="button"
            onClick={() => scrollToToday(true)}
            className="absolute top-2 right-4 z-20 flex items-center gap-1.5 text-[11px] font-semibold text-yellow-700 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer backdrop-blur-sm"
          >
            <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Kembali ke Tanggal Saat Ini</span>
          </button>

          {/* SCROLLABLE CALENDAR AREA */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-12"
          >
            {calendarMonths.map((monthData, monthIndex) => {
              const emptyDays = Array.from({ length: monthData.firstDayOfWeek }, (_, i) => i);
              const days = Array.from({ length: monthData.daysInMonth }, (_, i) => i + 1);

              return (
                <div key={monthData.id} className="flex flex-col relative">
                  
                  {/* 3. STICKY HEADER BULAN & HARI DISATUKAN */}
                  <div className={`sticky top-0 bg-white z-10 border-b border-slate-100 shadow-sm -mx-4 px-4 pb-2 mb-3 ${monthIndex === 0 ? 'pt-5' : 'pt-4'}`}>
                    
                    {/* Baris Nama Bulan */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100/60">
                      <h2 className="text-sm font-extrabold text-slate-500 tracking-wide">
                        {monthData.name}
                      </h2>
                    </div>
                    
                    {/* Baris Header Nama Hari */}
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day) => (
                        <div key={day} className="text-center text-[9px] font-bold text-slate-400 uppercase">
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grid Tanggal */}
                  <div className="grid grid-cols-7 gap-2">
                    {emptyDays.map((emptyIdx) => (
                      <div key={`empty-${emptyIdx}`} className="min-h-[100px] bg-slate-50/30 rounded-lg border border-slate-50 opacity-50" />
                    ))}

                    {days.map((day) => {
                      const cellDateStr = `${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isToday = cellDateStr === todayString;
                      const isPast = cellDateStr < todayString;
                      
                      const daySchedules = schedules.filter(s => s.scheduleDate === cellDateStr);

                      return (
                        <div 
                          key={day}
                          ref={isToday ? todayRef : null}
                          className={`min-h-[100px] flex flex-col p-1.5 rounded-lg border transition-all ${
                            isToday 
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 shadow-sm' 
                              : isPast
                                ? 'border-slate-200 bg-slate-100/90'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            {/* BULATAN NOMOR TANGGAL */}
                            <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                              isToday 
                                ? 'bg-rose-600 text-white' 
                                : 'bg-transparent text-slate-600 border border-slate-300'
                            }`}>
                              {day}
                            </span>
                            
                            {daySchedules.length > 0 && (
                              <span className="text-[9px] font-semibold text-slate-400">
                                {daySchedules.length} Jadwal
                              </span>
                            )}
                          </div>

                          {/* RENDER JADWAL DARI API */}
                          <div className="flex flex-col gap-1.5">
                            {daySchedules.map((schedule) => {
                              const colorClass = getStatusColor(schedule.invoiceStatus);
                              return (
                                <Link 
                                  key={schedule.id}
                                  target="_blank"
                                  to={`/repayment/securities/${schedule.repaymentSecurityId}/schedules/${schedule.id}`} 
                                  className={`flex flex-col p-1.5 border rounded-md cursor-pointer transition-colors ${colorClass} ${isPast && schedule.invoiceStatus === InvoiceStatus.PAID ? 'opacity-70' : ''}`}
                                  title={`Invoice Status: ${schedule.invoiceStatus || 'UNKNOWN'}`}
                                >
                                  <span className="text-[11px] font-bold leading-tight truncate">
                                    {schedule.securityCode}
                                  </span>

                                  <span className="text-[9px] mt-0.5 leading-tight truncate opacity-80">
                                    {schedule.investeeName}
                                  </span>
                                  
                                  <span className="text-[8px] mt-1 font-semibold opacity-70 italic truncate">
                                    {formatScheduleType(schedule.scheduleType, schedule.scheduleSequence)}
                                  </span>

                                  <div className="mt-1">
                                    <span className="text-[7.5px] font-extrabold tracking-wider uppercase px-1 py-0.5 rounded border border-current opacity-90 inline-block leading-none">
                                      {schedule.invoiceStatus || 'N/A'}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}