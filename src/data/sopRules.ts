import { OrderItem } from '../types/sop';

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-001',
    orderNumber: 'BKK-2569-0121',
    invoiceNumber: 'IV-6902-0041',
    createdAt: '2026-11-09T09:15:00',
    orderTime: '09:15',
    channel: 'Line OA',
    customerName: 'คุณภัทรินทร์ วงศ์สวัสดิ์',
    customerPhone: '089-456-7890',
    productName: 'ช่อกุหลาบแดงพรีเมียม Ecuador 9 ดอก',
    productCode: 'FLW-RD-09',
    productPrice: 2890,
    deliveryFee: 150,
    totalPrice: 3040,
    deliveryAddress: 'อาคารเอ็มไพร์ทาวเวอร์ สาทร ชั้น 32 แขวงยานนาวา เขตสาทร กทม.',
    distanceKm: 7.5,
    deliveryType: 'NORMAL',
    desiredReceiveDate: 'วันนี้',
    desiredReceiveTime: '11:00',
    cardMessage: 'สุขสันต์วันครบรอบ 3 ปี ขอให้มีความสุขมากๆ รักเสมอค่ะ',
    specialInstructions: 'ส่งให้ถึงมือที่ล็อบบี้ โทรหาก่อนถึง 10 นาที',
    floristName: 'ช่างสมชาย (OP)',
    messengerName: 'พี่วินัย (Skootar)',
    messengerPhone: '081-222-3344',
    trackingRef: 'SKT-9921',
    opStatus: 'NOT_REQUIRED',
    deliveryStatus: 'DELIVERED',
    shiftCategory: 'DAY_8_17',
    lineGroupTarget: 'ตารางปกติ'
  },
  {
    id: 'ord-002',
    orderNumber: 'BKK-2569-0122',
    invoiceNumber: 'IV-6902-0042',
    createdAt: '2026-11-09T11:45:00',
    orderTime: '11:45',
    channel: 'Messenger',
    customerName: 'คุณกวิน ศิริวัฒน์',
    customerPhone: '081-888-9999',
    productName: 'แจกันดอกไฮเดรนเยีย & ดอกลิลลี่ขาว',
    productCode: 'VAS-HY-02',
    productPrice: 3500,
    deliveryFee: 200,
    totalPrice: 3700,
    deliveryAddress: 'คอนโด The Address สุขุมวิท 28 คลองเตย กทม.',
    distanceKm: 14.0,
    deliveryType: 'NORMAL',
    desiredReceiveDate: 'วันนี้',
    desiredReceiveTime: '13:00',
    cardMessage: 'Congratulations on your grand opening! จากทีมงาน Alpha Lab',
    opStatus: 'OP_APPROVED',
    opNotes: 'OP ช่างแนน คอนเฟิร์มจัดทัน เตรียมดอกไม้พร้อมส่ง 12:20 น.',
    deliveryStatus: 'DISPATCHED',
    shiftCategory: 'DAY_8_17',
    lineGroupTarget: 'ตารางปกติ'
  },
  {
    id: 'ord-003',
    orderNumber: 'BKK-2569-0123',
    invoiceNumber: 'IV-6902-0043',
    createdAt: '2026-11-09T18:10:00',
    orderTime: '18:10',
    channel: 'Instagram',
    customerName: 'คุณอรนลิน รัตนพงศ์',
    customerPhone: '095-123-4567',
    productName: 'กล่องดอกไม้ Flower Box พรีเมียมโทนชมพูพีช',
    productCode: 'BOX-PK-01',
    productPrice: 2490,
    deliveryFee: 150,
    totalPrice: 2640,
    deliveryAddress: 'ซอยอารีย์ 4 แขวงพญาไท เขตพญาไท กทม.',
    distanceKm: 8.2,
    deliveryType: 'NORMAL',
    desiredReceiveDate: 'วันพรุ่งนี้ 2026-11-10',
    desiredReceiveTime: '08:30 - 09:00 น.',
    cardMessage: 'Happy Birthday my dear sister ขอให้ปีนี้ปังๆ ทุกเรื่องนะจ๊ะ',
    opStatus: 'NOT_REQUIRED',
    deliveryStatus: 'PENDING_ARRANGEMENT',
    shiftCategory: 'EVENING_17_20',
    lineGroupTarget: 'BKK Head office'
  },
  {
    id: 'ord-004',
    orderNumber: 'BKK-2569-0124',
    invoiceNumber: 'IV-6902-0044',
    createdAt: '2026-11-09T20:15:00',
    orderTime: '20:15',
    channel: 'Line OA',
    customerName: 'คุณธีรภัทร ชาญชัย',
    customerPhone: '086-777-1234',
    productName: 'ช่อดอกทานตะวัน & แคสเปีย วันรับปริญญา',
    productCode: 'FLW-SN-05',
    productPrice: 1990,
    deliveryFee: 150,
    totalPrice: 2140,
    deliveryAddress: 'จุฬาลงกรณ์มหาวิทยาลัย คณะพาณิชยศาสตร์ฯ',
    distanceKm: 6.0,
    deliveryType: 'NORMAL',
    desiredReceiveDate: 'วันพรุ่งนี้ 2026-11-10',
    desiredReceiveTime: '09:00 - 09:30 น.',
    cardMessage: 'Congratulations on your graduation day! ภูมิใจในตัวน้องมากครับ',
    opStatus: 'NOT_REQUIRED',
    deliveryStatus: 'PENDING_ARRANGEMENT',
    chatScreenshotAttached: true,
    shiftCategory: 'NIGHT_20_22',
    lineGroupTarget: 'Admin สาขา BKK'
  },
  {
    id: 'ord-005',
    orderNumber: 'BKK-2569-0125',
    invoiceNumber: 'IV-6902-0045',
    createdAt: '2026-11-09T20:40:00',
    orderTime: '20:40',
    channel: 'Line OA',
    customerName: 'คุณมนัสนันท์ เกียรติภูมิ',
    customerPhone: '082-999-5566',
    productName: 'ชุดพรีเมียมดอกไม้ทิวลิปฮอลแลนด์สีขาว 10 ดอก',
    productCode: 'FLW-TL-10',
    productPrice: 3200,
    deliveryFee: 220,
    totalPrice: 3420,
    deliveryAddress: 'เดอะคริสตัล เอกมัย-รามอินทรา ประดิษฐ์มนูธรรม',
    distanceKm: 15.5,
    deliveryType: 'NORMAL',
    desiredReceiveDate: 'วันพรุ่งนี้ 2026-11-10',
    desiredReceiveTime: '09:30 - 10:30 น.',
    cardMessage: 'Wishing you all the best in your new journey!',
    opStatus: 'NOT_REQUIRED',
    deliveryStatus: 'PENDING_ARRANGEMENT',
    chatScreenshotAttached: true,
    shiftCategory: 'NIGHT_20_22',
    lineGroupTarget: 'Admin สาขา BKK'
  }
];

