import { FeasibilityResult, TimeSlotCategory, DeliveryType, ParsedChatResult, OrderItem, ChannelSource } from '../types/sop';

/**
 * Determine the time slot category based on "HH:mm" time string
 */
export function getTimeSlotCategory(timeStr: string): TimeSlotCategory {
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return 'DAY_8_17';
  }
  const minutes = parts[0] * 60 + parts[1];

  if (minutes >= 8 * 60 && minutes < 17 * 60) {
    return 'DAY_8_17';
  }
  if (minutes >= 17 * 60 && minutes < 20 * 60) {
    return 'EVENING_17_20';
  }
  if (minutes >= 20 * 60 && minutes <= 22 * 60) {
    return 'NIGHT_20_22';
  }
  return 'OUTSIDE_HOURS';
}

/**
 * Assess delivery feasibility and SLA according to the BKK Sale Process SOP
 */
export function assessFeasibility(params: {
  orderTime: string; // e.g. "14:20"
  distanceKm: number;
  deliveryType: DeliveryType;
  desiredReceiveTime?: string; // e.g. "15:30"
  currentNightOrders?: OrderItem[];
  isExpress?: boolean;
}): FeasibilityResult {
  const { orderTime, distanceKm, deliveryType, desiredReceiveTime, currentNightOrders = [], isExpress = false } = params;

  const slot = getTimeSlotCategory(orderTime);
  const warnings: string[] = [];
  const recommendations: string[] = [];

  let messengerTravelTime = '20 - 30 นาที';
  let customerSLA = 'ภายใน 1 - 1.5 ชม.';
  let expectedDeliveryWindow = '-';
  let isUrgentUnder2Hours = false;
  let actionRequired = 'นำข้อมูลจากแชทลูกค้า ลงตาราง รายการรับ ORDER สาขา BKK (NEW)';
  let targetLineGroup = 'ตารางปกติ';
  let sopClause = 'ข้อ 1.1 (เวลา 8.00 - 17.00 น.)';

  // Distance travel time calculation
  if (distanceKm <= 10) {
    messengerTravelTime = '20 - 30 นาที';
  } else if (distanceKm <= 20) {
    messengerTravelTime = '40 นาที';
  } else if (distanceKm <= 30) {
    messengerTravelTime = '40 - 50 นาที';
  } else {
    messengerTravelTime = '60 - 90 นาที';
  }

  // Quota calculation for 20:00 - 22:00
  const nightOrders = currentNightOrders.filter(
    (o) => o.shiftCategory === 'NIGHT_20_22' && o.deliveryStatus !== 'CANCELLED'
  );
  const totalNightCount = nightOrders.length;
  const slot1to10Count = nightOrders.filter((o) => o.distanceKm <= 10).length;
  const slot11to20Count = nightOrders.filter((o) => o.distanceKm > 10 && o.distanceKm <= 20).length;

  let quotaInfo = undefined;

  // Evaluate based on Shift
  if (slot === 'DAY_8_17') {
    sopClause = 'ตารางเวลา 8.00 - 17.00 น.';
    targetLineGroup = 'ตารางปกติ';

    if (isExpress || deliveryType === 'EXPRESS_UNDER_25KM') {
      if (distanceKm > 25) {
        warnings.push(`ระยะทาง ${distanceKm} กม. เกินเกณฑ์ชุดส่งด่วน (กำหนดไม่เกิน 25 กม.)`);
        customerSLA = 'ระยะทางเกินชุดส่งด่วน ต้องส่งแบบปกติหรือประสาน OP';
      } else {
        customerSLA = 'ด่วน ภายใน 1 - 1.5 ชม.';
        recommendations.push('ชุดส่งด่วนระยะไม่เกิน 25 กม. สามารถจัดคิวแมสเซนเจอร์ได้ทันที');
      }
    } else {
      if (distanceKm <= 10) {
        customerSLA = 'ภายใน 1 - 1.5 ชม.';
      } else if (distanceKm <= 20) {
        customerSLA = 'ภายใน 2 ชม.';
      } else if (distanceKm <= 30) {
        customerSLA = 'ภายใน 2.5 ชม.';
      } else {
        customerSLA = 'ภายใน 3 ชม. (แล้วแต่พิจารณา)';
        warnings.push('ระยะทางเกิน 30 กม. ต้องพิจารณาความพร้อมของแมสเซนเจอร์และสภาพการจราจร');
      }
    }

    // Check urgent case: customer desired time is under 2 hours from order time
    if (desiredReceiveTime) {
      const orderMinutes = parseTimeToMinutes(orderTime);
      const desiredMinutes = parseTimeToMinutes(desiredReceiveTime);
      if (orderMinutes !== null && desiredMinutes !== null) {
        let diffMinutes = desiredMinutes - orderMinutes;
        if (diffMinutes < 0) diffMinutes += 24 * 60; // next day wrap
        if (diffMinutes < 120 && diffMinutes > 0) {
          isUrgentUnder2Hours = true;
          warnings.push('⚠️ เคสเร่งด่วน: ลูกค้าต้องการรับของภายในน้อยกว่า 2 ชม.! (ตาม SOP บังคับประสาน OP ก่อน)');
          actionRequired = '🚨 ต้องประสานกับ OP ก่อนว่าได้ไหม แล้วจึงคอนเฟิร์มลูกค้า!';
          recommendations.push('โทร/แท็กหาหัวหน้าช่างดอกไม้ (OP) เพื่อเช็กสต็อกดอกไม้และคิวจัดทันที');
        }
      }
    }
  } else if (slot === 'EVENING_17_20') {
    sopClause = 'ข้อ 1.2 เวลา หลัง 17.00 - 20.00 น. (สั่งจัดแล้ว)';
    targetLineGroup = 'กลุ่มไลน์สาขา BKK (Head office)';
    actionRequired = 'ลงตาราง BKK (NEW) + สั่งจัดเข้ากลุ่มไลน์สาขา BKK (Head office)';

    if (distanceKm <= 10) {
      customerSLA = 'ภายใน 1 ชม. (รอบเช้าถัดไป)';
      expectedDeliveryWindow = '08:30 - 09:00 น.';
    } else if (distanceKm <= 20) {
      customerSLA = 'ภายใน 2.5 ชม. (รอบเช้าถัดไป)';
      expectedDeliveryWindow = '09:00 - 10:00 น.';
    } else if (distanceKm <= 30) {
      customerSLA = 'ภายใน 3 ชม. (รอบเช้าถัดไป)';
      expectedDeliveryWindow = '10:00 - 11:00 น.';
    } else {
      customerSLA = 'เกิน 30 กม. (รอบเช้าถัดไป พิจารณาเป็นกรณีพิเศษ)';
      expectedDeliveryWindow = 'หลัง 11:00 น.';
      warnings.push('ระยะทางเกิน 30 กม. ต้องประสานงานทีมส่งล่วงหน้าเป็นกรณีพิเศษ');
    }

    recommendations.push('แจ้งลูกค้าเรื่องรอบจัดส่งเช้าวันถัดไปตามช่วงเวลาข้างต้น');
    recommendations.push('เมื่อบันทึกข้อมูลแล้ว ให้กดคัดลอกข้อความสั่งจัดส่งเข้ากลุ่มไลน์สาขา BKK (Head office)');
  } else if (slot === 'NIGHT_20_22') {
    sopClause = 'ข้อ 1.3 เวลา 20.00 - 22.00 น. (ไม่ได้สั่งจัด)';
    targetLineGroup = 'กลุ่ม Admin สาขา BKK';
    actionRequired = 'แคปหน้าแชทที่คุยกับลูกค้า ในกลุ่ม Admin สาขา BKK + ลงข้อมูลวันเวลารับ';

    let maxDistanceSlot = 3;
    let usedDistanceSlot = slot1to10Count;

    if (deliveryType === 'STORE_PICKUP') {
      customerSLA = 'รับหน้าร้าน';
      expectedDeliveryWindow = '08:20 - 08:30 น.';
      recommendations.push('ลูกค้ารับหน้าร้านช่วง 08:20 - 08:30 น. (เตรียมสินค้าพร้อมก่อนเปิดร้าน)');
    } else if (distanceKm <= 10) {
      customerSLA = 'ภายใน 1 ชม. (จำกัดไม่เกิน 3 เจ้า)';
      expectedDeliveryWindow = '09:00 - 09:30 น.';
      maxDistanceSlot = 3;
      usedDistanceSlot = slot1to10Count;
    } else if (distanceKm <= 20) {
      customerSLA = 'ภายใน 2.5 ชม. (จำกัดไม่เกิน 2 เจ้า)';
      expectedDeliveryWindow = '09:30 - 10:30 น.';
      maxDistanceSlot = 2;
      usedDistanceSlot = slot11to20Count;
    } else if (distanceKm <= 30) {
      customerSLA = 'ภายใน 3 ชม.';
      expectedDeliveryWindow = '10:30 - 11:00 น.';
      maxDistanceSlot = 1;
      usedDistanceSlot = nightOrders.filter((o) => o.distanceKm > 20 && o.distanceKm <= 30).length;
    } else {
      customerSLA = 'ระยะทางเกิน 30 กม. ในรอบดึก';
      expectedDeliveryWindow = 'หลัง 11:00 น. (ต้องขออนุมัติพิเศษ)';
      warnings.push('รอบดึกระยะทางเกิน 30 กม. มีความเสี่ยงจัดส่งล่าช้า');
    }

    const isDistanceFull = usedDistanceSlot >= maxDistanceSlot;
    const isTotalFull = totalNightCount >= 5;

    quotaInfo = {
      usedTotal: totalNightCount,
      maxTotal: 5,
      usedDistanceSlot,
      maxDistanceSlot,
      isDistanceFull,
      isTotalFull
    };

    if (isTotalFull) {
      warnings.push('⛔ โควตารวมรอบดึกเต็มแล้ว (จำกัดสูงสุดไม่เกิน 5 ออเดอร์สำหรับชุดพรีเมี่ยมดอก)');
    } else if (isDistanceFull) {
      warnings.push(`⛔ โควตาระยะทาง ${distanceKm <= 10 ? '1-10 กม. (เต็ม 3 เจ้า)' : '11-20 กม. (เต็ม 2 เจ้า)'} เต็มแล้ว!`);
    } else {
      recommendations.push(`โควตารอบดึกยังว่าง (ใช้ไปแล้ว ${totalNightCount}/5 เจ้า)`);
    }

    recommendations.push('อย่าลืม "แคปภาพหน้าจอแชทที่คุยกับลูกค้า" ส่งเข้าไปในกลุ่มไลน์ Admin สาขา BKK');
  } else {
    // Outside 22:00 - 08:00
    sopClause = 'นอกเวลาทำการรับออเดอร์ (หลัง 22.00 น. ถึงก่อน 08.00 น.)';
    targetLineGroup = 'Admin สาขา BKK';
    actionRequired = 'รับเรื่องไว้และส่งต่อให้ทีมรอบ 08:00 น. ประสานงานเปิดร้าน';
    customerSLA = 'จัดส่งรอบถัดไปหลังร้านเปิด 08:00 น.';
    warnings.push('ขณะนี้อยู่นอกเวลาทำการปกติของสาขา BKK (ปิดรับจัดรอบดึก 22:00 น.)');
  }

  // Determine Overall Status
  let status: FeasibilityResult['status'] = 'APPROVED';
  if (slot === 'OUTSIDE_HOURS') {
    status = 'OUTSIDE_HOURS';
  } else if (quotaInfo?.isTotalFull || quotaInfo?.isDistanceFull) {
    status = 'QUOTA_EXCEEDED';
  } else if (isUrgentUnder2Hours) {
    status = 'REQUIRES_OP_CONFIRM';
  } else if (quotaInfo && (quotaInfo.usedTotal >= 4 || quotaInfo.usedDistanceSlot >= quotaInfo.maxDistanceSlot - 1)) {
    status = 'QUOTA_WARNING';
  }

  const timeSlotLabel =
    slot === 'DAY_8_17'
      ? 'เวลารับออเดอร์ปกติ (08:00 - 17:00 น.)'
      : slot === 'EVENING_17_20'
        ? 'เวลารับออเดอร์ช่วงเย็น (17:00 - 20:00 น. สั่งจัดแล้ว)'
        : slot === 'NIGHT_20_22'
          ? 'เวลารับออเดอร์รอบดึก (20:00 - 22:00 น. ไม่ได้สั่งจัด / โควตาจำกัด)'
          : 'นอกเวลาทำการ (22:00 - 08:00 น.)';

  return {
    status,
    timeSlotCategory: slot,
    timeSlotLabel,
    messengerTravelTime,
    customerSLA,
    expectedDeliveryWindow,
    isUrgentUnder2Hours,
    actionRequired,
    targetLineGroup,
    quotaInfo,
    warnings,
    recommendations,
    sopClause
  };
}

