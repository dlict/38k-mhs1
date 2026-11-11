/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalculationResult, PersonProfile, PositionEntry } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Calculator,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Award,
  Sparkles,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

interface GrandSummaryCardProps {
  result: CalculationResult;
  profile: PersonProfile;
  positions: PositionEntry[];
  onSaveToSheet: () => void;
  isSaving: boolean;
  onPrintSlip: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  isSheetConnected: boolean;
}

export const GrandSummaryCard: React.FC<GrandSummaryCardProps> = ({
  result,
  profile,
  positions,
  onSaveToSheet,
  isSaving,
  onPrintSlip,
  fontSize,
  isSheetConnected,
}) => {
  // Giant number sizing
  const numberTextSize = fontSize === 'xlarge'
    ? 'text-7xl sm:text-8xl'
    : fontSize === 'large'
    ? 'text-6xl sm:text-7xl'
    : 'text-5xl sm:text-6xl';

  const labelTextSize = fontSize === 'xlarge'
    ? 'text-2xl font-black'
    : fontSize === 'large'
    ? 'text-xl font-black'
    : 'text-lg font-black';

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-3xl border-2 border-indigo-200/90 shadow-xl overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-sky-300">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block text-xs uppercase tracking-wider font-extrabold text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-800 mb-1">
                ผลการคำนวณสุทธิ • แม่นยำตามระเบียบ
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                สรุปผลรวมเวลาปฏิบัติงานรายบุคคล
              </h3>
            </div>
          </div>

          {/* Personnel Quick Info */}
          <div className="text-right bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs sm:text-sm">
            <div className="font-black text-sky-200 text-base">
              {profile.fullName.trim() || '—'}
            </div>
            <div className="text-slate-300">
              {profile.currentPosition.trim() ? profile.currentPosition : '—'} {profile.department.trim() ? `(${profile.department})` : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* ================= EXTRA LARGE SUMMARY CARDS ================= */}
        <div>
          <div className="text-center mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest">
              ผลรวมเวลาทำงานสุทธิ (รวม {positions.length} ตำแหน่ง)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Box 1: ปี (Years) */}
            <div className="bg-gradient-to-b from-blue-50 to-blue-100/60 rounded-2xl p-5 sm:p-6 border-2 border-blue-200 text-center shadow-xs transition-transform hover:scale-[1.02]">
              <span className={`block text-blue-700 mb-1 ${labelTextSize}`}>
                จำนวน ปี
              </span>
              <div className={`font-black text-blue-950 font-mono tracking-tight leading-none my-2 ${numberTextSize}`}>
                {result.finalYears}
              </div>
              <span className="inline-block px-3 py-1 bg-blue-200/70 text-blue-900 rounded-full text-xs sm:text-sm font-black">
                {result.finalYears} ปีบริบูรณ์
              </span>
            </div>

            {/* Box 2: เดือน (Months) */}
            <div className="bg-gradient-to-b from-emerald-50 to-emerald-100/60 rounded-2xl p-5 sm:p-6 border-2 border-emerald-200 text-center shadow-xs transition-transform hover:scale-[1.02]">
              <span className={`block text-emerald-700 mb-1 ${labelTextSize}`}>
                จำนวน เดือน
              </span>
              <div className={`font-black text-emerald-950 font-mono tracking-tight leading-none my-2 ${numberTextSize}`}>
                {result.finalMonths}
              </div>
              <span className="inline-block px-3 py-1 bg-emerald-200/70 text-emerald-900 rounded-full text-xs sm:text-sm font-black">
                {result.finalMonths} เดือน
              </span>
            </div>

            {/* Box 3: วัน (Days) */}
            <div className="bg-gradient-to-b from-amber-50 to-amber-100/60 rounded-2xl p-5 sm:p-6 border-2 border-amber-200 text-center shadow-xs transition-transform hover:scale-[1.02]">
              <span className={`block text-amber-700 mb-1 ${labelTextSize}`}>
                จำนวน วัน
              </span>
              <div className={`font-black text-amber-950 font-mono tracking-tight leading-none my-2 ${numberTextSize}`}>
                {result.finalDays}
              </div>
              <span className="inline-block px-3 py-1 bg-amber-200/70 text-amber-900 rounded-full text-xs sm:text-sm font-black">
                {result.finalDays} วัน
              </span>
            </div>
          </div>
        </div>

        {/* Text Verdict in Massive Font */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 text-center shadow-md">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
            สรุปข้อความทางการ
          </div>
          <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-sky-400 tracking-tight py-1">
            {result.formattedThai}
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-300 mt-1">
            (เลขไทย: {result.formattedThaiNumerals})
          </div>
          <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            คิดเป็นระยะเวลาสะสมประมาณ {result.approxTotalDays.toLocaleString()} วัน
          </div>
        </div>

        {/* Quick Alert under ว 4/2568 if available */}
        {result.eligibility && (
          <div
            className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
              result.eligibility.isEligible
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : result.eligibility.statusType === 'approaching'
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 shrink-0 text-indigo-600" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-700 block">
                  เกณฑ์ ก.ค.ศ. ว 4/2568: {result.eligibility.targetLevelName}
                </span>
                <span className="text-base font-black">
                  {result.eligibility.statusTitle}
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  {result.eligibility.statusMessage}
                </p>
              </div>
            </div>
            <div className="text-right sm:text-right shrink-0 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
              <span className="text-[11px] text-slate-500 font-bold block">วันที่คาดว่าครบกำหนด:</span>
              <span className="text-sm font-black text-indigo-900">{result.eligibility.projectedCompletionDateThai}</span>
            </div>
          </div>
        )}

        {/* ================= STEP-BY-STEP CARRY-OVER BREAKDOWN ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h4 className="font-black text-slate-900 text-base sm:text-lg">
              แจกแจงขั้นตอนการรวมและทดเวลา (ความโปร่งใส 100%)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
            {/* Step 1: รวมวัน */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>1. ขั้นตอนรวมวัน:</span>
                <span className="text-amber-600 font-bold">{result.rawDays} วัน</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                นำวันจากทุกตำแหน่งมารวมกันได้ {result.rawDays} วัน (30 วัน = 1 เดือน)
              </p>
              <div className="mt-2 text-indigo-700 font-bold text-xs bg-indigo-50 p-1.5 rounded-lg">
                ➔ ทดเป็น {result.carriedMonthsFromDays} เดือน (เหลือเศษ {result.remainingDays} วัน)
              </div>
            </div>

            {/* Step 2: รวมเดือน */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>2. ขั้นตอนรวมเดือน:</span>
                <span className="text-emerald-600 font-bold">{result.rawMonths} เดือน</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                เดือนเดิม {result.rawMonths} + ทดมาจากวัน {result.carriedMonthsFromDays} = {result.rawMonths + result.carriedMonthsFromDays} เดือน (12 เดือน = 1 ปี)
              </p>
              <div className="mt-2 text-indigo-700 font-bold text-xs bg-indigo-50 p-1.5 rounded-lg">
                ➔ ทดเป็น {result.carriedYearsFromMonths} ปี (เหลือเศษ {result.remainingMonths} เดือน)
              </div>
            </div>

            {/* Step 3: รวมปี */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>3. ขั้นตอนรวมปี:</span>
                <span className="text-blue-600 font-bold">{result.rawYears} ปี</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                ปีเดิม {result.rawYears} + ทดมาจากเดือน {result.carriedYearsFromMonths} = {result.finalYears} ปี
              </p>
              <div className="mt-2 text-emerald-700 font-bold text-xs bg-emerald-50 p-1.5 rounded-lg">
                ➔ ผลรวมสุทธิ: {result.finalYears} ปี {result.finalMonths} เดือน {result.finalDays} วัน
              </div>
            </div>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Real-time Save to Google Sheets Button */}
          <button
            type="button"
            onClick={onSaveToSheet}
            disabled={isSaving}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-lg font-black rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
            <span>
              {isSaving ? 'กำลังบันทึกลง Google Sheet...' : 'บันทึกลง Google Sheet แบบเรียลไทม์'}
            </span>
          </button>

          {/* Print Certificate / Slip Button */}
          <button
            type="button"
            onClick={onPrintSlip}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold rounded-2xl text-base shadow-xs hover:border-slate-400 transition-all cursor-pointer"
          >
            <Printer className="w-5 h-5 text-indigo-600" />
            <span>พิมพ์รายงานสรุปผล</span>
          </button>
        </div>
      </div>
    </div>
  );
};
