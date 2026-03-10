import { AxiosError } from 'axios';
import api from '@/lib/api/client';
import type {
  BillingActionResponse,
  CancelSubscriptionRequest,
  ChangePlanRequest,
  ChangePlanResponse,
  CheckoutSessionResponse,
  CreateCheckoutSessionRequest,
  CreatePortalSessionRequest,
  FeatureAccess,
  PauseSubscriptionRequest,
  PortalSessionResponse,
  SubscriptionLifecycle,
  SubscriptionSnapshot,
} from './types';

export const billingApi = {
  getSubscription: async (): Promise<SubscriptionSnapshot | null> => {
    try {
      const { data } = await api.get<SubscriptionSnapshot>('/billing/subscription');
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  getLifecycle: async (): Promise<SubscriptionLifecycle> => {
    const { data } = await api.get<SubscriptionLifecycle>('/billing/lifecycle');
    return data;
  },

  createCheckoutSession: async (
    payload: CreateCheckoutSessionRequest,
  ): Promise<CheckoutSessionResponse> => {
    const { data } = await api.post<CheckoutSessionResponse>('/billing/checkout-session', payload);
    return data;
  },

  createPortalSession: async (
    payload: CreatePortalSessionRequest,
  ): Promise<PortalSessionResponse> => {
    const { data } = await api.post<PortalSessionResponse>('/billing/portal-session', payload);
    return data;
  },

  changePlan: async (payload: ChangePlanRequest): Promise<ChangePlanResponse> => {
    const { data } = await api.post<ChangePlanResponse>('/billing/change-plan', payload);
    return data;
  },

  cancel: async (payload: CancelSubscriptionRequest): Promise<BillingActionResponse> => {
    const { data } = await api.post<BillingActionResponse>('/billing/cancel', payload);
    return data;
  },

  resume: async (): Promise<BillingActionResponse> => {
    const { data } = await api.post<BillingActionResponse>('/billing/resume');
    return data;
  },

  pause: async (payload: PauseSubscriptionRequest): Promise<BillingActionResponse> => {
    const { data } = await api.post<BillingActionResponse>('/billing/pause', payload);
    return data;
  },

  unpause: async (): Promise<BillingActionResponse> => {
    const { data } = await api.post<BillingActionResponse>('/billing/unpause');
    return data;
  },

  reactivate: async (): Promise<BillingActionResponse> => {
    const { data } = await api.post<BillingActionResponse>('/billing/reactivate');
    return data;
  },

  getFeatureAccess: async (featureCode: string): Promise<FeatureAccess> => {
    const { data } = await api.get<FeatureAccess>(`/billing/features/${featureCode}`);
    return data;
  },
};
