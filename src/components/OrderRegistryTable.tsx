import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  FileText, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  MessageSquare,
  AlertCircle,
  Calendar,
  X,
  User,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { OrderItem, TimeSlotCategory, OPStatus, DeliveryStatus } from '../types/sop';
import { generateHeadOfficeLineMessage, generateAdminBranchLineMessage } from '../utils/feasibilityEngine';

interface OrderRegistryTableProps {
  orders: OrderItem[];
  onUpdateOrder: (order: OrderItem) => void;
  onDeleteOrder: (id: string) => void;
}

const DELIVERY_STATUS_CONFIG: Record<DeliveryStatus, { label: string; badgeClass: string }> = {
  PENDING_ARRANGEMENT: {
    label: 'รอจัดดอกไม้',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  IN_PREPARATION: {
    label: 'กำลังจัดช่อ',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  DISPATCHED: {
    label: 'ไรเดอร์กำลังนำส่ง',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  DELIVERED: {
    label: 'จัดส่งสำเร็จ',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  CANCELLED: {
    label: 'ยกเลิกออเดอร์',
    badgeClass: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700',
  },
};

export default function OrderRegistryTable({ orders, onUpdateOrder, onDeleteOrder }: OrderRegistryTableProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterDate, setFilterDate] = useState<string>('ALL');
  const [filterShift, setFilterShift] = useState<'ALL' | TimeSlotCategory>('ALL');
  const [filterOp, setFilterOp] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'NOT_REQUIRED'>('ALL');
  const [filterDeliveryStatus, setFilterDeliveryStatus] = useState<'ALL' | DeliveryStatus>('ALL');

  // Modal & Copy State
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique available delivery dates from orders
  const availableDates = useMemo(() => {
    const dateMap = new Map<string, number>();
    orders.forEach((o) => {
      const d = (o.desiredReceiveDate || '').trim();
      if (d) {
        dateMap.set(d, (dateMap.get(d) || 0) + 1);
      }
    });
    return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
  }, [orders]);

  // Check if any filters are active
  const hasActiveFilters = 
    searchTerm.trim() !== '' ||
    filterCustomer.trim() !== '' ||
    filterDate !== 'ALL' ||
    filterShift !== 'ALL' ||
    filterOp !== 'ALL' ||
    filterDeliveryStatus !== 'ALL';

  // Clear all filters handler
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterCustomer('');
    setFilterDate('ALL');
    setFilterShift('ALL');
    setFilterOp('ALL');
    setFilterDeliveryStatus('ALL');
  };

  // Filtered orders logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Shift filter
      if (filterShift !== 'ALL' && o.shiftCategory !== filterShift) return false;

      // 2. OP Status filter
      if (filterOp === 'PENDING' && o.opStatus !== 'PENDING_OP') return false;
      if (filterOp === 'APPROVED' && o.opStatus !== 'OP_APPROVED') return false;
      if (filterOp === 'NOT_REQUIRED' && o.opStatus !== 'NOT_REQUIRED') return false;

      // 3. Delivery Status filter
      if (filterDeliveryStatus !== 'ALL' && o.deliveryStatus !== filterDeliveryStatus) return false;

      // 4. Date filter
      if (filterDate !== 'ALL') {
        const matchesDate = 
          (o.desiredReceiveDate && o.desiredReceiveDate.includes(filterDate)) ||
          (o.createdAt && o.createdAt.includes(filterDate));
        if (!matchesDate) return false;
      }

      // 5. Customer Specific Filter
      if (filterCustomer.trim()) {
        const c = filterCustomer.toLowerCase().trim();
        const matchesCustomer = 
          o.customerName.toLowerCase().includes(c) ||
          o.customerPhone.includes(c);
        if (!matchesCustomer) return false;
      }

      // 6. General Search term (searches across name, phone, orderNumber, IV, address, product, cardMessage)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const match =
          o.orderNumber.toLowerCase().includes(q) ||
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.deliveryAddress.toLowerCase().includes(q) ||
          (o.cardMessage && o.cardMessage.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [orders, searchTerm, filterCustomer, filterDate, filterShift, filterOp, filterDeliveryStatus]);

  // Calculate Night Quota stats
  const nightOrders = orders.filter((o) => o.shiftCategory === 'NIGHT_20_22' && o.deliveryStatus !== 'CANCELLED');
  const totalNight = nightOrders.length;
  const night1to10 = nightOrders.filter((o) => o.distanceKm <= 10).length;
  const night11to20 = nightOrders.filter((o) => o.distanceKm > 10 && o.distanceKm <= 20).length;

  const handleApproveOp = (order: OrderItem) => {
    const updated: OrderItem = {
      ...order,
      opStatus: 'OP_APPROVED',
      opNotes: `OP อนุมัติเมื่อ ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`
    };
    onUpdateOrder(updated);
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(updated);
    }
  };

  const handleUpdateDeliveryStatus = (order: OrderItem, newStatus: DeliveryStatus) => {
    const updated: OrderItem = {
      ...order,
      deliveryStatus: newStatus,
    };
    onUpdateOrder(updated);
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(updated);
    }
  };

  const handleCopyLine = (order: OrderItem) => {
    const text = order.shiftCategory === 'NIGHT_20_22'
      ? generateAdminBranchLineMessage(order)
      : generateHeadOfficeLineMessage(order);
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCsv = () => {
    const headers = [
      'OrderNumber',
      'InvoiceNumber',
      'OrderTime',
      'Channel',
      'CustomerName',
      'CustomerPhone',
      'Product',
      'Price',
      'Address',
      'DistanceKm',
      'DesiredDate',
      'DesiredTime',
      'OPStatus',
      'DeliveryStatus',
      'Shift',
      'CardMessage'
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.invoiceNumber}"`,
      `"${o.orderTime}"`,
      `"${o.channel}"`,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.productName}"`,
      o.totalPrice,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      o.distanceKm,
      `"${o.desiredReceiveDate}"`,
      `"${o.desiredReceiveTime}"`,
      `"${o.opStatus}"`,
      `"${o.deliveryStatus}"`,
      `"${o.shiftCategory}"`,
      `"${(o.cardMessage || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bkk_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Bar & Quota Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total orders */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="text-xs text-neutral-500">ออเดอร์ทั้งหมดในตารางสาขา BKK</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-1">
            {orders.length} <span className="text-xs font-normal text-neutral-400">รายการ</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            แสดงผล: <span className="font-semibold text-rose-600 dark:text-rose-400">{filteredOrders.length}</span> จากทั้งหมด {orders.length}
          </div>
        </div>

        {/* Night Quota Tracker */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>โควตารอบดึก 20:00-22:00 น. วันนี้</span>
            <span className={`font-mono-numbers font-semibold ${totalNight >= 4 ? 'text-rose-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
              {totalNight} / 4 ออเดอร์
            </span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full transition-all ${totalNight >= 4 ? 'bg-rose-500' : totalNight >= 3 ? 'bg-amber-500' : 'bg-purple-600'}`}
              style={{ width: `${Math.min(100, (totalNight / 4) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-neutral-500 mt-2 font-mono-numbers">
            <span>1-10 กม.: {night1to10}/2 เจ้า</span>
            <span>11-20 กม.: {night11to20}/2 เจ้า</span>
          </div>
        </div>

        {/* OP Gatekeeper Count */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="text-xs text-neutral-500">เคสเร่งด่วน &lt; 2 ชม. (OP Gatekeeper)</div>
          <div className="flex items-center gap-3 mt-1">
            <div className="text-2xl font-bold font-mono-numbers text-rose-600 dark:text-rose-400">
              {orders.filter((o) => o.opStatus === 'PENDING_OP').length}
            </div>
            <div className="text-xs text-neutral-500">
              {orders.filter((o) => o.opStatus === 'PENDING_OP').length > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-medium">รอ OP อนุมัติก่อนคอนเฟิร์ม!</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">ไม่มีเคสค้างรอ OP</span>
              )}
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            อนุมัติแล้ว: {orders.filter((o) => o.opStatus === 'OP_APPROVED').length} รายการ
          </div>
        </div>
      </div>

      {/* Comprehensive Search & Filter Controls Panel */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        {/* Row 1: Search Inputs and Action Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Main Search Bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาด่วน: เลขที่ออเดอร์, เลขที่ IV, ชื่อลูกค้า, เบอร์โทร, ที่อยู่จัดส่ง หรือข้อความในการ์ด..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full"
                title="ล้างข้อความค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Customer Specific Search */}
          <div className="w-full sm:w-64 relative">
            <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              placeholder="กรองเฉพาะชื่อลูกค้า / เบอร์..."
              className="w-full pl-8.5 pr-8 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {filterCustomer && (
              <button
                onClick={() => setFilterCustomer('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCsv}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filteredOrders.length})</span>
          </button>
        </div>

        {/* Row 2: Secondary Filters (Date, Delivery Status, OP Status, Shift Tabs) */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Delivery Date */}
            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/60 p-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700/60">
              <Calendar className="w-3.5 h-3.5 text-neutral-500 ml-1.5 shrink-0" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-2 py-1 text-xs rounded-md bg-transparent text-neutral-800 dark:text-neutral-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">📅 วันที่จัดส่ง: ทั้งหมด</option>
                <option value="วันนี้">วันนี้</option>
                <option value="วันพรุ่งนี้">วันพรุ่งนี้</option>
                {availableDates
                  .filter((d) => d.date !== 'วันนี้' && d.date !== 'วันพรุ่งนี้')
                  .map((d, idx) => (
                    <option key={idx} value={d.date}>
                      {d.date} ({d.count} รายการ)
                    </option>
                  ))}
              </select>
            </div>

            {/* Filter by Delivery Status */}
            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/60 p-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700/60">
              <Truck className="w-3.5 h-3.5 text-neutral-500 ml-1.5 shrink-0" />
              <select
                value={filterDeliveryStatus}
                onChange={(e) => setFilterDeliveryStatus(e.target.value as any)}
                className="px-2 py-1 text-xs rounded-md bg-transparent text-neutral-800 dark:text-neutral-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">🚚 สถานะจัดส่ง: ทั้งหมด</option>
                <option value="PENDING_ARRANGEMENT">🟡 รอจัดดอกไม้</option>
                <option value="IN_PREPARATION">🔵 กำลังจัดช่อ</option>
                <option value="DISPATCHED">🟣 ไรเดอร์กำลังนำส่ง</option>
                <option value="DELIVERED">🟢 จัดส่งสำเร็จ</option>
                <option value="CANCELLED">⚪ ยกเลิกออเดอร์</option>
              </select>
            </div>

            {/* Filter by OP Gatekeeper Status */}
            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/60 p-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700/60">
              <ShieldAlert className="w-3.5 h-3.5 text-neutral-500 ml-1.5 shrink-0" />
              <select
                value={filterOp}
                onChange={(e) => setFilterOp(e.target.value as any)}
                className="px-2 py-1 text-xs rounded-md bg-transparent text-neutral-800 dark:text-neutral-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">🛡️ สถานะ OP: ทั้งหมด</option>
                <option value="PENDING">🚨 รอ OP คอนเฟิร์ม (&lt; 2 ชม.)</option>
                <option value="APPROVED">✅ OP อนุมัติแล้ว</option>
                <option value="NOT_REQUIRED">ปกติ (ไม่ต้องผ่าน OP)</option>
              </select>
            </div>
          </div>

          {/* Shift Segmented Tabs */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs overflow-x-auto">
            <button
              onClick={() => setFilterShift('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterShift === 'ALL'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              ทุกกะ
            </button>
            <button
              onClick={() => setFilterShift('DAY_8_17')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterShift === 'DAY_8_17'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              กะ 08-17 น.
            </button>
            <button
              onClick={() => setFilterShift('EVENING_17_20')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterShift === 'EVENING_17_20'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              กะ 17-20 น.
            </button>
            <button
              onClick={() => setFilterShift('NIGHT_20_22')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterShift === 'NIGHT_20_22'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              กะ 20-22 น.
            </button>
          </div>
        </div>

        {/* Row 3: Active Filters Summary Pills */}
        {hasActiveFilters && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-400 font-medium">ตัวกรองที่ใช้งานอยู่:</span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[11px]">
                <span>ค้นหา: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterCustomer && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px]">
                <span>ลูกค้า: "{filterCustomer}"</span>
                <button onClick={() => setFilterCustomer('')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterDate !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-[11px]">
                <span>วันที่: {filterDate}</span>
                <button onClick={() => setFilterDate('ALL')} className="hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterDeliveryStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 text-[11px]">
                <span>สถานะจัดส่ง: {DELIVERY_STATUS_CONFIG[filterDeliveryStatus].label}</span>
                <button onClick={() => setFilterDeliveryStatus('ALL')} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterOp !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[11px]">
                <span>สถานะ OP: {filterOp === 'PENDING' ? 'รอ OP คอนเฟิร์ม' : filterOp === 'APPROVED' ? 'OP อนุมัติแล้ว' : 'ปกติ'}</span>
                <button onClick={() => setFilterOp('ALL')} className="hover:text-rose-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterShift !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 text-[11px]">
                <span>กะ: {filterShift === 'DAY_8_17' ? '08-17 น.' : filterShift === 'EVENING_17_20' ? '17-20 น.' : '20-22 น.'}</span>
                <button onClick={() => setFilterShift('ALL')} className="hover:text-neutral-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="ml-auto text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรองทั้งหมด ({filteredOrders.length} รายการที่ตรง)</span>
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100/70 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                <th className="py-3 px-3.5 whitespace-nowrap">เลขที่ / IV</th>
                <th className="py-3 px-3.5 whitespace-nowrap">เวลา / ช่องทาง</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ลูกค้า &amp; เบอร์โทร</th>
                <th className="py-3 px-3.5 whitespace-nowrap">รายการสินค้า</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ยอดรวม</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ระยะทาง / เวลาแมส</th>
                <th className="py-3 px-3.5 whitespace-nowrap">เวลานัดรับสินค้า</th>
                <th className="py-3 px-3.5 whitespace-nowrap">สถานะจัดส่ง</th>
                <th className="py-3 px-3.5 whitespace-nowrap">สถานะ OP</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-2 text-neutral-500">
                      <div className="w-10 h-10 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                        <Filter className="w-5 h-5" />
                      </div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
                        ไม่พบรายการออเดอร์ตามเงื่อนไขที่เลือก
                      </div>
                      <p className="text-xs text-neutral-400">
                        ลองเปลี่ยนคำค้นหา หรือกดปุ่มด้านล่างเพื่อรีเซ็ตตัวกรองทั้งหมด
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 px-3.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          ล้างตัวกรองทั้งหมด
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusConf = DELIVERY_STATUS_CONFIG[order.deliveryStatus || 'PENDING_ARRANGEMENT'];

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      {/* Order & IV */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono-numbers">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">{order.orderNumber}</div>
                        <div className="text-[11px] text-neutral-400">{order.invoiceNumber}</div>
                      </td>

                      {/* Time & Channel */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-mono-numbers font-medium text-neutral-900 dark:text-neutral-100">{order.orderTime} น.</div>
                        <div className="text-[11px] text-neutral-500">{order.channel}</div>
                      </td>

                      {/* Customer & Phone */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">{order.customerName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono-numbers">{order.customerPhone}</div>
                      </td>

                      {/* Product */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <div className="truncate font-medium text-neutral-900 dark:text-neutral-100" title={order.productName}>
                          {order.productName}
                        </div>
                        <div className="text-[11px] text-neutral-400">{order.productCode}</div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono-numbers">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {order.totalPrice.toLocaleString()} บ.
                        </span>
                      </td>

                      {/* Distance & Travel time */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono-numbers">
                        <div className="text-neutral-900 dark:text-neutral-100 font-medium">{order.distanceKm} กม.</div>
                        <div className="text-[11px] text-neutral-500">
                          {order.distanceKm <= 10 ? '20-30 น.' : order.distanceKm <= 20 ? '40 น.' : order.distanceKm <= 30 ? '40-50 น.' : '60-90 น.'}
                        </div>
                      </td>

                      {/* Desired Receive Date & Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>{order.desiredReceiveDate}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono-numbers ml-4">
                          {order.desiredReceiveTime}
                        </div>
                      </td>

                      {/* Delivery Status Select Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={order.deliveryStatus || 'PENDING_ARRANGEMENT'}
                            onChange={(e) => handleUpdateDeliveryStatus(order, e.target.value as DeliveryStatus)}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none appearance-none pr-6 ${statusConf.badgeClass}`}
                          >
                            <option value="PENDING_ARRANGEMENT">รอจัดดอกไม้</option>
                            <option value="IN_PREPARATION">กำลังจัดช่อ</option>
                            <option value="DISPATCHED">ไรเดอร์กำลังนำส่ง</option>
                            <option value="DELIVERED">จัดส่งสำเร็จ</option>
                            <option value="CANCELLED">ยกเลิกออเดอร์</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* OP Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {order.opStatus === 'PENDING_OP' ? (
                          <button
                            onClick={() => handleApproveOp(order)}
                            className="px-2 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded border border-rose-300 dark:border-rose-800 hover:bg-rose-100 transition-colors"
                            title="คลิกเพื่ออนุมัติ OP"
                          >
                            🚨 รอ OP คอนเฟิร์ม
                          </button>
                        ) : order.opStatus === 'OP_APPROVED' ? (
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OP อนุมัติแล้ว
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-400">ปกติ</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                          title="ดูรายละเอียดการ์ดและที่อยู่"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyLine(order)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                          title="คัดลอกข้อความ Line"
                        >
                          {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
                          title="ลบออเดอร์"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <div className="text-xs text-neutral-500 font-mono-numbers">{selectedOrder.orderNumber}</div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">รายละเอียดคำสั่งซื้อ</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-500">เลขที่ IV:</span>
                  <div className="font-mono-numbers font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.invoiceNumber}</div>
                </div>
                <div>
                  <span className="text-neutral-500">เวลารับออเดอร์:</span>
                  <div className="font-mono-numbers font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.orderTime} น. ({selectedOrder.channel})</div>
                </div>
              </div>

              <div>
                <span className="text-neutral-500">ลูกค้า &amp; เบอร์โทร:</span>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
              </div>

              <div>
                <span className="text-neutral-500">สินค้า:</span>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.productName} ({selectedOrder.totalPrice.toLocaleString()} บ.)</div>
              </div>

              <div>
                <span className="text-neutral-500">สถานที่จัดส่ง ({selectedOrder.distanceKm} กม.):</span>
                <div className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">{selectedOrder.deliveryAddress}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-500">วันและเวลานัดรับ:</span>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                    {selectedOrder.desiredReceiveDate} {selectedOrder.desiredReceiveTime}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-500">สถานะการจัดส่ง:</span>
                  <div className="mt-1">
                    <select
                      value={selectedOrder.deliveryStatus || 'PENDING_ARRANGEMENT'}
                      onChange={(e) => handleUpdateDeliveryStatus(selectedOrder, e.target.value as DeliveryStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded border ${
                        DELIVERY_STATUS_CONFIG[selectedOrder.deliveryStatus || 'PENDING_ARRANGEMENT'].badgeClass
                      }`}
                    >
                      <option value="PENDING_ARRANGEMENT">รอจัดดอกไม้</option>
                      <option value="IN_PREPARATION">กำลังจัดช่อ</option>
                      <option value="DISPATCHED">ไรเดอร์กำลังนำส่ง</option>
                      <option value="DELIVERED">จัดส่งสำเร็จ</option>
                      <option value="CANCELLED">ยกเลิกออเดอร์</option>
                    </select>
                  </div>
                </div>
              </div>

              {selectedOrder.cardMessage && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 font-semibold">ข้อความในการ์ด:</span>
                  <div className="italic text-neutral-800 dark:text-neutral-200 mt-1">"{selectedOrder.cardMessage}"</div>
                </div>
              )}

              {selectedOrder.opStatus === 'PENDING_OP' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> เคสเร่งด่วน &lt; 2 ชม. ต้องได้รับการอนุมัติจาก OP!
                  </div>
                  <button
                    onClick={() => handleApproveOp(selectedOrder)}
                    className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-xs transition-colors"
                  >
                    กดอนุมัติเคสนี้แทน OP
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
