import { SystemLog, AgentPerformance, HourlyLogData } from '../types/dashboard';

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-11-09T21:45:12',
    timeDisplay: '21:45:12',
    severity: 'WARNING',
    category: 'NIGHT_QUOTA',
    message: 'โควตารอบดึก (20:00-22:00 น.) ใกล้เต็ม: บันทึกแล้ว 4/5 รายการ (เหลือ 1 ที่ว่าง)',
    agentName: 'เอเจนท์ กานต์ดา',
    channel: 'Line OA',
    orderNumber: 'BKK-2569-0125',
    details: {
      usedSlots: 4,
      maxSlots: 5,
      remainingSlotFor: '1-10km เท่านั้น (11-20km เต็ม 2 เจ้าแล้ว)'
    }
  },
  {
    id: 'log-102',
    timestamp: '2026-11-09T21:20:05',
    timeDisplay: '21:20:05',
    severity: 'ERROR',
    category: 'OP_GATEKEEPER',
    message: 'พยายามบันทึกเคสเร่งด่วน < 2 ชม. โดยไม่ได้รับการอนุมัติจาก OP (ระบบบล็อกเพื่อป้องกันความผิดพลาด)',
    agentName: 'เอเจนท์ ธีรเดช',
    channel: 'Messenger',
    orderNumber: 'BKK-2569-0124',
    details: {
      requestedReceiveTime: '22:15',
      orderTime: '21:20',
      timeDiffMinutes: 55,
      slaRule: 'เคสน้อยกว่า 2 ชม. ไม่ว่ากี่ กม. ต้องประสานกับ OP ก่อน'
    }
  },
  {
    id: 'log-103',
    timestamp: '2026-11-09T20:55:40',
    timeDisplay: '20:55:40',
    severity: 'INFO',
    category: 'ORDER_CREATE',
    message: 'บันทึกออเดอร์ใหม่สำเร็จ: ชุดพรีเมียมดอกไม้ทิวลิปขาว 10 ดอก (ส่งกลุ่ม Admin สาขา BKK)',
    agentName: 'เอเจนท์ ณิชาภัทร',
    channel: 'Line OA',
    orderNumber: 'BKK-2569-0125',
    details: {
      price: 3420,
      distanceKm: 15.5,
      chatScreenshotAttached: true
    }
  },
  {
    id: 'log-104',
    timestamp: '2026-11-09T20:12:18',
    timeDisplay: '20:12:18',
    severity: 'INFO',
    category: 'DISPATCH_LINE',
    message: 'ส่งข้อมูลสรุปสั่งจัดดอกไม้เข้ากลุ่มไลน์ "สาขา BKK (Head office)" เรียบร้อย',
    agentName: 'เอเจนท์ กานต์ดา',
    channel: 'Instagram',
    orderNumber: 'BKK-2569-0123',
    details: {
      deliveryWindow: '08:30 - 09:00 น.',
      recipient: 'คุณอรนลิน รัตนพงศ์'
    }
  },
  {
    id: 'log-105',
    timestamp: '2026-11-09T18:40:22',
    timeDisplay: '18:40:22',
    severity: 'WARNING',
    category: 'SLA_VALIDATION',
    message: 'ระยะทางจัดส่งเกิน 25 กม. ในกะเย็น: ต้องตรวจสอบเส้นทางกับแมสเซนเจอร์รอบเช้าล่วงหน้า',
    agentName: 'เอเจนท์ ธีรเดช',
    channel: 'Line OA',
    orderNumber: 'BKK-2569-0120',
    details: {
      distanceKm: 27.8,
      recommendedDeliveryWindow: '10:00 - 11:00 น.'
    }
  },
  {
    id: 'log-106',
    timestamp: '2026-11-09T17:15:02',
    timeDisplay: '17:15:02',
    severity: 'INFO',
    category: 'CHAT_PARSER',
    message: 'Chat Parser สกัดข้อมูลสำเร็จ 100%: ชื่อ, เบอร์โทร, ที่อยู่, เวลา, ข้อความการ์ด',
    agentName: 'AI Chatbot Assistant',
    channel: 'Line OA',
    details: {
      confidenceScore: 98,
      extractedFields: 7
    }
  },
  {
    id: 'log-107',
    timestamp: '2026-11-09T15:22:30',
    timeDisplay: '15:22:30',
    severity: 'ERROR',
    category: 'CHAT_PARSER',
    message: 'ข้อความแชทไม่ระบุเบอร์โทรศัพท์และที่อยู่จัดส่ง: ระบบส่งแจ้งเตือนให้เอเจนท์สอบถามเพิ่มเติม',
    agentName: 'เอเจนท์ ณิชาภัทร',
    channel: 'Instagram',
    details: {
      missingFields: ['เบอร์โทรศัพท์ลูกค้า', 'ที่อยู่จัดส่งละเอียด']
    }
  },
  {
    id: 'log-108',
    timestamp: '2026-11-09T13:45:11',
    timeDisplay: '13:45:11',
    severity: 'INFO',
    category: 'OP_GATEKEEPER',
    message: 'OP ช่างแนน อนุมัติเคสเร่งด่วน 1 ชม. 15 นาที เรียบร้อย: จัดสรรสต็อกไฮเดรนเยียทันที',
    agentName: 'เอเจนท์ กานต์ดา',
    channel: 'Messenger',
    orderNumber: 'BKK-2569-0122',
    details: {
      approver: 'ช่างแนน (หัวหน้า OP สาขา BKK)',
      preparationTimeEstimated: '35 นาที'
    }
  },
  {
    id: 'log-109',
    timestamp: '2026-11-09T11:10:45',
    timeDisplay: '11:10:45',
    severity: 'WARNING',
    category: 'SLA_VALIDATION',
    message: 'ชุดส่งด่วนระยะทาง 24.5 กม. ใกล้เพดาน 25 กม.: แจ้งแมสเซนเจอร์เตรียมพร้อมเดินทางด่วน',
    agentName: 'เอเจนท์ อนันต์',
    channel: 'Line OA',
    orderNumber: 'BKK-2569-0118',
    details: {
      distanceKm: 24.5,
      maxExpressKm: 25.0
    }
  },
  {
    id: 'log-110',
    timestamp: '2026-11-09T09:30:15',
    timeDisplay: '09:30:15',
    severity: 'INFO',
    category: 'ORDER_CREATE',
    message: 'เปิดบิล IV-6902-0041 สำเร็จ: ช่อกุหลาบแดงพรีเมียม Ecuador 9 ดอก ส่งสาทร',
    agentName: 'เอเจนท์ กานต์ดา',
    channel: 'Line OA',
    orderNumber: 'BKK-2569-0121',
    details: {
      price: 3040,
      distanceKm: 7.5
    }
  }
];