export const CHAT_PRESETS = [
  {
    label: 'เคส 1: รอบปกติกลางวัน (8:00 - 17:00) ระยะ 8 กม.',
    category: 'DAY_8_17',
    text: `ลูกค้า: สั่งช่อกุหลาบแดง 1 ช่อ รหัส FLW-RD-09 ราคา 2,890 บาทค่ะ
เอเจนท์: รับทราบค่ะ รบกวนขอชื่อ เบอร์โทร และที่อยู่จัดส่งด้วยนะคะ
ลูกค้า: ชื่อคุณพิมพ์ชนก เบอร์ 089-112-3344
ส่งที่ ตึก G Tower พระราม 9 ชั้น 20
อยากได้ประมาณ 15:30 น. ทันไหมคะ (ระยะทางประมาณ 8 กม.)
การ์ด: เขียนว่า Happy Birthday Bestie! มีความสุขมากๆ นะจ๊ะ รักแกที่สุด
เปิดบิลออกใบกำกับเลข IV-6902-0051 โอนเงินแล้วค่ะ`
  },
  {
    label: 'เคส 2: เคสเร่งด่วน < 2 ชม. (ต้องประสาน OP ด่วน!)',
    category: 'URGENT',
    text: `ลูกค้า: ด่วนมากค่ะ อยากได้แจกันดอกไม้เปิดร้าน รหัส VAS-HY-02 ราคา 3,500 บาท
ตอนนี้ 11:30 น. ต้องการรับของไม่เกิน 12:45 น. (อีก 1 ชม. 15 นาที)
ส่งที่ ทองหล่อ 13 ซอยสุขุมวิท 55 (ระยะทาง 12 กม.)
เบอร์ติดต่อ คุณวิชญ์ 081-999-8877
การ์ด: ยินดีด้วยกับร้านใหม่ เฮงๆ ปังๆ รวยๆ ครับ
เลข IV: IV-6902-0052
ถ้าทันช่วยคอนเฟิร์มด่วนเลยนะคะ`
  },
  {
    label: 'เคส 3: รอบเย็น 17:00 - 20:00 (สั่งจัดเข้า Head Office)',
    category: 'EVENING_17_20',
    text: `ลูกค้า: ทักมาตอน 18:30 น. สั่งดอกไม้ส่งพรุ่งนี้เช้าค่ะ
เอาเป็น Flower Box โทนพีช รหัส BOX-PK-01 ราคา 2,490 บาท
ชื่อผู้รับ: คุณณิชาภัทร โทร 092-345-6789
ที่อยู่: คอนโด Ideo Q จุฬา-สามย่าน (ระยะทาง 6.5 กม.)
ต้องการให้ถึงเช้าพรุ่งนี้ 8.45 น. ค่ะ
การ์ด: Happy Anniversary 5 years นะที่รัก
ออกใบกำกับภาษีเลขที่ IV-6902-0053 โอนเงินเรียบร้อยค่ะ`
  },
  {
    label: 'เคส 4: รอบดึก 20:00 - 22:00 (เช็คโควตา & กลุ่ม Admin)',
    category: 'NIGHT_20_22',
    text: `ลูกค้า: สั่งตอน 20:50 น. ครับ อยากได้ชุดพรีเมียมดอกไม้ทิวลิปขาว รหัส FLW-TL-10 ราคา 3,200 บาท
ผู้รับ: คุณกานต์ดา เบอร์ 083-456-7890
ส่งที่: อารีย์ ซอย 2 พญาไท (ระยะทาง 9.0 กม.)
ต้องการรับพรุ่งนี้เช้า 09:15 น. ครับ
การ์ด: สุขสันต์วันเกิดคุณแม่ที่รัก สุขภาพแข็งแรงนะคะ
เลขที่ IV: IV-6902-0054
โอนเงินผ่าน KBank เรียบร้อยครับ`
  },
  {
    label: 'เคส 5: รับหน้าร้านเช้า (Store Pickup 8:20 - 8.30 น.)',
    category: 'STORE_PICKUP',
    text: `ลูกค้า: สวัสดีครับ สั่งช่อทานตะวัน FLW-SN-05 ราคา 1,990 บาท
จะแวะเข้าไปรับเองที่หน้าร้านสาขา BKK พรุ่งนี้เช้าเวลา 08:20 น. ครับ
ชื่อ คุณอนุชา เบอร์ 085-678-9012
การ์ด: Congrats on your promotion buddy!
เลขที่ IV: IV-6902-0055 ชำระเงินเรียบร้อยครับ`
  }
];
