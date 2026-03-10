import { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useBillingLifecycle,
  useBillingSubscription,
  useCancelSubscription,
  useCreateCheckoutSession,
  usePauseSubscription,
  useReactivateSubscription,
  useResumeSubscription,
  useUnpauseSubscription,
} from '@/features/billing/hooks/useBilling';
import type { BillingActionResponse } from '@/features/billing/api/types';

const BILLING_SUCCESS_URL = `${window.location.origin}/settings?tab=billing&checkout=success`;
const BILLING_CANCEL_URL = `${window.location.origin}/settings?tab=billing&checkout=cancel`;

type BillingActionType = 'cancel' | 'pause' | 'resume' | 'unpause' | 'reactivate';

const actionLabel: Record<BillingActionType, string> = {
  cancel: 'Cancel at period end',
  pause: 'Pause subscription',
  resume: 'Resume cancellation',
  unpause: 'Unpause subscription',
  reactivate: 'Reactivate subscription',
};

function formatUtcDate(value: string | null | undefined) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
}

function getStatusVariant(status: string): 'default' | 'destructive' {
  return ['past_due', 'canceled', 'unpaid', 'incomplete_expired'].includes(status)
    ? 'destructive'
    : 'default';
}

export function BillingPage() {
  const { data: subscription, isLoading: isLoadingSubscription, error: subscriptionError } = useBillingSubscription();
  const { data: lifecycle, isLoading: isLoadingLifecycle, error: lifecycleError } = useBillingLifecycle();

  const cancelMutation = useCancelSubscription();
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();
  const unpauseMutation = useUnpauseSubscription();
  const reactivateMutation = useReactivateSubscription();
  const createCheckoutSessionMutation = useCreateCheckoutSession();

  const [pendingAction, setPendingAction] = useState<BillingActionType | null>(null);

  const activeMutation =
    pendingAction === 'cancel'
      ? cancelMutation
      : pendingAction === 'pause'
      ? pauseMutation
      : pendingAction === 'resume'
      ? resumeMutation
      : pendingAction === 'unpause'
      ? unpauseMutation
      : pendingAction === 'reactivate'
      ? reactivateMutation
      : null;

  const isAnyLoading =
    cancelMutation.isPending ||
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    unpauseMutation.isPending ||
    reactivateMutation.isPending ||
    createCheckoutSessionMutation.isPending;

  const isPaywallError = useMemo(() => {
    const has402 = (err: unknown) => err instanceof AxiosError && err.response?.status === 402;
    return has402(subscriptionError) || has402(lifecycleError);
  }, [lifecycleError, subscriptionError]);

  const runCheckoutFlow = async () => {
    if (!subscription?.priceId) {
      return;
    }

    const checkout = await createCheckoutSessionMutation.mutateAsync({
      priceId: subscription.priceId,
      successUrl: BILLING_SUCCESS_URL,
      cancelUrl: BILLING_CANCEL_URL,
      quantity: 1,
    });

    window.location.href = checkout.url;
  };

  const executeAction = async () => {
    if (!pendingAction) {
      return;
    }

    try {
      let response: BillingActionResponse | null = null;

      if (pendingAction === 'cancel') {
        response = await cancelMutation.mutateAsync({ reason: 'Canceled by user from frontend' });
      } else if (pendingAction === 'pause') {
        response = await pauseMutation.mutateAsync({ reason: 'Paused by user from frontend' });
      } else if (pendingAction === 'resume') {
        response = await resumeMutation.mutateAsync(undefined);
      } else if (pendingAction === 'unpause') {
        response = await unpauseMutation.mutateAsync(undefined);
      } else if (pendingAction === 'reactivate') {
        response = await reactivateMutation.mutateAsync(undefined);
      }

      const message = response?.message?.toLowerCase() ?? '';
      const status = response?.status?.toLowerCase() ?? '';
      const requiresCheckout =
        message.includes('checkout') ||
        message.includes('payment required') ||
        status.includes('checkout_required') ||
        status.includes('payment_required');

      if (pendingAction === 'reactivate' && requiresCheckout) {
        await runCheckoutFlow();
      }

      setPendingAction(null);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (pendingAction === 'reactivate' && axiosError.response?.status === 402) {
        await runCheckoutFlow();
        return;
      }

      setPendingAction(null);
    }
  };

  if (isLoadingSubscription || isLoadingLifecycle) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading billing data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isPaywallError && (
        <Alert className="border-amber-500/60 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Payment required</AlertTitle>
          <AlertDescription>
            Some premium features are blocked due to billing state. Please update your subscription to restore access.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Subscription status
            <Badge variant={getStatusVariant(subscription?.status ?? lifecycle?.status ?? 'unknown')}>
              {(subscription?.status ?? lifecycle?.status ?? 'unknown').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Current period end</p>
            <p className="font-medium">{formatUtcDate(subscription?.currentPeriodEndUtc ?? lifecycle?.currentPeriodEndUtc)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Grace period ends</p>
            <p className="font-medium">{formatUtcDate(subscription?.gracePeriodEndsUtc ?? lifecycle?.gracePeriodEndsUtc)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Price ID</p>
            <p className="font-medium break-all">{subscription?.priceId ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Access</p>
            <p className="font-medium">{subscription?.hasAccess ? 'Enabled' : 'Blocked'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={!lifecycle?.canCancel || isAnyLoading} onClick={() => setPendingAction('cancel')}>
            {actionLabel.cancel}
          </Button>
          <Button variant="outline" disabled={!lifecycle?.canResume || isAnyLoading} onClick={() => setPendingAction('resume')}>
            {actionLabel.resume}
          </Button>
          <Button variant="outline" disabled={!lifecycle?.canPause || isAnyLoading} onClick={() => setPendingAction('pause')}>
            {actionLabel.pause}
          </Button>
          <Button variant="outline" disabled={!lifecycle?.canUnpause || isAnyLoading} onClick={() => setPendingAction('unpause')}>
            {actionLabel.unpause}
          </Button>
          <Button variant="secondary" disabled={!lifecycle?.canReactivate || isAnyLoading} onClick={() => setPendingAction('reactivate')}>
            {actionLabel.reactivate}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction ? actionLabel[pendingAction] : 'Confirm action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === 'cancel' && 'This always schedules cancelation at period end.'}
              {pendingAction === 'pause' && 'Pause blocks all paid features until you unpause.'}
              {pendingAction === 'resume' && 'Resume removes pending cancellation when allowed by lifecycle.'}
              {pendingAction === 'unpause' && 'Unpause restores feature access according to your current plan.'}
              {pendingAction === 'reactivate' &&
                'We will try to reactivate directly. If payment is required, checkout will open automatically.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(activeMutation?.isPending)}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void executeAction();
              }}
              disabled={Boolean(activeMutation?.isPending)}
            >
              {activeMutation?.isPending ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
