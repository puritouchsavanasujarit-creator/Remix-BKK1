import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Table, 
  BookOpen, 
  Sun, 
  Moon, 
  Layers, 
  ShieldAlert,
  BarChart3,
  Sparkles,
  Bot,
  Box,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { OrderItem } from './types/sop';
import { INITIAL_ORDERS } from './data/sopRules';
import DashboardView from './components/DashboardView';
import AnalysisView from './components/AnalysisView';
import AgentWorkspace from './components/AgentWorkspace';
import OrderRegistryTable from './components/OrderRegistryTable';
import SOPReferenceMatrix from './components/SOPReferenceMatrix';
import Flower3DStudio from './components/Flower3DStudio';
import GeminiChatbot from './components/GeminiChatbot';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  subscribeToOrders, 
  saveOrderToFirestore, 
  deleteOrderFromFirestore,
  checkAndSeedInitialOrders 
} from './services/orderFirestoreService';

type ActiveTab = 'DASHBOARD' | 'WORKSPACE' | 'REGISTRY' | 'STUDIO_3D' | 'GEMINI_AI' | 'ANALYSIS' | 'SOP_RULES';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');
  const { currentUser, signIn, signOut, isFirestoreOnline } = useAuth();
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'SYNCED' | 'LOCAL' | 'SYNCING'>('LOCAL');

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('bkk_orders_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save to local storage for instant offline availability
  useEffect(() => {
    localStorage.setItem('bkk_orders_v1', JSON.stringify(orders));
  }, [orders]);

  // Setup Firestore real-time listener when authenticated
  useEffect(() => {
    if (!currentUser) {
      setCloudSyncStatus('LOCAL');
      return;
    }

    setCloudSyncStatus('SYNCING');
    // Seed initial orders to Firestore if database is fresh
    checkAndSeedInitialOrders(INITIAL_ORDERS);

    const unsubscribe = subscribeToOrders(
      (firestoreOrders) => {
        if (firestoreOrders && firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
        }
        setCloudSyncStatus('SYNCED');
      },
      (err) => {
        console.warn('Firestore subscription status:', err.message);
        setCloudSyncStatus('LOCAL');
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddOrder = async (newOrder: OrderItem) => {
    // Optimistic UI update
    setOrders((prev) => [newOrder, ...prev]);

    // If authenticated, persist to Firestore
    if (currentUser) {
      try {
        await saveOrderToFirestore(newOrder);
      } catch (err) {
        console.error('Failed to sync new order with Firestore:', err);
      }
    }
  };

  const handleUpdateOrder = async (updated: OrderItem) => {
    // Optimistic UI update
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

    // If authenticated, persist to Firestore
    if (currentUser) {
      try {
        await saveOrderToFirestore(updated);
      } catch (err) {
        console.error('Failed to sync updated order with Firestore:', err);
      }
    }
  };

  const handleDeleteOrder = async (id: string) => {
    // Optimistic UI update
    setOrders((prev) => prev.filter((o) => o.id !== id));

    // If authenticated, persist to Firestore
    if (currentUser) {
      try {
        await deleteOrderFromFirestore(id);
      } catch (err) {
        console.error('Failed to delete order from Firestore:', err);
      }
    }
  };

  // Check how many orders pending OP
  const pendingOpCount = orders.filter((o) => o.opStatus === 'PENDING_OP').length;
  // Night quota count
  const nightCount = orders.filter((o) => o.shiftCategory === 'NIGHT_20_22' && o.deliveryStatus !== 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand wordmark */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); setActiveTab('DASHBOARD'); }}
            className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="text-rose-600 dark:text-rose-400">BKK Flower</span>
            <span className="font-normal text-neutral-400">/</span>
            <span>Agent Operations</span>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'DASHBOARD'
                  ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span>แดชบอร์ด</span>
            </button>

            <button
              onClick={() => setActiveTab('WORKSPACE')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'WORKSPACE'
                  ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              ระบบช่วยบันทึก
            </button>

            <button
              onClick={() => setActiveTab('REGISTRY')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'REGISTRY'
                  ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span>ตาราง BKK</span>
              {pendingOpCount > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.2 rounded font-mono font-bold">
                  {pendingOpCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('STUDIO_3D')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'STUDIO_3D'
                  ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>สตูดิโอ 3D</span>
            </button>

            <button
              onClick={() => setActiveTab('GEMINI_AI')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'GEMINI_AI'
                  ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ผู้ช่วย AI (Gemini)</span>
            </button>

            <button
              onClick={() => setActiveTab('ANALYSIS')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'ANALYSIS'
                  ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              บทวิเคราะห์
            </button>

            <button
              onClick={() => setActiveTab('SOP_RULES')}
              className={`hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'SOP_RULES'
                  ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              คู่มือเกณฑ์เวลา SOP
            </button>
          </nav>

          {/* Zone 3: Auth & Cloud Status & Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Cloud Sync Status Indicator */}
            {currentUser ? (
              <div 
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300"
                title="เชื่อมต่อ Firebase Firestore แบบเรียลไทม์"
              >
                <Cloud className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span className="font-medium">Cloud Synced</span>
              </div>
            ) : (
              <div 
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-500 dark:text-neutral-400"
                title="ทำงานแบบ Offline/LocalStorage"
              >
                <CloudOff className="w-3 h-3 text-neutral-400" />
                <span>Local Mode</span>
              </div>
            )}

            {/* Google Authentication Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 pr-2 border border-neutral-200 dark:border-neutral-700">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Agent'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium max-w-[100px] truncate text-neutral-800 dark:text-neutral-200 hidden md:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn()}
                className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-600" />
                <span>เข้าสู่ระบบ Google</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={darkMode ? 'เปิดโหมดสว่าง' : 'เปิดโหมดมืด'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setActiveTab('WORKSPACE')}
              className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ลงออเดอร์ใหม่</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 py-2 px-3 text-xs overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'DASHBOARD' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
          >
            แดชบอร์ด
          </button>
          <button
            onClick={() => setActiveTab('WORKSPACE')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'WORKSPACE' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
          >
            ช่วยบันทึก
          </button>
          <button
            onClick={() => setActiveTab('REGISTRY')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'REGISTRY' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
          >
            ตาราง ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('STUDIO_3D')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'STUDIO_3D' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
          >
            สตูดิโอ 3D
          </button>
          <button
            onClick={() => setActiveTab('GEMINI_AI')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'GEMINI_AI' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
          >
            ผู้ช่วย AI
          </button>
          <button
            onClick={() => setActiveTab('ANALYSIS')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'ANALYSIS' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
          >
            บทวิเคราะห์
          </button>
          <button
            onClick={() => setActiveTab('SOP_RULES')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'SOP_RULES' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
          >
            คู่มือ SOP
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'DASHBOARD' && <DashboardView />}
        {activeTab === 'WORKSPACE' && (
          <AgentWorkspace
            orders={orders}
            onAddOrder={(order) => {
              handleAddOrder(order);
              setActiveTab('REGISTRY');
            }}
          />
        )}
        {activeTab === 'REGISTRY' && (
          <OrderRegistryTable
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
        {activeTab === 'STUDIO_3D' && <Flower3DStudio />}
        {activeTab === 'GEMINI_AI' && <GeminiChatbot />}
        {activeTab === 'ANALYSIS' && <AnalysisView />}
        {activeTab === 'SOP_RULES' && <SOPReferenceMatrix />}
      </main>

      {/* Clean, quiet Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>BKK Flower Operations &amp; Telemetry Hub</span>
            <span aria-hidden="true">·</span>
            <span>อิงตามคู่มือ Sale Process c6df47d6.pdf</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-numbers">รอบดึก: {nightCount}/4 โควตา</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">ค้าง OP: {pendingOpCount} เคส</span>
            {currentUser && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Firestore Cloud Active</span>
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
