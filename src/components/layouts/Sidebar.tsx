import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logoFundex from '../../assets/logo-fundex.svg';
import MonitoringLogo from '../ui/MonitoringLogo';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation(); // Hook untuk mengetahui path URL saat ini
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus = [
    { 
      name: 'Dashboard', 
      path: '/dashboard/monitoring', 
      icon: (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    // Parent Menu dengan Sub-Menu
    { 
      name: 'Pembayaran Penerbit', 
      path: '#', 
      icon: (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      subMenus: [
        { name: 'Daftar Penerbit', path: '/repayment/securities' },
        { name: 'Jadwal Pembayaran', path: '/repayment/calendar' },
        { name: 'Riwayat Pembayaran', path: '/repayment/receipts' },
      ]
    },
    // { 
    //   name: 'Monitoring Fee & Pajak', 
    //   path: '/repayment/billing', 
    //   icon: (
    //     <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    //       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    //     </svg>
    //   )
    // },
  ];

  // Efek untuk membuka submenu secara otomatis jika URL saat ini berada di bawah submenu tersebut
  useEffect(() => {
    menus.forEach((menu) => {
      if (menu.subMenus?.some((sub) => sub.path === location.pathname)) {
        setOpenMenu(menu.name);
      }
    });
  }, [location.pathname]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed); 
  };

  const handleMenuClick = (menuName: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <div 
      className={`min-h-screen flex flex-col justify-between text-white border-r border-slate-900 z-20 shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        background: 'radial-gradient(circle at bottom right, rgba(244, 63, 94, 0.20) 0%, transparent 65%), #090f26'
      }}
    >
      <div>
        {/* ========================================== */}
        {/* HEADER BRANDING SIDEBAR                    */}
        {/* ========================================== */}
        {isCollapsed ? (
          <div className="pt-6 pb-4 flex flex-col items-center gap-3.5">
            <button
              onClick={() => handleToggle()}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
              title="Perluas Menu"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h14" />
              </svg>
            </button>
            
            <h2 className="text-[11px] font-black tracking-tighter text-white text-center leading-none select-none">
              SUM<span className="text-rose-500">.</span>
            </h2>
          </div>
        ) : (
          <div className="p-6 pb-4 flex items-start justify-between gap-4">
            <MonitoringLogo  />
            <button
              onClick={() => handleToggle()}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none mt-1 shrink-0 cursor-pointer"
              title="Sembunyikan Menu"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h14" />
              </svg>
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* LIST NAVIGASI MENU                         */}
        {/* ========================================== */}
        <nav className={`mt-6 space-y-1 ${isCollapsed ? 'px-1.5' : 'px-3'}`}>
          {menus.map((menu, index) => {
            const hasSubMenus = menu.subMenus && menu.subMenus.length > 0;
            const isOpen = openMenu === menu.name;

            // Poin 2: Cek apakah salah satu sub-menu dari parent ini sedang aktif
            const isParentActive = hasSubMenus && menu.subMenus?.some((sub) => sub.path === location.pathname);

            return (
              <div key={index} className="flex flex-col">
                {/* Render Button untuk Parent yang memiliki Submenu */}
                {hasSubMenus ? (
                  <button
                    onClick={() => handleMenuClick(menu.name)}
                    className={`
                      flex items-center w-full py-2 text-sm transition-all duration-150 rounded-lg cursor-pointer
                      ${isParentActive
                        ? 'bg-white/10 text-white font-medium shadow-sm border-l-2 border-rose-500' // Garis merah jika sub-menu terpilih
                        : 'text-slate-400 font-light hover:bg-white/5 hover:text-white'}
                      ${isCollapsed ? 'justify-center px-0' : 'justify-between pr-4 pl-3.5'}
                      ${isParentActive && !isCollapsed ? 'pl-3' : ''}
                    `}
                    title={isCollapsed ? menu.name : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span className="transition-colors">{menu.icon}</span>
                      {!isCollapsed && <span className="truncate">{menu.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <svg 
                        className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                ) : (
                  /* Render NavLink normal untuk Single Menu */
                  <NavLink
                    to={menu.path}
                    className={({ isActive }) => `
                      flex items-center py-2 text-sm transition-all duration-150 rounded-lg
                      ${isActive 
                        ? 'bg-white/10 text-white font-medium shadow-sm border-l-2 border-rose-500' 
                        : 'text-slate-400 font-light hover:bg-white/5 hover:text-white'}
                      ${isCollapsed 
                        ? 'justify-center px-0' 
                        : 'gap-3 pr-4 pl-3.5'}
                      ${isActive && !isCollapsed ? 'pl-3' : ''} 
                    `}
                    title={isCollapsed ? menu.name : undefined}
                  >
                    <span className="transition-colors">{menu.icon}</span>
                    {!isCollapsed && <span className="truncate">{menu.name}</span>}
                  </NavLink>
                )}

                {/* List Sub-Menu */}
                {hasSubMenus && isOpen && !isCollapsed && (
                  <div className="mt-1 space-y-0.5 pl-9 pr-2">
                    {menu.subMenus!.map((subMenu, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={subMenu.path}
                        className={({ isActive }) => `
                          block py-1.5 px-3 text-xs transition-all duration-150 rounded-md
                          ${isActive 
                            ? 'bg-white/10 text-white font-medium shadow-sm' // Poin 1: Font Putih saat selected
                            : 'text-slate-400 font-light hover:text-white hover:bg-white/5'}
                        `}
                      >
                        {subMenu.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ========================================== */}
      {/* BOTTOM SECTION: LOGO & COPYRIGHT           */}
      {/* ========================================== */}
      <div className={`p-4 border-t border-slate-800/40 bg-slate-950/10 flex flex-col ${isCollapsed ? 'items-center justify-center' : 'px-6 py-5 gap-3.5'}`}>
        <img 
          src={logoFundex} 
          alt="Logo Fundex" 
          className={`brightness-0 invert opacity-100 transition-all duration-300 ${
            isCollapsed ? 'h-3.5 w-auto max-w-[40px]' : 'h-5.5 w-auto self-start'
          }`} 
        />
        {!isCollapsed && (
          <div className="text-[9px] font-sans text-slate-500 leading-normal tracking-wide">
            Copyright © 2026 PT Dana Investasi Bersama. All Rights Reserved.
          </div>
        )}
      </div>
    </div>
  );
}