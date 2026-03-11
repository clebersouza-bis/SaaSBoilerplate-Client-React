import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard, ShieldAlert } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo } from 'react';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

interface BillingAccessBlockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error?: {
    code?: string;
    message?: string;
    subscriptionStatus?: string;
    gracePeriodEndsUtc?: string;
  };
}

export function BillingAccessBlockedModal({
  open,
  onOpenChange,
  error,
}: BillingAccessBlockedModalProps) {
  const { t, hasTranslation, formatDate } = useTranslation();
  const { hasPermission } = usePermissions();

  const canManageBilling = hasPermission('User.HasRoleAdmin') || hasPermission('billing.pay');

  const tone = useMemo(() => {
    if (error?.code === 'BILLING_PAST_DUE') {
      return 'warning';
    }

    return 'critical';
  }, [error?.code]);

  const description = useMemo(() => {
    if (!error?.code) {
      return error?.message || t('billingGate.defaultDescription');
    }

    const translationKey = `apiErrors.${error.code}`;
    if (hasTranslation(translationKey)) {
      return t(translationKey);
    }

    return error.message || t('billingGate.defaultDescription');
  }, [error?.code, error?.message, hasTranslation, t]);

  const handleGoToBilling = () => {
    const path = canManageBilling ? '/settings/billing' : '/settings?tab=billing';
    window.location.href = path;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              {tone === 'warning' ? (
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-destructive" />
              )}
            </div>
            <div>
              <DialogTitle>
                {tone === 'warning' ? t('billingGate.warningTitle') : t('billingGate.criticalTitle')}
              </DialogTitle>
              <DialogDescription>{t('billingGate.subtitle')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <p className="text-sm text-muted-foreground">{description}</p>

          {error?.gracePeriodEndsUtc && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
              {t('billingGate.gracePeriodEnds', {
                date: formatDate(error.gracePeriodEndsUtc, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.dismiss')}
          </Button>
          <Button onClick={handleGoToBilling} className="gap-2">
            <CreditCard className="h-4 w-4" />
            {t('billingGate.goToBilling')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
