// features/settings/components/UsersManagement.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Shield,
  CheckCircle,
  XCircle,
  UserPlus,
  RefreshCw,
  Phone,
  Calendar,
  Check,
  X
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Tipos baseados nos modelos fornecidos
interface ApiUser {
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
    role: {
      id: string;
      name: string;
    };
  }>;
}

interface ApiRole {
  id: string;
  name: string;
  isActive: boolean;
  isDefault?: boolean;
}

export function UsersManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para dados da API
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  // Carregar dados da API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar users
      const [usersResponse, rolesResponse] = await Promise.all([
        api.get('/users'),
        api.get('/roles/all')
      ]);

      setUsers(usersResponse.data || []);
      // Filtrar roles ativas
      const activeRoles = (rolesResponse.data || []).filter((role: ApiRole) => role.isActive);
      setRoles(activeRoles);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.errorLoadingData'));
    } finally {
      setIsLoading(false);
    }
  };

  // Quando selecionar um user para editar, carregar seus roles
  useEffect(() => {
    if (selectedUser && showUserDialog) {
      const userRoles = new Set(
        selectedUser.userRoles?.map((ur: any) => ur.role.id) || []
      );
      setSelectedRoles(userRoles);
    }
  }, [selectedUser, showUserDialog]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    const matchesRole = selectedRole === 'all' || 
      user.userRoles?.some((ur: any) => ur.role.id === selectedRole) || false;
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' ? user.active : !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user: ApiUser) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(t('settings.confirmDeleteUser'))) return;
    
    try {
      await api.delete(`/users/${userId}`);
      toast.success(t('settings.userDeleted'));
      await loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('common.errorDeleting'));
    }
  };
  
  const handleToggleStatus = async (user: ApiUser) => {
    try {
      await api.patch(`/users/${user.id}`, {
        active: !user.active
      });
      toast.success(t('settings.userUpdated'));
      await loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('common.errorUpdating'));
    }
  };

  const handleToggleRole = (roleId: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(roleId)) {
      newSelected.delete(roleId);
    } else {
      newSelected.add(roleId);
    }
    setSelectedRoles(newSelected);
  };

  const handleSaveUser = async (formData: any) => {
    setIsSaving(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        active: formData.active,
        language: formData.language,
        theme: formData.theme,
        timezone: formData.timezone,
        roleIds: Array.from(selectedRoles)
      };

      if (selectedUser?.id) {
        // Atualizar user existente
        await api.put(`/users/${selectedUser.id}`, userData);
        toast.success(t('settings.userUpdated'));
      } else {
        // Criar novo user
        await api.post('/users', userData);
        toast.success(t('settings.userCreated'));
      }

      setShowUserDialog(false);
      setSelectedUser(null);
      await loadData();
      
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(t('common.errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { 
      label: 'settings.totalUsers', 
      value: users.length.toString(), 
      change: '+0' 
    },
    { 
      label: 'settings.activeUsers', 
      value: users.filter(u => u.active).length.toString(), 
      change: '+0' 
    },
    { 
      label: 'settings.confirmedEmails', 
      value: users.filter(u => u.emailConfirmed).length.toString(), 
      change: '+0' 
    },
    { 
      label: 'settings.withPhone', 
      value: users.filter(u => u.phone).length.toString(), 
      change: '+0' 
    },
  ];

  const languages = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];

  const themes = [
    { value: 'light', label: t('settings.light') },
    { value: 'dark', label: t('settings.dark') },
    { value: 'system', label: t('settings.system') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('settings.users')}</h2>
          <p className="text-muted-foreground">
            {t('settings.usersManagementDescription')}
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
            onClick={() => {
              setSelectedUser(null);
              setSelectedRoles(new Set());
              setShowUserDialog(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            {t('settings.addUser')}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t(stat.label)}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`h-10 w-10 ${
                  index === 0 ? 'bg-blue-500/10' :
                  index === 1 ? 'bg-green-500/10' :
                  index === 2 ? 'bg-purple-500/10' : 'bg-orange-500/10'
                } rounded-lg flex items-center justify-center`}>
                  {index === 0 ? <User className="h-5 w-5 text-blue-500" /> :
                   index === 1 ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                   index === 2 ? <Mail className="h-5 w-5 text-purple-500" /> :
                   <Phone className="h-5 w-5 text-orange-500" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                  placeholder={t('settings.searchUsers')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.filterByRole')}</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.allRoles')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('settings.allRoles')}</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.status')}</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('settings.allStatus')}</SelectItem>
                  <SelectItem value="active">{t('settings.active')}</SelectItem>
                  <SelectItem value="inactive">{t('settings.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.actions')}</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 flex-1"
                  onClick={loadData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('common.refresh')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Users Table */}
      <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>{t('settings.usersList')}</CardTitle>
            <Badge variant="outline">
              {filteredUsers.length} {t('settings.users')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>{t('settings.user')}</TableHead>
                <TableHead>{t('settings.contact')}</TableHead>
                <TableHead>{t('settings.role')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('settings.lastLogin')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>{t('common.loading')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          {t('settings.noUsersFound')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('settings.tryChangingFilters')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {user.photoPath ? (
                            <img 
                              src={user.photoPath} 
                              alt={user.firstName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {user.emailConfirmed ? (
                              <Badge className="bg-green-500/10 text-green-600 text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Email
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/10 text-yellow-600 text-xs">
                                <X className="h-3 w-3 mr-1" />
                                Email
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{user.phone}</span>
                            {user.phoneConfirmed && (
                              <Badge className="bg-green-500/10 text-green-600 text-xs">
                                <Check className="h-2 w-2" />
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {user.userRoles?.slice(0, 2).map((ur: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ur.role.name}
                            </Badge>
                          ))}
                          {user.userRoles && user.userRoles.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.userRoles.length - 2}
                            </Badge>
                          )}
                          {(!user.userRoles || user.userRoles.length === 0) && (
                            <Badge variant="outline" className="text-xs">
                              {t('settings.noRole')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.active ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <Badge className="bg-green-500/10 text-green-600 text-xs">
                              {t('settings.active')}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <Badge className="bg-red-500/10 text-red-600 text-xs">
                              {t('settings.inactive')}
                            </Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <div>
                          <div className="text-sm">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {t('settings.neverLoggedIn')}
                        </Badge>
                      )}
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
                            onClick={() => handleEditUser(user)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            {t('settings.editUser')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(user)}
                            className="cursor-pointer gap-2"
                          >
                            {user.active ? (
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
                            onClick={() => handleDeleteUser(user.id)}
                            className="cursor-pointer gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('settings.deleteUser')}
                          </DropdownMenuItem>
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
      
      {/* User Dialog */}
      {showUserDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl bg-card border-border max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>
                      {selectedUser?.id ? t('settings.editUser') : t('settings.addUser')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser?.id ? t('settings.editUserDescription') : t('settings.createUserDescription')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUserDialog(false);
                    setSelectedUser(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">{t('settings.firstName')} *</Label>
                          <Input
                            id="first-name"
                            placeholder={t('settings.firstNamePlaceholder')}
                            defaultValue={selectedUser?.firstName || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">{t('settings.lastName')} *</Label>
                          <Input
                            id="last-name"
                            placeholder={t('settings.lastNamePlaceholder')}
                            defaultValue={selectedUser?.lastName || ''}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('settings.email')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t('settings.emailPlaceholder')}
                          defaultValue={selectedUser?.email || ''}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('settings.phone')}</Label>
                        <Input
                          id="phone"
                          placeholder={t('settings.phonePlaceholder')}
                          defaultValue={selectedUser?.phone || ''}
                        />
                      </div>
                      
                      {!selectedUser?.id && (
                        <div className="space-y-2">
                          <Label htmlFor="password">{t('settings.password')} *</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder={t('settings.passwordPlaceholder')}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Configurações e Roles */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="is-active">{t('settings.active')}</Label>
                          <Switch
                            id="is-active"
                            defaultChecked={selectedUser?.active ?? true}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>{t('settings.language')}</Label>
                          <Select defaultValue={selectedUser?.language || 'pt'}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('settings.selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>{t('settings.theme')}</Label>
                          <Select defaultValue={selectedUser?.theme || 'system'}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('settings.selectTheme')} />
                            </SelectTrigger>
                            <SelectContent>
                              {themes.map(theme => (
                                <SelectItem key={theme.value} value={theme.value}>
                                  {theme.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label>{t('settings.roles')}</Label>
                        {roles.length === 0 ? (
                          <div className="border rounded-lg p-4 text-center">
                            <div className="h-10 w-10 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                              <Shield className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">
                              {t('settings.noRolesAvailable')}
                            </p>
                          </div>
                        ) : (
                          <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                            {roles.map((role) => (
                              <div
                                key={role.id}
                                className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Shield className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <span className="font-medium">{role.name}</span>
                                    {role.isDefault && (
                                      <Badge className="ml-2 bg-green-500/10 text-green-600 text-xs">
                                        {t('settings.default')}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Switch
                                  checked={selectedRoles.has(role.id)}
                                  onCheckedChange={() => handleToggleRole(role.id)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Ações */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUserDialog(false);
                        setSelectedUser(null);
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={() => {
                        const formData = {
                          firstName: (document.getElementById('first-name') as HTMLInputElement)?.value,
                          lastName: (document.getElementById('last-name') as HTMLInputElement)?.value,
                          email: (document.getElementById('email') as HTMLInputElement)?.value,
                          phone: (document.getElementById('phone') as HTMLInputElement)?.value,
                          password: selectedUser?.id ? undefined : (document.getElementById('password') as HTMLInputElement)?.value,
                          active: (document.getElementById('is-active') as HTMLInputElement)?.checked,
                          language: (document.querySelector('[data-state="open"]') as HTMLSelectElement)?.value || 'pt',
                          theme: (document.querySelector('[data-state="open"]:nth-of-type(2)') as HTMLSelectElement)?.value || 'system',
                          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        };
                        handleSaveUser(formData);
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {t('common.save')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}