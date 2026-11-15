import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Activity, 
  Filter, 
  Search, 
  ShieldAlert, 
  Plus, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Calendar,
  Pencil,
  Check,
  X,
  RotateCcw,
  Trash2,
  UserPlus
} from 'lucide-react';
import { SystemLog, LogSeverity, LogCategory, AgentPerformance } from '../types/dashboard';
import { INITIAL_LOGS, AGENT_STATS, HOURLY_24H_DATA, DAILY_7D_DATA, MONTHLY_30D_DATA } from '../data/mockLogs';

type TimeRange = '24H' | '7D' | '30D';

export default function DashboardView() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | LogSeverity>('ALL');
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeries, setActiveSeries] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR'>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Editable Section Title State
  const [sectionTitle, setSectionTitle] = useState<string>(() => {
    return localStorage.getItem('bkk_agent_section_title') || 'สถิติการใช้งานของผู้ใช้และเอเจ็นท์ (Agent Performance & Usage)';
  });
  const [isEditingSectionTitle, setIsEditingSectionTitle] = useState(false);
  const [tempSectionTitle, setTempSectionTitle] = useState(sectionTitle);

  // Editable Agents State
  const [agents, setAgents] = useState<AgentPerformance[]>(() => {
    const saved = localStorage.getItem('bkk_agents_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return AGENT_STATS;
      }
    }
    return AGENT_STATS;
  });

  // Save agents to localStorage
  useEffect(() => {
    localStorage.setItem('bkk_agents_v1', JSON.stringify(agents));
  }, [agents]);

  // Inline editing state for an individual agent row
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: string;
    ordersLogged: number;
    avgProcessSeconds: number;
    accuracyRate: number;
    urgentHandled: number;
    status: 'ACTIVE' | 'IDLE';
  }>({
    name: '',
    role: '',
    ordersLogged: 0,
    avgProcessSeconds: 0,
    accuracyRate: 0,
    urgentHandled: 0,
    status: 'ACTIVE'
  });

  // In-app modal states for deletion, reset, and errors (safe for iframes)
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Add new agent modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState<{
    name: string;
    role: string;
    status: 'ACTIVE' | 'IDLE';
    ordersLogged: number;
    avgProcessSeconds: number;
    accuracyRate: number;
    urgentHandled: number;
  }>({
    name: '',
    role: 'Sales Associate',
    status: 'ACTIVE',
    ordersLogged: 0,
    avgProcessSeconds: 42,
    accuracyRate: 98.0,
    urgentHandled: 0
  });

  // Section title save/cancel
  const handleSaveSectionTitle = () => {
    if (tempSectionTitle.trim()) {
      setSectionTitle(tempSectionTitle.trim());
      localStorage.setItem('bkk_agent_section_title', tempSectionTitle.trim());
    }
    setIsEditingSectionTitle(false);
  };

  const handleCancelSectionTitle = () => {
    setTempSectionTitle(sectionTitle);
    setIsEditingSectionTitle(false);
  };

  // Agent inline edit triggers
  const handleStartEditAgent = (agent: AgentPerformance) => {
    setEditingAgentId(agent.id);
    setFormError(null);
    setEditForm({
      name: agent.name,
      role: agent.role,
      ordersLogged: agent.ordersLogged,
      avgProcessSeconds: agent.avgProcessSeconds,
      accuracyRate: agent.accuracyRate,
      urgentHandled: agent.urgentHandled,
      status: agent.status
    });
  };

  const handleSaveAgent = (id: string) => {
    if (!editForm.name.trim()) {
      setFormError('กรุณาระบุชื่อเอเจ็นท์');
      return;
    }
    setAgents((prev) =>
      prev.map((ag) =>
        ag.id === id
          ? {
              ...ag,
              name: editForm.name.trim(),
              role: editForm.role.trim() || ag.role,
              ordersLogged: Number(editForm.ordersLogged) || 0,
              avgProcessSeconds: Number(editForm.avgProcessSeconds) || 0,
              accuracyRate: Number(editForm.accuracyRate) || 0,
              urgentHandled: Number(editForm.urgentHandled) || 0,
              status: editForm.status
            }
          : ag
      )
    );
    setEditingAgentId(null);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setEditingAgentId(null);
    setFormError(null);
  };

  // Trigger in-app delete modal
  const handleDeleteAgent = (id: string, name: string) => {
    setAgentToDelete({ id, name });
  };

  // Confirm delete agent
  const confirmDeleteAgent = () => {
    if (agentToDelete) {
      setAgents((prev) => prev.filter((ag) => ag.id !== agentToDelete.id));
      if (editingAgentId === agentToDelete.id) setEditingAgentId(null);
      setAgentToDelete(null);
    }
  };

  // Trigger in-app reset modal
  const handleResetAgents = () => {
    setIsResetConfirmOpen(true);
  };

  // Confirm reset agents
  const confirmResetAgents = () => {
    setAgents(AGENT_STATS);
    localStorage.removeItem('bkk_agents_v1');
    setSectionTitle('สถิติการใช้งานของผู้ใช้และเอเจ็นท์ (Agent Performance & Usage)');
    localStorage.removeItem('bkk_agent_section_title');
    setTempSectionTitle('สถิติการใช้งานของผู้ใช้และเอเจ็นท์ (Agent Performance & Usage)');
    setEditingAgentId(null);
    setIsResetConfirmOpen(false);
  };

  const handleAddNewAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentForm.name.trim()) {
      setFormError('กรุณาระบุชื่อเอเจ็นท์');
      return;
    }

    const avatarColors = ['bg-rose-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-teal-500'];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const created: AgentPerformance = {
      id: `ag-${Date.now()}`,
      name: newAgentForm.name.trim(),
      role: newAgentForm.role.trim() || 'Sales Associate',
      avatarColor: randomColor,
      ordersLogged: Number(newAgentForm.ordersLogged) || 0,
      avgProcessSeconds: Number(newAgentForm.avgProcessSeconds) || 45,
      accuracyRate: Number(newAgentForm.accuracyRate) || 98.0,
      urgentHandled: Number(newAgentForm.urgentHandled) || 0,
      lastActive: 'เมื่อสักครู่',
      status: newAgentForm.status
    };

    setAgents((prev) => [...prev, created]);
    setNewAgentForm({
      name: '',
      role: 'Sales Associate',
      status: 'ACTIVE',
      ordersLogged: 0,
      avgProcessSeconds: 42,
      accuracyRate: 98.0,
      urgentHandled: 0
    });
    setFormError(null);
    setIsAddModalOpen(false);
  };

  // Select chart dataset based on timeRange
  const chartData = useMemo(() => {
    if (timeRange === '24H') return HOURLY_24H_DATA;
    if (timeRange === '7D') return DAILY_7D_DATA;
    return MONTHLY_30D_DATA;
  }, [timeRange]);

  // Aggregate totals
  const totalStats = useMemo(() => {
    let info = 0;
    let warning = 0;
    let error = 0;
    chartData.forEach((d) => {
      info += d.info;
      warning += d.warning;
      error += d.error;
    });
    const total = info + warning + error;
    return {
      total,
      info,
      warning,
      error,
      infoPct: total > 0 ? ((info / total) * 100).toFixed(1) : '0',
      warningPct: total > 0 ? ((warning / total) * 100).toFixed(1) : '0',
      errorPct: total > 0 ? ((error / total) * 100).toFixed(1) : '0'
    };
  }, [chartData]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (severityFilter !== 'ALL' && l.severity !== severityFilter) return false;
      if (selectedAgent !== 'ALL' && !l.agentName.includes(selectedAgent)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          l.message.toLowerCase().includes(q) ||
          l.agentName.toLowerCase().includes(q) ||
          (l.orderNumber && l.orderNumber.toLowerCase().includes(q)) ||
          l.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [logs, severityFilter, selectedAgent, searchQuery]);

  // Max value in chart data for SVG scaling
  const maxChartVal = useMemo(() => {
    return Math.max(...chartData.map((d) => d.total), 10);
  }, [chartData]);

  // Simulate new log addition
  const handleSimulateLog = (severity: LogSeverity) => {
    const now = new Date();
    const timeDisplay = now.toTimeString().split(' ')[0];
    const id = `log-${Date.now()}`;
    const randomAgent = agents.length > 0 ? agents[Math.floor(Math.random() * agents.length)].name : 'เอเจนท์ กานต์ดา';

    let newLog: SystemLog;
    if (severity === 'ERROR') {
      newLog = {
        id,
        timestamp: now.toISOString(),
        timeDisplay,
        severity: 'ERROR',
        category: 'OP_GATEKEEPER',
        message: 'ตรวจพบเคสเร่งด่วน < 2 ชม. (เวลาสั่งนัดรับอีก 45 นาที): ถูกสกัดกั้นโดย OP Gatekeeper',
        agentName: randomAgent,
        channel: 'Line OA',
        orderNumber: `BKK-2569-${Math.floor(1000 + Math.random() * 9000)}`,
        details: {
          reason: 'ไม่ได้ผ่านการอนุมัติจาก OP ก่อนคอนเฟิร์มลูกค้า',
          diffMinutes: 45
        }
      };
    } else if (severity === 'WARNING') {
      newLog = {
        id,
        timestamp: now.toISOString(),
        timeDisplay,
        severity: 'WARNING',
        category: 'NIGHT_QUOTA',
        message: 'โควตารอบดึกใกล้เต็ม: ใช้ไปแล้ว 4/5 รายการ (เหลือโควตาสุดท้ายสำหรับ 1-10 กม.)',
        agentName: randomAgent,
        channel: 'Messenger',
        orderNumber: `BKK-2569-${Math.floor(1000 + Math.random() * 9000)}`,
        details: {
          usedSlots: 4,
          maxSlots: 5
        }
      };
    } else {
      newLog = {
        id,
        timestamp: now.toISOString(),
        timeDisplay,
        severity: 'INFO',
        category: 'ORDER_CREATE',
        message: 'บันทึกออเดอร์ใหม่สำเร็จและส่ง Line Head Office เรียบร้อย',
        agentName: randomAgent,
        channel: 'Instagram',
        orderNumber: `BKK-2569-${Math.floor(1000 + Math.random() * 9000)}`,
        details: {
          item: 'ช่อกุหลาบแดง Ecuador 9 ดอก',
          price: 2890
        }
      };
    }

    setLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header & Time Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <span>Log Monitoring &amp; System Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>สาขา BKK</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            แดชบอร์ดภาพรวม Log และประสิทธิภาพระบบ
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            ติดตามสถานะการบันทึกออเดอร์ การทำงานของ OP Gatekeeper การใช้โควตา และสถิติการทำงานของเอเจนท์
          </p>
        </div>

        {/* Time Range Selector & Live Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
            <button
              onClick={() => setTimeRange('24H')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                timeRange === '24H'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              24 ชม. ล่าสุด
            </button>
            <button
              onClick={() => setTimeRange('7D')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                timeRange === '7D'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              7 วันล่าสุด
            </button>
            <button
              onClick={() => setTimeRange('30D')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                timeRange === '30D'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              30 วันล่าสุด
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-800 pl-2">
            <button
              onClick={() => handleSimulateLog('INFO')}
              className="px-2 py-1 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
              title="จำลอง Log Info"
            >
              + Info
            </button>
            <button
              onClick={() => handleSimulateLog('WARNING')}
              className="px-2 py-1 text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
              title="จำลอง Log Warning"
            >
              + Warn
            </button>
            <button
              onClick={() => handleSimulateLog('ERROR')}
              className="px-2 py-1 text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
              title="จำลอง Log Error"
            >
              + Error
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards (Severity Breakdown & KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logs */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>จำนวน Log ทั้งหมด</span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-2">
            {totalStats.total.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% เทียบกับช่วงก่อน</span>
          </div>
        </div>

        {/* Info Logs */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>ระดับปกติ (Info)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono-numbers mt-2">
            {totalStats.info.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            คิดเป็น <span className="font-mono-numbers font-semibold text-neutral-700 dark:text-neutral-300">{totalStats.infoPct}%</span> ของทราฟฟิก
          </div>
        </div>

        {/* Warning Logs */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>แจ้งเตือน (Warning)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono-numbers mt-2">
            {totalStats.warning.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            เตือนโควตาดึก &amp; ส่งไกล <span className="font-mono-numbers font-semibold text-neutral-700 dark:text-neutral-300">({totalStats.warningPct}%)</span>
          </div>
        </div>

        {/* Error Logs */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>ข้อผิดพลาด (Error)</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono-numbers mt-2">
            {totalStats.error.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
            ดักจับโดย OP Gatekeeper <span className="font-mono-numbers font-semibold">({totalStats.errorPct}%)</span>
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart Section */}
      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              แนวโน้มปริมาณ Log และข้อผิดพลาดตามช่วงเวลา (Trend Timeline)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              แสดงการกระจายตัวของ Info, Warning และ Error ตลอดช่วงเวลาที่เลือก
            </p>
          </div>

          {/* Series Toggle Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveSeries('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${activeSeries === 'ALL' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs' : 'text-neutral-600 dark:text-neutral-400'}`}
            >
              แสดงทั้งหมด
            </button>
            <button
              onClick={() => setActiveSeries('ERROR')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${activeSeries === 'ERROR' ? 'bg-rose-500 text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-600'}`}
            >
              Error เท่านั้น
            </button>
            <button
              onClick={() => setActiveSeries('WARNING')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${activeSeries === 'WARNING' ? 'bg-amber-500 text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:text-amber-600'}`}
            >
              Warning เท่านั้น
            </button>
            <button
              onClick={() => setActiveSeries('INFO')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${activeSeries === 'INFO' ? 'bg-emerald-600 text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:text-emerald-600'}`}
            >
              Info เท่านั้น
            </button>
          </div>
        </div>

        {/* SVG Interactive Bar Chart */}
        <div className="relative pt-6">
          <div className="h-64 w-full flex items-end gap-2 sm:gap-4 px-2 border-b border-neutral-200 dark:border-neutral-800">
            {chartData.map((d, index) => {
              const heightPct = Math.max(8, (d.total / maxChartVal) * 100);
              const infoHeightPct = d.total > 0 ? (d.info / d.total) * 100 : 0;
              const warnHeightPct = d.total > 0 ? (d.warning / d.total) * 100 : 0;
              const errHeightPct = d.total > 0 ? (d.error / d.total) * 100 : 0;

              const isHovered = hoveredPoint === index;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-20 bg-neutral-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl border border-neutral-700 whitespace-nowrap pointer-events-none space-y-1">
                      <div className="font-bold text-neutral-200 pb-1 border-b border-neutral-800 font-mono-numbers">
                        {d.timeLabel}
                      </div>
                      <div className="flex items-center justify-between gap-3 text-emerald-400">
                        <span>Info:</span>
                        <strong className="font-mono-numbers">{d.info}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-amber-400">
                        <span>Warning:</span>
                        <strong className="font-mono-numbers">{d.warning}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-rose-400">
                        <span>Error:</span>
                        <strong className="font-mono-numbers">{d.error}</strong>
                      </div>
                      <div className="pt-1 border-t border-neutral-800 text-neutral-300 font-semibold font-mono-numbers">
                        รวม: {d.total} logs
                      </div>
                    </div>
                  )}

                  {/* Multi-layer stacked bar */}
                  <div 
                    className={`w-full max-w-[36px] rounded-t-sm transition-all flex flex-col-reverse overflow-hidden ${isHovered ? 'ring-2 ring-rose-500/80 scale-105' : 'opacity-90 hover:opacity-100'}`}
                    style={{ height: `${heightPct}%` }}
                  >
                    {activeSeries === 'ALL' ? (
                      <>
                        <div 
                          className="w-full bg-emerald-500 dark:bg-emerald-600 transition-all"
                          style={{ height: `${infoHeightPct}%` }} 
                        />
                        <div 
                          className="w-full bg-amber-400 dark:bg-amber-500 transition-all"
                          style={{ height: `${warnHeightPct}%` }} 
                        />
                        <div 
                          className="w-full bg-rose-500 dark:bg-rose-600 transition-all"
                          style={{ height: `${errHeightPct}%` }} 
                        />
                      </>
                    ) : activeSeries === 'ERROR' ? (
                      <div 
                        className="w-full bg-rose-500 dark:bg-rose-600 transition-all"
                        style={{ height: `${(d.error / (d.error || 1)) * 100}%` }}
                      />
                    ) : activeSeries === 'WARNING' ? (
                      <div 
                        className="w-full bg-amber-400 dark:bg-amber-500 transition-all"
                        style={{ height: `${(d.warning / (d.warning || 1)) * 100}%` }}
                      />
                    ) : (
                      <div 
                        className="w-full bg-emerald-500 dark:bg-emerald-600 transition-all"
                        style={{ height: `${(d.info / (d.info || 1)) * 100}%` }}
                      />
                    )}
                  </div>

                  {/* X-axis label */}
                  <div className="mt-2 text-[10px] sm:text-[11px] text-neutral-500 font-mono-numbers truncate">
                    {d.timeLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-2 text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>Info (ปกติ)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
                <span>Warning (เตือนโควตา/ระยะทาง)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                <span>Error (ดักจับเคสด่วน)</span>
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              *ข้อมูลอัปเดตแบบอัตโนมัติ Real-time
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Error Root Causes & System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Error & Warning Root Cause Analysis */}
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              การจำแนกสาเหตุข้อผิดพลาดและการแจ้งเตือน (Root Cause Breakdown)
            </h2>
            <span className="text-xs text-neutral-500">SOP Enforcement</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  1. เคสเร่งด่วน &lt; 2 ชม. ติดด่าน OP Gatekeeper
                </span>
                <span className="font-mono-numbers font-semibold text-rose-600 dark:text-rose-400">42% (23 เคส)</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '42%' }} />
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                ระบบบล็อกการกดยืนยันอัตโนมัติ เพื่อป้องกันการรับปากลูกค้าก่อน OP อนุมัติ
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  2. โควตารอบดึก 20:00-22:00 น. เต็ม (Night Quota Exceeded)
                </span>
                <span className="font-mono-numbers font-semibold text-amber-600 dark:text-amber-400">28% (15 เคส)</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '28%' }} />
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                พยายามบันทึกเกิน 5 ออเดอร์ หรือเกินโควตาระยะทาง (1-10 กม. เต็ม 3, 11-20 กม. เต็ม 2)
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  3. ระยะทางเกินเกณฑ์ชุดส่งด่วน (&gt; 25 กม.)
                </span>
                <span className="font-mono-numbers font-semibold text-neutral-700 dark:text-neutral-300">16% (9 เคส)</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div className="bg-neutral-400 h-full rounded-full" style={{ width: '16%' }} />
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                ลูกค้าต้องการชุดส่งด่วนแต่ระยะทางเกินเกณฑ์ความปลอดภัยของดอกไม้
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  4. ข้อมูลแชทไม่ครบถ้วน (Chat Parsing Incomplete)
                </span>
                <span className="font-mono-numbers font-semibold text-neutral-700 dark:text-neutral-300">14% (7 เคส)</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div className="bg-neutral-400 h-full rounded-full" style={{ width: '14%' }} />
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                ลูกค้ายังไม่ได้แจ้งเบอร์โทรหรือที่อยู่จัดส่งละเอียดในแชท
              </div>
            </div>
          </div>
        </div>

        {/* Right: System Performance & Health Indicators */}
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              ข้อมูลประสิทธิภาพของระบบ (System Performance &amp; SLA Health)
            </h2>
            <span className="text-xs text-neutral-500">Live Benchmarks</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-neutral-500">เวลาบันทึกออเดอร์เฉลี่ย:</span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono-numbers mt-1">
                42.8 วินาที
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">ลดลงจากเดิม 4.5 นาที</div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-neutral-500">อัตราความแม่นยำ Chat Parser:</span>
              <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-1">
                98.6%
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">สกัดข้อมูลตรงฟิลด์อัตโนมัติ</div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-neutral-500">อัตราปฏิบัติตาม SLA จัดส่ง:</span>
              <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-1">
                99.1%
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">เทียบตามตารางเวลาแมส</div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-neutral-500">เวลาตอบรับของ OP:</span>
              <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers mt-1">
                3.4 นาที
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">สำหรับเคสเร่งด่วน &lt; 2 ชม.</div>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-100/60 dark:bg-neutral-800/40 rounded-lg text-xs space-y-2 border border-neutral-200/60 dark:border-neutral-700/60">
            <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300 font-semibold">
              <span>สถิติช่องทางจำหน่าย (Channel Distribution):</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-neutral-600 dark:text-neutral-400 font-mono-numbers">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Line OA (58%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Messenger (27%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Instagram (15%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User & Agent Usage Statistics (EDITABLE SECTION TITLE & EDITABLE AGENTS) */}
      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          {/* Section Title with Inline Editing */}
          <div className="flex-1 min-w-[280px]">
            {isEditingSectionTitle ? (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="text"
                  value={tempSectionTitle}
                  onChange={(e) => setTempSectionTitle(e.target.value)}
                  placeholder="ใส่ชื่อหัวข้อที่ต้องการ..."
                  className="px-2.5 py-1 text-sm font-bold rounded border border-rose-400 dark:border-rose-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 flex-1 max-w-md"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveSectionTitle}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                  title="บันทึกชื่อหัวข้อ"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelSectionTitle}
                  className="p-1.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded transition-colors"
                  title="ยกเลิก"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <Users className="w-4 h-4 text-rose-500 shrink-0" />
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {sectionTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setTempSectionTitle(sectionTitle);
                    setIsEditingSectionTitle(true);
                  }}
                  className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                  title="คลิกเพื่อแก้ไข/เปลี่ยนชื่อหัวข้อนี้"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              ติดตามปริมาณงาน ความเร็ว และความแม่นยำ (สามารถกดไอคอนดินสอเพื่อแก้ไขหรือเปลี่ยนชื่อได้ทันที)
            </p>
          </div>

          {/* Action buttons: Add Agent & Reset Defaults */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-neutral-500 mr-2 hidden sm:inline">
              Active: {agents.filter(a => a.status === 'ACTIVE').length} / {agents.length} ท่าน
            </span>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ เพิ่มเอเจ็นท์</span>
            </button>

            <button
              type="button"
              onClick={handleResetAgents}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="รีเซ็ตข้อมูลเอเจ็นท์กลับเป็นค่าเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table of Agents */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100/70 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                <th className="py-2.5 px-3.5">เอเจ็นท์ / ผู้ใช้งาน</th>
                <th className="py-2.5 px-3.5">ตำแหน่ง</th>
                <th className="py-2.5 px-3.5 text-center">ออเดอร์ที่บันทึก</th>
                <th className="py-2.5 px-3.5 text-center">เวลาเฉลี่ย/ออเดอร์</th>
                <th className="py-2.5 px-3.5 text-center">ความแม่นยำ</th>
                <th className="py-2.5 px-3.5 text-center">เคสด่วนที่ดูแล</th>
                <th className="py-2.5 px-3.5 text-center">สถานะ</th>
                <th className="py-2.5 px-3.5 text-right">จัดการ (แก้ไข / ลบ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono-numbers">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-neutral-500 font-sans">
                    ยังไม่มีรายชื่อเอเจ็นท์ในระบบ คลิกปุ่ม <strong className="text-rose-600 dark:text-rose-400">"+ เพิ่มเอเจ็นท์"</strong> ด้านบน หรือคลิก <button onClick={handleResetAgents} className="text-rose-600 dark:text-rose-400 underline font-medium ml-1">รีเซ็ตข้อมูลเริ่มต้น</button>
                  </td>
                </tr>
              ) : (
                agents.map((agent) => {
                  const isEditing = editingAgentId === agent.id;

                  if (isEditing) {
                    return (
                      <tr key={agent.id} className="bg-rose-50/50 dark:bg-rose-950/20">
                        {/* Name input */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-sans">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full ${agent.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                              {editForm.name.charAt(0) || '?'}
                            </div>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              placeholder="ชื่อเอเจ็นท์..."
                              className="px-2 py-1 text-xs rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 w-44"
                              autoFocus
                            />
                          </div>
                        </td>

                        {/* Role input */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-sans">
                          <input
                            type="text"
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            placeholder="ตำแหน่ง..."
                            className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 w-32"
                          />
                        </td>

                        {/* Orders input */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <input
                            type="number"
                            value={editForm.ordersLogged}
                            onChange={(e) => setEditForm({ ...editForm, ordersLogged: Number(e.target.value) })}
                            className="w-16 px-1.5 py-1 text-xs text-center rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono-numbers"
                          />
                        </td>

                        {/* Speed input */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <input
                            type="number"
                            value={editForm.avgProcessSeconds}
                            onChange={(e) => setEditForm({ ...editForm, avgProcessSeconds: Number(e.target.value) })}
                            className="w-14 px-1.5 py-1 text-xs text-center rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono-numbers"
                          />
                        </td>

                        {/* Accuracy input */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <input
                            type="number"
                            step="0.1"
                            value={editForm.accuracyRate}
                            onChange={(e) => setEditForm({ ...editForm, accuracyRate: Number(e.target.value) })}
                            className="w-16 px-1.5 py-1 text-xs text-center rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono-numbers"
                          />
                        </td>

                        {/* Urgent handled input */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <input
                            type="number"
                            value={editForm.urgentHandled}
                            onChange={(e) => setEditForm({ ...editForm, urgentHandled: Number(e.target.value) })}
                            className="w-14 px-1.5 py-1 text-xs text-center rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono-numbers"
                          />
                        </td>

                        {/* Status select */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap font-sans">
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'ACTIVE' | 'IDLE' })}
                            className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="IDLE">IDLE</option>
                          </select>
                        </td>

                        {/* Save & Cancel & Delete */}
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap font-sans space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveAgent(agent.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
                            title="บันทึกการแก้ไข"
                          >
                            <Check className="w-3 h-3" />
                            <span>บันทึก</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-md transition-colors"
                            title="ยกเลิก"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAgent(agent.id, agent.name)}
                            className="px-2 py-1 text-xs bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded-md transition-colors inline-flex items-center gap-1"
                            title="ลบเอเจ็นท์"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>ลบ</span>
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={agent.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group">
                      <td className="py-3 px-3.5 whitespace-nowrap font-sans font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${agent.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                          {agent.name.charAt(0)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{agent.name}</span>
                          <button
                            type="button"
                            onClick={() => handleStartEditAgent(agent)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-opacity"
                            title="แก้ไข/เปลี่ยนชื่อเอเจ็นท์ท่านนี้"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap font-sans text-neutral-500">
                        {agent.role}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap font-bold text-neutral-900 dark:text-neutral-100">
                        {agent.ordersLogged}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-semibold">
                        {agent.avgProcessSeconds} วิ
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {agent.accuracyRate}%
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap font-semibold text-rose-600 dark:text-rose-400">
                        {agent.urgentHandled} เคส
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap font-sans text-[11px] text-neutral-500">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${agent.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        <span>{agent.status}</span>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-sans space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEditAgent(agent)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300/80 dark:border-neutral-700 transition-colors"
                          title="แก้ไขชื่อและข้อมูลเอเจ็นท์"
                        >
                          <Pencil className="w-3 h-3 text-neutral-500" />
                          <span>แก้ไข</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAgent(agent.id, agent.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 transition-colors"
                          title="ลบเอเจ็นท์ท่านนี้"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>ลบ</span>
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

      {/* Add New Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-rose-500" />
                เพิ่มรายชื่อเอเจ็นท์ / ผู้ใช้งานใหม่
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewAgent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  ชื่อ-นามสกุล / ชื่อเอเจ็นท์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAgentForm.name}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                  placeholder="e.g. พิชชาภา นามสกุล (เอเจ็นท์กะบ่าย)"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    ตำแหน่ง / บทบาท
                  </label>
                  <input
                    type="text"
                    value={newAgentForm.role}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, role: e.target.value })}
                    placeholder="e.g. Sales Specialist"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    สถานะการทำงาน
                  </label>
                  <select
                    value={newAgentForm.status}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, status: e.target.value as 'ACTIVE' | 'IDLE' })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="ACTIVE">ACTIVE (พร้อมทำงาน)</option>
                    <option value="IDLE">IDLE (พักกะงาน)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    ออเดอร์เริ่มต้น
                  </label>
                  <input
                    type="number"
                    value={newAgentForm.ordersLogged}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, ordersLogged: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    เวลาเฉลี่ย (วินาที)
                  </label>
                  <input
                    type="number"
                    value={newAgentForm.avgProcessSeconds}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, avgProcessSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  เพิ่มเอเจ็นท์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Agent Confirmation Modal (Iframe Safe) */}
      {agentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  ยืนยันการลบเอเจ็นท์
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  คุณต้องการลบรายชื่อ <strong className="text-neutral-900 dark:text-neutral-100">"{agentToDelete.name}"</strong> ออกจากระบบสถิติใช่หรือไม่?
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setAgentToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteAgent}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ใช่, ลบเอเจ็นท์นี้</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Reset Confirmation Modal (Iframe Safe) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  ยืนยันการรีเซ็ตข้อมูล
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  ต้องการคืนค่ารายชื่อเอเจ็นท์และชื่อหัวข้อกลับเป็นค่าเริ่มต้นทั้งหมดหรือไม่?
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmResetAgents}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตค่าเริ่มต้น</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Log Explorer & Search Console */}
      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" />
              ศูนย์ตรวจสอบบันทึกเหตุการณ์ (Live Log Explorer)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              ค้นหาและตรวจสอบรายละเอียด Log แต่ละรายการแบบเจาะลึก
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">แสดงผล:</span>
            <span className="font-mono-numbers font-semibold text-neutral-800 dark:text-neutral-200">{filteredLogs.length} รายการ</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity filter */}
            <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <button
                onClick={() => setSeverityFilter('ALL')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${severityFilter === 'ALL' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs' : 'text-neutral-600 dark:text-neutral-400'}`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setSeverityFilter('ERROR')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${severityFilter === 'ERROR' ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-neutral-600 dark:text-neutral-400'}`}
              >
                Error ({logs.filter(l => l.severity === 'ERROR').length})
              </button>
              <button
                onClick={() => setSeverityFilter('WARNING')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${severityFilter === 'WARNING' ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-neutral-600 dark:text-neutral-400'}`}
              >
                Warning ({logs.filter(l => l.severity === 'WARNING').length})
              </button>
              <button
                onClick={() => setSeverityFilter('INFO')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${severityFilter === 'INFO' ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-neutral-600 dark:text-neutral-400'}`}
              >
                Info ({logs.filter(l => l.severity === 'INFO').length})
              </button>
            </div>

            {/* Dynamic Agent Selector based on editable agents list */}
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              aria-label="กรองตามผู้ใช้งาน"
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <option value="ALL">ผู้ใช้งาน: ทั้งหมด ({agents.length} ท่าน)</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.name.split(' ')[0]}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อความ Log, เลขที่ออเดอร์..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-rose-500 w-56 sm:w-64"
            />
          </div>
        </div>

        {/* Log List */}
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              ไม่พบบันทึก Log ตามตัวกรองที่เลือก
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/40 transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      {/* Severity Icon */}
                      <div className="mt-0.5 shrink-0">
                        {log.severity === 'ERROR' && <XCircle className="w-4 h-4 text-rose-500" />}
                        {log.severity === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {log.severity === 'INFO' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>

                      <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {log.message}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 mt-1">
                          <span className="font-mono-numbers">{log.timeDisplay}</span>
                          <span aria-hidden="true">·</span>
                          <span>{log.agentName}</span>
                          {log.channel && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{log.channel}</span>
                            </>
                          )}
                          {log.orderNumber && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono-numbers text-neutral-700 dark:text-neutral-300 font-semibold">{log.orderNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {log.category}
                      </span>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                    </div>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && log.details && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
                      <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        รายละเอียดเพิ่มเติม (Payload Context):
                      </div>
                      <pre className="text-[11px] font-mono text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 overflow-x-auto leading-relaxed">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
