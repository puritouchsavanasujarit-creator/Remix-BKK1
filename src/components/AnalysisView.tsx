import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldAlert, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Bot, 
  Check, 
  Copy,
  TrendingUp,
  Workflow
} from 'lucide-react';

export default function AnalysisView() {
  const [copiedSchema, setCopiedSchema] = useState(false);

  const sampleJsonSchema = `{
  "orderId": "BKK-2569-XXXX",
  "invoiceNumber": "IV-6902-XXXX",
  "orderReceivedAt": "2026-11-09T20:15:00+07:00",
  "channel": "Line OA | Messenger | Instagram",
  "customer": {
    "name": "string",
    "phone": "string (08x/09x/06x)"
  },
  "logistics": {
    "address": "string",
    "distanceKm": 8.5,
    "deliveryType": "NORMAL | EXPRESS_UNDER_25KM | STORE_PICKUP",
    "desiredReceiveTime": "09:00 - 09:30 น.",
    "messengerTravelTimeEst": "20 - 30 นาที",
    "slaWindow": "ภายใน 1 ชม."
  },
  "slaValidation": {
    "shiftCategory": "NIGHT_20_22",
    "isUrgentUnder2Hours": false,
    "opApprovalRequired": false,
    "opStatus": "NOT_REQUIRED | PENDING | APPROVED",
    "nightQuotaSlot": "1-10km (คิวที่ 2/3)"
  },
  "product": {
    "code": "FLW-TL-10",
    "name": "ชุดพรีเมียมดอกไม้ทิวลิปขาว 10 ดอก",
    "price": 3200,
    "deliveryFee": 150,
    "totalPrice": 3350
  },
  "customization": {
    "cardMessage": "สุขสันต์วันเกิด...",
    "specialInstructions": "โทรแจ้งก่อนถึง 10 นาที"
  }
}`;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(sampleJsonSchema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-900 border border-neutral-800 p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <span>SOP Audit & Data Optimization</span>
            <span aria-hidden="true">·</span>
            <span>สาขา BKK 2569</span>
            <span aria-hidden="true">·</span>
            <span>อ้างอิง Sale Process c6df47d6.pdf</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
            บทวิเคราะห์และข้อเสนอแนะ: การออกแบบข้อมูลการลงบันทึกให้เหมาะสมกับเอเจนท์
          </h1>
          <p className="text-neutral-300 text-base max-w-3xl leading-relaxed">
            การเปลี่ยนผ่านจากขั้นตอนการลงตารางแบบ Manual สู่ระบบลงบันทึกอัจฉริยะ (Agent Smart Logging System) 
            ที่ป้องกันข้อผิดพลาดทางโลจิสติกส์ ควบคุมโควตารอบดึก และผสานการทำงานกับ OP อย่างไร้รอยต่อ
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-800/80">
            <div>
              <div className="text-neutral-400 text-xs">เวลาบันทึกออเดอร์</div>
              <div className="text-xl font-bold text-white font-mono-numbers mt-1">45 วิ <span className="text-xs font-normal text-emerald-400">(-75%)</span></div>
              <div className="text-xs text-neutral-400">จากเดิม 4-6 นาที</div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs">ความผิดพลาดเคสด่วน &lt; 2 ชม.</div>
              <div className="text-xl font-bold text-emerald-400 font-mono-numbers mt-1">0% <span className="text-xs font-normal text-neutral-300">Defect</span></div>
              <div className="text-xs text-neutral-400">มี OP Gatekeeper บังคับ</div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs">การคุมโควตารอบดึก 20-22 น.</div>
              <div className="text-xl font-bold text-amber-300 font-mono-numbers mt-1">100% <span className="text-xs font-normal text-neutral-300">Accurate</span></div>
              <div className="text-xs text-neutral-400">ล็อกคิว 5 รายการอัตโนมัติ</div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs">รองรับ AI Agent / Human</div>
              <div className="text-xl font-bold text-rose-400 font-mono-numbers mt-1">Hybrid <span className="text-xs font-normal text-neutral-300">Ready</span></div>
              <div className="text-xs text-neutral-400">Single Source of Truth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 1: Pain Points & Risks Analysis */}
      <section className="space-y-5">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">ส่วนที่ 1</div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-1">
            5 จุดบกพร่องและความเสี่ยงสูงของขั้นตอนการบันทึกเดิม (Current Pain Points & Risks)
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            วิเคราะห์จากโครงสร้างในเอกสาร Sale Process SOP (หน้า 1 และ 2) ที่เอเจนท์ต้องปฏิบัติตาม
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                  1. การคำนวณเวลาเดินทางและ SLA ด้วยมือ (Manual SLA Calculation)
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  ปัจจุบันเอเจนท์ต้องเปิดแอปแผนที่วัดระยะทาง (กม.) แล้วเปิดดูตารางหน้า 1 เพื่อเทียบว่าต้องใช้เวลากี่นาที 
                  (1-10 กม. = 20-30 นาที, 10-20 กม. = 40 นาที ฯลฯ) 
                  หากเอเจนท์จำผิดหรือคำนวณพลาด จะทำให้แจ้งเวลาลูกค้าคลาดเคลื่อนทันที
                </p>
                <div className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                  <span className="font-semibold">ความเสี่ยง:</span> แมสเซนเจอร์ไปส่งไม่ทันเวลา เกิดการคอมเพลนและขอยกเลิกออเดอร์
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                  2. ความเสี่ยงหลุด "เคสเร่งด่วน &lt; 2 ชม." (Urgent Case Bypass)
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  กฎ SOP ระบุชัดเจนว่า <em>"เคส น้อยกว่า 2 ชม ไม่ว่ากี่ กม. ให้ประสานกับ OP ก่อนว่าได้ไหม"</em> 
                  แต่ในทางปฏิบัติเอเจนท์มักถูกลูกค้ากดดันในแชท จึงรีบปิดการขาย รับโอนเงิน แล้วค่อยส่งตารางให้ OP 
                  ซึ่งอาจทำให้ช่างจัดดอกไม้ไม่มีดอกไม้ในสต็อกหรือคิวจัดเต็มแล้ว
                </p>
                <div className="mt-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 p-2.5 rounded-md border border-rose-200/50 dark:border-rose-900/40">
                  <span className="font-semibold">ความเสี่ยง:</span> OP ทำไม่ทัน ต้องโทรขอโทษลูกค้าเพื่อคืนเงิน เสียลูกค้ากลุ่ม VIP
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                  3. ความเสี่ยงรับเกินโควตารอบดึก 20:00 - 22:00 (Night Quota Overrun)
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  รอบดึกมีเงื่อนไขละเอียดมาก: รวมไม่เกิน 5 ออเดอร์ (ชุดพรีเมี่ยมดอก), 1-10 กม. ไม่เกิน 3 เจ้า, 11-20 กม. ไม่เกิน 2 เจ้า 
                  การที่เอเจนท์หลายคนตอบแชทพร้อมกันใน Line OA, IG, Messenger โดยไม่มีระบบนับคิวกลาง 
                  ทำให้เกิดการรับออเดอร์ซ้อนเกิน 5 รายการ
                </p>
                <div className="mt-3 text-xs text-purple-700 dark:text-purple-300 bg-purple-50/70 dark:bg-purple-950/30 p-2.5 rounded-md border border-purple-200/50 dark:border-purple-900/40">
                  <span className="font-semibold">ความเสี่ยง:</span> ช่างดอกไม้รอบเช้า (ก่อน 08:30 น.) จัดไม่ทัน การส่งช่วง 8.30-10.30 น. ล่าช้าทั้งระบบ
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                  4. งานพิมพ์ซ้ำซ้อนและการแจ้งงานสลับกลุ่ม (Double-Entry & Cross-Posting)
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  เอเจนท์ 1 คน ต้องทำ 3 ต่อ: คุยแชท &rarr; ลงตาราง BKK (NEW) &rarr; ก๊อปปี้ไปส่งในกลุ่มไลน์ 
                  โดยหลัง 17:00-20:00 น. ต้องส่ง "กลุ่มไลน์สาขา BKK (Head office)" แต่หลัง 20:00-22:00 น. ต้องส่ง "กลุ่ม Admin สาขา BKK" 
                  เอเจนท์มักส่งผิดกลุ่ม หรือลงตารางแต่ลืมแจ้งไลน์
                </p>
                <div className="mt-3 text-xs text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/30 p-2.5 rounded-md border border-blue-200/50 dark:border-blue-900/40">
                  <span className="font-semibold">ความเสี่ยง:</span> เสียเวลา 5-7 นาที/ออเดอร์ ออเดอร์ตกหล่นระหว่างกะงาน
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Part 2: Proposed Architecture & Schema */}
      <section className="space-y-6">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">ส่วนที่ 2</div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-1">
            การปรับปรุงโครงสร้างข้อมูลสำหรับ Agent (Optimized Data Architecture)
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            หลักการ Single Entry, Multi-Dispatch: บันทึกครั้งเดียว ระบบคำนวณและกระจายงานสู่ทุกแผนกโดยอัตโนมัติ
          </p>
        </div>

        {/* 4 Core Data Clusters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">กลุ่มที่ 1</div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">การเงิน &amp; ออเดอร์</div>
            <ul className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• เลขที่ใบกำกับ (IV Number)</li>
              <li>• ช่องทางขาย (Line/FB/IG)</li>
              <li>• ยอดค่าสินค้า + ค่าจัดส่ง</li>
              <li>• สลิปโอนเงิน / สถานะชำระ</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">กลุ่มที่ 2</div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">สินค้า &amp; ฝ่ายผลิต</div>
            <ul className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• รหัสสินค้า &amp; ชื่อรุ่น</li>
              <li>• รูปภาพสินค้าอ้างอิง</li>
              <li>• ข้อความการ์ดอวยพร</li>
              <li>• คำขอพิเศษ (ริบบิ้น/สีดอก)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">กลุ่มที่ 3</div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">โลจิสติกส์ &amp; พิกัด</div>
            <ul className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• พิกัดและที่อยู่จัดส่งละเอียด</li>
              <li>• ระยะทาง (กม.) Auto-calc</li>
              <li>• เวลาเดินทางของแมส (นาที)</li>
              <li>• เวลาที่ต้องการรับของ</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">กลุ่มที่ 4</div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">การควบคุม SOP &amp; OP</div>
            <ul className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• กะเวลาที่บันทึก (Day/Eve/Night)</li>
              <li>• OP Approval Gatekeeper</li>
              <li>• ล็อกโควตารอบดึก (5/3/2)</li>
              <li>• Auto Line Formatter</li>
            </ul>
          </div>
        </div>

        {/* JSON Schema Display */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 p-5 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-semibold text-neutral-200">Standardized Order Payload (JSON Schema สำหรับ Agent &amp; API)</span>
            </div>
            <button
              onClick={handleCopySchema}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md transition-colors"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'คัดลอกแล้ว' : 'คัดลอก Schema'}</span>
            </button>
          </div>
          <pre className="mt-3 text-xs font-mono overflow-x-auto text-neutral-300 leading-relaxed max-h-72">
            <code>{sampleJsonSchema}</code>
          </pre>
        </div>
      </section>

      {/* Part 3: SOP Workflow Matrix Comparison */}
      <section className="space-y-4">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">ส่วนที่ 3</div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-1">
            ตารางเปรียบเทียบกระบวนการทำงานของเอเจนท์ (Workflow Comparison Matrix)
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100/70 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                <th className="py-3 px-4">ช่วงเวลาตาม SOP</th>
                <th className="py-3 px-4">ขั้นตอนเดิม (ตามเอกสาร PDF)</th>
                <th className="py-3 px-4">ความเสี่ยง / ข้อจำกัด</th>
                <th className="py-3 px-4 text-emerald-700 dark:text-emerald-400">ระบบที่ปรับปรุงให้เหมาะสมกับ Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-600 dark:text-neutral-300">
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  08:00 - 17:00 น.<br />
                  <span className="text-[11px] font-normal text-neutral-500">รอบปกติ</span>
                </td>
                <td className="py-3.5 px-4 leading-relaxed">
                  • ตอบแชท Line OA/FB/IG<br />
                  • ลงตาราง รายการรับ ORDER สาขา BKK 2569 (NEW)<br />
                  • เคสน้อยกว่า 2 ชม. ต้องจำเองว่าต้องประสาน OP
                </td>
                <td className="py-3.5 px-4 text-amber-700 dark:text-amber-400">
                  เอเจนท์มักลืมขออนุมัติ OP ในเคสเร่งด่วน &lt; 2 ชม. เพราะไม่มีระบบบังคับเตือน
                </td>
                <td className="py-3.5 px-4 text-neutral-900 dark:text-neutral-100 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">OP Gatekeeper Alert:</span> ระบบคำนวณเวลาอัตโนมัติ หากเวลาส่ง &lt; 2 ชม. ระบบจะล็อกปุ่มบันทึกจนกว่าจะติ๊กรับรองว่า OP อนุมัติแล้ว
                </td>
              </tr>

              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  17:00 - 20:00 น.<br />
                  <span className="text-[11px] font-normal text-neutral-500">รอบเย็น (สั่งจัดแล้ว)</span>
                </td>
                <td className="py-3.5 px-4 leading-relaxed">
                  • ลงตาราง BKK (NEW)<br />
                  • พิมพ์ข้อความสั่งจัดส่งเข้ากลุ่มไลน์ "สาขา BKK (Head office)"<br />
                  • กำหนดส่งเช้าวันถัดไป 8:30 - 11:00 น. ตามระยะทาง
                </td>
                <td className="py-3.5 px-4 text-amber-700 dark:text-amber-400">
                  ต้องสลับไปพิมพ์ข้อความใน Line เอง พิมพ์ตกหล่น เช่น ลืมข้อความการ์ด หรือเลขที่ IV
                </td>
                <td className="py-3.5 px-4 text-neutral-900 dark:text-neutral-100 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">One-Click Dispatch:</span> สร้างฟอร์แมตข้อความสั่งจัดสำหรับส่งเข้ากลุ่มไลน์ Head Office อัตโนมัติ พร้อมสลิปยืนยันลูกค้า
                </td>
              </tr>

              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  20:00 - 22:00 น.<br />
                  <span className="text-[11px] font-normal text-neutral-500">รอบดึก (จำกัดโควตา)</span>
                </td>
                <td className="py-3.5 px-4 leading-relaxed">
                  • แคปหน้าแชทส่งกลุ่ม "Admin สาขา BKK"<br />
                  • ลงข้อมูลวันเวลาที่ลูกค้ารับสินค้า<br />
                  • ควบคุมโควตาไม่เกิน 5 ออเดอร์ (1-10 กม. ไม่เกิน 3 เจ้า, 11-20 กม. ไม่เกิน 2 เจ้า)
                </td>
                <td className="py-3.5 px-4 text-rose-700 dark:text-rose-400">
                  โควตานับด้วยสายตา เสี่ยงต่อการรับเกินโควตา 5 รายการ ส่งผลให้ตอนเช้าผลิตไม่ทัน
                </td>
                <td className="py-3.5 px-4 text-neutral-900 dark:text-neutral-100 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Live Quota Enforcement:</span> ตัวนับโควตา Real-time แจ้งเตือนทันทีเมื่อโควตาระยะทางหรือโควตารวม 5 ออเดอร์เต็ม และเตือนให้แนบรูปแคปแชท
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Part 4: Recommendations for AI Agent Implementation */}
      <section className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/40 space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">
            แนวทางการพัฒนาต่อยอดเป็น Autonomous AI Agent
          </h3>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          หากองค์กรต้องการให้ AI Agent (เช่น Gemini-powered Assistant) ช่วยตอบแชทลูกค้าตลอด 24 ชั่วโมง 
          สามารถนำ Business Logic ในแอปนี้ไปแปลงเป็น <strong>Function Calling Tools</strong> ได้ 3 เครื่องมือหลัก:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">1. checkDeliveryFeasibility()</div>
            <div className="text-neutral-500 dark:text-neutral-400 mt-1">
              รับค่าเวลาสั่ง พิกัด และเวลาที่ลูกค้าต้องการรับ &rarr; ส่งคืนสถานะว่าผ่านเกณฑ์ SLA หรือต้องรอประสาน OP หรือโควตารอบดึกเต็มหรือไม่
            </div>
          </div>
          <div className="p-3.5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">2. requestOpApproval()</div>
            <div className="text-neutral-500 dark:text-neutral-400 mt-1">
              เมื่อมีเคสเร่งด่วน &lt; 2 ชม. ให้ AI ยิง Webhook แจ้งเตือนหัวหน้าช่างดอกไม้ (OP) เพื่อกดยืนยันก่อนที่ AI จะแจ้งลูกค้ารับโอนเงิน
            </div>
          </div>
          <div className="p-3.5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">3. dispatchOrderToLine()</div>
            <div className="text-neutral-500 dark:text-neutral-400 mt-1">
              จัดกลุ่มส่งข้อความอัตโนมัติไปยัง Line กลุ่ม Head Office หรือ Admin สาขา BKK ตามกฎช่วงเวลา 8-17, 17-20 และ 20-22 น. อย่างแม่นยำ 100%
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
