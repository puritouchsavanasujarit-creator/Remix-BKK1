/**
 * Single source of truth for the BKK Flower Agent prompts, chat payload
 * helpers and Gemini model configuration. Shared by server.ts (Express dev
 * server) and worker/index.js (Cloudflare Workers production entrypoint).
 */
export const SOP_SYSTEM_INSTRUCTION = `คุณคือ "BKK Flower Agent AI Assistant" ผู้ช่วยอัจฉริยะประจำศูนย์ปฏิบัติการสาขา BKK (Bangkok Flower Agent Hub)
หน้าที่ของคุณคือ:
1. ตอบคำถามและให้คำแนะนำเกี่ยวกับกระบวนการขาย (Sale Process SOP) ของสาขา BKK อย่างแม่นยำ:
   - กฎช่วงเวลา 08:00 - 17:00 น. (กะกลางวัน): ส่งปกติ จัดดอกไม้ 2 ชม. + ขนส่งตามระยะทาง
   - กฎช่วงเวลา 17:00 - 20:00 น. (กะค่ำ): ต้องส่งข้อความถาม OP ในกลุ่ม LINE ทันที และได้รับไฟเขียวก่อนคอนเฟิร์มลูกค้า
   - กฎช่วงเวลา 20:00 - 22:00 น. (กะดึก): โควตารวมทั้งสาขาไม่เกิน 4 ออร์เดอร์/วัน, ระยะทางไม่เกิน 25 กม., ออร์เดอร์ที่ 1-2 ต้องแจ้ง OP ในกลุ่ม BKK Head office, ออร์เดอร์ที่ 3-4 ต้องแจ้งทั้ง BKK Head office และ Admin สาขา BKK
   - ออร์เดอร์ด่วนต่ำกว่า 2 ชั่วโมง: ถือเป็นเคสพิเศษ ต้องส่งยืนยัน OP เสมอ
2. ช่วยเขียนข้อความการ์ดอวยพร (วันเกิด, แสดงความยินดี, ขอโทษ, แสดงความเสียใจ, วันครบรอบ, วาเลนไทน์) ให้ไพเราะและตรงตามความต้องการของลูกค้า
3. ให้คำแนะนำเรื่องการดูแลรักษาดอกไม้แต่ละชนิด (กุหลาบ, ลิลลี่, ทานตะวัน, ทิวลิป, ไฮเดรนเยีย)
4. สุภาพ เป็นมิตร รวดเร็ว และเป็นมืออาชีพ ใช้ภาษาไทยที่เข้าใจง่าย`;

/** Prompt for the chat-slip extractor used by POST /api/ai/parse-slip. */
export function buildParseSlipPrompt(chatText) {
  return `วิเคราะห์ข้อความสนทนาการสั่งซื้อดอกไม้ต่อไปนี้ และดึงข้อมูลออกมาเป็น JSON เพื่อให้เอเจนท์นำไปลงบันทึกในระบบ BKK Hub:
ข้อความ:
"""
${chatText}
"""

ให้คืนผลลัพธ์เป็น JSON Object ที่มีโครงสร้างดังนี้:
{
  "customerName": string หรือ null,
  "customerPhone": string หรือ null,
  "address": string หรือ null,
  "distanceKm": number (ถ้าไม่มีให้ประมาณจากเขตในกรุงเทพฯ),
  "desiredTime": string หรือ null (เช่น 16:00),
  "desiredDate": string หรือ null,
  "productName": string หรือ null,
  "price": number หรือ 0,
  "cardMessage": string หรือ null,
  "invoiceNumber": string หรือ null,
  "confidenceScore": number (0-100),
  "missingFields": array of strings
}`;
}

/** Gemini `contents` for a chat history; assistant turns become `model`. */
export function buildChatContents(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || m.text || '' }],
  }));
}

/** Grounding citations (web + maps) from a response's groundingChunks. */
export function extractGroundingLinks(chunks = []) {
  return (chunks || []).flatMap((chunk) => [
    ...(chunk?.web?.uri
      ? [{ title: chunk.web.title || chunk.web.uri, url: chunk.web.uri, type: 'web' }]
      : []),
    ...(chunk?.maps?.uri
      ? [{ title: chunk.maps.title || 'ดูบน Google Maps', url: chunk.maps.uri, type: 'maps' }]
      : []),
  ]);
}

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
export const FALLBACK_GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest'];

/** The model requested first; both runtimes and /api/health report this value. */
export function resolveGeminiModel(modelOverride) {
  return modelOverride?.trim() || DEFAULT_GEMINI_MODEL;
}

/** Models to try in order, falling back only when a model is unavailable (404). */
export function geminiModelCandidates(modelOverride) {
  const primary = resolveGeminiModel(modelOverride);
  return [primary, ...FALLBACK_GEMINI_MODELS.filter((m) => m !== primary)];
}
