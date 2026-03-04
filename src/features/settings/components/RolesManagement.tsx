// features/settings/components/RolesManagement.tsx - VERSÃO FINAL OTIMIZADA
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Key,
  Copy,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Check,
  ListChecks,
  AlertCircle,
  Users,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { extractApiErrorMessage } from '@/lib/api/error-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipos (mantidos iguais)
interface ApiRole {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  inactiveDate?: string | null;
  tenant?: any;
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string;
  updatedBy?: string | null;
  userCount?: number;
}

interface Permission {
  id: string;
  key: string;
  name: string;
  resource: string;
  isActive: boolean;
  description?: string;
  category?: string;
}

interface PermissionGroup {
  resource: string;
  category?: string;
  permissions: Permission[];
}

interface AllPermissionsResponse {
  permissions: Permission[];
  rolePermissions: string[];
}

export function RolesManagement() {
  const { t, hasTranslation } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ApiRole | null>(null);
  const [showInactiveRoles, setShowInactiveRoles] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [permissionError, setPermissionError] = useState<string>('');

  // Estados para dados da API
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

  // Estado para permissões selecionadas no diálogo
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Estado para diálogo de confirmação
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'activate' | 'deactivate' | 'delete';
    role: ApiRole | null;
  }>({ type: 'activate', role: null });

  // Refs para os inputs do formulário
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const isActiveSwitchRef = useRef<HTMLButtonElement>(null);

  const [hasLoadedPermissions, setHasLoadedPermissions] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rolesResponse = await api.get('/roles/roles-permissions', {
        skipPermissionErrorModal: true
      });
      setRoles(rolesResponse.data);
    } catch (error: any) {
      console.error('Error loading roles:', error);
      if (error.response?.status === 403) {
        setHasPermissionError(true);
        setPermissionError(t('settings.noPermissionToViewRoles'));
        setRoles([]);
        toast.error(t('settings.noPermissionToViewRoles'), {
          description: t('errors.contactAdminForAccess')
        });
      } else {
        toast.error(t('common.errorLoadingData'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showRoleDialog) {
      setHasLoadedPermissions(false);
      setAllPermissions([]);
      setPermissionGroups([]);
      return;
    }
    if (hasLoadedPermissions) return;

    const loadPermissions = async () => {
      setIsLoadingPermissions(true);
      try {
        let url = '/roles/permissions';
        if (selectedRole?.id) {
          url += `?roleId=${selectedRole.id}`;
        }

        const response = await api.get<AllPermissionsResponse>(url, {
          skipPermissionErrorModal: true
        });

        setAllPermissions(response.data.permissions);

        if (response.data.rolePermissions) {
          setSelectedPermissions(new Set(response.data.rolePermissions));
        } else if (selectedRole?.permissions) {
          setSelectedPermissions(new Set(
            selectedRole.permissions.map((p: Permission) => p.id)
          ));
        }

        const groupsMap = new Map<string, Permission[]>();
        response.data.permissions.forEach((permission: Permission) => {
          const resource = permission.resource || 'General';
          if (!groupsMap.has(resource)) {
            groupsMap.set(resource, []);
          }
          groupsMap.get(resource)?.push(permission);
        });

        const groups: PermissionGroup[] = Array.from(groupsMap.entries())
          .map(([resource, perms]) => ({
            resource,
            category: perms[0]?.category,
            permissions: perms.sort((a, b) => a.name.localeCompare(b.name))
          }))
          .sort((a, b) => a.resource.localeCompare(b.resource));

        setPermissionGroups(groups);
        setExpandedGroups(new Set(groups.map(g => g.resource)));
        setHasLoadedPermissions(true);
      } catch (error) {
        console.error('Error loading permissions:', error);
        toast.error(t('common.errorLoadingData'));
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [showRoleDialog, selectedRole, hasLoadedPermissions, t]);

  const filteredRoles = roles.filter(role => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesFilter = showInactiveRoles || role.isActive;
    return matchesSearch && matchesFilter;
  });

  const handleEditRole = (role: ApiRole) => {
    setSelectedRole(role);
    setShowRoleDialog(true);
    setHasLoadedPermissions(false);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setSelectedPermissions(new Set());
    setShowRoleDialog(true);
    setHasLoadedPermissions(false);
  };

  const handleDeleteRole = async (roleId: string) => {
    setConfirmAction({ type: 'delete', role: roles.find(r => r.id === roleId) || null });
    setShowConfirmDialog(true);
  };

  const confirmDeleteRole = async () => {
    if (!confirmAction.role) return;
    try {
      await api.delete(`/roles/${confirmAction.role.id}`);
      toast.success(t('settings.roleDeleted'));
      await loadData();
    } catch (error) {
      toast.error(t('common.errorDeleting'));
    } finally {
      setShowConfirmDialog(false);
      setConfirmAction({ type: 'activate', role: null });
    }
  };

  const handleDuplicateRole = (role: ApiRole) => {
    const duplicate = {
      ...role,
      id: undefined,
      name: `${role.name} (Copy)`,
      isDefault: false
    };
    setSelectedRole(duplicate as unknown as ApiRole);
    setShowRoleDialog(true);
  };

  const handleToggleActive = async (role: ApiRole) => {
    if (role.userCount && role.userCount > 0) {
      setConfirmAction({
        type: role.isActive ? 'deactivate' : 'activate',
        role
      });
      setShowConfirmDialog(true);
    } else {
      performToggleActive(role);
    }
  };

  const performToggleActive = async (role: ApiRole) => {
    try {
      await api.patch(`/roles/${role.id}`, { isActive: !role.isActive });
      toast.success(t('settings.roleUpdated'));
      await loadData();
    } catch (error) {
      toast.error(t('common.errorUpdating'));
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSelectAllInGroup = (group: PermissionGroup) => {
    const newSelected = new Set(selectedPermissions);
    const allSelected = group.permissions.every(p => newSelected.has(p.id));
    group.permissions.forEach(permission => {
      if (allSelected) {
        newSelected.delete(permission.id);
      } else {
        newSelected.add(permission.id);
      }
    });
    setSelectedPermissions(newSelected);
  };

  const handleToggleGroup = (resource: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource);
    } else {
      newExpanded.add(resource);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSaveRole = async () => {
    if (!nameInputRef.current?.value.trim()) {
      toast.error(t('settings.roleNameRequired'));
      nameInputRef.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const formData = {
        name: nameInputRef.current?.value || '',
        description: descriptionInputRef.current?.value || '',
        isActive: isActiveSwitchRef.current?.getAttribute('data-state') === 'checked',
        permissionIds: Array.from(selectedPermissions)
      };

      if (selectedRole?.id) {
        await api.put(`/roles/${selectedRole.id}`, formData, { skipErrorToast: true });
        toast.success(t('settings.roleUpdated'));
      } else {
        await api.post('/roles', formData, { skipErrorToast: true });
        toast.success(t('settings.roleCreated'));
      }

      setShowRoleDialog(false);
      setSelectedRole(null);
      await loadData();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(
        extractApiErrorMessage(error, {
          t,
          hasTranslation,
          fallbackMessage: t('common.errorSaving'),
        }),
        {
          duration: 8000
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'administration': return 'bg-purple-500/10 text-purple-600';
      case 'security': return 'bg-red-500/10 text-red-600';
      case 'data': return 'bg-blue-500/10 text-blue-600';
      case 'user': return 'bg-green-500/10 text-green-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const stats = [
    {
      label: 'settings.totalRoles',
      value: roles.length.toString(),
      change: '+0',
      icon: Shield,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      label: 'settings.activeRoles',
      value: roles.filter(role => role.isActive).length.toString(),
      change: '+0',
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-500'
    },
    {
      label: 'settings.totalUsers',
      value: roles.reduce((sum, role) => sum + (role.userCount || 0), 0).toString(),
      change: '+0',
      icon: Users,
      color: 'bg-orange-500/10 text-orange-500'
    },
    {
      label: 'settings.permissionsCount',
      value: allPermissions.length.toString(),
      change: '+0',
      icon: Key,
      color: 'bg-purple-500/10 text-purple-500'
    },
  ];

  if (hasPermissionError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('settings.roles')}</h2>
            <p className="text-muted-foreground">
              {t('settings.rolesManagementDescription')}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
        </div>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-destructive mb-2">
                {t('errors.accessDenied')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {permissionError || t('settings.noPermissionToViewRoles')}
              </p>

              <div className="space-y-3 max-w-md w-full">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('permission.contactYourManager')}
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/settings'}>
                    {t('common.goBack')}
                  </Button>
                  <Button variant="default" className="flex-1 gap-2" onClick={() => {
                    const subject = encodeURIComponent('Role Management Access Request');
                    window.open(`mailto:admin@company.com?subject=${subject}`, '_blank');
                  }}>
                    <AlertCircle className="h-4 w-4" />
                    {t('permission.requestAccess')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('settings.roles')}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('settings.rolesManagementDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9 sm:h-10" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </Button>
          <Button size="sm" className="gap-2 h-9 sm:h-10" onClick={handleCreateRole} disabled={isLoading}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('settings.createRole')}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t(stat.label)}</p>
                  <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
                    <h3 className="text-xl sm:text-2xl font-bold">{stat.value}</h3>
                    <Badge variant="secondary" className="text-xs">{stat.change}</Badge>
                  </div>
                </div>
                <div className={`h-8 w-8 sm:h-10 sm:w-10 ${stat.color.split(' ')[0]} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color.split(' ')[1]}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4" />
                {t('common.search')}
              </Label>
              <Input
                id="search"
                placeholder={t('settings.searchRoles')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 sm:h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                {t('settings.roleStatus')}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={showInactiveRoles ? "outline" : "default"}
                  size="sm"
                  className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={() => setShowInactiveRoles(false)}
                >
                  <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="truncate">{t('settings.activeOnly')}</span>
                </Button>
                <Button
                  variant={showInactiveRoles ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={() => setShowInactiveRoles(true)}
                >
                  <EyeOff className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="truncate">{t('settings.all')}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('common.actions')}</Label>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 h-9 sm:h-10"
                onClick={loadData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl">{t('settings.rolesList')}</CardTitle>
            <Badge variant="outline" className="w-fit">
              {filteredRoles.length} {t('settings.roles')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="min-w-[200px]">{t('settings.role')}</TableHead>
                  <TableHead className="min-w-[250px] hidden md:table-cell">{t('settings.description')}</TableHead>
                  <TableHead className="min-w-[100px]">{t('settings.permissions')}</TableHead>
                  <TableHead className="min-w-[80px]">{t('settings.users')}</TableHead>
                  <TableHead className="min-w-[100px]">{t('settings.status')}</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">{t('settings.lastUpdated')}</TableHead>
                  <TableHead className="text-right min-w-[80px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <span>{t('common.loading')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="space-y-3">
                        <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">{t('settings.noRolesFound')}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('settings.tryChangingFilters')}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate text-sm sm:text-base">{role.name}</p>
                            {role.isDefault && (
                              <Badge className="bg-green-500/10 text-green-600 text-xs mt-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('settings.default')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px] lg:max-w-[300px]">
                          {role.description || t('settings.noDescription')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm">{role.permissions?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm">{role.userCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={role.isActive ? "default" : "secondary"}
                          className={`text-xs px-2 py-0.5 ${role.isActive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
                        >
                          {role.isActive ? t('settings.active') : t('settings.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-xs sm:text-sm">
                          {new Date(role.updatedAt || role.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditRole(role)}
                            title={t('settings.editRole')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hidden sm:inline-flex"
                            onClick={() => handleDuplicateRole(role)}
                            title={t('settings.duplicateRole')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 sm:w-48">
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(role)}
                                className="cursor-pointer gap-2 text-xs sm:text-sm"
                              >
                                {role.isActive ? (
                                  <>
                                    <XCircle className="h-4 w-4" />
                                    {t('settings.deactivate')}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    {t('settings.activate')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDuplicateRole(role)}
                                className="cursor-pointer gap-2 text-xs sm:text-sm sm:hidden"
                              >
                                <Copy className="h-4 w-4" />
                                {t('settings.duplicateRole')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRole(role.id)}
                                className="cursor-pointer gap-2 text-red-600 text-xs sm:text-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t('settings.deleteRole')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Dialog */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <Card className="w-full max-w-6xl bg-card border-border max-h-[90vh] overflow-hidden shadow-2xl mx-2 sm:mx-4">
            {/* Header */}
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-10 bg-card p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg md:text-xl truncate">
                      {selectedRole?.id ? t('settings.editRole') : t('settings.createRole')}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm truncate">
                      {selectedRole?.id ? t('settings.editRoleDescription') : t('settings.createRoleDescription')}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRoleDialog(false);
                    setSelectedRole(null);
                    setSelectedPermissions(new Set());
                  }}
                  className="h-8 w-8 p-0 self-end sm:self-center flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Content */}
            <ScrollArea className="h-[calc(90vh-280px)] sm:h-[calc(90vh-240px)] md:h-[calc(90vh-220px)] lg:h-[calc(90vh-200px)]">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="role-name" className="text-xs sm:text-sm font-medium">
                          {t('settings.roleName')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="role-name"
                          ref={nameInputRef}
                          placeholder={t('settings.roleNamePlaceholder')}
                          defaultValue={selectedRole?.name || ''}
                          className="h-9 sm:h-10 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role-description" className="text-xs sm:text-sm font-medium">
                          {t('settings.description')}
                        </Label>
                        <textarea
                          id="role-description"
                          ref={descriptionInputRef}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-xs sm:text-sm min-h-[70px] sm:min-h-[80px] resize-none"
                          placeholder={t('settings.roleDescriptionPlaceholder')}
                          defaultValue={selectedRole?.description || ''}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <Label htmlFor="is-active" className="text-xs sm:text-sm font-medium cursor-pointer">
                          {t('settings.active')}
                        </Label>
                        <Switch
                          id="is-active"
                          ref={isActiveSwitchRef}
                          defaultChecked={selectedRole?.isActive ?? true}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <Card className="border-border">
                        <CardHeader className="py-2 sm:py-3">
                          <CardTitle className="text-xs sm:text-sm flex items-center justify-between">
                            <span>{t('settings.summary')}</span>
                            <Badge variant="outline" className="text-xs">
                              {selectedPermissions.size} {t('settings.selected')}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 sm:py-3">
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('settings.totalPermissions')}:</span>
                              <span className="font-medium">{allPermissions.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('settings.resourceGroups')}:</span>
                              <span className="font-medium">{permissionGroups.length}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Alert className="bg-blue-50 border-blue-200 p-3">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-xs text-blue-700">
                          {t('settings.permissionSelectionHint')}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  <Separator />

                  {/* Permissions */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold">{t('settings.permissions')}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {t('settings.selectPermissionsForRole')}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
                          const allIds = allPermissions.map(p => p.id);
                          setSelectedPermissions(new Set(allIds));
                          toast.success(t('settings.allPermissionsSelected'));
                        }}>
                          {t('settings.selectAll')}
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
                          setSelectedPermissions(new Set());
                          toast.info(t('settings.allPermissionsDeselected'));
                        }}>
                          {t('settings.deselectAll')}
                        </Button>
                      </div>
                    </div>

                    {isLoadingPermissions ? (
                      <div className="flex items-center justify-center py-8 sm:py-12">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                          <span className="text-sm">{t('settings.loadingPermissions')}</span>
                        </div>
                      </div>
                    ) : permissionGroups.length === 0 ? (
                      <div className="border rounded-lg p-6 sm:p-8 text-center">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                          <Key className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium text-sm sm:text-base">
                          {t('settings.noPermissionsAvailable')}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {t('settings.contactAdminForPermissions')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {permissionGroups.map((group) => {
                          const selectedInGroup = group.permissions.filter(p => selectedPermissions.has(p.id)).length;
                          const isAllSelected = selectedInGroup === group.permissions.length;
                          const isPartialSelected = selectedInGroup > 0 && selectedInGroup < group.permissions.length;
                          const isExpanded = expandedGroups.has(group.resource);

                          return (
                            <div key={group.resource} className="border rounded-lg overflow-hidden">
                              {/* Group Header */}
                              <div className={`px-3 sm:px-4 py-2 sm:py-3 border-b transition-colors ${isExpanded ? 'bg-gradient-to-r from-primary/5 to-primary/0' : 'bg-muted/5'
                                }`}>
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    onClick={() => handleToggleGroup(group.resource)}
                                    className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 text-left"
                                  >
                                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center flex-shrink-0">
                                      {isExpanded ? (
                                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                        <span className="font-semibold text-xs sm:text-sm md:text-base capitalize truncate">
                                          {group.resource}
                                        </span>
                                        <Badge variant="outline" className="text-[10px] sm:text-xs px-1 py-0">
                                          {group.permissions.length}
                                        </Badge>
                                        {isAllSelected && (
                                          <Badge className="bg-green-500/10 text-green-600 text-[10px] sm:text-xs border-green-200">
                                            <Check className="h-2 w-2 mr-1" />
                                            {t('settings.allSelected')}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectAllInGroup(group);
                                    }}
                                    className="text-[10px] sm:text-xs h-6 sm:h-7 px-2 flex-shrink-0"
                                  >
                                    {isAllSelected ? t('settings.deselectAll') : t('settings.selectAll')}
                                  </Button>
                                </div>
                              </div>

                              {/* Permissions List */}
                              {isExpanded && (
                                <div className="p-2 sm:p-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {group.permissions.map((permission) => {
                                      const isSelected = selectedPermissions.has(permission.id);
                                      return (
                                        <div
                                          key={permission.id}
                                          className={`flex items-start justify-between p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                                            }`}
                                          onClick={() => handleTogglePermission(permission.id)}
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-2">
                                              <div className={`h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {isSelected ? <Check className="h-3 w-3" /> : <Key className="h-3 w-3" />}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-xs truncate">
                                                  {permission.name}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-mono truncate">
                                                  {permission.key}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="ml-2 flex-shrink-0">
                                            <Switch
                                              checked={isSelected}
                                              onCheckedChange={() => handleTogglePermission(permission.id)}
                                              className="scale-75 sm:scale-90"
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t bg-muted/20 p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                {/* Info de permissões */}
                <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                  <Key className="h-4 w-4 hidden sm:block flex-shrink-0" />
                  <span className="text-center sm:text-left">
                    {selectedPermissions.size} {t('settings.selected')} • {permissionGroups.length} {t('settings.groups')}
                  </span>
                </div>

                {/* BOTÕES - CORRIGIDO PARA OCUPAR 100% NO MOBILE */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRoleDialog(false);
                      setSelectedRole(null);
                      setSelectedPermissions(new Set());
                    }}
                    className="w-full sm:w-auto min-w-[100px] px-4 h-10 sm:h-10 text-sm"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveRole}
                    disabled={isSaving}
                    className="w-full sm:w-auto min-w-[120px] px-4 h-10 sm:h-10 text-sm gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
                    ) : (
                      <Save className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span>{t('common.save')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg truncate">
                  {confirmAction.type === 'delete'
                    ? t('settings.confirmDeleteRole')
                    : confirmAction.type === 'deactivate'
                      ? t('settings.confirmDeactivateRole')
                      : t('settings.confirmActivateRole')
                  }
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {confirmAction.type === 'delete'
                    ? t('settings.deleteRoleWarning')
                    : confirmAction.type === 'deactivate'
                      ? t('settings.deactivateRoleWarning', { count: confirmAction.role?.userCount || 0 })
                      : t('settings.activateRoleWarning', { count: confirmAction.role?.userCount || 0 })
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {confirmAction.role && (
            <div className="py-4">
              <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{confirmAction.role.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {confirmAction.role.userCount || 0} {t('settings.usersAffected')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setConfirmAction({ type: 'activate', role: null });
              }}
              className="w-full sm:w-auto min-w-[100px]"
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant={confirmAction.type === 'delete' ? 'destructive' : 'default'}
              onClick={() => {
                if (confirmAction.type === 'delete') {
                  confirmDeleteRole();
                } else {
                  performToggleActive(confirmAction.role!);
                  setShowConfirmDialog(false);
                  setConfirmAction({ type: 'activate', role: null });
                }
              }}
              className="w-full sm:w-auto min-w-[120px] gap-2"
            >
              {confirmAction.type === 'delete' && <Trash2 className="h-4 w-4" />}
              {confirmAction.type === 'deactivate' && <XCircle className="h-4 w-4" />}
              {confirmAction.type === 'activate' && <CheckCircle className="h-4 w-4" />}
              <span className="truncate">
                {confirmAction.type === 'delete'
                  ? t('settings.deleteRole')
                  : confirmAction.type === 'deactivate'
                    ? t('settings.deactivate')
                    : t('settings.activate')
                }
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
