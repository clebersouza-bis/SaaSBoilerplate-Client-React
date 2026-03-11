import { useEffect, useState } from 'react';
import { BillingAccessBlockedModal } from '@/components/modals/BillingAccessBlockedModal';
import { BillingAccessBlockedEvent } from '@/types/errors';

export function BillingAccessProvider({ children }: { children: React.ReactNode }) {
  const [billingBlock, setBillingBlock] = useState<{
    show: boolean;
    error?: {
      code?: string;
      message?: string;
      subscriptionStatus?: string;
      gracePeriodEndsUtc?: string;
    };
  }>({ show: false });

  useEffect(() => {
    const handleBillingAccessBlocked = (event: CustomEvent<BillingAccessBlockedEvent>) => {
      const { detail } = event;

      setBillingBlock((current) => {
        if (
          current.show &&
          current.error?.code === detail.code &&
          current.error?.message === detail.message
        ) {
          return current;
        }

        return {
          show: true,
          error: {
            code: detail.code,
            message: detail.message,
            subscriptionStatus: detail.subscriptionStatus,
            gracePeriodEndsUtc: detail.gracePeriodEndsUtc,
          },
        };
      });
    };

    window.addEventListener('billingAccessBlocked', handleBillingAccessBlocked as EventListener);

    return () => {
      window.removeEventListener('billingAccessBlocked', handleBillingAccessBlocked as EventListener);
    };
  }, []);

  return (
    <>
      {children}
      <BillingAccessBlockedModal
        open={billingBlock.show}
        onOpenChange={() => setBillingBlock({ show: false })}
        error={billingBlock.error}
      />
    </>
  );
}
