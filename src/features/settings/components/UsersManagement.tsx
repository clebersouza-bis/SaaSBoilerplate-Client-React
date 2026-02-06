// features/settings/components/UsersManagement.tsx - MODAL REDESENHADO
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
  X,
  Save,
  Key,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  Lock,
  Globe,
  Clock,
  Hash
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Tipos
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
      isActive: boolean;
      description?: string;
    };
  }>;
}

interface ApiRole {
  id: string;
  name: string;
  isActive: boolean;
  isDefault?: boolean;
  description?: string;
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

  // Estados para senha (apenas criação)
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Carregar dados da API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        api.get('/users'),
        api.get('/roles/all')
      ]);

      setUsers(usersResponse.data || []);
      const activeRoles = (rolesResponse.data || []).filter((role: ApiRole) => role.isActive);
      setRoles(activeRoles);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.errorLoadingData'));
    } finally {
      setIsLoading(false);
    }
  };

  // Quando selecionar um user para editar
  useEffect(() => {
    if (selectedUser && showUserDialog) {
      const userRoles = new Set(
        selectedUser.userRoles?.map((ur: any) => ur.role.id) || []
      );
      setSelectedRoles(userRoles);
    } else {
      setPassword('');
      setPasswordError('');
      setActiveTab('basic');
    }
  }, [selectedUser, showUserDialog]);

  const validatePassword = () => {
    if (selectedUser?.id) return true; // Não valida senha para edição
    
    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError(t('auth.passwordMinLength'));
      return false;
    }
    
    setPasswordError('');
    return true;
  };

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

  const handleSaveUser = async () => {
    // Validações básicas
    const firstName = (document.getElementById('first-name') as HTMLInputElement)?.value;
    const lastName = (document.getElementById('last-name') as HTMLInputElement)?.value;
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    
    if (!firstName?.trim() || !lastName?.trim()) {
      toast.error(t('settings.nameRequired'));
      return;
    }
    
    if (!email?.trim()) {
      toast.error(t('settings.emailRequired'));
      return;
    }
    
    // Valida senha apenas para criação
    if (!selectedUser?.id && !validatePassword()) {
      return;
    }
    
    setIsSaving(true);
    try {
      const userData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: (document.getElementById('phone') as HTMLInputElement)?.value?.trim() || null,
        active: (document.getElementById('is-active') as HTMLInputElement)?.checked,
        roleIds: Array.from(selectedRoles)
      };
      
      // Adiciona configurações adicionais se existirem
      const language = (document.getElementById('language') as HTMLInputElement)?.value;
      const timezone = (document.getElementById('timezone') as HTMLInputElement)?.value;
      
      if (language) userData.language = language;
      if (timezone) userData.timezone = timezone;

      // Adiciona password apenas para criação
      if (!selectedUser?.id && password) {
        userData.password = password;
      }

      if (selectedUser?.id) {
        await api.put(`/users/${selectedUser.id}`, userData);
        toast.success(t('settings.userUpdated'));
      } else {
        await api.post('/users', userData);
        toast.success(t('settings.userCreated'));
      }

      setShowUserDialog(false);
      setSelectedUser(null);
      setPassword('');
      setSelectedRoles(new Set());
      await loadData();
      
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message;
      toast.error(errorMsg || t('common.errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { 
      label: 'settings.totalUsers', 
      value: users.length.toString(), 
      change: '+0',
      icon: User,
      color: 'text-blue-500'
    },
    { 
      label: 'settings.activeUsers', 
      value: users.filter(u => u.active).length.toString(), 
      change: '+0',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    { 
      label: 'settings.confirmedEmails', 
      value: users.filter(u => u.emailConfirmed).length.toString(), 
      change: '+0',
      icon: Mail,
      color: 'text-purple-500'
    },
    { 
      label: 'settings.withPhone', 
      value: users.filter(u => u.phone).length.toString(), 
      change: '+0',
      icon: Phone,
      color: 'text-orange-500'
    },
  ];

  // Renderiza a parte de cima da tabela (mantida igual)
  return (
    <div className="space-y-6">
      {/* Header - Mantido igual */}
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
              setPassword('');
              setShowUserDialog(true);
            }}
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4" />
            {t('settings.addUser')}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards - Mantido igual */}
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
                <div className={`h-10 w-10 ${stat.color.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Filters - Mantido igual */}
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
                placeholder={t('settings.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('settings.filterByRole')}
              </Label>
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
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('common.status')}
              </Label>
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
          </div>
        </CardContent>
      </Card>
      
      {/* Users Table - Mantido igual */}
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
                <TableHead className="w-[250px]">{t('settings.user')}</TableHead>
                <TableHead className="w-[200px]">{t('settings.contact')}</TableHead>
                <TableHead>{t('settings.role')}</TableHead>
                <TableHead className="w-[100px]">{t('common.status')}</TableHead>
                <TableHead className="w-[150px]">{t('settings.lastLogin')}</TableHead>
                <TableHead className="text-right w-[100px]">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin" />
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
                  <TableRow key={user.id} className="hover:bg-muted/20 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
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
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {user.emailConfirmed ? (
                              <Badge className="bg-green-500/10 text-green-600 text-xs px-1.5 py-0.5">
                                <Check className="h-2.5 w-2.5 mr-1" />
                                Email
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/10 text-yellow-600 text-xs px-1.5 py-0.5">
                                <X className="h-2.5 w-2.5 mr-1" />
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
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{user.phone}</span>
                            {user.phoneConfirmed && (
                              <Badge className="bg-green-500/10 text-green-600 text-xs px-1 py-0">
                                <Check className="h-2 w-2" />
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.userRoles?.slice(0, 3).map((ur: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                            {ur.role.name}
                          </Badge>
                        ))}
                        {user.userRoles && user.userRoles.length > 3 && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            +{user.userRoles.length - 3}
                          </Badge>
                        )}
                        {(!user.userRoles || user.userRoles.length === 0) && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {t('settings.noRole')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.active ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-200">
                          {t('settings.active')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-muted">
                          {t('settings.inactive')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <div className="text-sm space-y-0.5">
                          <div>
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
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditUser(user)}
                          title={t('settings.editUser')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* User Dialog - TOTALMENTE REDESENHADO */}
      {showUserDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-5xl bg-card border-border max-h-[90vh] overflow-hidden shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-10 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={selectedUser?.photoPath} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {selectedUser?.id 
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : t('settings.createNewUser')
                      }
                    </CardTitle>
                    <CardDescription>
                      {selectedUser?.id 
                        ? t('settings.editUserDescription')
                        : t('settings.createUserDescription')
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedUser?.id && (
                    <Badge variant={selectedUser.active ? "default" : "secondary"}>
                      {selectedUser.active ? t('settings.active') : t('settings.inactive')}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUserDialog(false);
                      setSelectedUser(null);
                      setPassword('');
                      setSelectedRoles(new Set());
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="h-[calc(90vh-180px)]">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="basic" className="gap-2">
                      <User className="h-4 w-4" />
                      {t('settings.basicInfo')}
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                      <Lock className="h-4 w-4" />
                      {t('settings.security')}
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="gap-2">
                      <Shield className="h-4 w-4" />
                      {t('settings.roles')}
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                      <Globe className="h-4 w-4" />
                      {t('settings.preferences')}
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB: Informações Básicas */}
                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Coluna Esquerda */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t('settings.firstName')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="first-name"
                            placeholder={t('settings.firstNamePlaceholder')}
                            defaultValue={selectedUser?.firstName || ''}
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {t('settings.email')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="user@company.com"
                            defaultValue={selectedUser?.email || ''}
                            className="h-10"
                            disabled={!!selectedUser?.id}
                          />
                          {selectedUser?.emailConfirmed && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              {t('settings.emailConfirmed')}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {t('settings.phone')}
                          </Label>
                          <Input
                            id="phone"
                            placeholder="+55 (11) 99999-9999"
                            defaultValue={selectedUser?.phone || ''}
                            className="h-10"
                          />
                          {selectedUser?.phoneConfirmed && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              {t('settings.phoneConfirmed')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Coluna Direita */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t('settings.lastName')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="last-name"
                            placeholder={t('settings.lastNamePlaceholder')}
                            defaultValue={selectedUser?.lastName || ''}
                            className="h-10"
                          />
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="is-active" className="text-sm font-medium cursor-pointer">
                              {t('settings.accountStatus')}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {selectedUser?.active 
                                ? t('settings.accountActiveDescription')
                                : t('settings.accountInactiveDescription')
                              }
                            </p>
                          </div>
                          <Switch
                            id="is-active"
                            defaultChecked={selectedUser?.active ?? true}
                          />
                        </div>

                        {/* Informações de criação */}
                        {selectedUser?.id && (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{t('settings.createdAt')}:</span>
                              <span className="font-medium">
                                {new Date(selectedUser.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{t('settings.lastLogin')}:</span>
                              <span className="font-medium">
                                {selectedUser.lastLogin 
                                  ? new Date(selectedUser.lastLogin).toLocaleDateString()
                                  : t('settings.never')
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!selectedUser?.id && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          {t('settings.userCreationNotice')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* TAB: Segurança */}
                  <TabsContent value="security" className="space-y-6">
                    {selectedUser?.id ? (
                      <div className="space-y-4">
                        <Alert>
                          <Lock className="h-4 w-4" />
                          <AlertDescription>
                            {t('settings.passwordChangeNotice')}
                          </AlertDescription>
                        </Alert>

                        <div className="bg-muted/30 p-4 rounded-lg">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium">
                                  {t('settings.emailVerification')}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {selectedUser.emailConfirmed 
                                    ? t('settings.emailVerifiedDescription')
                                    : t('settings.emailNotVerifiedDescription')
                                  }
                                </p>
                              </div>
                              <Badge variant={selectedUser.emailConfirmed ? "default" : "secondary"}>
                                {selectedUser.emailConfirmed ? t('common.verified') : t('common.pending')}
                              </Badge>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium">
                                  {t('settings.phoneVerification')}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {selectedUser.phone && selectedUser.phoneConfirmed 
                                    ? t('settings.phoneVerifiedDescription')
                                    : selectedUser.phone
                                    ? t('settings.phoneNotVerifiedDescription')
                                    : t('settings.phoneNotSetDescription')
                                  }
                                </p>
                              </div>
                              <Badge variant={selectedUser.phoneConfirmed ? "default" : "secondary"}>
                                {selectedUser.phoneConfirmed ? t('common.verified') : selectedUser.phone ? t('common.pending') : t('common.notSet')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            {t('settings.password')} <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={t('settings.passwordPlaceholder')}
                              className="h-10 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {passwordError && (
                            <p className="text-xs text-destructive mt-1">{passwordError}</p>
                          )}
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <p>{t('auth.passwordRequirements')}:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>{t('auth.passwordMinLength')}</li>
                              <li>{t('auth.passwordUpperCase')}</li>
                              <li>{t('auth.passwordLowerCase')}</li>
                              <li>{t('auth.passwordNumber')}</li>
                            </ul>
                          </div>
                        </div>

                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {t('settings.passwordWarning')}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </TabsContent>

                  {/* TAB: Roles */}
                  <TabsContent value="roles" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{t('settings.assignRoles')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.roleAssignmentDescription')}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {selectedRoles.size} {t('settings.selected')}
                        </Badge>
                      </div>

                      {roles.length === 0 ? (
                        <div className="border rounded-lg p-8 text-center">
                          <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                            <Shield className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">
                            {t('settings.noRolesAvailable')}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('settings.createRolesFirst')}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                          {roles.map((role) => (
                            <Card 
                              key={role.id}
                              className={`cursor-pointer transition-all hover:border-primary/50 ${
                                selectedRoles.has(role.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border'
                              }`}
                              onClick={() => handleToggleRole(role.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                        selectedRoles.has(role.id)
                                          ? 'bg-primary/10 text-primary'
                                          : 'bg-muted text-muted-foreground'
                                      }`}>
                                        <Shield className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium truncate">{role.name}</h4>
                                          {role.isDefault && (
                                            <Badge variant="outline" className="text-xs">
                                              {t('settings.default')}
                                            </Badge>
                                          )}
                                        </div>
                                        {role.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {role.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={selectedRoles.has(role.id)}
                                    onCheckedChange={() => handleToggleRole(role.id)}
                                    className="ml-2"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* TAB: Configurações */}
                  <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="language" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {t('settings.language')}
                          </Label>
                          <Select defaultValue={selectedUser?.language || 'en'}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('settings.selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="pt">Português</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="theme" className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            {t('settings.theme')}
                          </Label>
                          <Select defaultValue={selectedUser?.theme || 'system'}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('settings.selectTheme')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                              <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                              <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="timezone" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {t('settings.timezone')}
                          </Label>
                          <Input
                            id="timezone"
                            placeholder="America/Sao_Paulo"
                            defaultValue={selectedUser?.timezone || ''}
                            className="h-10"
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('settings.timezoneDescription')}
                          </p>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {t('settings.preferencesNotice')}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </ScrollArea>

            {/* Footer do Modal */}
            <div className="border-t bg-muted/20 p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {selectedUser?.id ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {t('settings.editingUser')}: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>{t('settings.creatingNewUser')}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserDialog(false);
                      setSelectedUser(null);
                      setPassword('');
                      setSelectedRoles(new Set());
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {selectedUser?.id ? t('settings.updateUser') : t('settings.createUser')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}