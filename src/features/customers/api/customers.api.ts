// features/customers/api/customers.api.ts - VERSÃO CORRIGIDA
import api from '@/lib/api/client';
import type {
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ListCustomersRequest,
  PagedResult,
  CustomerAddressDto,
  ApiPaginatedResponse
} from '@/types/customer';

export const customerApi = {
  // Listar customers com paginação - CORRIGIDO PARA O NOVO FORMATO
  getCustomers: async (params?: ListCustomersRequest): Promise<PagedResult<CustomerDto>> => {
    try {
      console.log('[Customer API] Fetching customers with params:', params);
      
      const response = await api.get<ApiPaginatedResponse<CustomerDto>>('/customers/paginated', {
        params: {
          search: params?.search || '',
          page: params?.page || 1,
          pageSize: params?.pageSize || 20,
        }
      });
      
      console.log('[Customer API] Response received:', response.data);
      
      const apiResponse = response.data;
      
      // Extrair os items do array data
      const items = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      
      return {
        items,
        total: apiResponse.total || items.length,
        page: apiResponse.page || params?.page || 1,
        pageSize: apiResponse.pageSize || params?.pageSize || 20,
        totalPages: apiResponse.totalPages || 
          Math.ceil((apiResponse.total || items.length) / 
          (apiResponse.pageSize || params?.pageSize || 20)),
      };
      
    } catch (error: any) {
      console.error('[Customer API] Error fetching customers:', error);
      console.error('[Customer API] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Em caso de erro, retorna array vazio
      return {
        items: [],
        total: 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
        totalPages: 0,
      };
    }
  },

  // Buscar customer por ID - ATUALIZADO PARA O FORMATO DA API
  getCustomer: async (id: string): Promise<CustomerDto> => {
    try {
      const response = await api.get<{ success: boolean; data: CustomerDto }>(`/customers/${id}`);
      console.log('[Customer API] Fetched customer:', response.data);
      if (!response.data.success) {
        throw new Error('Failed to fetch customer');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[Customer API] Error fetching customer:', error);
      throw error;
    }
  },

  // Criar customer - ATUALIZADO PARA O FORMATO DA API
  createCustomer: async (data: CreateCustomerRequest): Promise<CustomerDto> => {
    try {
      const response = await api.post<{ success: boolean; data: CustomerDto }>('/customers', data);
      
      if (!response.data.success) {
        throw new Error('Failed to create customer');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[Customer API] Error creating customer:', error);
      throw error;
    }
  },

  // Atualizar customer - ATUALIZADO PARA O FORMATO DA API
  updateCustomer: async (id: string, data: UpdateCustomerRequest): Promise<CustomerDto> => {
    try {
      const response = await api.put<{ success: boolean; data: CustomerDto }>(`/customers/${id}`, {
        ...data,
        customerId: id,
      });
      
      if (!response.data.success) {
        throw new Error('Failed to update customer');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[Customer API] Error updating customer:', error);
      throw error;
    }
  },

  // Excluir customer
  deleteCustomer: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<{ success: boolean; message?: string }>(`/customers/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete customer');
      }
    } catch (error: any) {
      console.error('[Customer API] Error deleting customer:', error);
      throw error;
    }
  },

  // Adicionar endereço ao customer
  addCustomerAddress: async (customerId: string, data: Omit<CustomerAddressDto, 'id'>): Promise<CustomerDto> => {
    try {
      const response = await api.post<{ success: boolean; data: CustomerDto }>(
        `/customers/${customerId}/addresses`, 
        data
      );
      
      if (!response.data.success) {
        throw new Error('Failed to add address');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[Customer API] Error adding address:', error);
      throw error;
    }
  },

  // Atualizar endereço do customer
  updateCustomerAddress: async (customerId: string, addressId: string, data: Partial<CustomerAddressDto>): Promise<CustomerDto> => {
    try {
      const response = await api.put<{ success: boolean; data: CustomerDto }>(
        `/customers/${customerId}/addresses/${addressId}`, 
        data
      );
      
      if (!response.data.success) {
        throw new Error('Failed to update address');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[Customer API] Error updating address:', error);
      throw error;
    }
  },

  // Deletar endereço do customer
  deleteCustomerAddress: async (customerId: string, addressId: string): Promise<void> => {
    try {
      const response = await api.delete<{ success: boolean; message?: string }>(
        `/customers/${customerId}/addresses/${addressId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete address');
      }
    } catch (error: any) {
      console.error('[Customer API] Error deleting address:', error);
      throw error;
    }
  },
  
  // Testar conexão com a API
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.get<ApiPaginatedResponse<CustomerDto>>('/customers', { 
        params: { pageSize: 1 } 
      });
      
      if (response.data.success) {
        return { success: true, message: 'API connection successful' };
      } else {
        return { 
          success: false, 
          message: `API returned unsuccessful response: ${JSON.stringify(response.data.errors)}` 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: `API connection failed: ${error.message}` 
      };
    }
  }
};