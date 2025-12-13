// features/customers/components/CustomerDialog.tsx - VERSÃO COM SCROLL CORRIGIDO
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerForm } from './CustomerForm';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types/customer';
import { useTranslation } from '@/hooks/useTranslation';
import { Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSuccess?: () => void;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDialogProps) {
  const { t } = useTranslation();
  const isEditMode = !!customer;

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: CreateCustomerDto | UpdateCustomerDto) => {
    try {
      if (isEditMode && customer) {
        await updateMutation.mutateAsync({
          id: customer.id,
          data: data as UpdateCustomerDto,
        });
      } else {
        await createMutation.mutateAsync(data as CreateCustomerDto);
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Dialog submission error:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-card/80 backdrop-blur-sm border-border shadow-2xl">
        {/* Header com gradiente - FIXO NO TOPO */}
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border p-6 shrink-0">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {isEditMode ? t('dialog.editCustomer') : t('dialog.createCustomer')}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {isEditMode
                      ? t('dialog.updateDescription')
                      : t('dialog.createDescription')}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 rounded-full"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t('common.cancel')}</span>
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content com scroll - PARTE QUE ROLA */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <CustomerForm
              customer={customer}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Footer decorativo - FIXO NO FUNDO */}
        <div className="border-t border-border p-4 bg-muted/30 shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse" />
              <span>{isEditMode ? 'Updating customer' : 'Creating new customer'}</span>
            </div>
            <span>BIS Core • v1.0.0</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}