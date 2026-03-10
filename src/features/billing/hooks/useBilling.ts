import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { billingApi } from '@/features/billing/api/billing.api';
import type {
  BillingActionResponse,
  CancelSubscriptionRequest,
  ChangePlanRequest,
  CreateCheckoutSessionRequest,
  CreatePortalSessionRequest,
  PauseSubscriptionRequest,
} from '@/features/billing/api/types';

export const BILLING_QUERY_KEYS = {
  all: ['billing'] as const,
  subscription: ['billing', 'subscription'] as const,
  lifecycle: ['billing', 'lifecycle'] as const,
  featureAccess: (featureCode: string) => ['billing', 'feature-access', featureCode] as const,
};

function useInvalidateBillingQueries() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.subscription }),
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.lifecycle }),
    ]);
}

export function useBillingSubscription() {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.subscription,
    queryFn: billingApi.getSubscription,
  });
}

export function useBillingLifecycle() {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.lifecycle,
    queryFn: billingApi.getLifecycle,
  });
}

export function useFeatureAccess(featureCode: string) {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.featureAccess(featureCode),
    queryFn: () => billingApi.getFeatureAccess(featureCode),
    enabled: Boolean(featureCode),
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 402) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (payload: CreateCheckoutSessionRequest) => billingApi.createCheckoutSession(payload),
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: (payload: CreatePortalSessionRequest) => billingApi.createPortalSession(payload),
  });
}

export function useChangePlan() {
  const invalidateBillingQueries = useInvalidateBillingQueries();

  return useMutation({
    mutationFn: (payload: ChangePlanRequest) => billingApi.changePlan(payload),
    onSuccess: invalidateBillingQueries,
  });
}

function useBillingActionMutation<TVariables>(
  mutationFn: (payload: TVariables) => Promise<BillingActionResponse>,
) {
  const invalidateBillingQueries = useInvalidateBillingQueries();

  return useMutation({
    mutationFn,
    onSuccess: invalidateBillingQueries,
  });
}

export function useCancelSubscription() {
  return useBillingActionMutation((payload: CancelSubscriptionRequest) => billingApi.cancel(payload));
}

export function useResumeSubscription() {
  return useBillingActionMutation(() => billingApi.resume());
}

export function usePauseSubscription() {
  return useBillingActionMutation((payload: PauseSubscriptionRequest) => billingApi.pause(payload));
}

export function useUnpauseSubscription() {
  return useBillingActionMutation(() => billingApi.unpause());
}

export function useReactivateSubscription() {
  return useBillingActionMutation(() => billingApi.reactivate());
}
