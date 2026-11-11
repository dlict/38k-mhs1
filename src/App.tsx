/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebase';
import {
  TARGET_SPREADSHEET_ID,
  fetchSheetRecords,
  saveRecordToGoogleSheet,
  deleteRecordFromGoogleSheet,
  getLocalRecords,
  getSpreadsheetDetails,
} from './services/sheetsService';
import {
  PositionEntry,
  PersonProfile,
  CalculationResult,
  SheetRecord,
  TargetPromotionLevel,
  EducationLevel,
} from './types';
import {
  calculateTotalTenure,
  formatThaiDate,
  calculateDateInterval,
  CIRCULAR_REF,
} from './utils/tenureCalculator';
import { Navbar } from './components/Navbar';
import { PersonInfoForm } from './components/PersonInfoForm';
import { PositionList } from './components/PositionList';
import { GrandSummaryCard } from './components/GrandSummaryCard';
import { EligibilityAlertCard } from './components/EligibilityAlertCard';
import { PersonnelRosterTable } from './components/PersonnelRosterTable';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ConfirmModal } from './components/ConfirmModal';
import { PrintCertificateModal } from './components/PrintCertificateModal';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  ChevronRight,
  BookOpen,
  Award,
  Users,
  Calculator,
  PlusCircle,
} from 'lucide-react';

const INITIAL_PROFILE: PersonProfile = {
  fullName: '',
  employeeId: '',
  department: '',
  currentPosition: '',
  educationLevel: 'bachelor',
  targetLevel: 'pro',
  promotionCase: 'case1',
  remarks: '',
};

