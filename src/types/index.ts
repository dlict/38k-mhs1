/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CalculationMode = 'direct' | 'dates';

export type EducationLevel =
  | 'bachelor' // ปริญญาตรี
  | 'master' // ปริญญาโท
  | 'doctoral' // ปริญญาเอก
  | 'vocational_diploma' // ปวส. / อนุปริญญา
  | 'vocational_cert'; // ปวช.

export type TargetPromotionLevel =
  | 'pro' // ชำนาญการ
  | 'senior_pro' // ชำนาญการพิเศษ
  | 'expert_craft'; // ชำนาญงาน (ประเภททั่วไป)

/**
 * ๓ กรณีของการเลื่อนและแต่งตั้งตามหลักเกณฑ์ ก.ค.ศ. (ว 4/2568):
 * - case1 = กรณีที่ ๑: การเลื่อนและแต่งตั้งผู้ดำรงตำแหน่งระดับปฏิบัติการ ให้ดำรงตำแหน่งระดับชำนาญการ
 * - case2 = กรณีที่ ๒: การเลื่อนและแต่งตั้งผู้ดำรงตำแหน่งระดับชำนาญการ ให้ดำรงตำแหน่งระดับชำนาญการพิเศษ (ตำแหน่งว่างปกติ)
 * - case3 = กรณีที่ ๓: การเลื่อนและแต่งตั้งผู้ดำรงตำแหน่งระดับชำนาญการ ให้ดำรงตำแหน่งระดับชำนาญการพิเศษ (กรณีผู้ครองตำแหน่งเดิมจะพ้นจากราชการเพราะเกษียณอายุราชการ - ประเมินล่วงหน้าได้ ๖ เดือน)
 */
export type PromotionCase = 'case1' | 'case2' | 'case3';

export interface PositionEntry {
  id: string;
  positionTitle: string; // ชื่อตำแหน่ง เช่น นักวิชาการศึกษาปฏิบัติการ
  organization: string; // สังกัด/หน่วยงาน
  mode: CalculationMode; // เลือก วันที่เริ่ม-สิ้นสุด
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  years: number;
  months: number;
  days: number;
  factorPercentage: number; // สัดส่วนการนับ % (ปกติ 100%, เกื้อกูล 80%, ทวีคูณ 200%)
  note?: string; // หมายเหตุ
}

export interface PersonProfile {
  employeeId: string; // รหัสบุคลากร / เลขประจำตัว
  fullName: string; // ชื่อ-สกุล
  department: string; // สังกัด / เขตพื้นที่การศึกษา / สถานศึกษา / หน่วยงาน
  currentPosition: string; // ตำแหน่งปัจจุบัน (เช่น นักจัดการงานทั่วไปปฏิบัติการ หรือ เจ้าพนักงานธุรการชำนาญงาน)
  educationLevel: EducationLevel; // วุฒิการศึกษาที่ใช้บรรจุหรือปรับคุณวุฒิ
  targetLevel: TargetPromotionLevel; // ระดับที่ต้องการขอรับการประเมิน (ชำนาญการ หรือ ชำนาญการพิเศษ)
  promotionCase: PromotionCase; // ๓ กรณีตามเกณฑ์ ว 4/2568
  remarks: string; // หมายเหตุเพิ่มเติม
}

export interface PromotionEligibility {
  promotionCase: PromotionCase;
  caseBadgeText: string; // เช่น "กรณีที่ ๑" หรือ "กรณีที่ ๓ (แทนผู้เกษียณ)"
  caseTitle: string; // ชื่อกรณีเต็มตามหนังสือ ก.ค.ศ.
  caseDescription: string; // รายละเอียดและเงื่อนไขของกรณีนี้

  targetLevel: TargetPromotionLevel;
  targetLevelName: string; // เช่น "ระดับชำนาญการ" หรือ "ระดับชำนาญการพิเศษ"
  educationLevelName: string; // เช่น "ปริญญาตรี (๖ ปี)" หรือ "ปริญญาโท (๔ ปี)"
  requiredYears: number; // ระยะเวลาขั้นต่ำที่ต้องครองตำแหน่ง (ปี)
  requiredMonths: number;
  requiredDays: number;

  isEligible: boolean; // ครบกำหนดแล้วหรือไม่
  statusType: 'eligible' | 'approaching' | 'pending'; // เขียว | ส้ม (ใกล้ครบ < 6 เดือน) | แดง/เทา (ยังไม่ครบ)
  statusTitle: string;
  statusMessage: string;

  // ระยะเวลาที่ขาด หรือระยะเวลาที่เกิน
  remainingYears: number;
  remainingMonths: number;
  remainingDays: number;
  surplusYears: number;
  surplusMonths: number;
  surplusDays: number;

  progressPercentage: number; // 0 - 100%
  projectedCompletionDateThai: string; // วันที่คาดว่าจะครบกำหนดตามเกณฑ์
  circularReference: string; // หนังสือสำนักงาน ก.ค.ศ. ที่ ศธ 0206.5/ว 4 ลงวันที่ 20 กุมภาพันธ์ 2568
  checklistNotes: string[]; // สิ่งที่ต้องเตรียมยื่นประเมินตาม ว 4/2568
  isRetirementEarlyEval?: boolean; // กรณีที่ 3 ประเมินล่วงหน้าได้ 6 เดือนก่อน 1 ต.ค.
}

export interface CalculationResult {
  // ผลรวมดิบก่อนปัดเศษ
  rawYears: number;
  rawMonths: number;
  rawDays: number;

  // การทด
  carriedMonthsFromDays: number;
  remainingDays: number;
  carriedYearsFromMonths: number;
  remainingMonths: number;

  // ผลรวมสุทธิหลังปัดเศษ (30 วัน = 1 เดือน, 12 เดือน = 1 ปี)
  finalYears: number;
  finalMonths: number;
  finalDays: number;

  // สรุปเป็นข้อความทางการ
  formattedThai: string; // "5 ปี 4 เดือน 12 วัน"
  formattedThaiNumerals: string; // "๕ ปี ๔ เดือน ๑๒ วัน"

  // ประมาณการวันทั้งหมด
  approxTotalDays: number;

  // การตรวจสอบคุณสมบัติตาม ว 4/2568
  eligibility?: PromotionEligibility;
}

export interface SheetRecord {
  id: string;
  timestamp: string;
  employeeId: string;
  fullName: string;
  department: string;
  currentPosition: string;
  educationLevel?: string; // วุฒิการศึกษา
  targetLevel?: string; // ระดับเป้าหมาย เช่น ชำนาญการ / ชำนาญการพิเศษ
  promotionCase?: string; // กรณีที่ ๑ / กรณีที่ ๒ / กรณีที่ ๓
  positionCount: number;
  positionsSummary: string; // ข้อความสรุปแต่ละตำแหน่ง
  positionsJson?: string; // ข้อมูล JSON เผื่อกู้คืน
  finalYears: number;
  finalMonths: number;
  finalDays: number;
  totalText: string;
  approxTotalDays: number;
  eligibilityStatus: string; // สถานะครบกำหนด ว 4/2568
  projectedDate: string; // วันที่ครบกำหนด
  remarks: string;
  recordedBy: string;
  rowIndex?: number; // ลำดับแถวใน Google Sheet
}
