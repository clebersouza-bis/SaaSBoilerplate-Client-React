// features/settings/components/UsersManagement.tsx
import * as React from 'react';
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
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
  Download,
  Key
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

// Mock data - substituir por dados reais da API
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@bis.com',
    role: 'Administrator',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    permissions: 24,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@bis.com',
    role: 'Manager',
    status: 'active',
    lastLogin: '2024-01-14T15:45:00Z',
    permissions: 18,
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert@bis.com',
    role: 'Analyst',
    status: 'inactive',
    lastLogin: '2024-01-10T09:20:00Z',
    permissions: 12,
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily@bis.com',
    role: 'Viewer',
    status: 'active',
    lastLogin: '2024-01-15T08:15:00Z',
    permissions: 8,
  },
];

export function UsersManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const roles = ['Administrator', 'Manager', 'Analyst', 'Viewer'];
  
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });
  
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm(t('settings.confirmDeleteUser'))) {
      console.log('Delete user:', userId);
    }
  };
  
  const handleToggleStatus = (user: any) => {
    console.log('Toggle status for user:', user.id);
  };
  
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
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {t('common.export')}
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowUserDialog(true)}>
            <UserPlus className="h-4 w-4" />
            {t('settings.addUser')}
          </Button>
        </div>
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
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t('settings.allRoles')}</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.status')}</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t('settings.allStatus')}</option>
                <option value="active">{t('settings.active')}</option>
                <option value="inactive">{t('settings.inactive')}</option>
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
                <TableHead>{t('settings.role')}</TableHead>
                <TableHead>{t('settings.status')}</TableHead>
                <TableHead>{t('settings.permissions')}</TableHead>
                <TableHead>{t('settings.lastLogin')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
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
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.status === 'active' ? (
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
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{user.permissions}</span>
                        <span className="text-xs text-muted-foreground">
                          {t('settings.permissionsCount')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                            {user.status === 'active' ? (
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
      
      {/* User Dialog (será implementado) */}
      {showUserDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Implementar UserDialog component */}
          <Card className="w-full max-w-2xl bg-card border-border">
            <CardHeader>
              <CardTitle>
                {selectedUser ? t('settings.editUser') : t('settings.addUser')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                User dialog implementation coming soon...
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={() => setShowUserDialog(false)}>
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}