const INITIAL_POSITIONS: PositionEntry[] = [
  {
    id: 'pos-1',
    positionTitle: '',
    organization: '',
    mode: 'dates',
    startDate: '',
    endDate: '',
    years: 0,
    months: 0,
    days: 0,
    factorPercentage: 100,
  },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSheetConnected, setIsSheetConnected] = useState(false);

  // Tab: 'calculator' (คำนวณและประเมินสิทธิ์) | 'roster' (ทำเนียบบุคลากรและสถานะ ว 4/2568)
  const [activeTab, setActiveTab] = useState<'calculator' | 'roster'>('calculator');

  // Core Calculator State
  const [profile, setProfile] = useState<PersonProfile>(INITIAL_PROFILE);
  const [positions, setPositions] = useState<PositionEntry[]>(INITIAL_POSITIONS);

  // Font Size: 'normal' | 'large' | 'xlarge'
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Sheet Records & History
  const [records, setRecords] = useState<SheetRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // UI Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Confirmation Modal state for destructive/sensitive actions
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const local = getLocalRecords();
    if (local && local.length > 0) {
      setRecords(local);
    }

    const unsubscribe = initAuth(
      async (authUser, token) => {
        setUser(authUser);
        await verifyAndLoadSheet(token);
      },
      () => {
        setUser(null);
        setIsSheetConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const verifyAndLoadSheet = async (token: string) => {
    setIsLoadingRecords(true);
    try {
      await getSpreadsheetDetails(token);
      setIsSheetConnected(true);
      const sheetData = await fetchSheetRecords(token);
      setRecords(sheetData);
    } catch (err: any) {
      console.warn('Sheet sync warning:', err);
      setIsSheetConnected(false);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        await verifyAndLoadSheet(res.accessToken);
        showToast('เชื่อมต่อกับ Google Sheet เรียบร้อยแล้ว', 'success');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast(err.message || 'เข้าสู่ระบบไม่สำเร็จ', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsSheetConnected(false);
    showToast('ออกจากระบบแล้ว', 'info');
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 2. Calculation logic memoized on positions, promotionCase, and educationLevel
  const calculationResult: CalculationResult = useMemo(() => {
    return calculateTotalTenure(positions, profile.promotionCase || 'case1', profile.educationLevel);
  }, [positions, profile.promotionCase, profile.educationLevel]);

  // Handlers for Positions
  const handleAddPosition = () => {
    const newEntry: PositionEntry = {
      id: `pos-${Date.now()}`,
      positionTitle: '',
      organization: '',
      mode: 'dates',
      startDate: '',
      endDate: '',
      years: 0,
      months: 0,
      days: 0,
      factorPercentage: 100,
    };
    setPositions((prev) => [...prev, newEntry]);
  };

  const handleUpdatePosition = (id: string, updated: Partial<PositionEntry>) => {
    setPositions((prev) =>
      prev.map((pos) => (pos.id === id ? { ...pos, ...updated } : pos))
    );
  };

  const handleRemovePosition = (id: string) => {
    if (positions.length <= 1) return;
    setPositions((prev) => prev.filter((pos) => pos.id !== id));
  };

  const handleDuplicatePosition = (entry: PositionEntry) => {
    const duplicate: PositionEntry = {
      ...entry,
      id: `pos-${Date.now()}`,
      positionTitle: entry.positionTitle ? `${entry.positionTitle} (สำเนา)` : '',
    };
    setPositions((prev) => [...prev, duplicate]);
  };

  const handleStartNewPerson = () => {
    setProfile({
      fullName: '',
      employeeId: '',
      department: '',
      currentPosition: '',
      educationLevel: 'bachelor',
      targetLevel: 'pro',
      promotionCase: 'case1',
      remarks: '',
    });
    setPositions([
      {
        id: `pos-${Date.now()}`,
        positionTitle: '',
        organization: '',
        mode: 'dates',
        startDate: '',
        endDate: '',
        years: 0,
        months: 0,
        days: 0,
        factorPercentage: 100,
      },
    ]);
    setActiveTab('calculator');
    showToast('เปิดฟอร์มสำหรับบุคคลใหม่เรียบร้อย', 'info');
  };

  const handleClearForm = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'ต้องการล้างข้อมูลในฟอร์มหรือไม่?',
      message: 'ข้อมูลที่กรอกอยู่ในปัจจุบันจะถูกล้างเพื่อเริ่มต้นใหม่ (ประวัติที่เคยบันทึกใน Google Sheet จะไม่ถูกลบ)',
      confirmLabel: 'ล้างฟอร์ม',
      isDestructive: false,
      onConfirm: () => {
        handleStartNewPerson();
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 3. Save to Google Sheets (Individual Record)
  const handleSaveToSheet = async () => {
    let token = await getAccessToken();

    if (!token) {
      try {
        setIsLoggingIn(true);
        const res = await googleSignIn();
        if (res) {
          setUser(res.user);
          token = res.accessToken;
          setIsSheetConnected(true);
        } else {
          return;
        }
      } catch (err: any) {
        showToast('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อบันทึกลงชีต', 'error');
        return;
      } finally {
        setIsLoggingIn(false);
      }
    }

    if (!token) {
      showToast('ไม่พบสิทธิ์การเข้าถึง Google Sheets', 'error');
      return;
    }

    if (!profile.fullName.trim()) {
      showToast('กรุณาระบุชื่อ-นามสกุล ของผู้ปฏิบัติงานก่อนบันทึก', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const nowStr = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

      // Create positions summary text with date range and calculated result
      const positionsSummary = positions
        .map((p, idx) => {
          const title = p.positionTitle.trim() || `ตำแหน่งที่ ${idx + 1}`;
          const diff = calculateDateInterval(p.startDate, p.endDate);
          const dateRange = p.startDate && p.endDate
            ? `${formatThaiDate(p.startDate)} ถึง ${formatThaiDate(p.endDate)}`
            : 'ยังไม่ได้ระบุวันที่';
          const dur = diff.isValid
            ? `${diff.years} ปี ${diff.months} เดือน ${diff.days} วัน`
            : `${p.years} ปี ${p.months} เดือน ${p.days} วัน`;
          const factorStr = p.factorPercentage !== 100 ? ` [สัดส่วน ${p.factorPercentage}%]` : '';
          return `${idx + 1}. ${title} (${dateRange} => คำนวณได้: ${dur}${factorStr})`;
        })
        .join('\n');

      const eduLabel =
        profile.educationLevel === 'doctoral'
          ? 'ปริญญาเอก'
          : profile.educationLevel === 'master'
          ? 'ปริญญาโท'
          : profile.educationLevel === 'vocational_diploma'
          ? 'ปวส./อนุปริญญา'
          : profile.educationLevel === 'vocational_cert'
          ? 'ปวช.'
          : 'ปริญญาตรี';

      const promoCaseLabel =
        profile.promotionCase === 'case3'
          ? 'กรณีที่ ๓ (แทนผู้เกษียณ)'
          : profile.promotionCase === 'case2'
          ? 'กรณีที่ ๒ (ว่างปกติ)'
          : 'กรณีที่ ๑ (ปฏิบัติการ ➔ ชำนาญการ)';

      const targetLabel =
        profile.promotionCase === 'case1'
          ? 'ชำนาญการ (กรณีที่ ๑)'
          : profile.promotionCase === 'case2'
          ? 'ชำนาญการพิเศษ (กรณีที่ ๒ ว่างปกติ)'
          : 'ชำนาญการพิเศษ (กรณีที่ ๓ แทนผู้เกษียณ)';

      const eligibilityStatusText = calculationResult.eligibility
        ? calculationResult.eligibility.isEligible
          ? 'ครบกำหนดแล้ว (พร้อมยื่น)'
          : calculationResult.eligibility.statusType === 'approaching'
          ? 'ใกล้ครบกำหนด (ขาดอีก < ๖ ด.)'
          : `ยังไม่ครบ (ขาดอีก ${calculationResult.eligibility.remainingYears} ปี ${calculationResult.eligibility.remainingMonths} ด.)`
        : '-';

      const projectedDateText = calculationResult.eligibility
        ? calculationResult.eligibility.projectedCompletionDateThai
        : '-';

      const newRecord: SheetRecord = {
        id: `REC-${Date.now()}`,
        timestamp: nowStr,
        employeeId: profile.employeeId || '-',
        fullName: profile.fullName,
        department: profile.department || '-',
        currentPosition: profile.currentPosition || '-',
        educationLevel: eduLabel,
        targetLevel: targetLabel,
        promotionCase: promoCaseLabel,
        positionCount: positions.length,
        positionsSummary,
        positionsJson: JSON.stringify({ profile, positions }),
        finalYears: calculationResult.finalYears,
        finalMonths: calculationResult.finalMonths,
        finalDays: calculationResult.finalDays,
        totalText: calculationResult.formattedThai,
        approxTotalDays: calculationResult.approxTotalDays,
        eligibilityStatus: eligibilityStatusText,
        projectedDate: projectedDateText,
        remarks: profile.remarks || '-',
        recordedBy: user?.email || user?.displayName || 'ผู้ใช้งานระบบ',
      };

      await saveRecordToGoogleSheet(token, newRecord);

      // Refresh records list
      const updatedList = await fetchSheetRecords(token);
      setRecords(updatedList);
      showToast(`บันทึกข้อมูลและสถานะ ว 4/2568 ของ "${profile.fullName}" สำเร็จเรียบร้อย!`, 'success');
    } catch (err: any) {
      console.error('Error saving to sheet:', err);
      showToast(`บันทึกไม่สำเร็จ: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Reload from record in History Drawer or Roster Table
  const handleSelectRecordFromHistory = (rec: SheetRecord) => {
    if (rec.positionsJson) {
      try {
        const parsed = JSON.parse(rec.positionsJson);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.positions && Array.isArray(parsed.positions)) {
          setPositions(parsed.positions);
        }
        setActiveTab('calculator');
        showToast(`โหลดข้อมูลของ "${rec.fullName}" เรียบร้อยแล้ว`, 'info');
        return;
      } catch (e) {
        console.warn('JSON parse fallback:', e);
      }
    }

    setProfile((prev) => ({
      ...prev,
      fullName: rec.fullName,
      employeeId: rec.employeeId,
      department: rec.department,
      currentPosition: rec.currentPosition,
      remarks: rec.remarks,
    }));
    setActiveTab('calculator');
    showToast(`โหลดข้อมูลของ "${rec.fullName}" แล้ว`, 'info');
  };

  // 5. Delete record from Google Sheet (mandates user confirmation)
  const handleRequestDelete = (rec: SheetRecord) => {
    setConfirmConfig({
      isOpen: true,
      title: 'ยืนยันการลบข้อมูลใน Google Sheet หรือไม่?',
      message: `คุณกำลังจะลบรายการประวัติของ "${rec.fullName}" (รหัส: ${rec.id}) ออกจากตาราง Google Sheet การดำเนินการนี้ไม่สามารถยกเลิกได้`,
      confirmLabel: 'ยืนยันการลบ',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const token = await getAccessToken();
        if (!token) {
          showToast('กรุณาลงชื่อเข้าใช้ Google เพื่อลบข้อมูลในชีต', 'error');
          return;
        }

        try {
          if (rec.rowIndex) {
            await deleteRecordFromGoogleSheet(token, rec.rowIndex);
          }
          const updated = await fetchSheetRecords(token);
          setRecords(updated);
          showToast(`ลบข้อมูล "${rec.fullName}" เรียบร้อยแล้ว`, 'info');
        } catch (err: any) {
          showToast(`ลบข้อมูลไม่สำเร็จ: ${err.message}`, 'error');
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-['Sarabun',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navbar with Font Size Controls & Auth */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={records.length}
        isSheetConnected={isSheetConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Banner Explaining Feature & Circular ว 4/2568 */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform skew-x-12"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sky-100 text-xs font-black uppercase tracking-wider backdrop-blur-xs mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                ระบบคำนวณและแจ้งเตือนคุณสมบัติเลื่อนระดับ ก.ค.ศ. ว 4/2568
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                รวม ปี เดือน วัน รายบุคคล & แจ้งเตือนสิทธิ์ชำนาญการ / ชำนาญการพิเศษ
              </h2>
              <p className="text-sky-100 text-sm sm:text-base mt-1 max-w-3xl font-medium">
                คำนวณเวลาราชการแม่นยำ พร้อมตรวจสอบระยะเวลาครบกำหนดตาม {CIRCULAR_REF} บันทึกรายคนลง Google Sheet แบบเรียลไทม์
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={handleStartNewPerson}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-sm shadow-md transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ บันทึกบุคคลใหม่</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'calculator' ? 'roster' : 'calculator')}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-2xl text-sm backdrop-blur-md transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>{activeTab === 'calculator' ? `ดูทำเนียบทุกคน (${records.length})` : 'กลับสู่ฟอร์มคำนวณ'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs between Calculator & Roster Directory */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-black transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span>คำนวณและประเมินสิทธิ์ ว 4/2568</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-black transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>ทำเนียบบุคลากรและสถานะแจ้งเตือน ({records.length} คน)</span>
          </button>
        </div>

        {activeTab === 'calculator' ? (
          <>
            {/* TOP SECTION: Grand Summary Card with Giant Numbers */}
            <GrandSummaryCard
              result={calculationResult}
              profile={profile}
              positions={positions}
              onSaveToSheet={handleSaveToSheet}
              isSaving={isSaving}
              onPrintSlip={() => setIsPrintModalOpen(true)}
              fontSize={fontSize}
              isSheetConnected={isSheetConnected}
            />

            {/* ว 4/2568 CRITERIA & ALERT CARD */}
            {calculationResult.eligibility && (
              <EligibilityAlertCard
                eligibility={calculationResult.eligibility}
                educationLevel={profile.educationLevel}
                promotionCase={profile.promotionCase || 'case1'}
                onChangePromotionCase={(pCase) => {
                  const targetLvl = pCase === 'case1' ? 'pro' : 'senior_pro';
                  setProfile((prev) => ({ ...prev, promotionCase: pCase, targetLevel: targetLvl }));
                }}
                onChangeEducationLevel={(edu) => setProfile((prev) => ({ ...prev, educationLevel: edu }))}
                fontSize={fontSize}
              />
            )}

            {/* MIDDLE SECTION: Personnel Profile Form */}
            <PersonInfoForm
              profile={profile}
              onChange={(upd) => setProfile((prev) => ({ ...prev, ...upd }))}
              onClear={handleClearForm}
              fontSize={fontSize}
            />

            {/* BOTTOM SECTION: Positions & Periods List */}
            <PositionList
              positions={positions}
              onAddPosition={handleAddPosition}
              onUpdatePosition={handleUpdatePosition}
              onRemovePosition={handleRemovePosition}
              onDuplicatePosition={handleDuplicatePosition}
              fontSize={fontSize}
            />
          </>
        ) : (
          /* TAB 2: Personnel Roster & All Personnel Alerts */
          <PersonnelRosterTable
            records={records}
            onSelectRecord={handleSelectRecordFromHistory}
            onRequestDelete={handleRequestDelete}
            onRefresh={async () => {
              const token = await getAccessToken();
              if (token) {
                await verifyAndLoadSheet(token);
                showToast('รีเฟรชข้อมูลจากชีตเรียบร้อย', 'info');
              }
            }}
            onAddNewPerson={handleStartNewPerson}
            isLoading={isLoadingRecords}
            fontSize={fontSize}
          />
        )}

        {/* Help & Civil Service Guidelines Footer Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-slate-600 text-xs sm:text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>หลักเกณฑ์การคำนวณและเลื่อนระดับตำแหน่งตาม {CIRCULAR_REF}</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <strong>ระดับชำนาญการ (ประเภทวิชาการ):</strong> ดำรงตำแหน่งระดับปฏิบัติการมาแล้วไม่น้อยกว่า ๖ ปี (วุฒิปริญญาตรี), ๔ ปี (วุฒิปริญญาโท), หรือ ๒ ปี (วุฒิปริญญาเอก)
            </li>
            <li>
              <strong>ระดับชำนาญการพิเศษ (ประเภทวิชาการ):</strong> ดำรงตำแหน่งระดับชำนาญการมาแล้วไม่น้อยกว่า ๕ ปี (วุฒิปริญญาตรี) หรือ ๔ ปี (วุฒิปริญญาโท/เอก)
            </li>
            <li>
              <strong>การรวมเศษวันและเดือน:</strong> รวมเศษ ๓๐ วัน นับเป็น ๑ เดือน, รวมเศษ ๑๒ เดือน นับเป็น ๑ ปี ตามระเบียบการนับเวลาราชการ
            </li>
            <li>
              <strong>การบันทึกข้อมูล:</strong> ข้อมูลแต่ละคนจะถูกบันทึกลงใน Google Sheet ID: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{TARGET_SPREADSHEET_ID}</code> แผ่นงาน "เวลาปฏิบัติงาน" แบบเรียลไทม์
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>
          ระบบคำนวณเวลาปฏิบัติงานและแจ้งเตือนเลื่อนระดับตาม {CIRCULAR_REF} • เชื่อมต่อ Google Sheet ID: {TARGET_SPREADSHEET_ID}
        </p>
      </footer>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={records}
        isLoading={isLoadingRecords}
        onRefresh={async () => {
          const token = await getAccessToken();
          if (token) {
            await verifyAndLoadSheet(token);
            showToast('รีเฟรชข้อมูลจากชีตเรียบร้อย', 'info');
          } else {
            showToast('กรุณาลงชื่อเข้าใช้ Google ก่อนเพื่อรีเฟรชชีต', 'info');
          }
        }}
        onSelectRecord={handleSelectRecordFromHistory}
        onRequestDelete={handleRequestDelete}
      />

      {/* Print / Export Slip Modal */}
      <PrintCertificateModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={calculationResult}
        profile={profile}
        positions={positions}
      />

      {/* Confirmation Modal for Sensitive Actions */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
