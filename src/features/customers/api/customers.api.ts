// features/customers/api/customers.api.ts - VERSÃO ATUALIZADA
import api from '@/lib/api/client';
import type { Customer, CreateCustomerDto, UpdateCustomerDto, ApiResponse, PagedResult } from '@/types/customer';

export const customerApi = {
  // Get paginated customers
  getCustomers: async (page = 1, pageSize = 10, filters?: Record<string, string>): Promise<PagedResult<Customer>> => {
    const response = await api.get<ApiResponse<Customer[]>>('/customers', {
      params: { page, pageSize, ...filters },
    });
    
    const apiResponse = response.data;
    
    if (!apiResponse.success) {
      throw new Error('Failed to fetch customers');
    }

    return {
      items: apiResponse.data,
      total: apiResponse.total || 0,
      page: apiResponse.page || 1,
      pageSize: apiResponse.pageSize || 10,
      totalPages: Math.ceil((apiResponse.total || 0) / (apiResponse.pageSize || 10)),
    };
  },

  // Get single customer
  getCustomer: async (id: string): Promise<Customer> => {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch customer');
    }
    
    return response.data.data;
  },

  // Create customer
  createCustomer: async (data: CreateCustomerDto): Promise<string> => {
    const response = await api.post<ApiResponse<string>>('/customers', data);
    
    if (!response.data.success) {
      throw new Error('Failed to create customer');
    }
    
    return response.data.data;
  },

  // Update customer
  updateCustomer: async (id: string, data: UpdateCustomerDto): Promise<void> => {
    const response = await api.put<ApiResponse<void>>(`/customers/${id}`, data);
    
    if (!response.data.success) {
      throw new Error('Failed to update customer');
    }
  },

  // Delete customer (soft delete)
  deleteCustomer: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/customers/${id}`);
    
    if (!response.data.success) {
      throw new Error('Failed to delete customer');
    }
  },

  // Restore customer
  restoreCustomer: async (id: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(`/customers/${id}/restore`, {});
    
    if (!response.data.success) {
      throw new Error('Failed to restore customer');
    }
  },
};