import { Role } from "./role";

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  photoPath?: string;
  active: boolean;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  lastLogin?: string;
  language?: string;
  theme?: string;
  timezone?: string;
  createdAt: string;
  updatedAt?: string;
  userRoles?: Array<{
    role: Role;
  }>;
  userTenants?: Array<{
    tenant: any;
  }>;
}