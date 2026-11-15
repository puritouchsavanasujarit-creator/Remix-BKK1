import React, { useState } from 'react';
import { Clock, MapPin, AlertCircle, FileText, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';

export default function SOPReferenceMatrix() {
  const [testKm, setTestKm] = useState<number>(12);

  // Calculate stats for testKm
  const getTravelTime = (km: number) => {
    if (km <= 10) return '20 - 30 นาที';
    if (km <= 20) return '40 นาที';
    if (km <= 30) return '40 - 50 นาที';
    return '60 - 90 นาที';
  };

  const getDaySla = (km: number) => {
    if (km <= 10) return 'ภายใน 1 - 1.5 ชม.';
    if (km <= 20) return 'ภายใน 2 ชม.';
    if (km <= 30) return 'ภายใน 2.5 ชม.';
    return 'ภายใน 3 ชม. (แล้วแต่พิจารณา)';
  };

  const getEveningSlot = (km: number) => {
    if (km <= 10) return '08:30 - 09:00 น.';
    if (km <= 20) return '09:00 - 10:00 น.';
    if (km <= 30) return '10:00 - 11:00 น.';
    return 'หลัง 11:00 น. (พิจารณาพิเศษ)';
  };

  const getNightSlot = (km: number) => {
    if (km <= 10) return { window: '09:00 - 09:30 น.', quota: 'จำกัดไม่เกิน 3 เจ้า' };
    if (km <= 20) return { window: '09:30 - 10:30 น.', quota: 'จำกัดไม่เกิน 2 เจ้า' };
    if (km <= 30) return { window: '10:30 - 11:00 น.', quota: 'ตามดุลยพินิจ' };
    return { window: 'หลัง 11:00 น.', quota: 'ต้องขออนุมัติพิเศษ' };
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">คู่มืออ้างอิงมาตรฐาน (SOP Reference)</div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-1">
            เกณฑ์ระยะทาง เวลาเดินทางของแมส และรอบจัดส่งสาขา BKK
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            ถอดความจากเอกสาร Sale Process SOP (หน้า 1-2) ครบถ้วนทุกเงื่อนไข
          </p>
        </div>

        <a
          href="/assets/aistudio/___________________-_Sale_Process_c6df47d6.pdf"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg shadow-xs transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-rose-500" />
          <span>เปิดดูเอกสาร PDF ต้นฉบับ</span>
          <ExternalLink className="w-3 h-3 text-neutral-400" />
        </a>
      </div>

      {/* Quick Interactive Distance Calculator */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              ทดสอบคำนวณ SLA ตามระยะทางแบบฉับไว
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="test-distance-km-input" className="text-xs text-neutral-500">ใส่ระยะทาง (กม.):</label>
            <input
              id="test-distance-km-input"
              type="number"
              step="1"
              min="1"
              max="50"
              value={testKm}
              onChange={(e) => setTestKm(Number(e.target.value))}
              className="w-20 px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
            <span className="text-neutral-500">เวลาเดินทางแมส:</span>
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-1">
              {getTravelTime(testKm)}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">วัดจากหน้าร้านสาขา BKK</div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
            <span className="text-neutral-500">รอบกลางวัน (08-17 น.):</span>
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-1">
              {getDaySla(testKm)}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">&lt; 2 ชม. ต้องถาม OP ก่อน</div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
            <span className="text-neutral-500">รอบเย็น (17-20 น.):</span>
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-1">
              {getEveningSlot(testKm)}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">ส่งเช้าวันถัดไป</div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
            <span className="text-neutral-500">รอบดึก (20-22 น.):</span>
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-1">
              {getNightSlot(testKm).window}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              {getNightSlot(testKm).quota}
            </div>
          </div>
        </div>
      </div>

      {/* Table 1: Daytime */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-100/70 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              ตารางที่ 1: เวลารับออเดอร์ 8.00 - 17.00 น. (รอบปกติ)
            </span>
          </div>
          <span className="text-xs text-neutral-500">นำข้อมูลลงตาราง BKK (NEW)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">
                <th className="py-2.5 px-4">ระยะทาง</th>
                <th className="py-2.5 px-4">ระยะเวลาเดินทางของแมส</th>
                <th className="py-2.5 px-4">เวลาที่ลูกค้าต้องการรับของ (SLA)</th>
                <th className="py-2.5 px-4 text-rose-600 dark:text-rose-400 font-bold">เคสเร่งด่วน / ข้อควรระวัง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono-numbers">
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">1 - 10 กม.</td>
                <td className="py-3 px-4">20 - 30 นาที</td>
                <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">ภายใน 1 - 1.5 ชม.</td>
                <td rowSpan={4} className="py-3 px-4 align-top font-sans text-rose-700 dark:text-rose-300 bg-rose-50/40 dark:bg-rose-950/20 border-l border-rose-200 dark:border-rose-900/50">
                  <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1 mb-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    เคสน้อยกว่า 2 ชม. ไม่ว่ากี่ กม.
                  </div>
                  <div className="leading-relaxed text-xs">
                    ให้ประสานกับ OP ก่อนว่าได้ไหม แล้วจึงคอนเฟิร์มเวลากับลูกค้า
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">10 - 20 กม.</td>
                <td className="py-3 px-4">40 นาที</td>
                <td className="py-3 px-4 font-semibold">ภายใน 2 ชม.</td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">20 - 30 กม.</td>
                <td className="py-3 px-4">40 - 50 นาที</td>
                <td className="py-3 px-4 font-semibold">ภายใน 2.5 ชม.</td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">30 กม. ขึ้นไป</td>
                <td className="py-3 px-4">60 - 90 นาที</td>
                <td className="py-3 px-4 text-neutral-500">ภายใน 3 ชม. (แล้วแต่พิจารณา)</td>
              </tr>
              <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-sans">
                <td className="py-3 px-4 font-bold text-amber-900 dark:text-amber-200">กรณี ชุดส่งด่วน</td>
                <td className="py-3 px-4 font-mono-numbers">ไม่เกิน 25 กม.</td>
                <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-300 font-mono-numbers">ด่วน ภายใน 1 - 1.5 ชม.</td>
                <td className="py-3 px-4 text-xs text-amber-800 dark:text-amber-300">
                  ต้องไม่เกิน 25 กม. เพื่อความปลอดภัยของสินค้า
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Evening & Night */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-100/70 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              ตารางที่ 2: เวลารับออเดอร์ 17.00 - 20.00 น. (สั่งจัดแล้ว) และ 20.00 - 22.00 น. (ไม่ได้สั่งจัด)
            </span>
          </div>
          <span className="text-xs text-neutral-500">จัดส่งวันถัดไป</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">
                <th className="py-2.5 px-3.5">เวลารับออเดอร์</th>
                <th className="py-2.5 px-3.5">ระยะทาง</th>
                <th className="py-2.5 px-3.5">เวลาเดินทางแมส</th>
                <th className="py-2.5 px-3.5">เวลาสินค้าถึงลูกค้า</th>
                <th className="py-2.5 px-3.5 font-bold text-neutral-900 dark:text-neutral-100">เวลาที่จัดส่งถึงลูกค้า</th>
                <th className="py-2.5 px-3.5 text-purple-700 dark:text-purple-300">จำนวนออเดอร์ที่รับได้ (โควตา)</th>
                <th className="py-2.5 px-3.5">กลุ่มที่ต้องสั่งงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono-numbers">
              {/* 17.00 - 20.00 */}
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td rowSpan={3} className="py-3 px-3.5 font-semibold text-neutral-900 dark:text-neutral-100 align-top font-sans bg-neutral-50/40 dark:bg-neutral-950/10">
                  17.00 - 20.00 น.<br />
                  <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">(สั่งจัดแล้ว)</span>
                </td>
                <td className="py-3 px-3.5 font-medium">1 - 10 กม.</td>
                <td className="py-3 px-3.5">20 - 30 นาที</td>
                <td className="py-3 px-3.5">ภายใน 1 ชม.</td>
                <td className="py-3 px-3.5 font-bold text-emerald-700 dark:text-emerald-400">8.30 - 9.00 น.</td>
                <td className="py-3 px-3.5 text-neutral-400 font-sans">ตามคิวจัด</td>
                <td rowSpan={3} className="py-3 px-3.5 align-top font-sans text-xs bg-neutral-50/40 dark:bg-neutral-950/10">
                  สั่งจัดเข้ากลุ่มไลน์<br />
                  <strong className="text-neutral-900 dark:text-neutral-100">สาขา BKK (Head office)</strong>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3 px-3.5 font-medium">11 - 20 กม.</td>
                <td className="py-3 px-3.5">40 นาที</td>
                <td className="py-3 px-3.5">ภายใน 2.5 ชม.</td>
                <td className="py-3 px-3.5 font-bold text-emerald-700 dark:text-emerald-400">9.00 - 10.00 น.</td>
                <td className="py-3 px-3.5 text-neutral-400 font-sans">ตามคิวจัด</td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3 px-3.5 font-medium">21 - 30 กม.</td>
                <td className="py-3 px-3.5">40 - 50 นาที</td>
                <td className="py-3 px-3.5">ภายใน 3 ชม.</td>
                <td className="py-3 px-3.5 font-bold text-emerald-700 dark:text-emerald-400">10.00 - 11.00 น.</td>
                <td className="py-3 px-3.5 text-neutral-400 font-sans">ตามคิวจัด</td>
              </tr>

              {/* 20.00 - 22.00 */}
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-purple-50/20 dark:bg-purple-950/10">
                <td rowSpan={4} className="py-3 px-3.5 font-semibold text-purple-900 dark:text-purple-300 align-top font-sans">
                  20.00 - 22.00 น.<br />
                  <span className="text-[11px] font-normal text-purple-600 dark:text-purple-400">(ไม่ได้สั่งจัด)</span>
                </td>
                <td className="py-3 px-3.5 font-medium">1 - 10 กม.</td>
                <td className="py-3 px-3.5">20 - 30 นาที</td>
                <td className="py-3 px-3.5">ภายใน 1 ชม.</td>
                <td className="py-3 px-3.5 font-bold text-purple-700 dark:text-purple-300">9.00 - 9.30 น.</td>
                <td className="py-3 px-3.5 font-bold text-purple-700 dark:text-purple-300 font-sans">ไม่เกิน 3 เจ้า</td>
                <td rowSpan={4} className="py-3 px-3.5 align-top font-sans text-xs bg-purple-50/30 dark:bg-purple-950/20">
                  <span className="font-semibold text-purple-900 dark:text-purple-200">กลุ่ม Admin สาขา BKK</span>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 mt-1">
                    * ต้องแคปหน้าแชทส่ง และลงวันเวลารับสินค้า
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-purple-50/20 dark:bg-purple-950/10">
                <td className="py-3 px-3.5 font-medium">11 - 20 กม.</td>
                <td className="py-3 px-3.5">40 นาที</td>
                <td className="py-3 px-3.5">ภายใน 2.5 ชม.</td>
                <td className="py-3 px-3.5 font-bold text-purple-700 dark:text-purple-300">9.30 - 10.30 น.</td>
                <td className="py-3 px-3.5 font-bold text-purple-700 dark:text-purple-300 font-sans">ไม่เกิน 2 เจ้า</td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-purple-50/20 dark:bg-purple-950/10">
                <td className="py-3 px-3.5 font-medium">21 - 30 กม.</td>
                <td className="py-3 px-3.5">40 - 50 นาที</td>
                <td className="py-3 px-3.5">ภายใน 3 ชม.</td>
                <td className="py-3 px-3.5 font-bold text-purple-700 dark:text-purple-300">10.30 - 11.00 น.</td>
                <td className="py-3 px-3.5 text-neutral-400 font-sans">-</td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-purple-50/20 dark:bg-purple-950/10">
                <td className="py-3 px-3.5 font-bold text-neutral-900 dark:text-neutral-100 font-sans">รับหน้าร้าน</td>
                <td className="py-3 px-3.5 font-sans">-</td>
                <td className="py-3 px-3.5 font-sans">-</td>
                <td className="py-3 px-3.5 font-bold text-purple-700 dark:text-purple-300">8.20 - 8.30 น.</td>
                <td className="py-3 px-3.5 font-bold text-purple-700 dark:text-purple-300 font-sans">
                  รวมไม่เกิน 5 ออเดอร์
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
