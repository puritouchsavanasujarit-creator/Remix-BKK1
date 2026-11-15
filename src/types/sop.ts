export type TimeSlotCategory = 'DAY_8_17' | 'EVENING_17_20' | 'NIGHT_20_22' | 'OUTSIDE_HOURS';

export type DeliveryType = 'NORMAL' | 'EXPRESS_UNDER_25KM' | 'STORE_PICKUP';

export type ChannelSource = 'Line OA' | 'Messenger' | 'Instagram' | 'หน้าร้าน / อื่นๆ';

export type OPStatus = 'NOT_REQUIRED' | 'PENDING_OP' | 'OP_APPROVED' | 'OP_REJECTED';

export type DeliveryStatus = 'PENDING_ARRANGEMENT' | 'IN_PREPARATION' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderNumber: string; // e.g. BKK-2569-0128
  invoiceNumber: string; // เลขที่ IV e.g. IV-6902-0045
  createdAt: string; // ISO date or time
  orderTime: string; // e.g. "14:35" or "20:15"
  channel: ChannelSource;
  customerName: string;
  customerPhone: string;
  productName: string;
  productCode: string;
  productPrice: number;
  deliveryFee: number;
  totalPrice: number;
  deliveryAddress: string;
  distanceKm: number;
  deliveryType: DeliveryType;
  desiredReceiveDate: string; // e.g. "วันนี้" or "วันพรุ่งนี้ 2026-11-10"
  desiredReceiveTime: string; // e.g. "16:00" or "09:00 - 09:30 น."
  cardMessage: string;
  specialInstructions?: string;
  floristName?: string;
  messengerName?: string;
  messengerPhone?: string;
  trackingRef?: string;
  opStatus: OPStatus;
  opNotes?: string;
  deliveryStatus: DeliveryStatus;
  chatScreenshotAttached?: boolean;
  shiftCategory: TimeSlotCategory;
  lineGroupTarget: 'BKK Head office' | 'Admin สาขา BKK' | 'ทั้งสองกลุ่ม' | 'ตารางปกติ';
}

export interface FeasibilityResult {
  status: 'APPROVED' | 'REQUIRES_OP_CONFIRM' | 'QUOTA_WARNING' | 'QUOTA_EXCEEDED' | 'OUTSIDE_HOURS';
  timeSlotCategory: TimeSlotCategory;
  timeSlotLabel: string;
  messengerTravelTime: string;
  customerSLA: string;
  expectedDeliveryWindow: string;
  isUrgentUnder2Hours: boolean;
  actionRequired: string;
  targetLineGroup: string;
  quotaInfo?: {
    usedTotal: number;
    maxTotal: number;
    usedDistanceSlot: number;
    maxDistanceSlot: number;
    isDistanceFull: boolean;
    isTotalFull: boolean;
  };
  warnings: string[];
  recommendations: string[];
  sopClause: string;
}

export interface ParsedChatResult {
  customerName?: string;
  customerPhone?: string;
  address?: string;
  distanceKm?: number;
  desiredTime?: string;
  desiredDate?: string;
  productName?: string;
  price?: number;
  cardMessage?: string;
  invoiceNumber?: string;
  channel?: ChannelSource;
  confidenceScore: number;
  missingFields: string[];
}
