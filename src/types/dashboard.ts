export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR';

export type LogCategory = 
  | 'ORDER_CREATE'
  | 'SLA_VALIDATION'
  | 'OP_GATEKEEPER'
  | 'NIGHT_QUOTA'
  | 'CHAT_PARSER'
  | 'DISPATCH_LINE'
  | 'USER_SESSION';

export interface SystemLog {
  id: string;
  timestamp: string; // ISO
  timeDisplay: string; // "14:23:10"
  severity: LogSeverity;
  category: LogCategory;
  message: string;
  agentName: string;
  channel?: string;
  orderNumber?: string;
  details?: Record<string, any>;
  resolved?: boolean;
}

export interface AgentPerformance {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  ordersLogged: number;
  avgProcessSeconds: number;
  accuracyRate: number; // percentage
  urgentHandled: number;
  lastActive: string;
  status: 'ACTIVE' | 'IDLE';
}

export interface HourlyLogData {
  timeLabel: string;
  info: number;
  warning: number;
  error: number;
  total: number;
}
