// features/customers/components/CustomerDialog.tsx
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
  const isEditMode = !!customer;
  const { t } = useTranslation();
  
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
      // Error is handled by mutation
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('dialog.editCustomer') : t('dialog.createCustomer')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? t('dialog.updateDescription') 
              : t('dialog.createDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <CustomerForm
          customer={customer}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}