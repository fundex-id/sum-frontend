import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from '../../../../node_modules/axios/index';
import logoFundex from '../../../assets/logo-fundex.svg'
import { useAuth } from '../../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCredentialError, setIsCredentialError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const inputErrorClasses = isCredentialError
  ? 'border-rose-500 bg-rose-50/30 text-rose-900 placeholder-rose-300 focus:border-rose-600 focus:ring-rose-500/10'
  : 'border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-[#090f26] focus:ring-[#090f26]/5';

  // Validasi Form sederhana Client-side
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email wajib diisi.');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format alamat email tidak valid.');
      return false;
    }

    if (!password) {
      setError('Password wajib diisi.');
      return false;
    }

    if (password.length < 6) {
      setError('Password minimal terdiri dari 6 karakter.');
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard/monitoring');
    } catch (err: unknown) {
      
      // -- BARIS DEBUGGING (Hapus jika sudah jalan) --
      console.log("LOG ERROR LENGKAP:", err); 
      // ----------------------------------------------

      // 2. Gunakan axios.isAxiosError() untuk pengecekan yang lebih akurat
      if (axios.isAxiosError(err)) {
        
        if (err.response) {
          // A. Server berhasil merespons dengan status error (401, 400, dll)
          const status = err.response.status;
          const data = err.response.data;
          
          const rawMessage = data?.message;
          const backendMessage = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
          
          if (status === 401) {
            setError(backendMessage || 'Akses ditolak! Email atau password salah.');
            setIsCredentialError(true);
          } else if (status === 400) {
            setError(backendMessage || 'Format data yang dikirim tidak sesuai.');
            setIsCredentialError(true);
          } else if (status >= 500) {
            setError('Terjadi kendala pada server.');
          } else {
            setError(backendMessage || 'Gagal memproses permintaan Anda.');
          }
        } else if (err.request) {
          // B. Request terkirim, tapi TIDAK ADA balasan dari server (atau diblokir CORS)
          setError('Tidak ada respon dari server. Pastikan server backend menyala.');
        } else {
          // C. Kesalahan saat men-setup request di Frontend
          setError('Terjadi kesalahan pada sistem frontend.');
        }
      } else {
        // Bukan error dari Axios sama sekali (misal error di sintaks React)
        setError('Terjadi kesalahan tak terduga.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* KODE ANIMASI KUSTOM CSS (Isolated Keyframes) */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes bar-grow-1 { 0%, 100% { height: 30%; } 50% { height: 75%; } }
        @keyframes bar-grow-2 { 0%, 100% { height: 45%; } 50% { height: 90%; } }
        @keyframes bar-grow-3 { 0%, 100% { height: 20%; } 50% { height: 60%; } }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.1); }
        }
        
        .animate-scanline { animation: scanline 6s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-grid { animation: grid-move 4s linear infinite; }
        .anim-bar-1 { animation: bar-grow-1 3s ease-in-out infinite; }
        .anim-bar-2 { animation: bar-grow-2 2.5s ease-in-out infinite; }
        .anim-bar-3 { animation: bar-grow-3 3.5s ease-in-out infinite; }
        .animate-glow-red { animation: pulse-subtle 6s ease-in-out infinite; }
      `}</style>

      {/* KOLOM KIRI: Panel Animasi & Brand Identity */}
      <div 
        className="hidden md:flex md:w-1/2 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800"
        style={{
          // Poin 1 & 2: Mempertahankan bg lama sambil menambahkan sentuhan halus gradasi merah di sudut
          background: 'radial-gradient(circle at top right, rgba(125, 13, 32, 0.5) 0%, transparent 50%), #090f26'
        }}
      >
        
        {/* Dekorasi Grid & Cahaya Latar Belakang */}
        <div className="absolute inset-0 opacity-5 animate-grid" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        
        {/* Pendaran merah latar belakang yang dianimasikan secara halus */}
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-600 rounded-full blur-[130px] animate-glow-red"></div>

        {/* Top Header Logo Kelompok dengan SVG asli */}
        <div className="z-10 flex items-center gap-3">
        <img 
            src={logoFundex} 
            alt="Logo Fundex" 
            className="w-25 brightness-0 invert" // 'brightness-0 invert' bikin logo jadi putih bersih agar kontras dengan bg gelap
        />
      
        </div>

        {/* AREA ANIMASI UTAMA: Terdiri dari Identitas Baru + Monitor Dashboard */}
        <div className="z-10 flex flex-col items-center justify-center my-auto animate-float w-full">
          
          {/* Poin 1: Title "SUM.PP" besar dan Subtitle sistem di bagian atas monitor */}
          <div className="w-full max-w-md text-left mb-6 px-1">
            <h2 className="text-8xl font-black tracking-tight text-white">
              SUM<span className="text-rose-500">.</span>
            </h2>
            <p className="mt-2 text-lg font-medium text-slate-400">
              Sistem Untuk Monitoring.
            </p>
            <div className="w-10 h-0.5 bg-rose-500/60 mt-3 rounded-full"></div>
          </div>
          
          {/* Bezel / Frame Monitor */}
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0d1536]/90 p-4 shadow-2xl relative backdrop-blur-md">
            
            {/* Sinar Scanline Efek Monitor */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent animate-scanline"></div>
            </div>

            {/* Top Bar Monitor (Window Control) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 opacity-80"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 opacity-60"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 opacity-60"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-[10px] tracking-wider text-rose-400 font-mono font-bold uppercase">SISTEM MONITORING</span>
              </div>
            </div>

            {/* Isi Dashboard Monitor */}
            <div className="grid grid-cols-3 gap-3">
              
              {/* Widget 1: Grafik Arus Kas Naik Turun */}
              <div className="col-span-2 rounded-xl bg-[#060a1f] p-3 border border-slate-800 flex flex-col justify-between h-32 relative">
                <span className="text-[10px] font-bold text-slate-400 font-mono">PERTUMBUHAN PENERBIT</span>
                
                {/* Batang Grafik Bergerak */}
                <div className="flex items-end justify-between gap-2 h-16 px-2">
                  <div className="w-full bg-gradient-to-t from-cyan-500 to-blue-300 rounded-t anim-bar-1"></div>
                  <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t anim-bar-2"></div>
                  <div className="w-full bg-gradient-to-t from-cyan-700 to-blue-400 rounded-t anim-bar-3"></div>
                  <div className="w-full bg-gradient-to-t from-blue-700 to-blue-400 rounded-t anim-bar-1"></div>
                  <div className="w-full bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t anim-bar-2"></div>
                </div>
              </div>

              {/* Widget 2: Finansial Persentase Bulatan */}
              <div className="col-span-1 rounded-xl bg-[#060a1f] p-3 border border-slate-800 flex flex-col items-center justify-center text-center h-32">
                <div className="relative flex items-center justify-center">
                  {/* Lingkaran Berputar / Pulse */}
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-rose-500 animate-spin" style={{ animationDuration: '8s' }}></div>
                  <span className="absolute text-[11px] font-mono font-bold text-white"> 12%</span>
                </div>
                <span className="text-[9px] mt-2 font-semibold text-slate-500 uppercase tracking-tight">Sukuk Rate</span>
              </div>

              {/* Widget 3: Garis Tracking Arus Kas Panjang */}
              <div className="col-span-3 rounded-xl bg-[#060a1f] p-3 border border-slate-800 flex items-center justify-between h-14">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Target Distribusi</span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5">Rp 100.000.000.000,00</span>
                </div>
                {/* Mini Waveform SVG */}
                <svg className="w-24 h-8 text-rose-500" viewBox="0 0 100 30" fill="none">
                  <path d="M0 20 Q 15 5, 30 15 T 60 10 T 90 25 T 100 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0 20 Q 15 5, 30 15 T 60 10 T 90 25 T 100 5 L 100 30 L 0 30 Z" fill="currentColor" fillOpacity="0.05" />
                </svg>
              </div>

            </div>

          </div>

          {/* Kaki Dudukan Monitor */}
          <div className="w-12 h-4 bg-slate-800 border-x border-slate-700"></div>
          <div className="w-28 h-2 bg-slate-700 rounded-full shadow-md"></div>
        </div>

        {/* Bottom Copy */}
        <div className="text-[10px] font-sans text-white leading-normal tracking-wide text-center">
            Copyright © 2026 PT Dana Investasi Bersama. All Rights Reserved.
          </div>
      </div>

      {/* KOLOM KANAN: Form Login (Clean, Putih, Minimalis Modern) */}
      <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 lg:px-24 xl:px-36 bg-white shadow-inner">
        <div className="mx-auto w-full max-w-md">
          
          {/* Poin 3: Mengganti judul utama kanan dengan "Silahkan login" & memperkecil ukurannya */}
          <div className="mb-10 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-[#090f26]">
              Silahkan Login
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 leading-relaxed">
              Masukkan Email Perusahaan & Password Anda
            </p>
            <div className="w-8 h-0.5 bg-gradient-to-r from-[#090f26] to-rose-500 mt-3 rounded-full"></div>
          </div>


          {/* Form Akses */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Input Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email Perusahaan
              </label>

              <input
                type="email"
                required
                disabled={isLoading}
                placeholder="nama@fundex.id"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isCredentialError) setIsCredentialError(false); // Reset error saat user mengetik kembali
                }}
                className={`mt-2 block w-full rounded-xl border px-4 py-3.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 ${inputErrorClasses}`}
              />
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <input
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isCredentialError) setIsCredentialError(false); // Reset error saat user mengetik kembali
                }}
                className={`mt-2 block w-full rounded-xl border px-4 py-3.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 ${inputErrorClasses}`}
              />
            </div>

            {/* Notifikasi Pesan Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 animate-fadeIn">
                <svg className="h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Tombol Masuk Utama */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#090f26] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-[#121c42] focus:outline-none focus:ring-4 focus:ring-[#090f26]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Memverifikasi...</span>
                </div>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Hak Cipta */}
          <p className="mt-2 text-left text-xs font-medium text-slate-400">
            &copy; Copyright © 2026 PT Dana Investasi Bersama. <br />All Rights Reserved.
          </p>

        </div>
      </div>

    </div>
  );
}