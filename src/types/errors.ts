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