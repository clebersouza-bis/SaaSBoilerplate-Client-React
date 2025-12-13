// types/customer.ts - VERSÃO ATUALIZADA
export interface Address {
  street: string;  
  number: string;  
  neighborhood: string | null;
  city: string;
  state: string;
  zipCode: string; 
  complement: string | null; 
  county: string | null;
  country: string | null; 
  latitude: string | null;
  longitude: string | null;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  mainPhone: string | null;
  address: Address;
  notes?: string | null;  
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  mainPhone?: string;
  notes?: string;
  address: {
    street: string;
    number: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
    county?: string;
    country?: string;
  };
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// NOVO: Tipo para resposta da sua API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors: any | null;
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}