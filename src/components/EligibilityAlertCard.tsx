/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PromotionEligibility,
  EducationLevel,
  PromotionCase,
} from '../types';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  GraduationCap,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CalendarClock,
  Sparkles,
} from 'lucide-react';

interface EligibilityAlertCardProps {
  eligibility: PromotionEligibility;
  educationLevel: EducationLevel;
  promotionCase: PromotionCase;
  onChangePromotionCase: (pCase: PromotionCase) => void;
  onChangeEducationLevel: (edu: EducationLevel) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const EligibilityAlertCard: React.FC<EligibilityAlertCardProps> = ({
  eligibility,
  educationLevel,
  promotionCase,
  onChangePromotionCase,
  onChangeEducationLevel,
  fontSize,
}) => {
  const [showChecklist, setShowChecklist] = React.useState(false);

  const titleSize = fontSize === 'xlarge'
    ? 'text-3xl font-black'
    : fontSize === 'large'
    ? 'text-2xl font-black'
    : 'text-xl font-black';

  const badgeSize = fontSize === 'xlarge'
    ? 'text-2xl sm:text-3xl font-black'
    : fontSize === 'large'
    ? 'text-xl sm:text-2xl font-black'
    : 'text-lg sm:text-xl font-bold';

  const isEligible = eligibility.isEligible;
  const isApproaching = eligibility.statusType === 'approaching';

  return (
    <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-md overflow-hidden transition-all">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/20 backdrop-blur-md rounded-2xl border border-indigo-400/30 text-amber-300">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                  เกณฑ์ ก.ค.ศ. ว 4/2568
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  หนังสือสำนักงาน ก.ค.ศ. ที่ ศธ 0206.5/ว 4 ลงวันที่ 20 กุมภาพันธ์ 2568
                </span>
              </div>
              <h3 className={`${titleSize} text-white tracking-tight mt-1`}>
                ระบบตรวจสอบระยะเวลาและแจ้งเตือนการเลื่อนระดับ (๓ กรณี)
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* ================= 3 PROMOTION CASES BUTTON SELECTOR ================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>เลือกกรณีการเลื่อนระดับตำแหน่ง (ตามเกณฑ์ ก.ค.ศ. ว 4/2568 มี ๓ กรณี):</span>
            </label>
            <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              กำลังเลือก: {eligibility.caseBadgeText}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {/* Button 1: กรณีที่ ๑ */}
            <button
              type="button"
              onClick={() => onChangePromotionCase('case1')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden active:scale-98 ${
                promotionCase === 'case1'
                  ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    promotionCase === 'case1'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  กรณีที่ ๑
                </span>
                <span className="text-xs font-bold text-blue-700">ปฏิบัติการ ➔ ชำนาญการ</span>
              </div>
              <div className="font-black text-slate-900 text-base leading-snug">
                เลื่อนเป็น "ระดับชำนาญการ"
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ผู้ดำรงตำแหน่งระดับปฏิบัติการ เลื่อนขึ้นระดับชำนาญการ (เกณฑ์ ป.ตรี ๖ ปี / ป.โท ๔ ปี / ป.เอก ๒ ปี)
              </p>
            </button>

            {/* Button 2: กรณีที่ ๒ */}
            <button
              type="button"
              onClick={() => onChangePromotionCase('case2')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden active:scale-98 ${
                promotionCase === 'case2'
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    promotionCase === 'case2'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  กรณีที่ ๒
                </span>
                <span className="text-xs font-bold text-indigo-700">ชำนาญการ ➔ ชำนาญการพิเศษ</span>
              </div>
              <div className="font-black text-slate-900 text-base leading-snug">
                ชำนาญการพิเศษ (ตำแหน่งว่างปกติ)
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                เลื่อนขึ้นสู่ระดับชำนาญการพิเศษ ในกรอบอัตราตำแหน่งว่างปกติที่มีอยู่เดิม (เกณฑ์ ป.ตรี ๕ ปี / ป.โท ๔ ปี)
              </p>
            </button>

            {/* Button 3: กรณีที่ ๓ */}
            <button
              type="button"
              onClick={() => onChangePromotionCase('case3')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden active:scale-98 ${
                promotionCase === 'case3'
                  ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    promotionCase === 'case3'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  กรณีที่ ๓ (แทนผู้เกษียณ)
                </span>
                <span className="text-xs font-bold text-amber-700">ประเมินล่วงหน้าได้ ๖ ด.</span>
              </div>
              <div className="font-black text-slate-900 text-base leading-snug">
                ชำนาญการพิเศษ (แทนผู้เกษียณอายุ)
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                เลื่อนในตำแหน่งที่ผู้ครองเดิมจะเกษียณอายุ <strong className="text-amber-800">ประเมินล่วงหน้าได้ไม่เกิน ๖ เดือน</strong> (แต่งตั้งมีผล ๑ ต.ค.)
              </p>
            </button>
          </div>
        </div>

        {/* Education Level Selector */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>วุฒิการศึกษาที่ใช้ (มีผลต่อเกณฑ์ระยะเวลาตาม ว 4/2568):</span>
            </label>
            <p className="text-xs text-slate-500">
              เกณฑ์ระยะเวลาขั้นต่ำสำหรับ {eligibility.caseBadgeText} ตามวุฒิการศึกษานี้คือ:{' '}
              <strong className="text-indigo-800">{eligibility.requiredYears} ปีบริบูรณ์</strong>
            </p>
          </div>

          <div className="w-full md:w-96">
            <select
              value={educationLevel === 'bachelor' ? 'bachelor_4' : educationLevel}
              onChange={(e) => onChangeEducationLevel(e.target.value as EducationLevel)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm sm:text-base font-bold text-slate-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="bachelor_4">
                ปริญญาตรี ๔ ปี — {promotionCase === 'case1' ? 'เกณฑ์ ๖ ปี' : 'เกณฑ์ ๕ ปี'}
              </option>
              <option value="bachelor_5">
                ปริญญาตรี ๕ ปี (ครุศาสตร์/ศึกษาศาสตร์) — {promotionCase === 'case1' ? 'เกณฑ์ ๕ ปี' : 'เกณฑ์ ๔ ปี'}
              </option>
              <option value="bachelor_6">
                ปริญญาตรี ๖ ปี (สัตวแพทย์/เภสัช) — {promotionCase === 'case1' ? 'เกณฑ์ ๔ ปี' : 'เกณฑ์ ๓ ปี'}
              </option>
              <option value="master">
                ปริญญาโท (ป.โท) — เกณฑ์ครองตำแหน่ง ๔ ปี
              </option>
              <option value="doctoral">
                ปริญญาเอก (ป.เอก) — เกณฑ์ครองตำแหน่ง ๒ ปี
              </option>
            </select>
          </div>
        </div>

        {/* ================= PRIMARY ALERT BANNER ================= */}
        <div
          className={`rounded-2xl p-5 sm:p-6 border-2 transition-all shadow-sm ${
            isEligible
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-400'
              : isApproaching
              ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-amber-400'
              : 'bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 border-sky-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div
                className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                  isEligible
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : isApproaching
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                }`}
              >
                {isEligible ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : isApproaching ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <Clock className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      isEligible
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isApproaching
                        ? 'bg-amber-200 text-amber-950 border border-amber-400 animate-pulse'
                        : 'bg-slate-200 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {isEligible ? 'สิทธิการเลื่อนระดับ: พร้อมยื่นประเมิน' : isApproaching ? 'แจ้งเตือน: ใกล้ครบกำหนด' : 'สถานะ: อยู่ระหว่างสะสมระยะเวลา'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {eligibility.caseBadgeText}
                  </span>
                </div>

                <h4
                  className={`${badgeSize} ${
                    isEligible
                      ? 'text-emerald-950'
                      : isApproaching
                      ? 'text-amber-950'
                      : 'text-slate-900'
                  }`}
                >
                  {eligibility.statusTitle}
                </h4>
                <p className="text-sm sm:text-base text-slate-700 font-medium mt-1 leading-relaxed">
                  {eligibility.statusMessage}
                </p>
                {promotionCase === 'case3' && (
                  <div className="mt-2 text-xs font-bold text-amber-900 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 inline-flex">
                    <CalendarClock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      สิทธิ์กรณีที่ ๓: สามารถประเมินบุคคลและผลงานล่วงหน้าได้ไม่เกิน ๖ เดือน ก่อนผู้เดิมพ้นจากราชการ (มีผล ๑ ต.ค.)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Days calculation badge */}
            <div className="text-right sm:text-right w-full sm:w-auto shrink-0 bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-bold">
                วันที่คาดว่าจะครบกำหนด:
              </div>
              <div className="text-base sm:text-lg font-black text-indigo-900 mt-0.5">
                {eligibility.projectedCompletionDateThai}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                เกณฑ์เวลาขั้นต่ำ: {eligibility.requiredYears} ปี ({eligibility.educationLevelName})
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>ความคืบหน้าระยะเวลาครองตำแหน่ง ({eligibility.progressPercentage}%)</span>
              <span>เป้าหมาย {eligibility.requiredYears} ปีบริบูรณ์</span>
            </div>
            <div className="w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isEligible
                    ? 'bg-emerald-500 shadow-sm'
                    : isApproaching
                    ? 'bg-amber-500 shadow-sm'
                    : 'bg-indigo-600 shadow-sm'
                }`}
                style={{ width: `${eligibility.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Circular Guidelines Accordion */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
          <button
            type="button"
            onClick={() => setShowChecklist(!showChecklist)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>
                รายละเอียดเงื่อนไขและเอกสารที่ต้องเตรียมยื่นประเมิน ({eligibility.caseBadgeText})
              </span>
            </div>
            {showChecklist ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showChecklist && (
            <div className="p-4 pt-1 bg-white border-t border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">
                {eligibility.caseTitle}
              </p>
              <p className="text-slate-600 text-xs leading-relaxed">
                {eligibility.caseDescription}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                {eligibility.checklistNotes.map((note, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-slate-400 text-[11px] pt-2 border-t border-slate-100">
                * ตามหนังสือสำนักงาน ก.ค.ศ. ที่ ศธ 0206.5/ว 4 ลงวันที่ 20 กุมภาพันธ์ 2568
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
