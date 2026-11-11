/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalculationResult, PersonProfile, PositionEntry } from '../types';
import { formatThaiDate, calculateDateInterval } from '../utils/tenureCalculator';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';

interface PrintCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  profile: PersonProfile;
  positions: PositionEntry[];
}

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  isOpen,
  onClose,
  result,
  profile,
  positions,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayThai = formatThaiDate(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-800 text-sm">
              ตัวอย่างแบบรายงานสรุปผลการคำนวณเวลาปฏิบัติงาน
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ / บันทึก PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-['Sarabun',sans-serif] bg-white text-slate-900 print:p-0">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              เอกสารสรุปผลการคำนวณเวลาปฏิบัติงานและอายุงาน
            </h1>
            <p className="text-base font-semibold text-slate-600 mt-1">
              (สำหรับประกอบการพิจารณาเลื่อนระดับ / ประเมินคุณสมบัติ / บันทึก ก.พ.7)
            </p>
            <div className="text-xs text-slate-500 mt-2">
              วันที่คำนวณและออกเอกสาร: {todayThai}
            </div>
          </div>

          {/* Personnel Details Table */}
          <div className="my-6 bg-slate-50 rounded-xl p-4 border border-slate-200 print:bg-transparent print:border-slate-400">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
              ๑. ข้อมูลผู้ขอรับการประเมิน / ผู้ปฏิบัติงาน
            </h2>
            <div className="grid grid-cols-2 gap-y-2.5 text-sm">
              <div>
                <span className="font-bold text-slate-700">ชื่อ - นามสกุล: </span>
                <span className="font-semibold text-slate-900 text-base">
                  {profile.fullName || '-'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-700">เลขประจำตัว/รหัส: </span>
                <span className="font-mono font-bold text-slate-900">
                  {profile.employeeId || '-'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-700">ตำแหน่งปัจจุบัน: </span>
                <span className="text-slate-900">{profile.currentPosition || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">สังกัด/หน่วยงาน: </span>
                <span className="text-slate-900">{profile.department || '-'}</span>
              </div>
              {profile.remarks && (
                <div className="col-span-2 text-xs text-slate-600 pt-1">
                  <span className="font-bold text-slate-700">วัตถุประสงค์ / หมายเหตุ: </span>
                  {profile.remarks}
                </div>
              )}
            </div>
          </div>

          {/* Positions Breakdown Table */}
          <div className="my-6">
            <h2 className="text-base font-bold text-slate-800 mb-3">
              ๒. รายละเอียดการดำรงตำแหน่งและระยะเวลาที่นำมารวม (จำนวน {positions.length} รายการ)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2.5 border border-slate-300 text-center w-12">ลำดับ</th>
                    <th className="p-2.5 border border-slate-300">ตำแหน่ง / สายงาน</th>
                    <th className="p-2.5 border border-slate-300">สังกัด / หน่วยงาน</th>
                    <th className="p-2.5 border border-slate-300 text-center">ช่วงเวลา / วิธีคิด</th>
                    <th className="p-2.5 border border-slate-300 text-center">สัดส่วน</th>
                    <th className="p-2.5 border border-slate-300 text-center font-black">ระยะเวลา (ปี-ด-ว)</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, idx) => {
                    const diff = calculateDateInterval(pos.startDate, pos.endDate);
                    const y = diff.isValid ? diff.years : pos.years;
                    const m = diff.isValid ? diff.months : pos.months;
                    const d = diff.isValid ? diff.days : pos.days;

                    return (
                      <tr key={pos.id} className="border-b border-slate-200">
                        <td className="p-2.5 border border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="p-2.5 border border-slate-300 font-semibold">{pos.positionTitle || '-'}</td>
                        <td className="p-2.5 border border-slate-300 text-slate-600">{pos.organization || '-'}</td>
                        <td className="p-2.5 border border-slate-300 text-center text-xs">
                          {pos.startDate && pos.endDate ? (
                            <span>{formatThaiDate(pos.startDate)} ถึง {formatThaiDate(pos.endDate)}</span>
                          ) : (
                            <span className="text-slate-400">ยังไม่ระบุวันที่</span>
                          )}
                        </td>
                        <td className="p-2.5 border border-slate-300 text-center text-xs">
                          {pos.factorPercentage}%
                        </td>
                        <td className="p-2.5 border border-slate-300 text-center font-bold bg-slate-50">
                          {y} ปี {m} เดือน {d} วัน
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Calculation Result Highlight Box */}
          <div className="my-6 p-6 rounded-2xl bg-indigo-50/70 border-2 border-indigo-400 text-center print:border-slate-800">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-900 mb-1">
              ผลรวมเวลาปฏิบัติงานสุทธิหลังการคำนวณปัดเศษ
            </div>
            <div className="text-3xl sm:text-4xl font-black text-indigo-950 my-2">
              {result.finalYears} ปี {result.finalMonths} เดือน {result.finalDays} วัน
            </div>
            <div className="text-base font-bold text-slate-700">
              (ตัวอักษร: {result.formattedThaiNumerals})
            </div>
            <p className="text-xs text-slate-500 mt-2">
              สูตรการคำนวณตามมาตรฐาน: รวมวันเศษ ๓๐ วัน เป็น ๑ เดือน, รวมเดือนเศษ ๑๒ เดือน เป็น ๑ ปี
            </p>
          </div>

          {/* Section 3: Evaluation under ว 4/2568 */}
          {result.eligibility && (
            <div className="my-6 bg-slate-50 rounded-xl p-4 border border-slate-300 print:bg-transparent">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                ๓. ผลการตรวจสอบคุณสมบัติตามหนังสือสำนักงาน ก.ค.ศ. ที่ ศธ 0206.5/ว 4 ลงวันที่ 20 กุมภาพันธ์ 2568
              </h2>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="col-span-2">
                  <span className="font-bold text-slate-700">กรณีตามหลักเกณฑ์ ว 4/2568: </span>
                  <span className="font-semibold text-indigo-900">{result.eligibility.caseTitle}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">ระดับที่ขอรับการประเมิน: </span>
                  <span className="font-semibold text-slate-900">{result.eligibility.targetLevelName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">เกณฑ์ระยะเวลาขั้นต่ำ: </span>
                  <span className="font-semibold text-slate-900">{result.eligibility.requiredYears} ปี ({result.eligibility.educationLevelName})</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-700">ผลการประเมินคุณสมบัติด้านระยะเวลา: </span>
                  <span className={`font-black ${result.eligibility.isEligible ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {result.eligibility.statusTitle} — {result.eligibility.statusMessage}
                  </span>
                </div>
                <div className="col-span-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-600">วันที่คาดว่าจะครบกำหนด: </span>
                  {result.eligibility.projectedCompletionDateThai}
                </div>
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-sm">
            <div>
              <p className="text-slate-600">ลงชื่อ......................................................ผู้ขอประเมิน</p>
              <p className="font-bold text-slate-800 mt-1">({profile.fullName || '...................................................'})</p>
              <p className="text-xs text-slate-500 mt-1">วันที่ ...... / ...... / ..........</p>
            </div>
            <div>
              <p className="text-slate-600">ลงชื่อ......................................................ผู้ตรวจสอบ/เจ้าหน้าที่ ก.พ.</p>
              <p className="font-bold text-slate-800 mt-1">(...................................................)</p>
              <p className="text-xs text-slate-500 mt-1">ตำแหน่ง ..................................................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
