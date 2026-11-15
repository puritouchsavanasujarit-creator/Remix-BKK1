import React, { useState, useId, useMemo, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Check, 
  Phone, 
  User, 
  Tag, 
  Send, 
  Flame, 
  ShieldAlert, 
  Plus, 
  ArrowRight,
  MessageSquareText,
  Calendar,
  Share2,
  UserCheck,
  History,
  Search,
  X,
  ChevronRight,
  Building
} from 'lucide-react';
import { OrderItem, TimeSlotCategory, DeliveryType, ChannelSource, OPStatus } from '../types/sop';
import { assessFeasibility, parseCustomerChat, generateHeadOfficeLineMessage, generateAdminBranchLineMessage, generateCustomerConfirmationSlip } from '../utils/feasibilityEngine';
import { CHAT_PRESETS } from '../data/sopRules';

interface AgentWorkspaceProps {
  orders: OrderItem[];
  onAddOrder: (order: OrderItem) => void;
}

export default function AgentWorkspace({ orders, onAddOrder }: AgentWorkspaceProps) {
  // Input chat text
  const [chatInput, setChatInput] = useState('');
  
  // Simulated current time for testing different shifts
  const [orderTime, setOrderTime] = useState<string>(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  // Form states
  const [channel, setChannel] = useState<ChannelSource>('Line OA');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(8.0);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('NORMAL');
  const [desiredReceiveDate, setDesiredReceiveDate] = useState('วันนี้');
  const [desiredReceiveTime, setDesiredReceiveTime] = useState('15:30');
  const [productName, setProductName] = useState('ช่อกุหลาบแดงพรีเมียม Ecuador 9 ดอก');
  const [productCode, setProductCode] = useState('FLW-RD-09');
  const [productPrice, setProductPrice] = useState<number>(2890);
  const [deliveryFee, setDeliveryFee] = useState<number>(150);
  const [invoiceNumber, setInvoiceNumber] = useState('IV-6902-0046');
  const [cardMessage, setCardMessage] = useState('สุขสันต์วันเกิด ขอให้มีแต่ความสุขและความสำเร็จในทุกสิ่งค่ะ');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [opApproved, setOpApproved] = useState(false);
  const [chatScreenshotAttached, setChatScreenshotAttached] = useState(false);

  // Copy feedback state
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [justAddedSuccess, setJustAddedSuccess] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);

  // Customer Directory & Auto-Fill states
  const [showCustomerDirectoryModal, setShowCustomerDirectoryModal] = useState(false);
  const [directorySearchTerm, setDirectorySearchTerm] = useState('');
  const [activeSuggestionField, setActiveSuggestionField] = useState<'NAME' | 'PHONE' | null>(null);
  const [autoFilledToast, setAutoFilledToast] = useState<string | null>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  // Extract unique customer profiles from past orders
  interface CustomerProfile {
    id: string;
    name: string;
    phone: string;
    address: string;
    distanceKm: number;
    channel?: ChannelSource;
    orderCount: number;
    lastOrderNumber: string;
    lastProductName?: string;
    lastCardMessage?: string;
    lastOrderDate?: string;
  }

  const storedCustomers: CustomerProfile[] = useMemo(() => {
    const map = new Map<string, CustomerProfile>();
    orders.forEach((o) => {
      const cleanPhone = (o.customerPhone || '').replace(/\D/g, '');
      const key = cleanPhone || (o.customerName || '').toLowerCase().trim();
      if (!key) return;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          id: o.id,
          name: o.customerName,
          phone: o.customerPhone,
          address: o.deliveryAddress,
          distanceKm: o.distanceKm,
          channel: o.channel,
          orderCount: 1,
          lastOrderNumber: o.orderNumber,
          lastProductName: o.productName,
          lastCardMessage: o.cardMessage,
          lastOrderDate: o.desiredReceiveDate || o.createdAt,
        });
      } else {
        existing.orderCount += 1;
        if ((!existing.address || existing.address.length < o.deliveryAddress.length) && o.deliveryAddress) {
          existing.address = o.deliveryAddress;
          existing.distanceKm = o.distanceKm;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount);
  }, [orders]);

  // Real-time matched suggestions based on what agent is typing
  const matchingSuggestions = useMemo(() => {
    if (!activeSuggestionField) return [];

    if (activeSuggestionField === 'NAME') {
      const q = customerName.toLowerCase().trim();
      if (q.length < 2) return [];
      return storedCustomers.filter((c) => 
        c.name.toLowerCase().includes(q) || 
        c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      ).slice(0, 5);
    }

    if (activeSuggestionField === 'PHONE') {
      const digits = customerPhone.replace(/\D/g, '');
      if (digits.length < 3) return [];
      return storedCustomers.filter((c) => 
        c.phone.replace(/\D/g, '').includes(digits) ||
        c.name.toLowerCase().includes(customerPhone.toLowerCase().trim())
      ).slice(0, 5);
    }

    return [];
  }, [activeSuggestionField, customerName, customerPhone, storedCustomers]);

  // Detected exact match for banner reminder
  const exactCustomerMatch = useMemo(() => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const cleanName = customerName.toLowerCase().trim();

    return storedCustomers.find((c) => {
      const cPhone = c.phone.replace(/\D/g, '');
      const cName = c.name.toLowerCase().trim();
      const phoneMatched = cleanPhone.length >= 8 && cPhone.includes(cleanPhone);
      const nameMatched = cleanName.length >= 3 && (cName === cleanName || cName.includes(cleanName));
      return (phoneMatched || nameMatched) && c.address && c.address !== deliveryAddress;
    });
  }, [customerPhone, customerName, deliveryAddress, storedCustomers]);

  // Auto-fill customer details
  const handleAutoFillCustomer = (profile: CustomerProfile) => {
    if (profile.name) setCustomerName(profile.name);
    if (profile.phone) setCustomerPhone(profile.phone);
    if (profile.address) setDeliveryAddress(profile.address);
    if (profile.distanceKm !== undefined) setDistanceKm(profile.distanceKm);
    if (profile.channel) setChannel(profile.channel);

    setActiveSuggestionField(null);
    setShowCustomerDirectoryModal(false);
    setAutoFilledToast(`✨ ดึงข้อมูลลูกค้าเก่า "${profile.name}" (${profile.phone}) และสถานที่จัดส่งเรียบร้อยแล้ว`);
    setTimeout(() => setAutoFilledToast(null), 4000);
  };

  // Click outside to dismiss autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionContainerRef.current && !suggestionContainerRef.current.contains(e.target as Node)) {
        setActiveSuggestionField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gemini AI Smart Slip Parser
  const handleAiParseChat = async () => {
    if (!chatInput.trim() || isAiParsing) return;
    setIsAiParsing(true);
    try {
      const res = await fetch('/api/ai/parse-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatText: chatInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.customerName) setCustomerName(data.customerName);
        if (data.customerPhone) setCustomerPhone(data.customerPhone);
        if (data.address) setDeliveryAddress(data.address);
        if (data.distanceKm) setDistanceKm(Number(data.distanceKm));
        if (data.desiredTime) setDesiredReceiveTime(data.desiredTime);
        if (data.desiredDate) setDesiredReceiveDate(data.desiredDate);
        if (data.productName) setProductName(data.productName);
        if (data.price) setProductPrice(Number(data.price));
        if (data.cardMessage) setCardMessage(data.cardMessage);
        if (data.invoiceNumber) setInvoiceNumber(data.invoiceNumber);
      } else {
        // Fallback to local rule-based parser
        handleParseChat(chatInput);
      }
    } catch (e) {
      handleParseChat(chatInput);
    } finally {
      setIsAiParsing(false);
    }
  };
  const feasibility = assessFeasibility({
    orderTime,
    distanceKm,
    deliveryType,
    desiredReceiveTime,
    currentNightOrders: orders,
    isExpress: deliveryType === 'EXPRESS_UNDER_25KM'
  });

  // Handle Chat Parse
  const handleParseChat = (textToParse: string) => {
    const parsed = parseCustomerChat(textToParse);
    if (parsed.customerName) setCustomerName(parsed.customerName);
    if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
    if (parsed.address) setDeliveryAddress(parsed.address);
    if (parsed.distanceKm) setDistanceKm(parsed.distanceKm);
    if (parsed.desiredTime) setDesiredReceiveTime(parsed.desiredTime);
    if (parsed.desiredDate) setDesiredReceiveDate(parsed.desiredDate);
    if (parsed.productName) setProductName(parsed.productName);
    if (parsed.price) setProductPrice(parsed.price);
    if (parsed.cardMessage) setCardMessage(parsed.cardMessage);
    if (parsed.invoiceNumber) setInvoiceNumber(parsed.invoiceNumber);
    if (parsed.channel) setChannel(parsed.channel);
  };

  const handleSelectPreset = (presetText: string, category: string) => {
    setChatInput(presetText);
    if (category === 'DAY_8_17') {
      setOrderTime('14:00');
      setDesiredReceiveDate('วันนี้');
      setDesiredReceiveTime('15:30');
    } else if (category === 'URGENT') {
      setOrderTime('11:30');
      setDesiredReceiveDate('วันนี้');
      setDesiredReceiveTime('12:45');
      setOpApproved(false);
    } else if (category === 'EVENING_17_20') {
      setOrderTime('18:30');
      setDesiredReceiveDate('วันพรุ่งนี้');
      setDesiredReceiveTime('08:45');
    } else if (category === 'NIGHT_20_22') {
      setOrderTime('20:45');
      setDesiredReceiveDate('วันพรุ่งนี้');
      setDesiredReceiveTime('09:15');
      setChatScreenshotAttached(true);
    } else if (category === 'STORE_PICKUP') {
      setOrderTime('19:00');
      setDeliveryType('STORE_PICKUP');
      setDesiredReceiveDate('วันพรุ่งนี้');
      setDesiredReceiveTime('08:20');
      setDeliveryFee(0);
    }
    handleParseChat(presetText);
  };

  // Preview Order Object
  const currentDraftOrder: OrderItem = {
    id: `ord-${Date.now()}`,
    orderNumber: `BKK-2569-${String(orders.length + 121).padStart(4, '0')}`,
    invoiceNumber: invoiceNumber || 'IV-6902-AUTO',
    createdAt: new Date().toISOString(),
    orderTime,
    channel,
    customerName: customerName || 'ยังไม่ระบุชื่อ',
    customerPhone: customerPhone || 'ยังไม่ระบุเบอร์',
    productName: productName || 'สินค้าดอกไม้',
    productCode: productCode || 'FLW-01',
    productPrice: Number(productPrice) || 0,
    deliveryFee: Number(deliveryFee) || 0,
    totalPrice: (Number(productPrice) || 0) + (Number(deliveryFee) || 0),
    deliveryAddress: deliveryAddress || 'ยังไม่ระบุที่อยู่',
    distanceKm: Number(distanceKm) || 0,
    deliveryType,
    desiredReceiveDate,
    desiredReceiveTime,
    cardMessage,
    specialInstructions,
    opStatus: feasibility.isUrgentUnder2Hours ? (opApproved ? 'OP_APPROVED' : 'PENDING_OP') : 'NOT_REQUIRED',
    deliveryStatus: 'PENDING_ARRANGEMENT',
    chatScreenshotAttached,
    shiftCategory: feasibility.timeSlotCategory,
    lineGroupTarget: feasibility.targetLineGroup as any
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (ชื่อ, เบอร์โทร, สถานที่จัดส่ง)');
      return;
    }

    if (feasibility.isUrgentUnder2Hours && !opApproved) {
      alert('⚠️ ตามกฎ SOP: เคสน้อยกว่า 2 ชม. ต้องประสานงาน OP และได้รับการอนุมัติก่อนบันทึกออเดอร์!');
      return;
    }

    onAddOrder(currentDraftOrder);
    setJustAddedSuccess(true);
    setTimeout(() => setJustAddedSuccess(false), 3000);

    // Auto increment IV
    const numMatch = invoiceNumber.match(/(\d+)$/);
    if (numMatch) {
      const nextNum = parseInt(numMatch[1], 10) + 1;
      setInvoiceNumber(invoiceNumber.replace(/\d+$/, String(nextNum).padStart(numMatch[1].length, '0')));
    }
  };

  const handleCopyText = (type: 'head_office' | 'admin' | 'customer', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Simulation / Shift Control Bar */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            <Clock className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">เวลาที่รับออเดอร์ (Order Receiving Time)</div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>{feasibility.timeSlotLabel}</span>
              <span className="text-neutral-400 font-normal">·</span>
              <span className="text-xs font-normal text-neutral-500">{feasibility.sopClause}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="test-order-time-input" className="text-xs text-neutral-500 dark:text-neutral-400">ทดสอบปรับเวลา:</label>
          <input
            id="test-order-time-input"
            type="time"
            value={orderTime}
            onChange={(e) => setOrderTime(e.target.value)}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => setOrderTime('14:30')}
              className={`px-2 py-1 text-xs rounded transition-colors ${feasibility.timeSlotCategory === 'DAY_8_17' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'}`}
            >
              กะ 08-17 น.
            </button>
            <button
              onClick={() => setOrderTime('18:30')}
              className={`px-2 py-1 text-xs rounded transition-colors ${feasibility.timeSlotCategory === 'EVENING_17_20' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'}`}
            >
              กะ 17-20 น.
            </button>
            <button
              onClick={() => setOrderTime('20:45')}
              className={`px-2 py-1 text-xs rounded transition-colors ${feasibility.timeSlotCategory === 'NIGHT_20_22' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'}`}
            >
              กะ 20-22 น.
            </button>
          </div>
        </div>
      </div>

      {/* Top Split: Chat Parser & Real-Time Feasibility */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Parser (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  วางข้อความแชทลูกค้า (Line / FB / IG)
                </h2>
              </div>
              <span className="text-xs text-neutral-500">Auto Parser</span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">เลือกเคสตัวอย่างจำลองตาม SOP:</div>
              <div className="flex flex-wrap gap-1.5">
                {CHAT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.text, preset.category)}
                    className="text-left px-2.5 py-1 text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-neutral-700 dark:text-neutral-300 rounded-md border border-neutral-200/80 dark:border-neutral-700/80 transition-colors"
                  >
                    {preset.label.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex-1">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="วางข้อความแชทจากลูกค้า เช่น ชื่อ เบอร์โทร ที่อยู่ วันเวลาที่ต้องการรับ รายการสินค้า ข้อความการ์ด หรือเลขที่ IV..."
                rows={7}
                className="w-full h-44 p-3 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="pt-3 mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-[11px] text-neutral-400">
                ระบบสกัด: ชื่อ, เบอร์โทร, พิกัด, เวลา, การ์ด, สินค้า
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiParseChat}
                  disabled={isAiParsing || !chatInput.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-md transition-colors shadow-2xs"
                  title="ใช้โมเดล Gemini 3.8 Flash สกัดข้อมูลอัตโนมัติ"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiParsing ? 'AI กำลังวิเคราะห์...' : 'AI สกัดข้อมูล (Gemini)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleParseChat(chatInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-md transition-colors"
                >
                  <span>ดึงข้อมูลดั้งเดิม</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Feasibility Status Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-5 rounded-xl border shadow-xs transition-colors ${
            feasibility.status === 'REQUIRES_OP_CONFIRM'
              ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20'
              : feasibility.status === 'QUOTA_EXCEEDED'
                ? 'border-purple-300 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">การประเมินความสอดคล้องตาม SOP</div>
                <div className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mt-0.5">
                  {feasibility.status === 'APPROVED' && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5" /> ผ่านเกณฑ์ SOP จัดส่งได้ตามกำหนด
                    </span>
                  )}
                  {feasibility.status === 'REQUIRES_OP_CONFIRM' && (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-5 h-5" /> 🚨 เคสเร่งด่วน &lt; 2 ชม. ต้องประสาน OP ก่อน!
                    </span>
                  )}
                  {feasibility.status === 'QUOTA_WARNING' && (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5" /> ⚠️ โควตารอบดึกใกล้เต็ม
                    </span>
                  )}
                  {feasibility.status === 'QUOTA_EXCEEDED' && (
                    <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5" /> ⛔ โควตารอบดึกเต็มแล้ว (ไม่เกิน 5 ออเดอร์)
                    </span>
                  )}
                  {feasibility.status === 'OUTSIDE_HOURS' && (
                    <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-5 h-5" /> นอกเวลาทำการรับออเดอร์
                    </span>
                  )}
                </div>
              </div>

              {/* OP Confirmation Toggle if urgent */}
              {feasibility.isUrgentUnder2Hours && (
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-2 rounded-lg border border-rose-200 dark:border-rose-900 shrink-0">
                  <input
                    id="op-confirm-checkbox"
                    type="checkbox"
                    checked={opApproved}
                    onChange={(e) => setOpApproved(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <label htmlFor="op-confirm-checkbox" className="text-xs font-semibold text-rose-700 dark:text-rose-300 cursor-pointer">
                    {opApproved ? '✅ OP อนุมัติแล้ว' : 'ติ๊กเมื่อ OP ยืนยันแล้ว'}
                  </label>
                </div>
              )}
            </div>

            {/* SLA Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 text-xs">
              <div>
                <span className="text-neutral-500 dark:text-neutral-400">ระยะทางระบุ:</span>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-0.5">
                  {distanceKm} กม.
                </div>
              </div>
              <div>
                <span className="text-neutral-500 dark:text-neutral-400">เวลาเดินทางของแมส:</span>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-0.5">
                  {feasibility.messengerTravelTime}
                </div>
              </div>
              <div>
                <span className="text-neutral-500 dark:text-neutral-400">เวลาที่ลูกค้าต้องการรับ:</span>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-0.5">
                  {desiredReceiveTime || '-'} น.
                </div>
              </div>
              <div>
                <span className="text-neutral-500 dark:text-neutral-400">ช่วงเวลาส่งถึงลูกค้า:</span>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-0.5">
                  {feasibility.expectedDeliveryWindow !== '-' ? feasibility.expectedDeliveryWindow : feasibility.customerSLA}
                </div>
              </div>
            </div>

            {/* Quota breakdown if night slot */}
            {feasibility.quotaInfo && (
              <div className="mt-4 p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/70 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-neutral-800 dark:text-neutral-200">
                  <span>โควตารอบดึก 20:00 - 22:00 น. วันนี้:</span>
                  <span className="font-mono-numbers">รวม {feasibility.quotaInfo.usedTotal} / {feasibility.quotaInfo.maxTotal} ออเดอร์</span>
                </div>
                <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400 pt-1">
                  <span>ระยะ 1-10 กม.: <strong className="font-mono-numbers">{orders.filter(o => o.shiftCategory === 'NIGHT_20_22' && o.distanceKm <= 10).length}/3</strong> เจ้า</span>
                  <span>ระยะ 11-20 กม.: <strong className="font-mono-numbers">{orders.filter(o => o.shiftCategory === 'NIGHT_20_22' && o.distanceKm > 10 && o.distanceKm <= 20).length}/2</strong> เจ้า</span>
                  <span>รับหน้าร้าน: 8.20 - 8.30 น.</span>
                </div>
              </div>
            )}

            {/* Action Directives */}
            <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2 text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">ขั้นตอนที่ต้องดำเนินการ:</span>
              <span className="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                {feasibility.actionRequired}
              </span>
            </div>

            {/* Warnings list */}
            {feasibility.warnings.length > 0 && (
              <div className="mt-3 space-y-1">
                {feasibility.warnings.map((w, i) => (
                  <div key={i} className="text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <span>• {w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Order Form */}
      <form onSubmit={handleSaveOrder} className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                แบบฟอร์มบันทึกออเดอร์สาขา BKK (NEW)
              </h2>
              <span className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                Auto-Fill Enabled
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              ฟิลด์ข้อมูลมาตรฐานที่ผสานข้อมูลลูกค้า โลจิสติกส์ และระบบส่งงานตาม SOP
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCustomerDirectoryModal(true)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="เปิดดูประวัติลูกค้าเก่าที่เคยบันทึกในระบบ BKK"
            >
              <UserCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>ประวัติลูกค้าเก่า ({storedCustomers.length})</span>
            </button>
            <div className="text-xs font-mono font-medium text-neutral-500 hidden sm:block">
              {currentDraftOrder.orderNumber}
            </div>
          </div>
        </div>

        {/* Auto-fill notification toast */}
        {autoFilledToast && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{autoFilledToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoFilledToast(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Row 1: Channel, IV Number, Customer Name, Phone (with Auto-fill Autocomplete) */}
        <div ref={suggestionContainerRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              ช่องทางการขาย <span className="text-rose-500">*</span>
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelSource)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="Line OA">Line OA</option>
              <option value="Messenger">Facebook Messenger</option>
              <option value="Instagram">Instagram</option>
              <option value="หน้าร้าน / อื่นๆ">หน้าร้าน / อื่นๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              เลขที่ใบกำกับ/ใบเสร็จ (IV Number) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. IV-6902-0046"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* Customer Name with Autocomplete */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium">
                ชื่อลูกค้า / ผู้รับ <span className="text-rose-500">*</span>
              </label>
              {customerName.trim().length >= 2 && matchingSuggestions.length > 0 && activeSuggestionField === 'NAME' && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> พบ {matchingSuggestions.length} รายชื่อ
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={customerName}
                onFocus={() => setActiveSuggestionField('NAME')}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setActiveSuggestionField('NAME');
                }}
                placeholder="e.g. คุณพิมพ์ชนก (พิมพ์เพื่อดึงข้อมูลเก่า)"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                required
              />
              {customerName && (
                <button
                  type="button"
                  onClick={() => setCustomerName('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown for Customer Name */}
            {activeSuggestionField === 'NAME' && matchingSuggestions.length > 0 && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 max-h-64 overflow-y-auto">
                <div className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/80 text-[10px] font-semibold text-neutral-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-rose-500" />
                    ลูกค้าเก่าที่ตรงกับ "{customerName}"
                  </span>
                  <span>คลิกเพื่อ Auto-fill</span>
                </div>
                {matchingSuggestions.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => handleAutoFillCustomer(cust)}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-colors flex items-start justify-between gap-2 group"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs group-hover:text-rose-600 dark:group-hover:text-rose-400">
                          {cust.name}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {cust.phone}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{cust.address}</span>
                        <span className="text-[10px] text-neutral-400 shrink-0">({cust.distanceKm} กม.)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded shrink-0">
                      สั่ง {cust.orderCount} ครั้ง
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Phone with Autocomplete */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium">
                เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
              </label>
              {customerPhone.trim().length >= 3 && matchingSuggestions.length > 0 && activeSuggestionField === 'PHONE' && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> พบ {matchingSuggestions.length} เบอร์
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={customerPhone}
                onFocus={() => setActiveSuggestionField('PHONE')}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setActiveSuggestionField('PHONE');
                }}
                placeholder="e.g. 089-112-3344"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono-numbers"
                required
              />
              {customerPhone && (
                <button
                  type="button"
                  onClick={() => setCustomerPhone('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown for Customer Phone */}
            {activeSuggestionField === 'PHONE' && matchingSuggestions.length > 0 && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 max-h-64 overflow-y-auto">
                <div className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/80 text-[10px] font-semibold text-neutral-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-rose-500" />
                    ประวัติลูกค้าที่ตรงกับเบอร์นี้
                  </span>
                  <span>คลิกเพื่อ Auto-fill</span>
                </div>
                {matchingSuggestions.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => handleAutoFillCustomer(cust)}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-colors flex items-start justify-between gap-2 group"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs font-mono group-hover:text-rose-600 dark:group-hover:text-rose-400">
                          {cust.phone}
                        </span>
                        <span className="text-[11px] text-neutral-600 dark:text-neutral-300">
                          ({cust.name})
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{cust.address}</span>
                        <span className="text-[10px] text-neutral-400 shrink-0">({cust.distanceKm} กม.)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded shrink-0">
                      สั่ง {cust.orderCount} ครั้ง
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Product Name, Product Code, Price, Delivery Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              รายการสินค้าดอกไม้ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. ช่อกุหลาบแดงพรีเมียม Ecuador 9 ดอก"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              รหัสสินค้า (SKU)
            </label>
            <input
              type="text"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="e.g. FLW-RD-09"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              ราคาค่าสินค้า + ค่าจัดส่ง (บาท)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(Number(e.target.value))}
                placeholder="ราคา"
                className="w-full px-2.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono-numbers"
              />
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                placeholder="ค่าส่ง"
                className="w-full px-2.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono-numbers"
              />
            </div>
          </div>
        </div>

        {/* Exact Match Suggestion Banner if address is not filled or different */}
        {exactCustomerMatch && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-2 text-amber-950 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-semibold">พบข้อมูลสถานที่จัดส่งเดิมของ {exactCustomerMatch.name}:</span>{' '}
                <span className="text-neutral-600 dark:text-neutral-400">"{exactCustomerMatch.address}" ({exactCustomerMatch.distanceKm} กม.)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAutoFillCustomer(exactCustomerMatch)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors text-xs flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ดึงที่อยู่นี้อัตโนมัติ</span>
            </button>
          </div>
        )}

        {/* Row 3: Address, Distance, Delivery Type, Receive Time */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
          <div className="sm:col-span-5">
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              สถานที่จัดส่ง (ระบุชื่ออาคาร/ชั้น/ถนน/ซอย) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. อาคารเอ็มไพร์ทาวเวอร์ สาทร ชั้น 32 แขวงยานนาวา เขตสาทร กทม."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              ระยะทาง (กม.) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono-numbers"
              required
            />
            <div className="text-[11px] text-neutral-400 mt-1">
              แมสเดินทาง: {feasibility.messengerTravelTime}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              ประเภทการจัดส่ง
            </label>
            <select
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
              className="w-full px-2.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="NORMAL">ส่งปกติ</option>
              <option value="EXPRESS_UNDER_25KM">ชุดส่งด่วน (&le; 25 กม.)</option>
              <option value="STORE_PICKUP">ลูกค้ารับหน้าร้าน</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              วันที่ &amp; เวลาที่ต้องการรับ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={desiredReceiveDate}
                onChange={(e) => setDesiredReceiveDate(e.target.value)}
                placeholder="วันนี้ / พรุ่งนี้"
                className="w-full px-2.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
              <input
                type="text"
                value={desiredReceiveTime}
                onChange={(e) => setDesiredReceiveTime(e.target.value)}
                placeholder="15:30"
                className="w-full px-2.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono-numbers"
                required
              />
            </div>
          </div>
        </div>

        {/* Row 4: Card Message & Special Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              ข้อความในการ์ดอวยพร (Card Message)
            </label>
            <textarea
              rows={2}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              placeholder="e.g. Happy Anniversary 5 years นะที่รัก..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              หมายเหตุ / คำขอพิเศษ
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. โทรหาก่อนถึง 10 นาที / ส่งที่นิติบุคคล / ฝาก รปภ."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
            />
          </div>
        </div>

        {/* Checkbox for Night order chat screenshot requirement */}
        {feasibility.timeSlotCategory === 'NIGHT_20_22' && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900/60 flex items-center gap-3">
            <input
              id="chat-screenshot-checkbox"
              type="checkbox"
              checked={chatScreenshotAttached}
              onChange={(e) => setChatScreenshotAttached(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="chat-screenshot-checkbox" className="text-xs font-semibold text-purple-800 dark:text-purple-300 cursor-pointer">
              📸 แคปภาพหน้าจอแชทที่คุยกับลูกค้าเรียบร้อยแล้ว (ตามระเบียบ 1.3 รอบ 20.00-22.00 น. ต้องส่งภาพในกลุ่ม Admin สาขา BKK)
            </label>
          </div>
        )}

        {/* Submit Button & Confirmation Notice */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">
            ยอดสุทธิรวม: <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers">{((Number(productPrice) || 0) + (Number(deliveryFee) || 0)).toLocaleString()} บาท</span>
          </div>

          <div className="flex items-center gap-3">
            {justAddedSuccess && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> บันทึกลงตาราง BKK (NEW) เรียบร้อยแล้ว!
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกออเดอร์ลงระบบ</span>
            </button>
          </div>
        </div>
      </form>

      {/* Generated Ready-to-Send Message Templates */}
      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              ข้อความสำเร็จรูปพร้อมคัดลอกส่งเข้ากลุ่ม Line &amp; ลูกค้า
            </h2>
          </div>
          <span className="text-xs text-neutral-500">One-Click Dispatch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Head Office Line */}
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  1. สั่งจัดส่ง "สาขา BKK (Head office)"
                </span>
                <span className="text-[10px] text-neutral-400">สำหรับช่างจัด</span>
              </div>
              <pre className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
                {generateHeadOfficeLineMessage(currentDraftOrder)}
              </pre>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText('head_office', generateHeadOfficeLineMessage(currentDraftOrder))}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-colors"
            >
              {copiedType === 'head_office' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'head_office' ? 'คัดลอกเรียบร้อย' : 'คัดลอกส่งไลน์ Head Office'}</span>
            </button>
          </div>

          {/* Card 2: Admin Branch Line */}
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  2. ส่งกลุ่ม "Admin สาขา BKK"
                </span>
                <span className="text-[10px] text-neutral-400">รอบดึก 20-22 น.</span>
              </div>
              <pre className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
                {generateAdminBranchLineMessage(currentDraftOrder)}
              </pre>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText('admin', generateAdminBranchLineMessage(currentDraftOrder))}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-colors"
            >
              {copiedType === 'admin' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'admin' ? 'คัดลอกเรียบร้อย' : 'คัดลอกส่งไลน์ Admin สาขา'}</span>
            </button>
          </div>

          {/* Card 3: Customer Confirmation Slip */}
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  3. ใบสรุปยืนยันออเดอร์ให้ลูกค้า
                </span>
                <span className="text-[10px] text-neutral-400">ส่งในแชทลูกค้า</span>
              </div>
              <pre className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
                {generateCustomerConfirmationSlip(currentDraftOrder)}
              </pre>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText('customer', generateCustomerConfirmationSlip(currentDraftOrder))}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-colors"
            >
              {copiedType === 'customer' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'customer' ? 'คัดลอกเรียบร้อย' : 'คัดลอกส่งยืนยันลูกค้า'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Directory Modal */}
      {showCustomerDirectoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm sm:text-base">
                    สมุดประวัติลูกค้าเก่า (BKK Customer Directory)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    พบ {storedCustomers.length} รายชื่อจากประวัติออเดอร์ในระบบทั้งหมด
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerDirectoryModal(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Directory Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={directorySearchTerm}
                onChange={(e) => setDirectorySearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, หรือที่อยู่จัดส่งเดิม..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                autoFocus
              />
              {directorySearchTerm && (
                <button
                  type="button"
                  onClick={() => setDirectorySearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Customer Profiles List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 pr-1 space-y-1">
              {storedCustomers
                .filter((c) => {
                  if (!directorySearchTerm.trim()) return true;
                  const q = directorySearchTerm.toLowerCase().trim();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    c.phone.includes(q) ||
                    c.address.toLowerCase().includes(q)
                  );
                })
                .map((cust) => (
                  <div
                    key={cust.id}
                    className="py-3 px-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                          {cust.name}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                          {cust.phone}
                        </span>
                        <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded">
                          สั่งแล้ว {cust.orderCount} ครั้ง
                        </span>
                        {cust.channel && (
                          <span className="text-[10px] text-neutral-400 hidden sm:inline">
                            • {cust.channel}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="truncate">{cust.address}</span>
                        <span className="text-[10px] text-neutral-400 shrink-0 font-mono">({cust.distanceKm} กม.)</span>
                      </div>
                      {cust.lastProductName && (
                        <div className="text-[10px] text-neutral-400">
                          ช่อล่าสุด: <span className="text-neutral-600 dark:text-neutral-300">{cust.lastProductName}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAutoFillCustomer(cust)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>นำข้อมูลมาใส่ฟอร์ม</span>
                    </button>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
              <span>คลิก "นำข้อมูลมาใส่ฟอร์ม" เพื่อกรอกชื่อ เบอร์ ที่อยู่ และระยะทาง</span>
              <button
                type="button"
                onClick={() => setShowCustomerDirectoryModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
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