/**
 * Helper to parse "HH:mm" to integer minutes from midnight
 */
function parseTimeToMinutes(timeStr: string): number | null {
  const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Smart Regex-based Chat Parser to extract order fields from customer chat logs
 */
export function parseCustomerChat(rawText: string): ParsedChatResult {
  const missingFields: string[] = [];
  let confidence = 0;

  // 1. Phone number (Thai phone numbers: 08x, 09x, 06x)
  const phoneMatch = rawText.match(/(?:เบอร์|โทร|ติดต่อ|tel|phone)?[:\s-]*([0][689]\d{1}[-.\s]?\d{3}[-.\s]?\d{4}|[0][2][-.\s]?\d{3}[-.\s]?\d{4})/i);
  const customerPhone = phoneMatch ? phoneMatch[1].replace(/[\s-]/g, '') : undefined;
  if (customerPhone) confidence += 20;
  else missingFields.push('เบอร์โทรศัพท์ลูกค้า');

  // 2. Customer Name
  let customerName: string | undefined = undefined;
  const nameMatch = rawText.match(/(?:ชื่อ|ผู้รับ|ผู้สั่ง|คุณ)[:\s]*([ก-๙a-zA-Z\s]{2,30})(?=\s*(?:เบอร์|โทร|ที่อยู่|ส่งที่|เวลา|\n|$))/i);
  if (nameMatch) {
    customerName = nameMatch[1].trim();
    if (!customerName.startsWith('คุณ')) customerName = `คุณ${customerName}`;
    confidence += 15;
  } else {
    // secondary check
    const altName = rawText.match(/คุณ([ก-๙a-zA-Z]{2,20})/);
    if (altName) {
      customerName = `คุณ${altName[1].trim()}`;
      confidence += 10;
    } else {
      missingFields.push('ชื่อผู้รับ/ผู้สั่ง');
    }
  }

  // 3. Distance (km)
  let distanceKm: number | undefined = undefined;
  const distanceMatch = rawText.match(/(?:ระยะทาง|ประมาณ|ห่างจากร้าน)?[:\s]*(\d+(?:\.\d+)?)\s*(?:กม|กิโลเมตร|km|กม\.)/i);
  if (distanceMatch) {
    distanceKm = parseFloat(distanceMatch[1]);
    confidence += 15;
  } else {
    missingFields.push('ระยะทาง (กม.)');
  }

  // 4. Desired delivery time
  let desiredTime: string | undefined = undefined;
  const timeMatch = rawText.match(/(?:เวลา|รับของ|อยากได้|ถึง|ส่งประมาณ|ช่วง)?[:\s]*(\d{1,2}[:.]\d{2})\s*(?:น\.|น|โมง|am|pm)?/i);
  if (timeMatch) {
    desiredTime = timeMatch[1].replace('.', ':');
    confidence += 15;
  }

  // Desired Date
  let desiredDate = 'วันนี้';
  if (rawText.includes('พรุ่งนี้') || rawText.includes('วันพรุ่งนี้') || rawText.includes('เช้าพรุ่งนี้')) {
    desiredDate = 'วันพรุ่งนี้';
  }

  // 5. Address
  let address: string | undefined = undefined;
  const addressMatch = rawText.match(/(?:ส่งที่|ที่อยู่|สถานที่จัดส่ง|สถานที่|จัดส่ง)[:\s]*([^\n]+(?:\n[^\n]+)?)(?=\s*(?:อยากได้|เวลา|การ์ด|เบอร์|เปิดบิล|โทร|$))/i);
  if (addressMatch) {
    address = addressMatch[1].trim();
    confidence += 15;
  } else {
    // look for common keywords
    const subMatch = rawText.match(/(?:ตึก|อาคาร|คอนโด|หมู่บ้าน|ซอย|ถนน|ชั้น|แขวง|เขต|กทม)[^\n]+/i);
    if (subMatch) {
      address = subMatch[0].trim();
      confidence += 10;
    } else {
      missingFields.push('ที่อยู่จัดส่ง');
    }
  }

  // 6. Card Message
  let cardMessage: string | undefined = undefined;
  const cardMatch = rawText.match(/(?:การ์ด|ข้อความ|ข้อความการ์ด|การ์ดอวยพร|เขียนว่า)[:\s]*([^\n]+(?:\n[^\n]+)?)(?=\s*(?:เปิดบิล|เลข|โอน|เบอร์|$))/i);
  if (cardMatch) {
    cardMessage = cardMatch[1].trim();
    confidence += 10;
  }

  // 7. Product & Price
  let productName: string | undefined = undefined;
  let price: number | undefined = undefined;
  const productMatch = rawText.match(/(?:สั่ง|เอาเป็น|สินค้า|รหัส)?[:\s]*([ก-๙a-zA-Z0-9\s-]+?(?:ช่อ|แจกัน|กล่อง|Flower Box|ดอกไม้|ทิวลิป|กุหลาบ|ทานตะวัน)[^\n,]*)/i);
  if (productMatch) {
    productName = productMatch[1].trim();
    confidence += 10;
  }

  const priceMatch = rawText.match(/(?:ราคา|ยอด)?[:\s]*([0-9,]{3,7})\s*(?:บาท|.-)?/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
  }

  // 8. Invoice Number (IV)
  let invoiceNumber: string | undefined = undefined;
  const ivMatch = rawText.match(/(?:IV|ใบกำกับ|เปิดบิล|บิล|เลขที่ IV)[:\s-]*([A-Z0-9-]{4,15})/i);
  if (ivMatch) {
    invoiceNumber = ivMatch[1].trim();
    if (!invoiceNumber.toUpperCase().startsWith('IV')) {
      invoiceNumber = `IV-${invoiceNumber}`;
    }
    confidence += 10;
  }

  // Channel inference
  let channel: ChannelSource = 'Line OA';
  if (rawText.toLowerCase().includes('messenger') || rawText.toLowerCase().includes('facebook') || rawText.toLowerCase().includes('fb')) {
    channel = 'Messenger';
  } else if (rawText.toLowerCase().includes('ig') || rawText.toLowerCase().includes('instagram')) {
    channel = 'Instagram';
  }

  return {
    customerName,
    customerPhone,
    address,
    distanceKm,
    desiredTime,
    desiredDate,
    productName,
    price,
    cardMessage,
    invoiceNumber,
    channel,
    confidenceScore: Math.min(100, confidence),
    missingFields
  };
}

/**
 * Generate formatted message ready to send to "Line กลุ่มสาขา BKK (Head office)"
 */
export function generateHeadOfficeLineMessage(order: OrderItem): string {
  return `🌸 [สั่งจัดดอกไม้ - สาขา BKK Head Office] 🌸
━━━━━━━━━━━━━━━━━━
เลขที่คำสั่งซื้อ: ${order.orderNumber}
เลขที่ IV: ${order.invoiceNumber}
ช่องทาง: ${order.channel}
เวลารับออเดอร์: ${order.orderTime} น. (${order.shiftCategory === 'EVENING_17_20' ? 'รอบเย็น 17-20 น. สั่งจัดแล้ว' : 'รอบปกติ'})

📦 รายการสินค้า: ${order.productName} (${order.productCode})
💰 ราคา: ${order.productPrice.toLocaleString()} บาท (ค่าส่ง ${order.deliveryFee} บ. รวม ${order.totalPrice.toLocaleString()} บ.)

📍 สถานที่ส่ง: ${order.deliveryAddress}
🛵 ระยะทาง: ${order.distanceKm} กม.
⏰ วันเวลาที่ลูกค้าต้องการรับ: ${order.desiredReceiveDate} เวลา ${order.desiredReceiveTime}
👤 ผู้รับ: ${order.customerName} โทร ${order.customerPhone}

💌 ข้อความการ์ด: "${order.cardMessage || '-'}"
📝 หมายเหตุ/คำขอพิเศษ: ${order.specialInstructions || '-'}
━━━━━━━━━━━━━━━━━━
⚡ สถานะ OP: ${order.opStatus === 'OP_APPROVED' ? '✅ OP อนุมัติแล้ว' : order.opStatus === 'PENDING_OP' ? '⏳ รอ OP คอนเฟิร์ม' : 'ปกติ'}`;
}

/**
 * Generate formatted message ready to send to "Line กลุ่ม Admin สาขา BKK" (รอบ 20:00 - 22:00)
 */
export function generateAdminBranchLineMessage(order: OrderItem): string {
  return `🌙 [แจ้งออเดอร์รอบดึก 20:00-22:00 - กลุ่ม Admin สาขา BKK] 🌙
━━━━━━━━━━━━━━━━━━
⚠️ แคปรูปหน้าแชทกับลูกค้าส่งแนบในกลุ่มนี้ด้วย
เลขที่คำสั่งซื้อ: ${order.orderNumber}
เลขที่ IV: ${order.invoiceNumber}
เวลาที่รับออเดอร์: ${order.orderTime} น. (โควตาชุดพรีเมี่ยมดอก)

👤 ชื่อลูกค้า/ผู้รับ: ${order.customerName}
📞 เบอร์ติดต่อ: ${order.customerPhone}
📍 สถานที่จัดส่ง: ${order.deliveryAddress}
🛵 ระยะทาง: ${order.distanceKm} กม.
⏰ วันและเวลาที่ลูกค้ารับสินค้า: ${order.desiredReceiveDate} ช่วง ${order.desiredReceiveTime}

🌺 สินค้า: ${order.productName}
💳 ยอดเงินรวม: ${order.totalPrice.toLocaleString()} บาท
💌 ข้อความในการ์ด: "${order.cardMessage || '-'}"
━━━━━━━━━━━━━━━━━━
📌 ลงตารางบันทึกออเดอร์เรียบร้อยแล้ว`;
}

/**
 * Generate Customer Order Confirmation Slip
 */
export function generateCustomerConfirmationSlip(order: OrderItem): string {
  return `💐 ยืนยันคำสั่งซื้อร้านดอกไม้ BKK สาขาใหญ่ 💐
เรียน ${order.customerName}

ทางร้านได้รับยอดชำระและบันทึกออเดอร์ของท่านเรียบร้อยแล้วค่ะ
• เลขที่คำสั่งซื้อ: ${order.orderNumber}
• เลขที่ใบกำกับภาษี: ${order.invoiceNumber}
• รายการ: ${order.productName}
• กำหนดส่งมอบ: ${order.desiredReceiveDate} เวลา ${order.desiredReceiveTime}
• สถานที่จัดส่ง: ${order.deliveryAddress}
• เบอร์ติดต่อผู้รับ: ${order.customerPhone}
• ข้อความการ์ด: "${order.cardMessage || '-'}"

ขอบพระคุณที่ไว้วางใจให้เราเป็นสื่อกลางส่งมอบความรู้สึกดีๆ นะคะ 🙏🌸`;
}
