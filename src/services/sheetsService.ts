/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SheetRecord } from '../types';

export const TARGET_SPREADSHEET_ID = '1I-fX8mHF4GjJzYdgYBcWC10swEkXhP9jzfW7TjdrZoc';
export const DEFAULT_SHEET_TAB_NAME = 'เวลาปฏิบัติงาน';

const LOCAL_STORAGE_KEY = 'tenure_records_v4_2568';

export const HEADERS = [
  'รหัสบันทึก (ID)',
  'วันเวลาที่บันทึก',
  'เลขประจำตัว/รหัส',
  'ชื่อ-สกุล',
  'สังกัด/เขตพื้นที่/สถานศึกษา',
  'ตำแหน่งปัจจุบัน',
  'วุฒิการศึกษา',
  'ระดับที่ขอประเมิน',
  'สรุปผลรวมเวลาปฏิบัติงาน',
  'สถานะครบกำหนด (ว 4/2568)',
  'วันที่คาดว่าจะครบกำหนด',
  'จำนวนตำแหน่งที่รวม',
  'รายละเอียดแต่ละตำแหน่ง',
  'รวมปี',
  'รวมเดือน',
  'รวมวัน',
  'วันรวมทั้งหมด (โดยประมาณ)',
  'หมายเหตุ',
  'ผู้บันทึกข้อมูล',
  'JSON_DATA',
];

/**
 * ดึงข้อมูล Metadata ของ Google Spreadsheet เพื่อตรวจสอบการเชื่อมต่อและชื่อแท็บ
 */
export async function getSpreadsheetDetails(accessToken: string): Promise<{ title: string; sheets: string[] }> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}?fields=properties.title,sheets.properties.title`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = `Google Sheets API Error (${res.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) {
        errorMsg = parsed.error.message;
      }
    } catch {
      errorMsg = errorText;
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const sheets = (data.sheets || []).map((s: any) => s.properties?.title as string);
  return {
    title: data.properties?.title || 'Spreadsheet',
    sheets,
  };
}

/**
 * สร้างหรือตรวจสอบหัวตารางในชีต (Ensure Headers)
 */
export async function ensureSheetHeaders(accessToken: string, sheetName: string = DEFAULT_SHEET_TAB_NAME): Promise<void> {
  try {
    const details = await getSpreadsheetDetails(accessToken);
    if (!details.sheets.includes(sheetName)) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                  gridProperties: { rowCount: 1000, columnCount: 25 },
                },
              },
            },
          ],
        }),
      });
    }

    const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!A1:T1`;
    const res = await fetch(checkUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.values || data.values.length === 0 || !data.values[0] || data.values[0].length === 0) {
        await writeHeaderRow(accessToken, sheetName);
      }
    } else {
      await writeHeaderRow(accessToken, sheetName);
    }
  } catch (err) {
    console.warn('ensureSheetHeaders warning:', err);
  }
}

async function writeHeaderRow(accessToken: string, sheetName: string): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!A1:T1?valueInputOption=USER_ENTERED`;
  await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `${sheetName}!A1:T1`,
      majorDimension: 'ROWS',
      values: [HEADERS],
    }),
  });
}

/**
 * ฟังก์ชันแยกวิเคราะห์ CSV ที่รองรับเครื่องหมายคำพูดและข้อความหลายบรรทัด
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];

    if (ch === '"' && insideQuotes && nextCh === '"') {
      currentVal += '"';
      i++;
    } else if (ch === '"') {
      insideQuotes = !insideQuotes;
    } else if (ch === ',' && !insideQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((ch === '\r' || ch === '\n') && !insideQuotes) {
      if (ch === '\r' && nextCh === '\n') i++;
      currentRow.push(currentVal);
      if (currentRow.some((c) => c.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += ch;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.some((c) => c.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * ดึงรายการบันทึกเวลาปฏิบัติงานจาก Google Sheet โดยตรง (ไม่ต้องล็อกอิน)
 */
