// features/settings/components/SettingsPage.tsx
import * as React from 'react';
import { useState } from 'react';
import { 
  Settings as SettingsIcon,
  Users,
  Shield,
  Bell,
  Globe,
  Database,
  Key,
  Lock,
  Palette,
  Terminal,
  FolderTree,
  Network,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { UsersManagement } from './UsersManagement';
import { RolesManagement } from './RolesManagement';
import { PermissionsTree } from './PermissionsTree';
import { SystemSettings } from './SystemSettings';
import { useTranslation } from '@/hooks/useTranslation';

const settingsSections = [
  {
    id: 'users',
    label: 'settings.users',
    icon: Users,
    description: 'settings.usersDescription',
    badge: 'Admin',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'roles',
    label: 'settings.roles',
    icon: Shield,
    description: 'settings.rolesDescription',
    badge: 'Advanced',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'permissions',
    label: 'settings.permissions',
    icon: Key,
    description: 'settings.permissionsDescription',
    badge: 'Advanced',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'system',
    label: 'settings.system',
    icon: Terminal,
    description: 'settings.systemDescription',
    badge: 'System',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'integrations',
    label: 'settings.integrations',
    icon: Network,
    description: 'settings.integrationsDescription',
    badge: 'Beta',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const stats = [
    { label: 'Total Users', value: '1,248', change: '+12%' },
    { label: 'Active Roles', value: '24', change: '+2' },
    { label: 'Permissions', value: '156', change: '+8' },
    { label: 'System Health', value: '98%', change: 'Stable' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('settings.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              {t('settings.exportConfig')}
            </Button>
            <Button size="sm">
              <Lock className="h-4 w-4 mr-2" />
              {t('settings.saveChanges')}
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-10 w-10 bg-primary/5 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary/70" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className={`lg:w-64 ${sidebarCollapsed ? 'lg:w-20' : ''} transition-all duration-200`}>
          <Card className="border-border bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <CardTitle className="text-lg">{t('settings.sections')}</CardTitle>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:flex hidden"
                >
                  {sidebarCollapsed ? '→' : '←'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <div className={`h-8 w-8 ${section.bgColor} rounded-lg flex items-center justify-center`}>
                    <section.icon className={`h-4 w-4 ${section.color}`} />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t(section.label)}</span>
                        <Badge variant="outline" className="text-xs">
                          {section.badge}
                        </Badge>
                      </div>
                      <p className="text-xs truncate">{t(section.description)}</p>
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Content Area */}
        <div className="flex-1">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 lg:grid-cols-5 mb-6">
                  {settingsSections.map((section) => (
                    <TabsTrigger key={section.id} value={section.id} className="gap-2">
                      <section.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t(section.label)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="users" className="space-y-6">
                  <UsersManagement />
                </TabsContent>
                
                <TabsContent value="roles" className="space-y-6">
                  <RolesManagement />
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-6">
                  <PermissionsTree />
                </TabsContent>
                
                <TabsContent value="system" className="space-y-6">
                  <SystemSettings />
                </TabsContent>
                
                <TabsContent value="integrations" className="space-y-6">
                  <div className="text-center py-12">
                    <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                      <Network className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t('settings.comingSoon')}</h3>
                    <p className="text-muted-foreground">
                      {t('settings.integrationsComingSoon')}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Settings Footer */}
          <div className="mt-6 text-center">
            <Separator className="mb-6" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>BIS Core Settings • v1.0.0 • Last updated: {new Date().toLocaleDateString()}</p>
              <p className="text-[10px]">All changes are logged and audited for security purposes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}