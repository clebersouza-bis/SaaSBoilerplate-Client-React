// features/settings/components/RolesManagement.tsx - VERSÃO ATUALIZADA
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Tipos
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
  const { t } = useTranslation();
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
      // Carregar roles
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
      // Reset quando o diálogo fecha
      setHasLoadedPermissions(false);
      setAllPermissions([]);
      setPermissionGroups([]);
      return;
    }

    // Se já carregou, não carrega de novo
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

        // Marcar permissões selecionadas
        if (response.data.rolePermissions) {
          setSelectedPermissions(new Set(response.data.rolePermissions));
        } else if (selectedRole?.permissions) {
          setSelectedPermissions(new Set(
            selectedRole.permissions.map((p: Permission) => p.id)
          ));
        }

        // Agrupar permissões
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

        // Expandir todos os grupos
        const resourceSet = new Set(groups.map(g => g.resource));
        setExpandedGroups(resourceSet);

        setHasLoadedPermissions(true);

      } catch (error) {
        console.error('Error loading permissions:', error);
        toast.error(t('common.errorLoadingData'));
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [showRoleDialog, selectedRole, hasLoadedPermissions, t]); // Adicionado hasLoadedPermissions


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
    setHasLoadedPermissions(false); // Forçar recarregar
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setSelectedPermissions(new Set());
    setShowRoleDialog(true);
    setHasLoadedPermissions(false); // Forçar recarregar
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
      await api.patch(`/roles/${role.id}`, {
        isActive: !role.isActive
      });
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
        await api.put(`/roles/${selectedRole.id}`, formData);
        toast.success(t('settings.roleUpdated'));
      } else {
        await api.post('/roles', formData);
        toast.success(t('settings.roleCreated'));
      }

      setShowRoleDialog(false);
      setSelectedRole(null);
      await loadData();

    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(t('common.errorSaving'));
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={loadData}
          >
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
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = '/settings'}
                  >
                    {t('common.goBack')}
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 gap-2"
                    onClick={() => {
                      const subject = encodeURIComponent('Role Management Access Request');
                      window.open(`mailto:admin@company.com?subject=${subject}`, '_blank');
                    }}
                  >
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('settings.roles')}</h2>
          <p className="text-muted-foreground">
            {t('settings.rolesManagementDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={handleCreateRole}  // ← TROQUE AQUI
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            {t('settings.createRole')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t(stat.label)}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className={`h-10 w-10 ${stat.color.split(' ')[0]} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color.split(' ')[1]}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t('common.search')}
              </Label>
              <Input
                id="search"
                placeholder={t('settings.searchRoles')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('settings.roleStatus')}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={showInactiveRoles ? "outline" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowInactiveRoles(false)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('settings.activeOnly')}
                </Button>
                <Button
                  variant={showInactiveRoles ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowInactiveRoles(true)}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  {t('settings.all')}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('common.actions')}</Label>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
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
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>{t('settings.rolesList')}</CardTitle>
            <Badge variant="outline">
              {filteredRoles.length} {t('settings.roles')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[250px]">{t('settings.role')}</TableHead>
                <TableHead className="w-[300px]">{t('settings.description')}</TableHead>
                <TableHead>{t('settings.permissions')}</TableHead>
                <TableHead>{t('settings.users')}</TableHead>
                <TableHead>{t('settings.status')}</TableHead>
                <TableHead>{t('settings.lastUpdated')}</TableHead>
                <TableHead className="text-right w-[100px]">{t('common.actions')}</TableHead>
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
                        <p className="font-medium text-muted-foreground">
                          {t('settings.noRolesFound')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('settings.tryChangingFilters')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-muted/20 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{role.name}</p>
                          {role.isDefault && (
                            <Badge className="bg-green-500/10 text-green-600 text-xs mt-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t('settings.default')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {role.description || t('settings.noDescription')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {role.permissions?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {role.userCount || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? "default" : "secondary"} className={role.isActive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
                        {role.isActive ? t('settings.active') : t('settings.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(role.updatedAt || role.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(role.updatedAt || role.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                          className="h-8 w-8 p-0"
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(role)}
                              className="cursor-pointer gap-2"
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
                              onClick={() => handleDeleteRole(role.id)}
                              className="cursor-pointer gap-2 text-red-600"
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
        </CardContent>
      </Card>

      {/* Role Dialog */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-6xl bg-card border-border max-h-[90vh] overflow-hidden shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {selectedRole?.id ? t('settings.editRole') : t('settings.createRole')}
                    </CardTitle>
                    <CardDescription>
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
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <CardContent className="p-6">
                {/* Informações Básicas - Layout Vertical */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="role-name" className="text-sm font-medium">
                          {t('settings.roleName')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="role-name"
                          ref={nameInputRef}
                          placeholder={t('settings.roleNamePlaceholder')}
                          defaultValue={selectedRole?.name || ''}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role-description" className="text-sm font-medium">
                          {t('settings.description')}
                        </Label>
                        <textarea
                          id="role-description"
                          ref={descriptionInputRef}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[80px] resize-none"
                          placeholder={t('settings.roleDescriptionPlaceholder')}
                          defaultValue={selectedRole?.description || ''}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <Label htmlFor="is-active" className="text-sm font-medium cursor-pointer">
                          {t('settings.active')}
                        </Label>
                        <Switch
                          id="is-active"
                          ref={isActiveSwitchRef}
                          defaultChecked={selectedRole?.isActive ?? true}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Card className="border-border">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span>{t('settings.summary')}</span>
                            <Badge variant="outline">
                              {selectedPermissions.size} {t('settings.selected')}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('settings.totalPermissions')}:</span>
                              <span className="font-medium">{allPermissions.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('settings.resourceGroups')}:</span>
                              <span className="font-medium">{permissionGroups.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('settings.roleStatus')}:</span>
                              <Badge variant={selectedRole?.isActive ?? true ? "default" : "secondary"}>
                                {selectedRole?.isActive ?? true ? t('settings.active') : t('settings.inactive')}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-xs text-blue-700">
                          {t('settings.permissionSelectionHint')}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  <Separator />

                  {/* Permissões - Layout Expandido */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{t('settings.permissions')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.selectPermissionsForRole')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allIds = allPermissions.map(p => p.id);
                            setSelectedPermissions(new Set(allIds));
                          }}
                        >
                          {t('settings.selectAll')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPermissions(new Set())}
                        >
                          {t('settings.deselectAll')}
                        </Button>
                      </div>
                    </div>

                    {isLoadingPermissions ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                          <span>{t('settings.loadingPermissions')}</span>
                        </div>
                      </div>
                    ) : permissionGroups.length === 0 ? (
                      <div className="border rounded-lg p-8 text-center">
                        <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                          <Key className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          {t('settings.noPermissionsAvailable')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('settings.contactAdminForPermissions')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {permissionGroups.map((group) => (
                          <Card key={group.resource} className="border-border overflow-hidden">
                            <div className="bg-muted/30 border-b">
                              <button
                                onClick={() => handleToggleGroup(group.resource)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  {expandedGroups.has(group.resource) ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <div className="text-left flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold capitalize">{group.resource}</span>
                                      {group.category && (
                                        <Badge variant="outline" className={getCategoryColor(group.category)}>
                                          {group.category}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {group.permissions.length} {t('settings.permissions')} •
                                      {group.permissions.filter(p => selectedPermissions.has(p.id)).length} {t('settings.selected')}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectAllInGroup(group);
                                  }}
                                  className="text-xs"
                                >
                                  {group.permissions.every(p => selectedPermissions.has(p.id)) ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      {t('settings.deselectAll')}
                                    </>
                                  ) : (
                                    <>
                                      <ListChecks className="h-3 w-3 mr-1" />
                                      {t('settings.selectAll')}
                                    </>
                                  )}
                                </Button>
                              </button>

                              {expandedGroups.has(group.resource) && (
                                <div className="px-4 pb-3 pt-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {group.permissions.map((permission) => (
                                      <div
                                        key={permission.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedPermissions.has(permission.id)
                                          ? 'border-primary bg-primary/5'
                                          : 'border-border hover:bg-muted/30'
                                          }`}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm truncate">
                                            {permission.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground font-mono truncate mt-1">
                                            {permission.key}
                                          </div>
                                          {permission.description && (
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                              {permission.description}
                                            </div>
                                          )}
                                        </div>
                                        <Switch
                                          checked={selectedPermissions.has(permission.id)}
                                          onCheckedChange={() => handleTogglePermission(permission.id)}
                                          className="ml-3"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="border-t bg-muted/20 p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {selectedPermissions.size} {t('settings.permissionsSelected')}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRoleDialog(false);
                      setSelectedRole(null);
                      setSelectedPermissions(new Set());
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveRole}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>
                  {confirmAction.type === 'delete'
                    ? t('settings.confirmDeleteRole')
                    : confirmAction.type === 'deactivate'
                      ? t('settings.confirmDeactivateRole')
                      : t('settings.confirmActivateRole')
                  }
                </DialogTitle>
                <DialogDescription>
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

          <div className="py-4">
            {confirmAction.role && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{confirmAction.role.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {confirmAction.role.userCount || 0} {t('settings.usersAffected')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setConfirmAction({ type: 'activate', role: null });
              }}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant={confirmAction.type === 'delete' ? 'destructive' : 'default'}
              onClick={() => {
                if (confirmAction.type === 'delete') {
                  confirmDeleteRole();
                } else if (confirmAction.type === 'deactivate' || confirmAction.type === 'activate') {
                  performToggleActive(confirmAction.role!);
                  setShowConfirmDialog(false);
                  setConfirmAction({ type: 'activate', role: null });
                }
              }}
              className="flex-1 gap-2"
            >
              {confirmAction.type === 'delete' && <Trash2 className="h-4 w-4" />}
              {confirmAction.type === 'deactivate' && <XCircle className="h-4 w-4" />}
              {confirmAction.type === 'activate' && <CheckCircle className="h-4 w-4" />}
              {confirmAction.type === 'delete'
                ? t('settings.deleteRole')
                : confirmAction.type === 'deactivate'
                  ? t('settings.deactivate')
                  : t('settings.activate')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}