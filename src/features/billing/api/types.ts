export type BillingSubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid'
  | 'paused'
  | string;

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  quantity?: number;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface CreatePortalSessionRequest {
  returnUrl: string;
}

export interface PortalSessionResponse {
  url: string;
}

export interface SubscriptionSnapshot {
  tenantId: string;
  status: BillingSubscriptionStatus;
  priceId: string;
  productId: string;
  currentPeriodEndUtc: string;
  gracePeriodEndsUtc: string | null;
  isBlocked: boolean;
  hasAccess: boolean;
}

export interface ChangePlanRequest {
  targetPriceId: string;
  effectiveMode: string;
  notes?: string | null;
}

export interface ChangePlanResponse {
  changeRequestId: string;
  stripeSubscriptionId: string;
  previousPriceId: string;
  newPriceId: string;
  changeType: string;
  effectiveMode: string;
  prorationBehavior: string;
  status: string;
}

export interface FeatureAccess {
  featureCode: string;
  enabled: boolean;
  limit: number | null;
  value: string | null;
}

export interface CancelSubscriptionRequest {
  reason?: string | null;
}

export interface PauseSubscriptionRequest {
  reason?: string | null;
}

export interface BillingActionResponse {
  stripeSubscriptionId: string;
  action: string;
  status: string;
  effectiveAtUtc: string | null;
  message: string | null;
}

export interface SubscriptionLifecycle {
  stripeSubscriptionId: string;
  status: BillingSubscriptionStatus;
  isBlocked: boolean;
  canCancel: boolean;
  canResume: boolean;
  canPause: boolean;
  canUnpause: boolean;
  canReactivate: boolean;
  currentPeriodEndUtc: string;
  cancelAtUtc: string | null;
  gracePeriodEndsUtc: string | null;
}