export const AGENT_STATS: AgentPerformance[] = [
  {
    id: 'ag-1',
    name: 'กานต์ดา ศิริสุข (หัวหน้ากะ)',
    role: 'Senior Sales Agent',
    avatarColor: 'bg-rose-500',
    ordersLogged: 42,
    avgProcessSeconds: 38,
    accuracyRate: 99.2,
    urgentHandled: 12,
    lastActive: '2 นาทีที่แล้ว',
    status: 'ACTIVE'
  },
  {
    id: 'ag-2',
    name: 'ณิชาภัทร รุ่งเรือง',
    role: 'Customer Support',
    avatarColor: 'bg-purple-500',
    ordersLogged: 36,
    avgProcessSeconds: 44,
    accuracyRate: 98.5,
    urgentHandled: 8,
    lastActive: '5 นาทีที่แล้ว',
    status: 'ACTIVE'
  },
  {
    id: 'ag-3',
    name: 'ธีรเดช พงษ์ไพบูลย์',
    role: 'Night Shift Specialist',
    avatarColor: 'bg-blue-500',
    ordersLogged: 29,
    avgProcessSeconds: 46,
    accuracyRate: 96.8,
    urgentHandled: 6,
    lastActive: '12 นาทีที่แล้ว',
    status: 'ACTIVE'
  },
  {
    id: 'ag-4',
    name: 'อนันต์ ชัยเจริญ',
    role: 'Sales Associate',
    avatarColor: 'bg-emerald-500',
    ordersLogged: 24,
    avgProcessSeconds: 52,
    accuracyRate: 97.4,
    urgentHandled: 4,
    lastActive: '45 นาทีที่แล้ว',
    status: 'IDLE'
  },
  {
    id: 'ag-5',
    name: 'AI Smart Chatbot Agent',
    role: 'Automated Bot (24/7)',
    avatarColor: 'bg-amber-500',
    ordersLogged: 68,
    avgProcessSeconds: 12,
    accuracyRate: 98.9,
    urgentHandled: 15,
    lastActive: 'เมื่อสักครู่',
    status: 'ACTIVE'
  }
];

export const HOURLY_24H_DATA: HourlyLogData[] = [
  { timeLabel: '00:00', info: 4, warning: 1, error: 0, total: 5 },
  { timeLabel: '02:00', info: 2, warning: 0, error: 0, total: 2 },
  { timeLabel: '04:00', info: 3, warning: 0, error: 0, total: 3 },
  { timeLabel: '06:00', info: 8, warning: 1, error: 0, total: 9 },
  { timeLabel: '08:00', info: 28, warning: 4, error: 1, total: 33 },
  { timeLabel: '10:00', info: 45, warning: 7, error: 2, total: 54 },
  { timeLabel: '12:00', info: 58, warning: 12, error: 3, total: 73 },
  { timeLabel: '14:00', info: 62, warning: 9, error: 2, total: 73 },
  { timeLabel: '16:00', info: 52, warning: 8, error: 1, total: 61 },
  { timeLabel: '18:00', info: 48, warning: 14, error: 3, total: 65 },
  { timeLabel: '20:00', info: 38, warning: 16, error: 4, total: 58 },
  { timeLabel: '22:00', info: 18, warning: 5, error: 1, total: 24 }
];

export const DAILY_7D_DATA = [
  { timeLabel: 'จันทร์', info: 180, warning: 32, error: 8, total: 220 },
  { timeLabel: 'อังคาร', info: 165, warning: 28, error: 6, total: 199 },
  { timeLabel: 'พุธ', info: 195, warning: 35, error: 7, total: 237 },
  { timeLabel: 'พฤหัสบดี', info: 210, warning: 41, error: 9, total: 260 },
  { timeLabel: 'ศุกร์', info: 260, warning: 54, error: 14, total: 328 },
  { timeLabel: 'เสาร์', info: 285, warning: 62, error: 16, total: 363 },
  { timeLabel: 'อาทิตย์ (วันนี้)', info: 240, warning: 48, error: 11, total: 299 }
];

export const MONTHLY_30D_DATA = [
  { timeLabel: 'สัปดาห์ 1', info: 1240, warning: 210, error: 45, total: 1495 },
  { timeLabel: 'สัปดาห์ 2', info: 1380, warning: 245, error: 52, total: 1677 },
  { timeLabel: 'สัปดาห์ 3', info: 1450, warning: 260, error: 48, total: 1758 },
  { timeLabel: 'สัปดาห์ 4', info: 1520, warning: 280, error: 56, total: 1856 }
];
