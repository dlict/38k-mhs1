/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from 'firebase/auth';
import { TARGET_SPREADSHEET_ID } from '../services/sheetsService';
import {
  FileSpreadsheet,
  ExternalLink,
  LogOut,
  Type,
  CheckCircle2,
  AlertCircle,
  Database,
  History,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  onOpenHistory: () => void;
  historyCount: number;
  isSheetConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  fontSize,
  setFontSize,
  onOpenHistory,
  historyCount,
  isSheetConnected,
}) => {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="text-2xl font-black tracking-wider">วป</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ระบบคำนวณเวลาปฏิบัติงานและอายุงาน
                </h1>
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  รายบุคคล
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                รวม ปี เดือน วัน แต่ละตำแหน่งอย่างแม่นยำ • บันทึกลง Google Sheet
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Font Size Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
              <span className="hidden sm:inline-flex items-center px-2 text-slate-600 font-semibold gap-1">
                <Type className="w-4 h-4 text-blue-600" /> ตัวหนังสือ:
              </span>
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  fontSize === 'normal'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ขนาดปกติ"
              >
                ปกติ
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  fontSize === 'large'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ขนาดใหญ่"
              >
                ใหญ่ A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  fontSize === 'xlarge'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ขนาดใหญ่พิเศษ ชัดเจนที่สุด"
              >
                ใหญ่มาก A++
              </button>
            </div>

            {/* History Button */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-2xs transition-all hover:border-slate-400"
              title="ดูข้อมูลย้อนหลัง"
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline font-semibold">ประวัติย้อนหลัง</span>
              {historyCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Google Sheet Direct Link Button */}
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-medium shadow-2xs transition-all"
              title={`เปิด Google Sheet: ${TARGET_SPREADSHEET_ID}`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline font-semibold">เปิดชีต</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-75" />
            </a>

            {/* Google Authentication Component */}
            {user ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-9 h-9 rounded-full ring-2 ring-emerald-500/50"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="hidden xl:block text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {user.displayName || 'ผู้ใช้งาน'}
                  </div>
                  <div className="text-emerald-600 text-[11px] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    พร้อมซิงค์ชีต
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="ออกจากระบบ Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition-all active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบชีต'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Sheet Status Sub-bar */}
      <div className="bg-slate-100 border-t border-slate-200/80 px-4 py-1.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              ฐานข้อมูล Google Sheet:
            </span>
            <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-[11px] text-slate-800">
              {TARGET_SPREADSHEET_ID}
            </code>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">แผ่นงาน: "เวลาปฏิบัติงาน"</span>
          </div>

          <div className="flex items-center gap-2">
            {isSheetConnected ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ซิงค์เรียลไทม์พร้อมทำงาน
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> โหมดจัดเก็บชั่วคราว (กดเข้าสู่ระบบเพื่อบันทึกลงชีตจริง)
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
