// features/customers/hooks/useCustomers.ts - VERSÃO ATUALIZADA
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customers.api';
import type {
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ListCustomersRequest,
  AddCustomerAddressRequest,
  CustomerAddressDto
} from '@/types/customer';
import { toast } from '@/hooks/use-toast';

const CUSTOMERS_QUERY_KEY = 'customers';

export function useCustomers(params?: ListCustomersRequest) {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, params],
    queryFn: () => customerApi.getCustomers(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, id],
    queryFn: () => customerApi.getCustomer(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      
      toast({
        title: 'Success',
        description: `Customer "${newCustomer.name}" created successfully`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Failed to create customer';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customerApi.updateCustomer(id, data),
    onSuccess: (updatedCustomer) => {
      // Atualiza o cache individualmente
      queryClient.setQueryData(
        [CUSTOMERS_QUERY_KEY, updatedCustomer.id],
        updatedCustomer
      );
      // Invalida a lista
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      
      toast({
        title: 'Success',
        description: `Customer "${updatedCustomer.name}" updated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update customer',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: (_, customerId) => {
      // Remove do cache
      queryClient.removeQueries({ queryKey: [CUSTOMERS_QUERY_KEY, customerId] });
      // Invalida a lista
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete customer',
        variant: 'destructive',
      });
    },
  });
}

export function useAddCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: Omit<CustomerAddressDto, 'id'> }) =>
      customerApi.addCustomerAddress(customerId, data),
    onSuccess: (updatedCustomer, variables) => {
      // Atualiza o cache
      queryClient.setQueryData([CUSTOMERS_QUERY_KEY, variables.customerId], updatedCustomer);
      
      toast({
        title: 'Success',
        description: 'Address added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add address',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, addressId, data }: { 
      customerId: string; 
      addressId: string; 
      data: Partial<CustomerAddressDto> 
    }) => customerApi.updateCustomerAddress(customerId, addressId, data),
    onSuccess: (updatedCustomer, variables) => {
      queryClient.setQueryData([CUSTOMERS_QUERY_KEY, variables.customerId], updatedCustomer);
      
      toast({
        title: 'Success',
        description: 'Address updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update address',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, addressId }: { customerId: string; addressId: string }) =>
      customerApi.deleteCustomerAddress(customerId, addressId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY, variables.customerId] });
      
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete address',
        variant: 'destructive',
      });
    },
  });
}