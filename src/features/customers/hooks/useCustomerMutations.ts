// features/customers/hooks/useCustomerMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customers.api';
import type { UpdateCustomerRequest, CreateCustomerRequest } from '@/types/customer';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const [permissionError, setPermissionError] = useState<{
    show: boolean;
    resource?: string;
    action?: string;
  }>({ show: false });

  return {
    mutation: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
        customerApi.updateCustomer(id, data),
      onSuccess: (updatedCustomer) => {
        queryClient.setQueryData(
          ['customers', updatedCustomer.id],
          updatedCustomer
        );
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        
        toast({
          title: 'Success',
          description: `Customer "${updatedCustomer.name}" updated successfully`,
        });
      },
      onError: (error: any) => {
        if (error.response?.status === 403) {
          setPermissionError({
            show: true,
            resource: 'customer',
            action: 'update'
          });
          
          // Log para analytics
          console.warn('Permission denied for customer update', {
            userId: 'current-user-id', // Você pegaria do auth store
            customerId: error.config?.data?.customerId,
            timestamp: new Date().toISOString()
          });
        }
        // Outros erros são tratados pelo interceptor
      },
    }),
    permissionError,
    clearPermissionError: () => setPermissionError({ show: false })
  };
}

// Hook similar para criação
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const [permissionError, setPermissionError] = useState<{
    show: boolean;
    resource?: string;
    action?: string;
  }>({ show: false });

  return {
    mutation: useMutation({
      mutationFn: customerApi.createCustomer,
      onSuccess: (newCustomer) => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        
        toast({
          title: 'Success',
          description: `Customer "${newCustomer.name}" created successfully`,
        });
      },
      onError: (error: any) => {
        if (error.response?.status === 403) {
          setPermissionError({
            show: true,
            resource: 'customer',
            action: 'create'
          });
        }
      },
    }),
    permissionError,
    clearPermissionError: () => setPermissionError({ show: false })
  };
}