/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TARGET_SPREADSHEET_ID } from '../services/sheetsService';
import {
  FileSpreadsheet,
  ExternalLink,
  Type,
  CheckCircle2,
  Database,
  History,
} from 'lucide-react';

interface NavbarProps {
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  onOpenHistory: () => void;
  historyCount: number;
  isSheetConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  fontSize,
  setFontSize,
  onOpenHistory,
  historyCount,
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

            {/* Direct Google Sheet Sync Status Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <div className="font-bold text-slate-800">
                  Google Sheet
                </div>
                <div className="text-emerald-700 text-[11px] font-semibold">
                  ซิงค์สดเรียลไทม์
                </div>
              </div>
            </div>
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
            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> เชื่อมต่อกับ Google Sheet โดยตรง (ไม่ต้องล็อกอิน)
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
