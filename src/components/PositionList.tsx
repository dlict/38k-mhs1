/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PositionEntry } from '../types';
import { calculateDateInterval, formatThaiDate } from '../utils/tenureCalculator';
import { ThaiDateInput } from './ThaiDateInput';
import {
  Plus,
  Trash2,
  Layers,
  Copy,
  Percent,
  Calculator,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Building,
} from 'lucide-react';

interface PositionListProps {
  positions: PositionEntry[];
  onAddPosition: () => void;
  onUpdatePosition: (id: string, updated: Partial<PositionEntry>) => void;
  onRemovePosition: (id: string) => void;
  onDuplicatePosition: (entry: PositionEntry) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const PositionList: React.FC<PositionListProps> = ({
  positions,
  onAddPosition,
  onUpdatePosition,
  onRemovePosition,
  onDuplicatePosition,
  fontSize,
}) => {
  const headingClass = fontSize === 'xlarge'
    ? 'text-2xl font-black text-slate-900'
    : fontSize === 'large'
    ? 'text-xl font-black text-slate-900'
    : 'text-lg font-black text-slate-900';

  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={headingClass}>
                ระบุช่วงเวลารับราชการในแต่ละตำแหน่ง (เริ่มวันที่ - ถึงวันที่)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                {positions.length} ช่วงตำแหน่ง
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              ระบุวันเริ่มต้นและวันสิ้นสุดของแต่ละตำแหน่ง ระบบจะคำนวณให้อัตโนมัติ (เมื่อกดเพิ่มตำแหน่งถัดไป ระบบจะดึงวันสิ้นสุดของตำแหน่งก่อนหน้ามาตั้งเป็นวันเริ่มต้นให้อัตโนมัติ)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddPosition}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all active:scale-95 text-sm sm:text-base cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ เพิ่มช่วงตำแหน่งถัดไป</span>
        </button>
      </div>

