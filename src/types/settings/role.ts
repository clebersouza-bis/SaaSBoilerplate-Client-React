import { Permission } from "./permission";

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isSystem?: boolean;
  isDefault?: boolean;
  tenant?: any;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  rolePermissions?: Array<{
    permission: Permission;
  }>;
}