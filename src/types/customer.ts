// types/customer.ts - ATUALIZADO COM BASE NOS DTOs
export interface CustomerAddressDto {
  id: string;
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary: boolean;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface CustomerDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  addresses: CustomerAddressDto[];
}

// Requests para API
export interface ListCustomersRequest {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean; 
  customerAddress?: CustomerAddressDto; 
  addressIsPrimary: boolean; 
}

export interface UpdateCustomerRequest {
  customerId: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export interface AddCustomerAddressRequest {
  customerId: string;
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface UpdateCustomerAddressRequest {
  customerId: string;
  addressId: string;
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface SetPrimaryCustomerAddressRequest {
  customerId: string;
  addressId: string;
}

export interface DeleteCustomerAddressRequest {
  customerId: string;
  addressId: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// types/customer.ts - ATUALIZADO
export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  errors?: Record<string, string[]> | null;
  page?: number | null;
  pageSize?: number | null;
  total?: number | null;
  totalPages?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors?: Record<string, string[]> ;
  message?: string;
}

// Remover a interface antiga ou manter como alias
export type PaginatedResponse<T> = ApiPaginatedResponse<T>;

// Aliases para compatibilidade
export type Customer = CustomerDto;
export type CreateCustomerDto = CreateCustomerRequest;
export type UpdateCustomerDto = UpdateCustomerRequest;