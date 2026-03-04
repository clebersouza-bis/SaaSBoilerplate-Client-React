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
  Check,
  X,
  Save,
  Key,
  Info,
  AlertCircle,
  Globe
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
import { extractApiErrorMessage } from '@/lib/api/error-utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LANGUAGES } from '@/lib/i18n/config';

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
  userInviteDto?: {
    invitedBy: string;
    userId: string;
    tenantId: string;
    accept: boolean;
    acceptedAt: string;
    expiresAt: string;
  } | null;
}

interface ApiRole {
  id: string;
  name: string;
  isActive: boolean;
  isDefault?: boolean;
  description?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  active: boolean;
  language: string;
}

export function UsersManagement() {
  const { t, hasTranslation } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resendLoading, setResendLoading] = useState<string | null>(null);
  // Estados para dados da API
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('basic');

  // Estado para dados do formulário (controlled components)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    active: true,
    language: ''
  });

  // Carregar dados da API
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
      toast.error(t('common.errorLoadingData'), {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quando selecionar um user para editar
  useEffect(() => {
    if (selectedUser && showUserDialog) {
      const userRoles = new Set(
        selectedUser.userRoles?.map((ur: any) => ur.role.id) || []
      );
      setSelectedRoles(userRoles);

      // Preenche o formData com os dados do usuário
      setFormData({
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || '',
        active: selectedUser.active ?? true,
        language: selectedUser.language || ''
      });
    } else {
      setActiveTab('basic');
      // Reseta o formData quando criar novo usuário
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        active: true,
        language: ''
      });
    }
  }, [selectedUser, showUserDialog]);

  // Funções para atualizar o formData
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Função para reenviar convite
  const handleResendInvite = async (userId: string, email: string) => {
    setResendLoading(userId);
    try {
      await api.post(`/users/resend-invite`, { userId });
      toast.success(t('settings.inviteResent'), {
        description: t('settings.inviteResentDescription', { email }),
        duration: 3000,
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
    } catch (error) {
      console.error('Error resending invite:', error);
      toast.error(t('common.errorSendingInvite'), {
        duration: 3000,
      });
    } finally {
      setResendLoading(null);
    }
  };

  // Função auxiliar para verificar se tem convite pendente
  const hasPendingInvite = (user: ApiUser) => {
    return user.userInviteDto !== null && !user.userInviteDto?.accept;
  };

  const handleEditUser = (user: ApiUser) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(t('settings.confirmDeleteUser'))) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success(t('settings.userDeleted'), {
        description: t('settings.userDeletedDescription', { email: formData.email }),
        duration: 3000,
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('settings.errorDeletingUser'), {
        description: t('settings.errorDeletingUserDescription', { email: formData.email }),
        duration: 3000,
      });
    }
  };

  const handleToggleStatus = async (user: ApiUser) => {
    try {
      await api.patch(`/users/${user.id}`, {
        active: !user.active
      });
      toast.success(user.active ? t('settings.userDeactivated') : t('settings.userActivated'), {
        description: t('settings.userStatusChangedDescription', { email: user.email }),
        duration: 3000,
      });
      await loadData();
    } catch (error) {
      toast.error(t('settings.errorUpdatingUser'), {
        description: t('settings.errorUpdatingUserDescription', { email: user.email }),
        duration: 3000,
      });
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
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      toast.error(t('settings.nameRequired'), {
        duration: 3000,
      });
      return;
    }

    if (!formData.email?.trim()) {
      toast.error(t('settings.emailRequired'), {
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const userData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        active: formData.active,
        roleIds: Array.from(selectedRoles),
        language: formData.language || null
      };

      if (selectedUser?.id) {
        await api.put(`/users/${selectedUser.id}`, userData);

        toast.success(t('settings.userUpdated'), {
          description: t('settings.userUpdatedDescription', { email: formData.email }),
          duration: 3000,
          className: "bg-blue-50 border-blue-200 text-blue-800",
        });
      } else {
        await api.post('/users', userData);
        toast.success(t('settings.userCreated'), {
          description: t('settings.userCreatedDescription', { email: formData.email }),
          duration: 5000,
          className: "bg-blue-50 border-blue-200 text-blue-800",
        });
      }

      setShowUserDialog(false);
      setSelectedUser(null);
      setSelectedRoles(new Set());
      setTimeout(async () => {
        await loadData();
      }, 1000);

    } catch (error) {
      console.error('Error saving user:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4" />
            {t('settings.addUser')}
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
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className={`h-8 w-8 sm:h-10 sm:w-10 ${stat.color.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2 text-sm sm:text-base">
                <Search className="h-4 w-4" />
                {t('common.search')}
              </Label>
              <Input
                id="search"
                placeholder={t('settings.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 sm:h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm sm:text-base">
                <Shield className="h-4 w-4" />
                {t('settings.filterByRole')}
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-9 sm:h-10">
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
              <Label className="flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4" />
                {t('common.status')}
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 sm:h-10">
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

      {/* Users Table */}
      <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">{t('settings.usersList')}</CardTitle>
            <Badge variant="outline" className="w-fit">
              {filteredUsers.length} {t('settings.users')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="min-w-[200px] sm:min-w-[250px]">{t('settings.user')}</TableHead>
                  <TableHead className="min-w-[180px] sm:min-w-[200px]">{t('settings.contact')}</TableHead>
                  <TableHead className="min-w-[150px]">{t('settings.role')}</TableHead>
                  <TableHead className="min-w-[100px]">{t('common.status')}</TableHead>
                  <TableHead className="min-w-[120px] sm:min-w-[150px]">{t('settings.lastLogin')}</TableHead>
                  <TableHead className="text-right min-w-[80px]">{t('common.actions')}</TableHead>
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
                          <div className="min-w-0">
                            <p className="font-medium truncate text-sm sm:text-base">{user.firstName} {user.lastName}</p>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {user.emailConfirmed ? (
                                <Badge className="bg-green-500/10 text-green-600 text-xs px-1.5 py-0.5">
                                  <Check className="h-2.5 w-2.5 mr-1" />
                                  Email
                                </Badge>
                              ) : (
                                <>
                                  <Badge className="bg-yellow-500/10 text-yellow-600 text-xs px-1.5 py-0.5">
                                    <X className="h-2.5 w-2.5 mr-1" />
                                    Email
                                  </Badge>
                                  {hasPendingInvite(user) && (
                                    <Badge className="bg-blue-500/10 text-blue-600 text-xs px-1.5 py-0.5 border-blue-200">
                                      <Mail className="h-2.5 w-2.5 mr-1" />
                                      {t('settings.invitePending')}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{user.phone}</span>
                              {user.phoneConfirmed && (
                                <Badge className="bg-green-500/10 text-green-600 text-xs px-1 py-0 flex-shrink-0">
                                  <Check className="h-2 w-2" />
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.userRoles?.slice(0, 2).map((ur: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 truncate max-w-[80px]">
                              {ur.role.name}
                            </Badge>
                          ))}
                          {user.userRoles && user.userRoles.length > 2 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              +{user.userRoles.length - 2}
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
                          <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">
                            {t('settings.active')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-muted text-xs">
                            {t('settings.inactive')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div className="text-xs sm:text-sm space-y-0.5">
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
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={() => handleEditUser(user)}
                            title={t('settings.editUser')}
                          >
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 sm:w-56">
                              {hasPendingInvite(user) && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleResendInvite(user.id, user.email)}
                                    disabled={resendLoading === user.id}
                                    className={`cursor-pointer gap-2 text-xs sm:text-sm ${resendLoading === user.id
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'text-blue-600 hover:text-blue-700'
                                      }`}
                                  >
                                    {resendLoading === user.id ? (
                                      <>
                                        <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                        <span>{t('common.sending')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span>{t('settings.resendInvite')}</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user)}
                                className="cursor-pointer gap-2 text-xs sm:text-sm"
                              >
                                {user.active ? (
                                  <>
                                    <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    {t('settings.deactivate')}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    {t('settings.activate')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="cursor-pointer gap-2 text-red-600 text-xs sm:text-sm"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          </div>
        </CardContent>
      </Card>

      {/* User Dialog */}
      {showUserDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <Card className="w-full max-w-5xl bg-card border-border max-h-[90vh] overflow-hidden shadow-2xl mx-2 sm:mx-4">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-10 bg-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/20">
                    <AvatarImage src={selectedUser?.photoPath} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-lg font-semibold">
                      {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl truncate">
                      {selectedUser?.id
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : t('settings.createUserDescription')
                      }
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm truncate">
                      {selectedUser?.id
                        ? t('settings.editUserDescription')
                        : t('settings.createUserDescription')
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {selectedUser?.id && (
                    <Badge variant={selectedUser.active ? "default" : "secondary"} className="text-xs">
                      {selectedUser.active ? t('settings.active') : t('settings.inactive')}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUserDialog(false);
                      setSelectedUser(null);
                      setSelectedRoles(new Set());
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="h-[calc(90vh-280px)] sm:h-[calc(90vh-220px)] md:h-[calc(90vh-200px)] lg:h-[calc(90vh-180px)]">
              <CardContent className="p-4 sm:p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                  <TabsList className="grid grid-cols-2 w-full h-auto p-1 sticky top-0 bg-card z-10">
                    <TabsTrigger value="basic" className="flex-col h-auto py-3 px-1 gap-1 text-xs sm:text-sm">
                      <User className="h-4 w-4 mb-1" />
                      <span className="truncate">{t('settings.basicInfo')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex-col h-auto py-3 px-1 gap-1 text-xs sm:text-sm">
                      <Shield className="h-4 w-4 mb-1" />
                      <span className="truncate">{t('settings.roles')}</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB: Informações Básicas */}
                  <TabsContent value="basic" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Coluna Esquerda */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            {t('settings.firstName')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="first-name"
                            placeholder={t('settings.firstNamePlaceholder')}
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
                            className="h-9 sm:h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4" />
                            {t('settings.email')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="user@company.com"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className="h-9 sm:h-10"
                            disabled={!!selectedUser?.id}
                          />
                          {selectedUser?.emailConfirmed && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {t('settings.emailConfirmed')}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            {t('settings.phone')}
                          </Label>
                          <Input
                            id="phone"
                            placeholder="+(999) 999-9999"
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            className="h-9 sm:h-10"
                          />
                          {selectedUser?.phoneConfirmed && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {t('settings.phoneConfirmed')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Coluna Direita */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            {t('settings.lastName')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="last-name"
                            placeholder={t('settings.lastNamePlaceholder')}
                            value={formData.lastName}
                            onChange={(e) => updateFormData('lastName', e.target.value)}
                            className="h-9 sm:h-10"
                          />
                        </div>

                        {/* Campo de Idioma */}
                        <div className="space-y-2">
                          <Label htmlFor="language" className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4" />
                            {t('settings.language')}
                          </Label>
                          <Select
                            value={formData.language}
                            onValueChange={(value) => updateFormData('language', value)}
                          >
                            <SelectTrigger className="h-9 sm:h-10">
                              <SelectValue placeholder={t('settings.selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  <div className="flex items-center gap-2">
                                    <span>{lang.flag}</span>
                                    <span>{lang.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg gap-3">
                          <div className="space-y-1 flex-1">
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
                          <div className="flex-shrink-0">
                            <Switch
                              id="is-active"
                              checked={formData.active}
                              onCheckedChange={(checked) => updateFormData('active', checked)}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>

                        {/* Informações de criação */}
                        {selectedUser?.id && (
                          <div className="space-y-2 text-xs sm:text-sm p-3 bg-muted/20 rounded-lg">
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
                      <Alert className="text-xs sm:text-sm">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          {t('settings.userCreationNotice')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* TAB: Roles */}
                  <TabsContent value="roles" className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold">{t('settings.assignRoles')}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {t('settings.roleAssignmentDescription')}
                          </p>
                        </div>
                        <Badge variant="outline" className="w-fit text-xs sm:text-sm">
                          {selectedRoles.size} {t('settings.selected')}
                        </Badge>
                      </div>

                      {roles.length === 0 ? (
                        <div className="border rounded-lg p-6 text-center">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium text-sm sm:text-base">
                            {t('settings.noRolesAvailable')}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {t('settings.createRolesFirst')}
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[300px] sm:h-[350px] pr-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {roles.map((role) => (
                              <Card
                                key={role.id}
                                className={`cursor-pointer transition-all hover:border-primary/50 ${selectedRoles.has(role.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border'
                                  }`}
                                onClick={() => handleToggleRole(role.id)}
                              >
                                <CardContent className="p-3 sm:p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedRoles.has(role.id)
                                          ? 'bg-primary/10 text-primary'
                                          : 'bg-muted text-muted-foreground'
                                          }`}>
                                          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                            <h4 className="font-medium text-sm sm:text-base truncate">{role.name}</h4>
                                            {role.isDefault && (
                                              <Badge variant="outline" className="text-xs px-1.5 py-0">
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
                                    <div
                                      className="flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleRole(role.id);
                                      }}
                                    >
                                      <Switch
                                        checked={selectedRoles.has(role.id)}
                                        onCheckedChange={() => handleToggleRole(role.id)}
                                        className="data-[state=checked]:bg-primary h-5 w-9 sm:h-6 sm:w-11"
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </ScrollArea>

            {/* Footer do Modal */}
            <div className="border-t bg-muted/20 p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                {/* Texto informativo */}
                <div className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                  {selectedUser?.id ? (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="truncate max-w-[180px] sm:max-w-none">
                        {t('settings.editingUser')}: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{t('settings.creatingNewUser')}</span>
                    </div>
                  )}
                </div>

                {/* BOTÕES */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserDialog(false);
                      setSelectedUser(null);
                      setSelectedRoles(new Set());
                    }}
                    className="w-full sm:w-auto min-w-[100px] px-4 h-10 sm:h-11 text-sm gap-2 flex-1 sm:flex-none"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    disabled={isSaving}
                    className="w-full sm:w-auto min-w-[120px] px-4 h-10 sm:h-11 text-sm gap-2 flex-1 sm:flex-none"
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
      {resendLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <Card className="bg-card p-6 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">{t('common.sendingInvite')}</p>
              <p className="text-xs text-muted-foreground">{t('common.loadingPleaseWait')}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}