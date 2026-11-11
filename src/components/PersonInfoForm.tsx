/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PersonProfile } from '../types';
import { UserCircle, Building2, Briefcase, Hash, FileText, Sparkles, RotateCcw } from 'lucide-react';

interface PersonInfoFormProps {
  profile: PersonProfile;
  onChange: (updated: Partial<PersonProfile>) => void;
  onClear: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const PersonInfoForm: React.FC<PersonInfoFormProps> = ({
  profile,
  onChange,
  onClear,
  fontSize,
}) => {
  const labelClass = fontSize === 'xlarge'
    ? 'text-lg font-bold text-slate-800'
    : fontSize === 'large'
    ? 'text-base font-bold text-slate-800'
    : 'text-sm font-semibold text-slate-700';

  const inputClass = fontSize === 'xlarge'
    ? 'w-full px-4 py-3 text-lg font-medium rounded-xl border border-slate-300 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white shadow-2xs'
    : fontSize === 'large'
    ? 'w-full px-3.5 py-2.5 text-base font-medium rounded-xl border border-slate-300 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white shadow-2xs'
    : 'w-full px-3 py-2 text-sm font-medium rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all bg-white shadow-2xs';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 transition-all hover:border-slate-300">
      <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className={fontSize === 'xlarge' ? 'text-2xl font-black text-slate-900' : 'text-xl font-black text-slate-900'}>
              ข้อมูลผู้ปฏิบัติงาน / บุคลากร
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              กรอกข้อมูลจริงเพื่อคำนวณและบันทึกลง Google Sheet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
            title="ล้างข้อมูลในฟอร์ม"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างฟอร์ม</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ชื่อ-นามสกุล */}
        <div className="lg:col-span-2">
          <label className={`block mb-1.5 flex items-center gap-1.5 ${labelClass}`}>
            <UserCircle className="w-4 h-4 text-blue-600" />
            <span>ชื่อ - นามสกุล</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="เช่น นายสมคิด มั่นคง หรือ นางสาวกาญจนา มีชัย"
            className={inputClass}
          />
        </div>

        {/* เลขประจำตัว / รหัสพนักงาน */}
        <div>
          <label className={`block mb-1.5 flex items-center gap-1.5 ${labelClass}`}>
            <Hash className="w-4 h-4 text-slate-500" />
            <span>เลขประจำตัว / รหัสข้าราชการ</span>
          </label>
          <input
            type="text"
            value={profile.employeeId}
            onChange={(e) => onChange({ employeeId: e.target.value })}
            placeholder="เช่น 1209900123456 หรือ EMP-084"
            className={inputClass}
          />
        </div>

        {/* ตำแหน่งปัจจุบัน */}
        <div>
          <label className={`block mb-1.5 flex items-center gap-1.5 ${labelClass}`}>
            <Briefcase className="w-4 h-4 text-slate-500" />
            <span>ตำแหน่งปัจจุบัน</span>
          </label>
          <input
            type="text"
            value={profile.currentPosition}
            onChange={(e) => onChange({ currentPosition: e.target.value })}
            placeholder="เช่น นักจัดการงานทั่วไปชำนาญการ"
            className={inputClass}
          />
        </div>

        {/* สังกัด / ฝ่าย / สำนัก / กรม */}
        <div className="lg:col-span-2">
          <label className={`block mb-1.5 flex items-center gap-1.5 ${labelClass}`}>
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>สังกัด / หน่วยงาน / กรม / กอง</span>
          </label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) => onChange({ department: e.target.value })}
            placeholder="เช่น สำนักงานเขตพื้นที่การศึกษา / กองการเจ้าหน้าที่..."
            className={inputClass}
          />
        </div>

        {/* กรณีการเลื่อนระดับตาม ว 4/2568 (๓ กรณี) */}
        <div className="lg:col-span-3">
          <label className={`block mb-1.5 flex items-center gap-1.5 ${labelClass}`}>
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>กรณีการเลื่อนระดับตำแหน่ง (ตามเกณฑ์ ก.ค.ศ. ว 4/2568 มี ๓ กรณี)</span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            value={profile.promotionCase || 'case1'}
            onChange={(e) => {
              const pCase = e.target.value as any;
              onChange({
                promotionCase: pCase,
                targetLevel: pCase === 'case1' ? 'pro' : 'senior_pro',
              });
            }}
            className={inputClass}
          >
            <option value="case1">
              กรณีที่ ๑: ปฏิบัติการ ➔ ชำนาญการ (ป.ตรี ๖ ปี / ป.โท ๔ ปี / ป.เอก ๒ ปี)
            </option>
            <option value="case2">
              กรณีที่ ๒: ชำนาญการ ➔ ชำนาญการพิเศษ — ตำแหน่งว่างปกติ (ป.ตรี ๕ ปี / ป.โท ๔ ปี / ป.เอก ๒ ปี)
            </option>
            <option value="case3">
              กรณีที่ ๓: ชำนาญการ ➔ ชำนาญการพิเศษ — แทนผู้เกษียณอายุ (ประเมินบุคคลและผลงานล่วงหน้าได้ ๖ เดือนก่อนเกษียณ)
            </option>
          </select>
        </div>

        {/* วุฒิการศึกษา (ตาม ว 4/2568) */}
        <div>
          <label className={`block mb-1.5 flex items-center gap-1.5 ${labelClass}`}>
            <span>วุฒิการศึกษา</span>
          </label>
          <select
            value={profile.educationLevel || 'bachelor_4'}
            onChange={(e) => onChange({ educationLevel: e.target.value as any })}
            className={inputClass}
          >
            <option value="bachelor_4">
              ปริญญาตรี ๔ ปี (เกณฑ์ {profile.promotionCase === 'case1' ? '๖' : '๕'} ปี)
            </option>
            <option value="bachelor_5">
              ปริญญาตรี ๕ ปี เช่น ครุศาสตร์/ศึกษาศาสตร์ (เกณฑ์ {profile.promotionCase === 'case1' ? '๕' : '๔'} ปี)
            </option>
            <option value="bachelor_6">
              ปริญญาตรี ๖ ปี เช่น สัตวแพทย์/เภสัช (เกณฑ์ {profile.promotionCase === 'case1' ? '๔' : '๓'} ปี)
            </option>
            <option value="master">ปริญญาโท (เกณฑ์ ๔ ปี)</option>
            <option value="doctoral">ปริญญาเอก (เกณฑ์ ๒ ปี)</option>
          </select>
        </div>

        {/* หมายเหตุ / วัตถุประสงค์การนับเวลา */}
        <div className="lg:col-span-4">
          <label className={`block mb-1.5 flex items-center gap-1.5 ${labelClass}`}>
            <FileText className="w-4 h-4 text-slate-500" />
            <span>หมายเหตุ / วัตถุประสงค์การนับเวลา</span>
          </label>
          <input
            type="text"
            value={profile.remarks}
            onChange={(e) => onChange({ remarks: e.target.value })}
            placeholder="เช่น ประเมินคุณสมบัติเพื่อแต่งตั้งให้ดำรงตำแหน่งระดับชำนาญการพิเศษ ตามหนังสือ ก.ค.ศ. ว 4/2568"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
};
