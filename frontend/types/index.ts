export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface SystemStatus {
  monitoring: boolean;
  datesheetStatus: 'available' | 'not_available' | 'unknown';
  lastChecked: string;
  subscriberCount: number;
  eligibleSubscribers: number;
  totalNotificationsSent: number;
  semesterDistribution: Array<{
    semester: number;
    count: number;
    active: number;
  }>;
}

export interface Subscriber {
  id: string;
  email: string;
  semester: number;
  subscribedAt: string;
  isActive: boolean;
  finalSemesterNotified?: boolean;
}

export interface SubscriberStats {
  total: number;
  active: number;
  inactive: number;
  eligible: number;
  semesterDistribution: Array<{
    semester: number;
    count: number;
    active: number;
  }>;
}