export async function fetchSheetRecords(accessToken?: string, sheetName: string = DEFAULT_SHEET_TAB_NAME): Promise<SheetRecord[]> {
  try {
    // 1. ดึงข้อมูลผ่าน gviz CSV endpoint ของ Google Sheet (เปิดสาธารณะ / ใช้งานได้ทันทีโดยไม่ต้อง Login)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
    const csvRes = await fetch(csvUrl);

    if (csvRes.ok) {
      const csvText = await csvRes.text();
      const allRows = parseCSV(csvText);

      // แถวแรกคือหัวตาราง A1:T1 แถวถัดมาคือข้อมูลตั้งแต่แถว 2 (row index 2)
      if (allRows.length > 1) {
        const dataRows = allRows.slice(1);
        const parsedRecords: SheetRecord[] = [];

        for (let index = 0; index < dataRows.length; index++) {
          const row = dataRows[index];
          if (!row || row.length === 0 || !row[0]?.trim()) continue;

          const rowIndex = index + 2; // ตำแหน่งแถวจริงใน Google Sheet
          const jsonField = row[19] || row[15] || '';
          let profileObj: any = null;
          let positionsObj: any = null;

          if (jsonField) {
            try {
              const parsed = JSON.parse(jsonField);
              profileObj = parsed.profile;
              positionsObj = parsed.positions;
            } catch {
              // ignore
            }
          }

          // แยกแยะระหว่าง schema 20 คอลัมน์ กับ schema 16 คอลัมน์เดิม
          const isNewSchema =
            row.length > 16 ||
            row[6]?.includes('ปริญญา') ||
            row[7]?.includes('ชำนาญการ') ||
            row[9]?.includes('ครบกำหนด');

          let rec: SheetRecord;
          if (isNewSchema) {
            rec = {
              id: String(row[0] || `REC-${Date.now()}`),
              timestamp: String(row[1] || ''),
              employeeId: String(row[2] || '-'),
              fullName: String(row[3] || ''),
              department: String(row[4] || '-'),
              currentPosition: String(row[5] || '-'),
              educationLevel: String(row[6] || profileObj?.educationLevel || 'ปริญญาตรี'),
              targetLevel: String(row[7] || profileObj?.targetLevel || 'ชำนาญการ'),
              promotionCase: profileObj?.promotionCase
                ? profileObj.promotionCase === 'case3'
                  ? 'กรณีที่ ๓ (แทนผู้เกษียณ)'
                  : profileObj.promotionCase === 'case2'
                  ? 'กรณีที่ ๒ (ว่างปกติ)'
                  : 'กรณีที่ ๑'
                : undefined,
              totalText: String(row[8] || (profileObj ? '' : row[11] || '')),
              eligibilityStatus: String(row[9] || '-'),
              projectedDate: String(row[10] || '-'),
              positionCount: parseInt(String(row[11] || (positionsObj?.length ? positionsObj.length : '1')), 10) || 1,
              positionsSummary: String(row[12] || ''),
              finalYears: parseInt(String(row[13] || '0'), 10) || 0,
              finalMonths: parseInt(String(row[14] || '0'), 10) || 0,
              finalDays: parseInt(String(row[15] || '0'), 10) || 0,
              approxTotalDays: parseInt(String(row[16] || '0'), 10) || 0,
              remarks: String(row[17] || profileObj?.remarks || '-'),
              recordedBy: String(row[18] || 'ผู้ใช้งานระบบ'),
              positionsJson: jsonField,
              rowIndex,
            };
          } else {
            // รูปแบบเดิม 16 คอลัมน์
            rec = {
              id: String(row[0] || `REC-${Date.now()}`),
              timestamp: String(row[1] || ''),
              employeeId: String(row[2] || '-'),
              fullName: String(row[3] || ''),
              department: String(row[4] || '-'),
              currentPosition: String(row[5] || '-'),
              educationLevel: 'ปริญญาตรี',
              targetLevel: 'ชำนาญการ',
              positionCount: parseInt(String(row[6] || '1'), 10) || 1,
              positionsSummary: String(row[7] || ''),
              finalYears: parseInt(String(row[8] || '0'), 10) || 0,
              finalMonths: parseInt(String(row[9] || '0'), 10) || 0,
              finalDays: parseInt(String(row[10] || '0'), 10) || 0,
              totalText: String(row[11] || ''),
              approxTotalDays: parseInt(String(row[12] || '0'), 10) || 0,
              eligibilityStatus: '-',
              projectedDate: '-',
              remarks: String(row[13] || '-'),
              recordedBy: String(row[14] || 'ผู้ใช้งานระบบ'),
              positionsJson: jsonField,
              rowIndex,
            };
          }
          parsedRecords.push(rec);
        }

        parsedRecords.reverse();
        saveToLocalStorage(parsedRecords);
        return parsedRecords;
      }
    }
  } catch (csvErr) {
    console.warn('Direct Sheet CSV fetch notice:', csvErr);
  }

  // 2. หากเรียก CSV ไม่สำเร็จแต่มี Token ให้ใช้ Sheets API v4
  if (accessToken) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!A2:T500`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const rows: any[][] = data.values || [];
      const records: SheetRecord[] = [];

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (!row || row.length === 0 || !row[0]) continue;
        records.push({
          id: String(row[0] || `rec-${index + 1}`),
          timestamp: String(row[1] || ''),
          employeeId: String(row[2] || ''),
          fullName: String(row[3] || ''),
          department: String(row[4] || ''),
          currentPosition: String(row[5] || ''),
          educationLevel: String(row[6] || 'ปริญญาตรี'),
          targetLevel: String(row[7] || 'ชำนาญการ'),
          totalText: String(row[8] || ''),
          eligibilityStatus: String(row[9] || '-'),
          projectedDate: String(row[10] || '-'),
          positionCount: parseInt(String(row[11] || '0'), 10) || 0,
          positionsSummary: String(row[12] || ''),
          finalYears: parseInt(String(row[13] || '0'), 10) || 0,
          finalMonths: parseInt(String(row[14] || '0'), 10) || 0,
          finalDays: parseInt(String(row[15] || '0'), 10) || 0,
          approxTotalDays: parseInt(String(row[16] || '0'), 10) || 0,
          remarks: String(row[17] || ''),
          recordedBy: String(row[18] || ''),
          positionsJson: String(row[19] || ''),
          rowIndex: index + 2,
        });
      }

      records.reverse();
      saveToLocalStorage(records);
      return records;
    }
  }

  return getLocalRecords();
}

/**
 * บันทึกข้อมูลสรุปเวลาปฏิบัติงานและสถานะเลื่อนระดับขึ้น Google Sheet (Real-time Append)
 */
export async function saveRecordToGoogleSheet(
  accessToken: string,
  record: SheetRecord,
  sheetName: string = DEFAULT_SHEET_TAB_NAME
): Promise<void> {
  await ensureSheetHeaders(accessToken, sheetName);

  const rowValues = [
    record.id,
    record.timestamp,
    record.employeeId,
    record.fullName,
    record.department,
    record.currentPosition,
    record.educationLevel || 'ปริญญาตรี',
    record.targetLevel || 'ชำนาญการ',
    record.totalText,
    record.eligibilityStatus || '-',
    record.projectedDate || '-',
    record.positionCount,
    record.positionsSummary,
    record.finalYears,
    record.finalMonths,
    record.finalDays,
    record.approxTotalDays,
    record.remarks,
    record.recordedBy,
    record.positionsJson || '',
  ];

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!A:T:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`บันทึกลง Google Sheets ไม่สำเร็จ: ${errorText}`);
  }

  const current = getLocalRecords();
  const updated = [record, ...current.filter((r) => r.id !== record.id)];
  saveToLocalStorage(updated);
}

/**
 * ลบแถวใน Google Sheet ตามลำดับแถว (Row Index)
 */
export async function deleteRecordFromGoogleSheet(
  accessToken: string,
  rowIndex: number,
  sheetName: string = DEFAULT_SHEET_TAB_NAME
): Promise<void> {
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}?fields=sheets.properties`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) throw new Error('ไม่สามารถดึงข้อมูลแผ่นงานเพื่อลบได้');

  const metaData = await metaRes.json();
  const targetSheet = metaData.sheets?.find((s: any) => s.properties?.title === sheetName) || metaData.sheets?.[0];
  const sheetId = targetSheet?.properties?.sheetId || 0;

  const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}:batchUpdate`;
  const res = await fetch(deleteUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`ลบข้อมูลใน Google Sheets ไม่สำเร็จ: ${errorText}`);
  }
}

export function getLocalRecords(): SheetRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToLocalStorage(records: SheetRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Local storage save failed:', err);
  }
}
