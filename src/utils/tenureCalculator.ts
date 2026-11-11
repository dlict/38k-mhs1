/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PositionEntry,
  CalculationResult,
  EducationLevel,
  TargetPromotionLevel,
  PromotionCase,
  PromotionEligibility,
} from '../types';

export const CIRCULAR_REF = 'หนังสือสำนักงาน ก.ค.ศ. ที่ ศธ 0206.5/ว 4 ลงวันที่ 20 กุมภาพันธ์ 2568';

export const THAI_MONTHS_NAMES = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

/**
 * คืนจำนวนวันในเดือนของปี ค.ศ.
 */
export function getDaysInMonth(yearCE: number, month: number): number {
  return new Date(yearCE, month, 0).getDate();
}

/**
 * แยก วัน เดือน ปี (ค.ศ. และ พ.ศ.) จาก ISO string "YYYY-MM-DD"
 */
export function parseDateComponents(dateStr?: string): { day: number; month: number; yearCE: number; yearBE: number } | null {
  if (!dateStr || !dateStr.includes('-')) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const yearCE = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(yearCE) || isNaN(month) || isNaN(day)) return null;
  return {
    day,
    month,
    yearCE,
    yearBE: yearCE + 543,
  };
}

/**
 * รวม วัน เดือน ปี พ.ศ. ให้เป็น ISO string "YYYY-MM-DD"
 */
