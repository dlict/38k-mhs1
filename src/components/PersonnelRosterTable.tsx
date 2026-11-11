/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SheetRecord } from '../types';
import { TARGET_SPREADSHEET_ID } from '../services/sheetsService';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  Edit,
  GraduationCap,
  Award,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

interface PersonnelRosterTableProps {
  records: SheetRecord[];
  onSelectRecord: (record: SheetRecord) => void;
  onRequestDelete: (record: SheetRecord) => void;
  onRefresh: () => void;
  onAddNewPerson: () => void;
  isLoading: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const PersonnelRosterTable: React.FC<PersonnelRosterTableProps> = ({
  records,
  onSelectRecord,
  onRequestDelete,
  onRefresh,
  onAddNewPerson,
  isLoading,
  fontSize,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'approaching' | 'pending'>('all');

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit`;

  // Compute Statistics
  const totalCount = records.length;
  const eligibleCount = records.filter(
    (r) => r.eligibilityStatus && (r.eligibilityStatus.includes('ครบกำหนด') || r.eligibilityStatus.includes('พร้อมยื่น'))
  ).length;
  const approachingCount = records.filter(
    (r) => r.eligibilityStatus && (r.eligibilityStatus.includes('ใกล้ครบ') || r.eligibilityStatus.includes('⚡'))
  ).length;

  const filtered = records.filter((r) => {
    // Search
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.fullName.toLowerCase().includes(q) ||
      r.employeeId.toLowerCase().includes(q) ||
      r.currentPosition.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Status Filter
    if (statusFilter === 'eligible') {
      return r.eligibilityStatus && (r.eligibilityStatus.includes('ครบกำหนด') || r.eligibilityStatus.includes('พร้อมยื่น'));
    }
    if (statusFilter === 'approaching') {
      return r.eligibilityStatus && (r.eligibilityStatus.includes('ใกล้ครบ') || r.eligibilityStatus.includes('⚡'));
    }
    if (statusFilter === 'pending') {
      return (
        !r.eligibilityStatus ||
        (!r.eligibilityStatus.includes('ครบกำหนด') && !r.eligibilityStatus.includes('ใกล้ครบ'))
      );
    }

    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner & Stats */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ทำเนียบบุคลากรและสถานะการครบกำหนดเลื่อนระดับ (ว 4/2568)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                รายชื่อบุคลากรทั้งหมดที่บันทึกใน Google Sheet พร้อมการแจ้งเตือนสิทธิ์ชำนาญการ / ชำนาญการพิเศษ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddNewPerson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ บันทึกบุคคลใหม่</span>
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-xl border border-slate-200 transition-colors"
              title="ดึงข้อมูลล่าสุดจาก Google Sheet"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
              title="เปิดดูใน Google Sheet ตัวจริง"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 3 Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-50/70 border-blue-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-slate-500">บุคลากรทั้งหมดที่บันทึก</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCount} คน</div>
          </div>

          <div
            onClick={() => setStatusFilter('eligible')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              statusFilter === 'eligible'
                ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> ครบกำหนดพร้อมยื่นประเมิน
            </div>
            <div className="text-2xl font-black text-emerald-800 mt-1">{eligibleCount} คน</div>
          </div>

          <div
            onClick={() => setStatusFilter('approaching')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              statusFilter === 'approaching'
                ? 'bg-amber-50/70 border-amber-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> ใกล้ครบกำหนด (&lt; ๖ เดือน)
            </div>
            <div className="text-2xl font-black text-amber-800 mt-1">{approachingCount} คน</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, รหัส, ตำแหน่ง..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs font-semibold">
          <span className="text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> กรอง:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg ${
              statusFilter === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('eligible')}
            className={`px-2.5 py-1 rounded-lg ${
              statusFilter === 'eligible' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            ครบกำหนด ({eligibleCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('approaching')}
            className={`px-2.5 py-1 rounded-lg ${
              statusFilter === 'approaching' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            ใกล้ครบ ({approachingCount})
          </button>
        </div>
      </div>

      {/* Roster Records Table */}
      <div className="overflow-x-auto">
        {records.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-base font-bold text-slate-700">ยังไม่มีรายชื่อบุคลากรที่บันทึก</p>
            <p className="text-xs text-slate-500 mt-1">
              กรอกข้อมูลคำนวณที่ฟอร์มด้านบน แล้วกด "บันทึกลง Google Sheet" ข้อมูลจะปรากฏที่นี่แบบเรียลไทม์
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            ไม่พบรายชื่อที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs">
                <th className="p-3.5 text-center w-12">ลำดับ</th>
                <th className="p-3.5">ชื่อ - นามสกุล / รหัส</th>
                <th className="p-3.5">ตำแหน่ง & สังกัด</th>
                <th className="p-3.5 text-center">วุฒิการศึกษา</th>
                <th className="p-3.5 text-center">ระดับเป้าหมาย</th>
                <th className="p-3.5 text-center font-black">เวลาราชการรวม</th>
                <th className="p-3.5 text-center">สถานะตาม ว 4/2568</th>
                <th className="p-3.5 text-center">วันที่คาดว่าครบ</th>
                <th className="p-3.5 text-center w-28">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rec, idx) => {
                const isEl =
                  rec.eligibilityStatus &&
                  (rec.eligibilityStatus.includes('ครบกำหนด') || rec.eligibilityStatus.includes('พร้อมยื่น'));
                const isAp =
                  rec.eligibilityStatus &&
                  (rec.eligibilityStatus.includes('ใกล้ครบ') || rec.eligibilityStatus.includes('⚡'));

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{rec.fullName || '-'}</div>
                      {rec.employeeId && (
                        <span className="text-[11px] text-slate-400 font-mono font-normal">
                          {rec.employeeId}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-slate-600">
                      <div className="font-semibold text-slate-800">{rec.currentPosition || '-'}</div>
                      <div className="text-slate-400">{rec.department || '-'}</div>
                    </td>
                    <td className="p-3.5 text-center text-xs text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {rec.educationLevel || 'ปริญญาตรี'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center text-xs">
                      <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <Award className="w-3 h-3" />
                        {rec.targetLevel || 'ชำนาญการ'}
                      </span>
                      {rec.promotionCase && (
                        <div className="text-[10px] text-indigo-700 font-semibold mt-1">
                          {rec.promotionCase}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-center font-black text-indigo-950 text-sm">
                      {rec.totalText || `${rec.finalYears} ปี ${rec.finalMonths} ด. ${rec.finalDays} ว.`}
                    </td>
                    <td className="p-3.5 text-center text-xs">
                      {isEl ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ครบกำหนดแล้ว
                        </span>
                      ) : isAp ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-950 border border-amber-300 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ใกล้ครบกำหนด
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          ยังไม่ครบกำหนด
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center text-xs text-slate-600 font-medium">
                      {rec.projectedDate && rec.projectedDate !== '-' ? (
                        <span className="font-semibold text-slate-800">{rec.projectedDate}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectRecord(rec)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="โหลดข้อมูลคนนี้ขึ้นมาดูหรือคำนวณต่อ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDelete(rec)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
