import api from '@/lib/api/client';
import type {
  ApiPaginatedResponse,
  CreateCustomerRequest,
  CustomerAddressDto,
  CustomerDto,
  ListCustomersRequest,
  PagedResult,
  UpdateCustomerRequest,
} from '@/types/customer';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function unwrapEnvelope<T>(response: ApiEnvelope<T>, fallbackMessage: string) {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.data;
}

export const customerApi = {
  async getCustomers(params?: ListCustomersRequest): Promise<PagedResult<CustomerDto>> {
    const { data } = await api.get<ApiPaginatedResponse<CustomerDto>>('/customers/paginated', {
      params: {
        search: params?.search || '',
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
      },
    });

    const items = Array.isArray(data.data) ? data.data : [];

    return {
      items,
      total: data.total || items.length,
      page: data.page || params?.page || 1,
      pageSize: data.pageSize || params?.pageSize || 20,
      totalPages:
        data.totalPages || Math.ceil((data.total || items.length) / (data.pageSize || params?.pageSize || 20)),
    };
  },

  async getCustomer(id: string): Promise<CustomerDto> {
    const { data } = await api.get<ApiEnvelope<CustomerDto>>(`/customers/${id}`);
    return unwrapEnvelope(data, 'Failed to fetch customer');
  },

  async createCustomer(payload: CreateCustomerRequest): Promise<CustomerDto> {
    const { data } = await api.post<ApiEnvelope<CustomerDto>>('/customers', payload);
    return unwrapEnvelope(data, 'Failed to create customer');
  },

  async updateCustomer(id: string, payload: UpdateCustomerRequest): Promise<CustomerDto> {
    const { data } = await api.put<ApiEnvelope<CustomerDto>>(`/customers/${id}`, {
      ...payload,
      customerId: id,
    });

    return unwrapEnvelope(data, 'Failed to update customer');
  },

  async deleteCustomer(id: string): Promise<void> {
    const { data } = await api.delete<{ success: boolean; message?: string }>(`/customers/${id}`);
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete customer');
    }
  },

  async addCustomerAddress(customerId: string, payload: Omit<CustomerAddressDto, 'id'>): Promise<CustomerDto> {
    const { data } = await api.post<ApiEnvelope<CustomerDto>>(`/customers/${customerId}/addresses`, payload);
    return unwrapEnvelope(data, 'Failed to add address');
  },

  async updateCustomerAddress(
    customerId: string,
    addressId: string,
    payload: Partial<CustomerAddressDto>,
  ): Promise<CustomerDto> {
    const { data } = await api.put<ApiEnvelope<CustomerDto>>(
      `/customers/${customerId}/addresses/${addressId}`,
      payload,
    );

    return unwrapEnvelope(data, 'Failed to update address');
  },

  async deleteCustomerAddress(customerId: string, addressId: string): Promise<void> {
    const { data } = await api.delete<{ success: boolean; message?: string }>(
      `/customers/${customerId}/addresses/${addressId}`,
    );

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete address');
    }
  },
};