      {/* Position Cards */}
      <div className="space-y-5">
        {positions.map((pos, index) => {
          // Calculate interval directly from startDate & endDate
          const calc = calculateDateInterval(pos.startDate, pos.endDate);
          const hasDates = Boolean(pos.startDate && pos.endDate);

          return (
            <div
              key={pos.id}
              className="bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-300 shadow-sm transition-all overflow-hidden"
            >
              {/* Card Top Title Bar */}
              <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-sm">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-sm sm:text-base">
                    ช่วงเวลาที่ {index + 1}
                  </span>
                  {pos.factorPercentage !== 100 && (
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      นับ {pos.factorPercentage}% ({pos.factorPercentage === 80 ? 'เกื้อกูล 4 ใน 5' : pos.factorPercentage === 200 ? 'ทวีคูณ' : 'สัดส่วน'})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDuplicatePosition(pos)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    title="คัดลอกช่วงนี้"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {positions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemovePosition(pos.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบช่วงตำแหน่งนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {/* 1. Position Title and Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span>ชื่อตำแหน่ง / สายงาน / ระดับ</span>
                    </label>
                    <input
                      type="text"
                      value={pos.positionTitle}
                      onChange={(e) => onUpdatePosition(pos.id, { positionTitle: e.target.value })}
                      placeholder="เช่น เจ้าพนักงานธุรการปฏิบัติงาน หรือ นักวิเคราะห์นโยบายและแผน"
                      className="w-full px-3.5 py-2.5 text-sm sm:text-base font-semibold rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-slate-500" />
                      <span>หน่วยงาน / สังกัด / กรม / กอง</span>
                    </label>
                    <input
                      type="text"
                      value={pos.organization}
                      onChange={(e) => onUpdatePosition(pos.id, { organization: e.target.value })}
                      placeholder="เช่น สำนักงานปลัดกระทรวง หรือ องค์การบริหารส่วนตำบล..."
                      className="w-full px-3.5 py-2.5 text-sm sm:text-base font-semibold rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    />
                  </div>
                </div>

                {/* 2. Start Date and End Date Inputs */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <ThaiDateInput
                        label="เริ่มรับราชการในตำแหน่งนี้ (เริ่มวันที่):"
                        value={pos.startDate}
                        onChange={(newStart) => {
                          const updatedCalc = calculateDateInterval(newStart, pos.endDate);
                          onUpdatePosition(pos.id, {
                            startDate: newStart,
                            years: updatedCalc.years,
                            months: updatedCalc.months,
                            days: updatedCalc.days,
                          });
                        }}
                      />
                    </div>

                    {/* End Date */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <ThaiDateInput
                        label="ถึงวันที่ (สิ้นสุดการดำรงตำแหน่งนี้):"
                        value={pos.endDate}
                        onChange={(newEnd) => {
                          const updatedCalc = calculateDateInterval(pos.startDate, newEnd);
                          onUpdatePosition(pos.id, {
                            endDate: newEnd,
                            years: updatedCalc.years,
                            months: updatedCalc.months,
                            days: updatedCalc.days,
                          });
                        }}
                        showTodayButton={true}
                        onSetToday={() => {
                          const updatedCalc = calculateDateInterval(pos.startDate, todayISO);
                          onUpdatePosition(pos.id, {
                            endDate: todayISO,
                            years: updatedCalc.years,
                            months: updatedCalc.months,
                            days: updatedCalc.days,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. AUTOMATIC CALCULATION RESULT FOR THIS POSITION */}
                <div className="rounded-2xl p-4 border-2 transition-all bg-gradient-to-r from-indigo-50 via-sky-50 to-blue-50 border-indigo-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-600 text-white rounded-lg">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-700 block">
                          ผลการคำนวณเวลาของตำแหน่งนี้ (คำนวณจากวันที่เริ่ม ถึง วันที่สิ้นสุด)
                        </span>
                        <span className="text-xs text-slate-500">
                          {hasDates ? (
                            <span>
                              {formatThaiDate(pos.startDate)} ถึง {formatThaiDate(pos.endDate)} (นับวันหัว-ท้ายเต็มวัน)
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">กรุณาเลือกวันเริ่มต้นและวันสิ้นสุดด้านบน</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Prominent result numbers */}
                    {calc.error ? (
                      <div className="flex items-center gap-1.5 text-rose-600 text-sm font-bold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{calc.error}</span>
                      </div>
                    ) : hasDates && calc.isValid ? (
                      <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 py-2.5 rounded-xl border border-indigo-200 shadow-2xs">
                        <div className="text-center">
                          <span className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono">
                            {calc.years}
                          </span>
                          <span className="text-xs text-slate-500 block font-semibold">ปี</span>
                        </div>
                        <span className="text-slate-300 font-bold">:</span>
                        <div className="text-center">
                          <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                            {calc.months}
                          </span>
                          <span className="text-xs text-slate-500 block font-semibold">เดือน</span>
                        </div>
                        <span className="text-slate-300 font-bold">:</span>
                        <div className="text-center">
                          <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
                            {calc.days}
                          </span>
                          <span className="text-xs text-slate-500 block font-semibold">วัน</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-slate-400 bg-white/70 px-4 py-2 rounded-xl border border-dashed border-slate-300">
                        รอระบุวันที่...
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Factor (สัดส่วนการนับ) */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">สัดส่วนการนับเวลา:</span>
                    <select
                      value={pos.factorPercentage}
                      onChange={(e) =>
                        onUpdatePosition(pos.id, {
                          factorPercentage: parseInt(e.target.value, 10) || 100,
                        })
                      }
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-indigo-500"
                    >
                      <option value={100}>100% (นับเต็มเวลาปกติ)</option>
                      <option value={80}>80% (เกื้อกูล 4 ใน 5)</option>
                      <option value={50}>50% (เกื้อกูล 1 ใน 2)</option>
                      <option value={200}>200% (นับทวีคูณ ในพื้นที่พิเศษ)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Position Button */}
      <button
        type="button"
        onClick={onAddPosition}
        className="w-full py-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-2xl flex items-center justify-center gap-2 text-indigo-700 font-bold transition-all text-base group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center text-indigo-700 transition-colors">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span>+ เพิ่มช่วงเวลา/ตำแหน่งถัดไปเพื่อนำมารวม</span>
      </button>
    </div>
  );
};
