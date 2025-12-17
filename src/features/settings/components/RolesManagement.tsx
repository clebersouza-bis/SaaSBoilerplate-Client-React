// features/settings/components/RolesManagement.tsx
import * as React from 'react';
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield,
  Users,
  Key,
  Copy,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Lock,
  Unlock,
  Eye,
  EyeOff
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { Separator } from '@/components/ui/separator';

// Mock data - substituir por dados reais da API
const mockRoles = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    userCount: 5,
    permissionCount: 156,
    isDefault: true,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Can manage users and content, limited system access',
    userCount: 12,
    permissionCount: 89,
    isDefault: false,
    isSystem: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-14T10:15:00Z',
  },
  {
    id: '3',
    name: 'Analyst',
    description: 'Read-only access to analytics and reports',
    userCount: 8,
    permissionCount: 45,
    isDefault: false,
    isSystem: false,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
  },
  {
    id: '4',
    name: 'Support Agent',
    description: 'Customer support with limited access',
    userCount: 15,
    permissionCount: 32,
    isDefault: false,
    isSystem: false,
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-12T09:20:00Z',
  },
  {
    id: '5',
    name: 'Viewer',
    description: 'Read-only access to basic features',
    userCount: 25,
    permissionCount: 18,
    isDefault: true,
    isSystem: false,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-11T11:30:00Z',
  },
];

export function RolesManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showSystemRoles, setShowSystemRoles] = useState(true);
  
  const filteredRoles = mockRoles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = showSystemRoles || !role.isSystem;
    
    return matchesSearch && matchesFilter;
  });
  
  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setShowRoleDialog(true);
  };
  
  const handleDeleteRole = (roleId: string) => {
    if (window.confirm(t('settings.confirmDeleteRole'))) {
      console.log('Delete role:', roleId);
    }
  };
  
  const handleDuplicateRole = (role: any) => {
    console.log('Duplicate role:', role.id);
    setSelectedRole({ ...role, name: `${role.name} (Copy)` });
    setShowRoleDialog(true);
  };
  
  const handleToggleDefault = (role: any) => {
    console.log('Toggle default for role:', role.id);
  };
  
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
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {t('common.export')}
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowRoleDialog(true)}>
            <Plus className="h-4 w-4" />
            {t('settings.createRole')}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.totalRoles')}</p>
                <h3 className="text-2xl font-bold mt-1">{mockRoles.length}</h3>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.totalUsers')}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {mockRoles.reduce((sum, role) => sum + role.userCount, 0)}
                </h3>
              </div>
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.systemRoles')}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {mockRoles.filter(role => role.isSystem).length}
                </h3>
              </div>
              <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Lock className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.defaultRoles')}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {mockRoles.filter(role => role.isDefault).length}
                </h3>
              </div>
              <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('settings.searchRoles')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.roleType')}</label>
              <div className="flex gap-2">
                <Button
                  variant={showSystemRoles ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowSystemRoles(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('settings.allRoles')}
                </Button>
                <Button
                  variant={!showSystemRoles ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowSystemRoles(false)}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  {t('settings.customOnly')}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.sortBy')}</label>
              <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm">
                <option value="name">{t('settings.name')}</option>
                <option value="users">{t('settings.userCount')}</option>
                <option value="created">{t('settings.dateCreated')}</option>
                <option value="updated">{t('settings.lastUpdated')}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.actions')}</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 flex-1">
                  <Filter className="h-4 w-4" />
                  {t('settings.filter')}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
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
                <TableHead>{t('settings.role')}</TableHead>
                <TableHead>{t('settings.description')}</TableHead>
                <TableHead>{t('settings.users')}</TableHead>
                <TableHead>{t('settings.permissions')}</TableHead>
                <TableHead>{t('settings.properties')}</TableHead>
                <TableHead>{t('settings.lastUpdated')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
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
                  <TableRow key={role.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{role.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {role.isSystem && (
                              <Badge variant="secondary" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                {t('settings.system')}
                              </Badge>
                            )}
                            {role.isDefault && (
                              <Badge className="bg-green-500/10 text-green-600 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('settings.default')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {role.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.userCount}</span>
                        <span className="text-xs text-muted-foreground">
                          {t('settings.users')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.permissionCount}</span>
                        <span className="text-xs text-muted-foreground">
                          {t('settings.permissions')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            {t('settings.system')}
                          </Badge>
                        )}
                        {role.isDefault && (
                          <Badge className="bg-green-500/10 text-green-600 text-xs">
                            {t('settings.default')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(role.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(role.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => handleEditRole(role)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            {t('settings.editRole')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicateRole(role)}
                            className="cursor-pointer gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            {t('settings.duplicateRole')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleDefault(role)}
                            className="cursor-pointer gap-2"
                          >
                            {role.isDefault ? (
                              <>
                                <XCircle className="h-4 w-4" />
                                {t('settings.removeDefault')}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                {t('settings.setAsDefault')}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!role.isSystem && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRole(role.id)}
                              className="cursor-pointer gap-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t('settings.deleteRole')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Role Dialog (será implementado) */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>
                    {selectedRole ? t('settings.editRole') : t('settings.createRole')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedRole ? 'Edit existing role' : 'Create a new role with specific permissions'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.roleName')} *</label>
                    <Input
                      placeholder="Enter role name"
                      defaultValue={selectedRole?.name || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.roleKey')} *</label>
                    <Input
                      placeholder="e.g., ROLE_ADMIN"
                      defaultValue={selectedRole?.id?.toUpperCase() || ''}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.description')}</label>
                  <textarea
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[80px] resize-none"
                    placeholder="Describe the role's purpose and permissions"
                    defaultValue={selectedRole?.description || ''}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">{t('settings.roleSettings')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is-default" className="h-4 w-4" defaultChecked={selectedRole?.isDefault || false} />
                      <label htmlFor="is-default" className="text-sm">{t('settings.setAsDefault')}</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is-system" className="h-4 w-4" defaultChecked={selectedRole?.isSystem || false} disabled={!!selectedRole?.isSystem} />
                      <label htmlFor="is-system" className="text-sm">{t('settings.systemRole')}</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is-active" className="h-4 w-4" defaultChecked />
                      <label htmlFor="is-active" className="text-sm">{t('settings.active')}</label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">{t('settings.permissions')} (156 total)</h4>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="h-10 w-10 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                      <Key className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {t('settings.permissionsSelectionComingSoon')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('settings.usePermissionsTreeTab')}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={() => setShowRoleDialog(false)}>
                    <Lock className="h-4 w-4 mr-2" />
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}