// features/settings/components/SettingsPage.tsx - VERSÃO CORRIGIDA
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    activeBgColor: 'bg-blue-500/20',
  },
  {
    id: 'roles',
    label: 'settings.roles',
    icon: Shield,
    description: 'settings.rolesDescription',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    activeBgColor: 'bg-purple-500/20',
  },
  {
    id: 'system',
    label: 'settings.system',
    icon: Terminal,
    description: 'settings.systemDescription',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    activeBgColor: 'bg-orange-500/20',
  },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('users');
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
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
                  {/* <p className="text-sm sm:text-base text-muted-foreground">
                    {t('settings.subtitle')}
                  </p> */}
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
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Desktop Tabs - VERSÃO SIMPLIFICADA */}
          {!isMobile && (
            <Card className="border-border bg-card/50 backdrop-blur-sm mb-6 shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 gap-3 bg-background p-2 rounded-lg">
                    {settingsSections.map((section) => (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className={cn(
                          "relative px-4 py-3 rounded-md transition-all",
                          "flex items-center justify-center gap-3",
                          "data-[state=active]:shadow-sm",
                          activeTab === section.id
                            ? `${section.activeBgColor} text-foreground`
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          activeTab === section.id
                            ? section.activeBgColor
                            : section.bgColor
                        )}>
                          <section.icon className={cn(
                            "h-4 w-4",
                            activeTab === section.id
                              ? section.iconColor
                              : "text-muted-foreground"
                          )} />
                        </div>
                        <span className="font-medium">
                          {t(section.label)}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                
                {/* Descrição da seção ativa */}
                {/* <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center",
                      settingsSections.find(s => s.id === activeTab)?.bgColor
                    )}>
                      {settingsSections.find(s => s.id === activeTab)?.icon && 
                        React.createElement(settingsSections.find(s => s.id === activeTab)!.icon, {
                          className: cn(
                            "h-4 w-4",
                            settingsSections.find(s => s.id === activeTab)?.iconColor
                          )
                        })
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {t(settingsSections.find(s => s.id === activeTab)?.label || '')}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(settingsSections.find(s => s.id === activeTab)?.description || '')}
                      </p>
                    </div>
                  </div>
                </div> */}
              </CardContent>
            </Card>
          )}

          {/* Mobile Tabs */}
          {isMobile && (
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full bg-background p-1 rounded-lg mb-4">
                  {settingsSections.map((section) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className={cn(
                        "flex flex-col items-center gap-1 py-2 px-1 rounded-md",
                        "data-[state=active]:shadow-sm",
                        activeTab === section.id
                          ? `${section.activeBgColor}`
                          : "hover:bg-muted/50"
                      )}
                    >
                      <section.icon className={cn(
                        "h-4 w-4",
                        activeTab === section.id
                          ? section.iconColor
                          : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-xs font-medium",
                        activeTab === section.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}>
                        {t(section.label)}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              {/* Header mobile */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {t(settingsSections.find(s => s.id === activeTab)?.label || '')}
                  </h2>
                  {/* <p className="text-sm text-muted-foreground">
                    {t(settingsSections.find(s => s.id === activeTab)?.description || '')}
                  </p> */}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="h-8 w-8">
                    <Lock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
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
            <div className="mt-8 text-center">
              <Separator className="mb-4" />
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
    </div>
  );
}