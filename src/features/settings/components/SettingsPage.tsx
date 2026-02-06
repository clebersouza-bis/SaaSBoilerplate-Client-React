// features/settings/components/SettingsPage.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  Globe,
  Lock,
  Terminal,
  Building2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { UsersManagement } from './UsersManagement';
import { RolesManagement } from './RolesManagement';
import { SystemSettings } from './SystemSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

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
    id: 'system',
    label: 'settings.system',
    icon: Terminal,
    description: 'settings.systemDescription',
    badge: 'System',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Estatísticas reais serão carregadas da API
  const [stats] = useState([
    { label: 'settings.totalUsers', value: '0', change: '+0%' },
    { label: 'settings.activeRoles', value: '0', change: '+0' },
    { label: 'settings.permissions', value: '0', change: '+0' },
    { label: 'settings.systemHealth', value: '100%', change: 'Stable' },
  ]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveTab(sectionId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden sticky top-0 z-30 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <SettingsIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{t('settings.title')}</h1>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {t('settings.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header Desktop */}
        {!isMobile && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {t('settings.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {t('settings.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('settings.exportConfig')}</span>
                </Button>
                <Button size="sm" className="gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('settings.saveChanges')}</span>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {t(stat.label)}
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <h3 className="text-xl sm:text-2xl font-bold truncate">
                            {stat.value}
                          </h3>
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            {stat.change}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary/70" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Stats */}
        {isMobile && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.slice(0, 2).map((stat, index) => (
              <Card key={index} className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t(stat.label)}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <h3 className="text-lg font-bold">{stat.value}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {stat.change}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-7 w-7 bg-primary/5 rounded-lg flex items-center justify-center">
                      <Building2 className="h-3.5 w-3.5 text-primary/70" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar Navigation */}
          <div className={cn(
            "lg:relative lg:z-0",
            isMobile
              ? "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-background border-r"
              : "lg:w-64",
            isMobile && !sidebarOpen && "-translate-x-full",
            !isMobile && sidebarCollapsed && "lg:w-20",
            !isMobile && "transition-all duration-200"
          )}>
            <Card className={cn(
              "border-border bg-card/50 backdrop-blur-sm h-full",
              isMobile && "border-0 rounded-none shadow-none"
            )}>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  {(!sidebarCollapsed || isMobile) && (
                    <CardTitle className="text-base lg:text-lg">
                      {t('settings.sections')}
                    </CardTitle>
                  )}
                  <div className="flex items-center gap-2">
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {!isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="hidden lg:flex"
                      >
                        {sidebarCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 lg:p-4">
                <div className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                        activeTab === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                        sidebarCollapsed && !isMobile && "justify-center"
                      )}
                    >
                      <div className={`h-7 w-7 lg:h-8 lg:w-8 ${section.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <section.icon className={`h-3.5 w-3.5 lg:h-4 lg:w-4 ${section.color}`} />
                      </div>
                      {(!sidebarCollapsed || isMobile) && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {t(section.label)}
                            </span>
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {section.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {t(section.description)}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Tabs Header */}
            {isMobile && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">
                    {t(settingsSections.find(s => s.id === activeTab)?.label || '')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Globe className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="h-8 w-8">
                      <Lock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    {settingsSections.map((section) => (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className="flex flex-col items-center gap-1 py-2 px-1"
                      >
                        <section.icon className="h-4 w-4" />
                        <span className="text-xs truncate max-w-full">
                          {t(section.label)}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Desktop Tabs */}
            {!isMobile && (
              <Card className="border-border bg-card/50 backdrop-blur-sm mb-6">
                <CardContent className="p-4 lg:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4 lg:mb-6">
                      {settingsSections.map((section) => (
                        <TabsTrigger
                          key={section.id}
                          value={section.id}
                          className="gap-2 py-2"
                        >
                          <section.icon className="h-4 w-4" />
                          <span>{t(section.label)}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="users" className="m-0 data-[state=inactive]:hidden">
                  <UsersManagement />
                </TabsContent>

                <TabsContent value="roles" className="m-0 data-[state=inactive]:hidden">
                  <RolesManagement />
                </TabsContent>

                <TabsContent value="system" className="m-0 data-[state=inactive]:hidden">
                  <SystemSettings />
                </TabsContent>
              </Tabs>
            </div>

            {/* Settings Footer */}
            {!isMobile && (
              <div className="mt-6 text-center">
                <Separator className="mb-4 lg:mb-6" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="text-sm">
                    BIS Core Settings • v1.0.0 • {t('settings.lastUpdated')}: {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-[10px] lg:text-xs">
                    {t('settings.auditNote')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Footer */}
        {isMobile && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>BIS Core Settings • v1.0.0</p>
              <p className="text-[10px]">
                {t('settings.lastUpdated')}: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}