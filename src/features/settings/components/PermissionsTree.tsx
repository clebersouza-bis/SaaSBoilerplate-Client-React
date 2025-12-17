// features/settings/components/PermissionsTree.tsx
import * as React from 'react';
import { useState } from 'react';
import { 
  FolderTree,
  Search,
  Filter,
  Key,
  Check,
  X,
  Plus,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/hooks/useTranslation';

// Mock data - estrutura hierárquica de permissions
const permissionCategories = [
  {
    id: 'customers',
    name: 'Customers',
    description: 'Customer management permissions',
    icon: '👥',
    permissions: [
      { id: 'customers.create', name: 'Create Customers', description: 'Can create new customers' },
      { id: 'customers.read', name: 'Read Customers', description: 'Can view customer information' },
      { id: 'customers.update', name: 'Update Customers', description: 'Can update customer details' },
      { id: 'customers.delete', name: 'Delete Customers', description: 'Can delete customers' },
      { id: 'customers.export', name: 'Export Customers', description: 'Can export customer data' },
    ],
  },
  {
    id: 'rooms',
    name: 'Rooms',
    description: 'Room management permissions',
    icon: '🏨',
    permissions: [
      { id: 'rooms.manage', name: 'Manage Rooms', description: 'Can manage all rooms' },
      { id: 'rooms.clean', name: 'Clean Rooms', description: 'Can mark rooms as clean' },
      { id: 'rooms.inspect', name: 'Inspect Rooms', description: 'Can inspect room quality' },
      { id: 'rooms.maintenance', name: 'Room Maintenance', description: 'Can schedule maintenance' },
    ],
  },
  {
    id: 'settings',
    name: 'System Settings',
    description: 'System configuration permissions',
    icon: '⚙️',
    permissions: [
      { id: 'settings.view', name: 'View Settings', description: 'Can view system settings' },
      { id: 'settings.manage', name: 'Manage Settings', description: 'Can modify system settings' },
      { id: 'settings.users', name: 'Manage Users', description: 'Can manage system users' },
      { id: 'settings.roles', name: 'Manage Roles', description: 'Can manage user roles' },
      { id: 'settings.permissions', name: 'Manage Permissions', description: 'Can modify permissions' },
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Reporting and analytics permissions',
    icon: '📊',
    permissions: [
      { id: 'reports.view', name: 'View Reports', description: 'Can view all reports' },
      { id: 'reports.generate', name: 'Generate Reports', description: 'Can generate new reports' },
      { id: 'reports.export', name: 'Export Reports', description: 'Can export report data' },
      { id: 'analytics.view', name: 'View Analytics', description: 'Can view analytics dashboard' },
    ],
  },
  {
    id: 'billing',
    name: 'Billing & Finance',
    description: 'Billing and financial permissions',
    icon: '💰',
    permissions: [
      { id: 'billing.view', name: 'View Billing', description: 'Can view billing information' },
      { id: 'billing.manage', name: 'Manage Billing', description: 'Can manage billing operations' },
      { id: 'invoices.create', name: 'Create Invoices', description: 'Can create new invoices' },
      { id: 'payments.process', name: 'Process Payments', description: 'Can process payments' },
    ],
  },
];

export function PermissionsTree() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['customers', 'settings']);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState('New Role');
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };
  
  const selectAllInCategory = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const allSelected = category.permissions.every(p => selectedPermissions.includes(p.id));
    
    if (allSelected) {
      // Deselect all
      setSelectedPermissions(prev => prev.filter(id => 
        !category.permissions.some(p => p.id === id)
      ));
    } else {
      // Select all
      setSelectedPermissions(prev => [
        ...prev,
        ...category.permissions.map(p => p.id).filter(id => !prev.includes(id))
      ]);
    }
  };
  
  const selectAll = () => {
    const allPermissionIds = permissionCategories.flatMap(c => c.permissions.map(p => p.id));
    const allSelected = allPermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissionIds);
    }
  };
  
  const filteredCategories = permissionCategories.map(category => ({
    ...category,
    permissions: category.permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    category.permissions.length > 0 ||
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('settings.permissions')}</h2>
          <p className="text-muted-foreground">
            {t('settings.permissionsManagementDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {t('common.export')}
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('settings.newRole')}
          </Button>
        </div>
      </div>
      
      {/* Role Configuration */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('settings.roleConfiguration')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.roleName')}</label>
              <Input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.roleDescription')}</label>
              <Input
                placeholder="Enter role description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.permissionsCount')}</label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-bold text-xl">{selectedPermissions.length}</div>
                  <div className="text-xs text-muted-foreground">
                    {t('settings.permissionsSelected')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Search & Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('settings.searchPermissions')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.filterByCategory')}</label>
              <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm">
                <option value="all">{t('settings.allCategories')}</option>
                {permissionCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.actions')}</label>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={selectAll}
              >
                {selectedPermissions.length > 0 ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {selectedPermissions.length > 0 
                  ? t('settings.deselectAll') 
                  : t('settings.selectAll')}
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.bulkActions')}</label>
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
      
      {/* Permissions Tree */}
      <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {t('settings.permissionsTree')}
            </CardTitle>
            <Badge variant="outline">
              {selectedPermissions.length} {t('settings.selected')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredCategories.map(category => (
              <div key={category.id} className="border border-border rounded-lg overflow-hidden">
                {/* Category Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <div className="font-semibold">{category.name}</div>
                      <div className="text-xs text-muted-foreground">{category.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {category.permissions.length} {t('settings.permissions')}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllInCategory(category.id);
                      }}
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      {category.permissions.every(p => selectedPermissions.includes(p.id))
                        ? t('settings.deselectAll')
                        : t('settings.selectAll')}
                    </button>
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {/* Permissions List */}
                {expandedCategories.includes(category.id) && (
                  <div className="p-4 space-y-3">
                    {category.permissions.map(permission => (
                      <div 
                        key={permission.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedPermissions.includes(permission.id)
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <Checkbox
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                          className="h-5 w-5"
                        />
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            <Key className="h-3 w-3 text-muted-foreground" />
                            {permission.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </div>
                          <div className="text-xs font-mono bg-muted px-2 py-0.5 rounded inline-block mt-2">
                            {permission.id}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {selectedPermissions.includes(permission.id) 
                            ? t('settings.granted') 
                            : t('settings.denied')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          {t('common.cancel')}
        </Button>
        <Button>
          <Lock className="h-4 w-4 mr-2" />
          {t('settings.saveRole')}
        </Button>
      </div>
    </div>
  );
}