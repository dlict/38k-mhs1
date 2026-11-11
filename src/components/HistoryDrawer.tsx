/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SheetRecord } from '../types';
import { TARGET_SPREADSHEET_ID } from '../services/sheetsService';
import {
  X,
  History,
  Search,
  RefreshCw,
  ExternalLink,
  Download,
  Trash2,
  Calendar,
  User,
  Briefcase,
  Building,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: SheetRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectRecord: (record: SheetRecord) => void;
  onRequestDelete: (record: SheetRecord) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  isLoading,
  onRefresh,
  onSelectRecord,
  onRequestDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRecords = records.filter((r) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.employeeId.toLowerCase().includes(q) ||
      r.currentPosition.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.totalText.toLowerCase().includes(q)
    );
  });

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                ประวัติข้อมูลเวลาปฏิบัติงาน
              </h3>
              <p className="text-xs text-slate-500">
                ข้อมูลบันทึกใน Google Sheet ({TARGET_SPREADSHEET_ID.slice(0, 8)}...)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-xl border border-slate-200 transition-colors"
              title="ดึงข้อมูลล่าสุดจากชีต"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
              title="เปิด Google Sheet ตัวจริง"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตามชื่อ-สกุล, รหัส, ตำแหน่ง หรือสังกัด..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        </div>

        {/* Record List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && records.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
              <p className="text-sm font-semibold">กำลังเชื่อมต่อและดึงข้อมูลจาก Google Sheet...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-base font-bold text-slate-700">ไม่พบประวัติข้อมูล</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา' : 'ยังไม่มีการบันทึกข้อมูลเวลาปฏิบัติงานในชีตนี้'}
              </p>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isExpanded = expandedId === rec.id;
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-base">
                          {rec.fullName || 'ไม่ระบุชื่อ'}
                        </span>
                        {rec.employeeId && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                            {rec.employeeId}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                        {rec.currentPosition && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span>{rec.currentPosition}</span>
                          </div>
                        )}
                        {rec.department && (
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{rec.department}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>บันทึกเมื่อ: {rec.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Result Badge */}
                    <div className="text-right">
                      <div className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                        {rec.totalText || `${rec.finalYears} ปี ${rec.finalMonths} ด. ${rec.finalDays} ว.`}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        รวม {rec.positionCount} ตำแหน่ง
                      </span>
                    </div>
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                      className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <span>ซ่อนรายละเอียด</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>ดูรายละเอียดตำแหน่ง</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectRecord(rec);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition-colors cursor-pointer"
                        title="นำข้อมูลนี้ไปใส่ในฟอร์มเพื่อคำนวณต่อหรือแก้ไข"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>โหลดกลับมาคำนวณ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRequestDelete(rec)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                      <div className="font-bold text-slate-800">รายละเอียดแต่ละตำแหน่ง:</div>
                      <p className="whitespace-pre-line text-slate-600 leading-relaxed font-sans">
                        {rec.positionsSummary || 'ไม่มีรายละเอียดเพิ่มเติม'}
                      </p>
                      {rec.remarks && (
                        <div className="pt-2 border-t border-slate-200/80 text-slate-500">
                          <span className="font-semibold text-slate-700">หมายเหตุ:</span> {rec.remarks}
                        </div>
                      )}
                      {rec.recordedBy && (
                        <div className="text-[11px] text-slate-400">
                          ผู้บันทึก: {rec.recordedBy}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>รวมทั้งหมด {records.length} รายการในฐานข้อมูล</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
