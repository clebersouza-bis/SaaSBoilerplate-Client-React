// types/errors.ts
export interface PermissionErrorEvent {
  status: number;
  message: string;
  resource?: string;
  action?: string;
  url?: string;
  method?: string;
  timestamp: string;
}

export interface BillingAccessBlockedEvent {
  status: number;
  code?: string;
  message: string;
  subscriptionStatus?: string;
  gracePeriodEndsUtc?: string;
  allowed?: string[];
  timestamp: string;
}
