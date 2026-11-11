/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  THAI_MONTHS_NAMES,
  parseDateComponents,
  createISODate,
  getDaysInMonth,
} from '../utils/tenureCalculator';
import { Calendar, Clock } from 'lucide-react';

interface ThaiDateInputProps {
  label: string;
  value?: string; // YYYY-MM-DD (ISO)
  onChange: (isoValue: string) => void;
  onSetToday?: () => void;
  showTodayButton?: boolean;
  minYearBE?: number;
  maxYearBE?: number;
}

export const ThaiDateInput: React.FC<ThaiDateInputProps> = ({
  label,
  value,
  onChange,
  onSetToday,
  showTodayButton = false,
  minYearBE = 2520,
  maxYearBE = 2575,
}) => {
  const currentYearBE = new Date().getFullYear() + 543;
  const comp = parseDateComponents(value);

  const selectedDay = comp?.day || 1;
  const selectedMonth = comp?.month || 10; // Default to October (start of fiscal year)
  const selectedYearBE = comp?.yearBE || currentYearBE;

  const daysCount = getDaysInMonth(selectedYearBE - 543, selectedMonth);
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  // Generate BE Years in descending order (2575 down to 2520)
  const yearsBEArray: number[] = [];
  for (let y = maxYearBE; y >= minYearBE; y--) {
    yearsBEArray.push(y);
  }

  const handleDayChange = (newDay: number) => {
    const validDay = Math.min(newDay, daysCount);
    onChange(createISODate(validDay, selectedMonth, selectedYearBE));
  };

  const handleMonthChange = (newMonth: number) => {
    const maxDaysInNewMonth = getDaysInMonth(selectedYearBE - 543, newMonth);
    const validDay = Math.min(selectedDay, maxDaysInNewMonth);
    onChange(createISODate(validDay, newMonth, selectedYearBE));
  };

  const handleYearChange = (newYearBE: number) => {
    const maxDaysInNewYear = getDaysInMonth(newYearBE - 543, selectedMonth);
    const validDay = Math.min(selectedDay, maxDaysInNewYear);
    onChange(createISODate(validDay, selectedMonth, newYearBE));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>{label}</span>
        </label>
        {showTodayButton && (
          <button
            type="button"
            onClick={onSetToday}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            title="ตั้งค่าเป็นวันปัจจุบัน"
          >
            <Clock className="w-3 h-3" />
            <span>ถึงปัจจุบัน (วันนี้)</span>
          </button>
        )}
      </div>

      {/* Selectors for Day, Month, Year (พ.ศ.) */}
      <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
        {/* Day */}
        <div className="col-span-3">
          <select
            value={value ? selectedDay : ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) handleDayChange(val);
            }}
            className="w-full px-2 py-2 text-sm sm:text-base font-bold bg-white text-slate-800 border-2 border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-center"
          >
            <option value="" disabled>วัน</option>
            {daysArray.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <span className="block text-[11px] text-center text-slate-400 font-semibold mt-0.5">วัน</span>
        </div>

        {/* Month */}
        <div className="col-span-5">
          <select
            value={value ? selectedMonth : ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) handleMonthChange(val);
            }}
            className="w-full px-2 py-2 text-sm sm:text-base font-bold bg-white text-slate-800 border-2 border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-center"
          >
            <option value="" disabled>เดือน</option>
            {THAI_MONTHS_NAMES.map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {mName}
              </option>
            ))}
          </select>
          <span className="block text-[11px] text-center text-slate-400 font-semibold mt-0.5">เดือน</span>
        </div>

        {/* Year BE */}
        <div className="col-span-4">
          <select
            value={value ? selectedYearBE : ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) handleYearChange(val);
            }}
            className="w-full px-2 py-2 text-sm sm:text-base font-bold bg-white text-indigo-950 border-2 border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-center"
          >
            <option value="" disabled>พ.ศ.</option>
            {yearsBEArray.map((yBE) => (
              <option key={yBE} value={yBE}>
                {yBE}
              </option>
            ))}
          </select>
          <span className="block text-[11px] text-center text-slate-400 font-semibold mt-0.5">ปี พ.ศ.</span>
        </div>
      </div>

      {/* Native calendar date picker hidden trigger or alternative */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5 px-0.5">
        <span>
          {value ? (
            <span className="font-bold text-indigo-900">
              {selectedDay} {THAI_MONTHS_NAMES[selectedMonth - 1]} พ.ศ. {selectedYearBE}
            </span>
          ) : (
            <span className="text-amber-700 font-medium">ยังไม่ได้เลือกวันที่</span>
          )}
        </span>
        <label className="text-slate-400 hover:text-indigo-600 cursor-pointer font-medium flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>เลือกผ่านปฏิทิน</span>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
};