export function createISODate(day: number, month: number, yearBE: number): string {
  const yearCE = yearBE - 543;
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yearCE}-${mm}-${dd}`;
}

/**
 * คำนวณระยะเวลารับราชการระหว่าง 2 วันที่ (เริ่มวันที่ ถึงวันที่)
 * ตามมาตรฐานระเบียบสำนักนายกรัฐมนตรี / ก.พ. / ก.อบต.
 * ให้นับวันเริ่มต้นและวันสิ้นสุดเป็นวันทำงานเต็ม (= ปรับวันสิ้นสุด +1 วัน)
 */
export function calculateDateInterval(startDateStr?: string, endDateStr?: string): { years: number; months: number; days: number; isValid: boolean; error?: string } {
  if (!startDateStr || !endDateStr) {
    return { years: 0, months: 0, days: 0, isValid: false };
  }

  const startComp = parseDateComponents(startDateStr);
  const endComp = parseDateComponents(endDateStr);

  if (!startComp || !endComp) {
    return { years: 0, months: 0, days: 0, isValid: false, error: 'รูปแบบวันที่ไม่ถูกต้อง' };
  }

  const d1 = startComp.day;
  const m1 = startComp.month;
  const y1 = startComp.yearCE;

  let d2 = endComp.day;
  let m2 = endComp.month;
  let y2 = endComp.yearCE;

  // ตรวจสอบว่าวันเริ่มต้นต้องไม่มากกว่าวันสิ้นสุด
  const startTime = new Date(y1, m1 - 1, d1).getTime();
  const endTime = new Date(y2, m2 - 1, d2).getTime();
  if (startTime > endTime) {
    return { years: 0, months: 0, days: 0, isValid: false, error: 'วันเริ่มต้นต้องไม่มากกว่าวันสิ้นสุด' };
  }

  // บวก 1 วันให้วันสิ้นสุด (เนื่องจากการนับเวลาราชการจะนับวันเริ่มต้นและวันสิ้นสุดรวมด้วย เช่น 1 ม.ค. ถึง 1 ม.ค. = 1 วันเต็ม)
  const daysInEndMonth = getDaysInMonth(y2, m2);
  if (d2 + 1 > daysInEndMonth) {
    d2 = 1;
    m2 += 1;
    if (m2 > 12) {
      m2 = 1;
      y2 += 1;
    }
  } else {
    d2 += 1;
  }

  // คำนวณเศษวัน
  let days: number;
  if (d2 < d1) {
    let prevMonth = m2 - 1;
    let prevYear = y2;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const daysInPrev = getDaysInMonth(prevYear, prevMonth);
    days = (d2 + daysInPrev) - d1;
    m2 -= 1;
  } else {
    days = d2 - d1;
  }

  // คำนวณเดือน
  let months: number;
  if (m2 < m1) {
    months = (m2 + 12) - m1;
    y2 -= 1;
  } else {
    months = m2 - m1;
  }

  const years = Math.max(0, y2 - y1);

  return { years, months, days, isValid: true };
}

/**
 * คำนวณและตรวจสอบคุณสมบัติระยะเวลาการครองตำแหน่งตาม "๓ กรณี"
 * ของหนังสือสำนักงาน ก.ค.ศ. ที่ ศธ 0206.5/ว 4 ลงวันที่ 20 กุมภาพันธ์ 2568:
 * - กรณีที่ ๑: เลื่อนจากระดับปฏิบัติการ ให้ดำรงตำแหน่งระดับชำนาญการ
 * - กรณีที่ ๒: เลื่อนจากระดับชำนาญการ ให้ดำรงตำแหน่งระดับชำนาญการพิเศษ (ตำแหน่งว่างปกติ)
 * - กรณีที่ ๓: เลื่อนจากระดับชำนาญการ ให้ดำรงตำแหน่งระดับชำนาญการพิเศษ (กรณีผู้ครองตำแหน่งเดิมจะพ้นจากราชการเพราะเกษียณอายุ ประเมินล่วงหน้าได้ ๖ เดือน)
 */
export function checkPromotionEligibility(
  finalYears: number,
  finalMonths: number,
  finalDays: number,
  promotionCase: PromotionCase = 'case1',
  educationLevel: EducationLevel = 'bachelor',
  latestEndDateStr?: string
): PromotionEligibility {
  let requiredYears = 6;
  let targetLevel: TargetPromotionLevel = 'pro';
  let targetLevelName = 'ระดับชำนาญการ';
  let educationLevelName = 'ปริญญาตรี';
  let caseBadgeText = 'กรณีที่ ๑';
  let caseTitle = '';
  let caseDescription = '';
  let isRetirementEarlyEval = false;

  if (promotionCase === 'case1') {
    // กรณีที่ ๑: ปฏิบัติการ -> ชำนาญการ
    caseBadgeText = 'กรณีที่ ๑';
    caseTitle = 'กรณีที่ ๑: การเลื่อนและแต่งตั้งผู้ดำรงตำแหน่งระดับปฏิบัติการ ให้ดำรงตำแหน่งระดับชำนาญการ';
    caseDescription = 'ผู้ดำรงตำแหน่งระดับปฏิบัติการ เลื่อนขึ้นสู่ระดับชำนาญการ ในตำแหน่งประเภทวิชาการ โดยดำรงตำแหน่งตามระยะเวลาที่ ก.ค.ศ. กำหนดตามวุฒิการศึกษา';
    targetLevel = 'pro';
    targetLevelName = 'ระดับชำนาญการ (ประเภทวิชาการ)';

    if (educationLevel === 'doctoral') {
      requiredYears = 2;
      educationLevelName = 'ปริญญาเอก (เกณฑ์ ๒ ปี)';
    } else if (educationLevel === 'master') {
      requiredYears = 4;
      educationLevelName = 'ปริญญาโท (เกณฑ์ ๔ ปี)';
    } else if (educationLevel === 'bachelor_6') {
      requiredYears = 4;
      educationLevelName = 'ปริญญาตรี ๖ ปี (เกณฑ์ ๔ ปี)';
    } else if (educationLevel === 'bachelor_5') {
      requiredYears = 5;
      educationLevelName = 'ปริญญาตรี ๕ ปี (เกณฑ์ ๕ ปี)';
    } else {
      requiredYears = 6;
      educationLevelName = 'ปริญญาตรี ๔ ปี (เกณฑ์ ๖ ปี)';
    }
  } else if (promotionCase === 'case2') {
    // กรณีที่ ๒: ชำนาญการ -> ชำนาญการพิเศษ (ตำแหน่งว่างปกติ)
    caseBadgeText = 'กรณีที่ ๒ (ว่างปกติ)';
    caseTitle = 'กรณีที่ ๒: การเลื่อนและแต่งตั้งผู้ดำรงตำแหน่งระดับชำนาญการ ให้ดำรงตำแหน่งระดับชำนาญการพิเศษ (ตำแหน่งว่างปกติ)';
    caseDescription = 'ผู้ดำรงตำแหน่งระดับชำนาญการ เลื่อนขึ้นสู่ระดับชำนาญการพิเศษ ในกรอบตำแหน่งว่างปกติที่มีอยู่เดิม';
    targetLevel = 'senior_pro';
    targetLevelName = 'ระดับชำนาญการพิเศษ (ตำแหน่งว่างปกติ)';

    if (educationLevel === 'doctoral') {
      requiredYears = 2;
      educationLevelName = 'ปริญญาเอก (เกณฑ์ ๒ ปี)';
    } else if (educationLevel === 'master') {
      requiredYears = 4;
      educationLevelName = 'ปริญญาโท (เกณฑ์ ๔ ปี)';
    } else if (educationLevel === 'bachelor_6') {
      requiredYears = 3;
      educationLevelName = 'ปริญญาตรี ๖ ปี (เกณฑ์ ๓ ปี)';
    } else if (educationLevel === 'bachelor_5') {
      requiredYears = 4;
      educationLevelName = 'ปริญญาตรี ๕ ปี (เกณฑ์ ๔ ปี)';
    } else {
      requiredYears = 5;
      educationLevelName = 'ปริญญาตรี ๔ ปี (เกณฑ์ ๕ ปี)';
    }
  } else {
    // กรณีที่ ๓: ชำนาญการ -> ชำนาญการพิเศษ (แทนผู้เกษียณอายุราชการ)
    caseBadgeText = 'กรณีที่ ๓ (แทนผู้เกษียณ)';
    caseTitle = 'กรณีที่ ๓: การเลื่อนและแต่งตั้งผู้ดำรงตำแหน่งระดับชำนาญการ ให้ดำรงตำแหน่งระดับชำนาญการพิเศษ (กรณีผู้ครองตำแหน่งเดิมจะพ้นจากราชการเพราะเกษียณอายุราชการ)';
    caseDescription = 'การเลื่อนขึ้นสู่ระดับชำนาญการพิเศษในตำแหน่งที่ผู้ครองตำแหน่งเดิมจะเกษียณอายุราชการ โดยสามารถประเมินล่วงหน้าได้ไม่เกิน ๖ เดือนก่อนเกษียณ (มีผลแต่งตั้ง ๑ ต.ค.)';
    targetLevel = 'senior_pro';
    targetLevelName = 'ระดับชำนาญการพิเศษ (แทนผู้เกษียณอายุ)';
    isRetirementEarlyEval = true;

    if (educationLevel === 'doctoral') {
      requiredYears = 2;
      educationLevelName = 'ปริญญาเอก (เกณฑ์ ๒ ปี)';
    } else if (educationLevel === 'master') {
      requiredYears = 4;
      educationLevelName = 'ปริญญาโท (เกณฑ์ ๔ ปี)';
    } else if (educationLevel === 'bachelor_6') {
      requiredYears = 3;
      educationLevelName = 'ปริญญาตรี ๖ ปี (เกณฑ์ ๓ ปี)';
    } else if (educationLevel === 'bachelor_5') {
      requiredYears = 4;
      educationLevelName = 'ปริญญาตรี ๕ ปี (เกณฑ์ ๔ ปี)';
    } else {
      requiredYears = 5;
      educationLevelName = 'ปริญญาตรี ๔ ปี (เกณฑ์ ๕ ปี)';
    }
  }

  const reqTotalDays = requiredYears * 360;
  const currentTotalDays = (finalYears * 360) + (finalMonths * 30) + finalDays;

  const isEligible = currentTotalDays >= reqTotalDays;
  const progressPercentage = Math.min(100, Math.round((currentTotalDays / reqTotalDays) * 100));

  let remainingYears = 0;
  let remainingMonths = 0;
  let remainingDays = 0;

  let surplusYears = 0;
  let surplusMonths = 0;
  let surplusDays = 0;

  let statusType: 'eligible' | 'approaching' | 'pending' = 'pending';
  let statusTitle = '';
  let statusMessage = '';
  let projectedCompletionDateThai = '-';

  if (isEligible) {
    statusType = 'eligible';
    const surplusTotal = currentTotalDays - reqTotalDays;
    surplusYears = Math.floor(surplusTotal / 360);
    surplusMonths = Math.floor((surplusTotal % 360) / 30);
    surplusDays = surplusTotal % 30;

    statusTitle = `🎉 ครบกำหนดตามเกณฑ์ ${caseBadgeText} แล้ว!`;
    if (promotionCase === 'case3') {
      statusMessage = `ครองตำแหน่งครบตามเกณฑ์ ${requiredYears} ปีแล้ว (กรณีที่ ๓: สามารถเสนอรับการประเมินล่วงหน้าเพื่อรอแต่งตั้งมีผลวันที่ ๑ ตุลาคม)`;
    } else if (surplusTotal === 0) {
      statusMessage = `ครองตำแหน่งครบตามเกณฑ์ ${requiredYears} ปี พอดี สามารถยื่นคำขอรับการประเมินได้ทันที`;
    } else {
      statusMessage = `ครองตำแหน่งครบตามเกณฑ์ ${requiredYears} ปีแล้ว (เกินเกณฑ์มา ${surplusYears} ปี ${surplusMonths} เดือน ${surplusDays} วัน)`;
    }
    projectedCompletionDateThai = 'ครบกำหนดแล้ว (พร้อมยื่นประเมิน)';
  } else {
    const diff = reqTotalDays - currentTotalDays;
    remainingYears = Math.floor(diff / 360);
    remainingMonths = Math.floor((diff % 360) / 30);
    remainingDays = diff % 30;

    // คำนวณวันที่คาดว่าจะครบกำหนด
    const baseDate = latestEndDateStr ? new Date(latestEndDateStr) : new Date();
    if (!isNaN(baseDate.getTime())) {
      const proj = new Date(baseDate);
      proj.setDate(proj.getDate() + diff);
      projectedCompletionDateThai = formatThaiDate(proj.toISOString().split('T')[0]);
    }

    if (promotionCase === 'case3' && diff <= 180) {
      statusType = 'approaching';
      statusTitle = `⚡ สิทธิพิเศษกรณีที่ ๓: เข้าข่ายประเมินล่วงหน้าได้ทันที (ไม่เกิน ๖ เดือนก่อนเกษียณ)!`;
      statusMessage = `ขาดระยะเวลาอีกเพียง ${remainingMonths} เดือน ${remainingDays} วัน สามารถดำเนินการประเมินล่วงหน้าตามเงื่อนไข ว 4/2568 ได้ โดยคำสั่งแต่งตั้งจะมีผล ๑ ตุลาคม`;
    } else if (diff <= 180) {
      statusType = 'approaching';
      statusTitle = `⚡ ใกล้ครบกำหนด ${caseBadgeText} (ขาดอีกไม่เกิน ๖ เดือน)`;
      statusMessage = `ขาดระยะเวลาอีกเพียง ${remainingYears > 0 ? `${remainingYears} ปี ` : ''}${remainingMonths} เดือน ${remainingDays} วัน (คาดว่าจะครบกำหนดวันที่ ${projectedCompletionDateThai})`;
    } else {
      statusType = 'pending';
      statusTitle = `⏳ ยังไม่ครบกำหนด ${caseBadgeText}`;
      statusMessage = `ต้องครองตำแหน่งอีก ${remainingYears} ปี ${remainingMonths} เดือน ${remainingDays} วัน (คาดว่าจะครบกำหนดประมาณ ${projectedCompletionDateThai})`;
    }
  }

  const checklistNotes = [
    `เกณฑ์ขั้นต่ำตาม ${caseBadgeText} (ว 4/2568): ต้องดำรงตำแหน่งมาแล้วไม่น้อยกว่า ${requiredYears} ปี (${educationLevelName})`,
    'จัดเตรียมแบบคำขอรับการประเมินบุคคลและผลงานตามแบบที่ ก.ค.ศ. กำหนด',
    'จัดทำข้อเสนอแนวคิดในการพัฒนางานหรือปรับปรุงงานในตำแหน่งที่ขอประเมิน',
    'จัดเตรียมผลงานที่เป็นผลการดำเนินงานที่ผ่านมา ย้อนหลังไม่เกิน ๕ ปี นับถึงวันยื่นคำขอ',
    promotionCase === 'case3'
      ? 'กรณีที่ ๓: สามารถดำเนินการประเมินล่วงหน้าได้ไม่เกิน ๖ เดือน ก่อนผู้ครองตำแหน่งเดิมจะพ้นจากราชการเพราะเกษียณอายุ (แต่งตั้งมีผล ๑ ต.ค.)'
      : 'ตรวจสอบประวัติการรับราชการ ก.พ.๗ หรือ ก.ค.ศ.๑๖ และการประเมินผลการปฏิบัติราชการย้อนหลัง',
  ];

  return {
    promotionCase,
    caseBadgeText,
    caseTitle,
    caseDescription,
    targetLevel,
    targetLevelName,
    educationLevelName,
    requiredYears,
    requiredMonths: 0,
    requiredDays: 0,
    isEligible,
    statusType,
    statusTitle,
    statusMessage,
    remainingYears,
    remainingMonths,
    remainingDays,
    surplusYears,
    surplusMonths,
    surplusDays,
    progressPercentage,
    projectedCompletionDateThai,
    circularReference: CIRCULAR_REF,
    checklistNotes,
    isRetirementEarlyEval,
  };
}

/**
 * คำนวณสรุปผลรวมเวลาปฏิบัติงานจากทุกตำแหน่ง
 * นำ ปี เดือน วัน ที่คำนวณได้จากแต่ละตำแหน่งมารวมกัน:
 * 1. รวมวันทั้งหมด: 30 วัน = 1 เดือน, เศษเป็นวัน
 * 2. รวมเดือนทั้งหมด + เดือนที่ทดมา: 12 เดือน = 1 ปี, เศษเป็นเดือน
 * 3. รวมปีทั้งหมด + ปีที่ทดมา
 */
export function calculateTotalTenure(
  positions: PositionEntry[],
  promotionCase?: PromotionCase,
  educationLevel?: EducationLevel
): CalculationResult {
  let rawYears = 0;
  let rawMonths = 0;
  let rawDays = 0;
  let latestEndDateStr = '';

  for (const pos of positions) {
    let y = 0;
    let m = 0;
    let d = 0;

    // คำนวณจากวันที่เริ่มต้น - สิ้นสุด
    if (pos.startDate && pos.endDate) {
      const diff = calculateDateInterval(pos.startDate, pos.endDate);
      if (diff.isValid) {
        y = diff.years;
        m = diff.months;
        d = diff.days;
      }
      if (!latestEndDateStr || pos.endDate > latestEndDateStr) {
        latestEndDateStr = pos.endDate;
      }
    } else {
      y = pos.years || 0;
      m = pos.months || 0;
      d = pos.days || 0;
    }

    const factor = (pos.factorPercentage || 100) / 100;
    if (factor === 1) {
      rawYears += y;
      rawMonths += m;
      rawDays += d;
    } else {
      const entryTotalDays = Math.round(((y * 360) + (m * 30) + d) * factor);
      const computedY = Math.floor(entryTotalDays / 360);
      const remAfterY = entryTotalDays % 360;
      const computedM = Math.floor(remAfterY / 30);
      const computedD = remAfterY % 30;

      rawYears += computedY;
      rawMonths += computedM;
      rawDays += computedD;
    }
  }

  // 1. รวมวัน และทดเป็นเดือน (30 วัน = 1 เดือน)
  const carriedMonthsFromDays = Math.floor(rawDays / 30);
  const remainingDays = rawDays % 30;

  // 2. รวมเดือน และทดเป็นปี (12 เดือน = 1 ปี)
  const totalMonthsWithCarry = rawMonths + carriedMonthsFromDays;
  const carriedYearsFromMonths = Math.floor(totalMonthsWithCarry / 12);
  const remainingMonths = totalMonthsWithCarry % 12;

  // 3. รวมปี
  const finalYears = rawYears + carriedYearsFromMonths;
  const finalMonths = remainingMonths;
  const finalDays = remainingDays;

  // สรุปเป็นข้อความภาษาไทย
  const parts: string[] = [];
  if (finalYears > 0 || (finalMonths === 0 && finalDays === 0)) {
    parts.push(`${finalYears} ปี`);
  }
  if (finalMonths > 0) {
    parts.push(`${finalMonths} เดือน`);
  }
  if (finalDays > 0 || parts.length === 0) {
    parts.push(`${finalDays} วัน`);
  }
  const formattedThai = parts.join(' ');

  // แปลงเป็นเลขไทย
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  const formattedThaiNumerals = formattedThai.replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit, 10)]);

  // ประมาณการวันทำงานทั้งหมด
  const approxTotalDays = (finalYears * 365) + (finalMonths * 30) + finalDays;

  // ตรวจสอบคุณสมบัติตาม ว 4/2568 ตาม ๓ กรณี
  let eligibility: PromotionEligibility | undefined = undefined;
  if (promotionCase && educationLevel) {
    eligibility = checkPromotionEligibility(
      finalYears,
      finalMonths,
      finalDays,
      promotionCase,
      educationLevel,
      latestEndDateStr
    );
  }

  return {
    rawYears,
    rawMonths,
    rawDays,
    carriedMonthsFromDays,
    remainingDays,
    carriedYearsFromMonths,
    remainingMonths,
    finalYears,
    finalMonths,
    finalDays,
    formattedThai,
    formattedThaiNumerals,
    approxTotalDays,
    eligibility,
  };
}

/**
 * แปลงวันที่ ค.ศ. YYYY-MM-DD เป็นรูปแบบ พ.ศ. ภาษาไทย เช่น "15 พ.ค. 2567"
 */
export function formatThaiDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const comp = parseDateComponents(dateStr);
  if (!comp) return dateStr;
  const monthName = THAI_MONTHS_SHORT[comp.month - 1] || '';
  return `${comp.day} ${monthName} ${comp.yearBE}`;
}

/**
 * แปลงวันที่ ค.ศ. YYYY-MM-DD เป็นรูปแบบ พ.ศ. แบบเต็ม เช่น "15 พฤษภาคม 2567"
 */
export function formatThaiFullDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const comp = parseDateComponents(dateStr);
  if (!comp) return dateStr;
  const monthName = THAI_MONTHS_NAMES[comp.month - 1] || '';
  return `${comp.day} ${monthName} ${comp.yearBE}`;
}
