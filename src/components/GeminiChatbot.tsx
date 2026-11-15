import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Globe, 
  MapPin, 
  ExternalLink, 
  Trash2, 
  Loader2, 
  MessageSquare,
  HelpCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  links?: { title: string; url: string; type: 'web' | 'maps' }[];
  timestamp: string;
  groundingMode?: 'standard' | 'search' | 'maps';
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: 'สวัสดีครับ! ผมคือ **BKK Flower Agent AI Assistant** ผู้ช่วยอัจฉริยะประจำศูนย์ปฏิบัติการสาขา BKK ยินดีช่วยเหลือเอเจนท์ทุกท่านครับ\n\nสามารถสอบถามเรื่อง:\n- **เกณฑ์เวลาและระเบียบ SOP**: กะกลางวัน (08:00-17:00), กะค่ำ (17:00-20:00), กะดึก (20:00-22:00 โควตา 4 ออร์เดอร์/วัน)\n- **คำนวณความเป็นไปได้ในการจัดส่ง (Feasibility)**\n- **ช่วยคิดข้อความการ์ดอวยพรลูกค้า** สำหรับโอกาสต่างๆ\n- **ค้นหาข้อมูลสดด้วย Google Search หรือค้นหาสถานที่ด้วย Google Maps Grounding**',
    timestamp: 'เมื่อสักครู่',
    groundingMode: 'standard',
  },
];

const PROMPT_SUGGESTIONS = [
  {
    label: 'กฎกะดึก 20:00-22:00 น.',
    prompt: 'ช่วยสรุปกฎและขั้นตอนการส่งออร์เดอร์กะดึก 20:00-22:00 น. ตามคู่มือ SOP ให้ชัดเจนหน่อยครับ',
    mode: 'standard' as const,
  },
  {
    label: 'การ์ดวันเกิดแฟน ซึ้งๆ',
    prompt: 'ช่วยเขียนข้อความการ์ดอวยพรวันเกิดแฟน ให้ความรู้สึกอบอุ่น ซาบซึ้ง และโรแมนติก ความยาวประมาณ 2-3 บรรทัด',
    mode: 'standard' as const,
  },
  {
    label: 'ตลาดดอกไม้ปากคลองตลาด (Maps)',
    prompt: 'ช่วยค้นหาข้อมูลจุดกระจายสินค้าและร้านดอกไม้ใกล้ปากคลองตลาด กรุงเทพฯ พร้อมพิกัด',
    mode: 'maps' as const,
  },
  {
    label: 'เทศกาล & ข้อมูลจัดส่ง (Search)',
    prompt: 'ค้นหาข้อมูลเทศกาลและวันสำคัญในกรุงเทพฯ ช่วงนี้ ที่อาจส่งผลต่อการสั่งดอกไม้และเวลาจัดส่ง',
    mode: 'search' as const,
  },
];

export default function GeminiChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('bkk_gemini_chat_history_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MESSAGES;
      }
    }
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [groundingMode, setGroundingMode] = useState<'standard' | 'search' | 'maps'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('bkk_gemini_chat_history_v1', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, modeOverride?: 'standard' | 'search' | 'maps') => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const currentMode = modeOverride || groundingMode;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      groundingMode: currentMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Get approximate location if Maps grounding is enabled
      let userLocation = { lat: 13.7563, lng: 100.5018 }; // Bangkok Default
      if (currentMode === 'maps' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
        } catch (e) {
          // Fall back gracefully to Bangkok coordinates
        }
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          groundingMode: currentMode,
          userLocation,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'ไม่มีการตอบกลับจากระบบ',
        links: data.links || [],
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        groundingMode: data.groundingMode || currentMode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      setError(err.message || 'ไม่สามารถติดต่อบริการ Gemini API ได้');
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('คุณต้องการล้างประวัติการสนทนานี้ใช่หรือไม่?')) {
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('bkk_gemini_chat_history_v1');
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                BKK Flower Agent Assistant
              </h3>
              <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono px-2 py-0.5 rounded-full font-medium">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              ระบบให้คำปรึกษาคู่มือ SOP, เช็คเงื่อนไขจัดส่ง & Grounding ข้อมูลสด
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-xs flex items-center gap-1.5"
            title="ล้างประวัติการสนทนา"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">ล้างแชท</span>
          </button>
        </div>
      </div>

      {/* Grounding Mode Selector */}
      <div className="px-5 py-2.5 bg-neutral-100/70 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500 dark:text-neutral-400 font-medium mr-1">โหมดการค้นหา:</span>

        <button
          onClick={() => setGroundingMode('standard')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            groundingMode === 'standard'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>SOP Flower Expert (มาตรฐาน)</span>
        </button>

        <button
          onClick={() => setGroundingMode('search')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            groundingMode === 'search'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Google Search Grounding (ข้อมูลสด)</span>
        </button>

        <button
          onClick={() => setGroundingMode('maps')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            groundingMode === 'maps'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Maps Grounding (พิกัด & เส้นทาง)</span>
        </button>
      </div>

      {/* Scrollable Message Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-rose-600 text-white rounded-tr-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-tl-xs border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Render Grounding Links if present */}
                  {m.links && m.links.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5">
                      <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                        {m.groundingMode === 'maps' ? (
                          <MapPin className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Globe className="w-3 h-3 text-sky-500" />
                        )}
                        <span>แหล่งอ้างอิงข้อมูล Grounding:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {m.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 rounded-md hover:underline"
                          >
                            <span className="truncate max-w-[200px]">{link.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[10px] text-neutral-400 px-1 flex items-center gap-1.5 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.groundingMode && m.groundingMode !== 'standard' && (
                    <span className="font-mono text-neutral-400">
                      • {m.groundingMode === 'maps' ? 'Maps Grounding' : 'Search Grounding'}
                    </span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto justify-start">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              <span>กำลังประมวลผลคำตอบจาก Gemini...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] text-neutral-400 whitespace-nowrap shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          คำถามแนะนำ:
        </span>
        {PROMPT_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => {
              setGroundingMode(item.mode);
              handleSendMessage(item.prompt, item.mode);
            }}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-[11px] shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              groundingMode === 'maps'
                ? 'ค้นหาพิกัด, ถนน, หรือสาขาดอกไม้ใน กทม. ผ่าน Google Maps...'
                : groundingMode === 'search'
                ? 'ถามข้อมูลสด, เทรนด์จัดดอกไม้, หรือข่าวการจราจรผ่าน Google Search...'
                : 'พิมพ์คำถามเกี่ยวกับระเบียบ SOP, ข้อความการ์ด หรือคำสั่งซื้อ...'
            }
            disabled={isLoading}
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-xs"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
