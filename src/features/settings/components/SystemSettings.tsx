// features/settings/components/SystemSettings.tsx
import * as React from 'react';
import { useState } from 'react';
import { 
  Save,
  RefreshCw,
  Database,
  Server,
  Shield,
  Globe,
  Bell,
  Mail,
  Lock,
  Palette,
  Clock,
  FileText,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SystemSettings() {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    appName: 'BIS Hotel Management',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    language: 'en',
    
    // Security Settings
    require2FA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordComplexity: 'medium',
    enableAuditLog: true,
    
    // Email Settings
    smtpHost: 'smtp.bis.com',
    smtpPort: '587',
    smtpUser: 'noreply@bis.com',
    emailFrom: 'noreply@bis.com',
    emailNotifications: true,
    
    // Performance Settings
    cacheEnabled: true,
    cacheDuration: 300,
    maxUploadSize: 10,
    compressionEnabled: true,
    
    // Maintenance Settings
    maintenanceMode: false,
    backupFrequency: 'daily',
    autoUpdate: true,
    debugMode: false,
  });
  
  const systemHealth = {
    status: 'healthy',
    uptime: '15 days, 6 hours',
    cpuUsage: 42,
    memoryUsage: 68,
    diskUsage: 45,
    activeSessions: 124,
    lastBackup: '2024-01-15 02:00:00',
  };
  
  const recentActivities = [
    { id: 1, action: 'User login', user: 'admin@bis.com', timestamp: '2 minutes ago', ip: '192.168.1.100' },
    { id: 2, action: 'Settings updated', user: 'john@bis.com', timestamp: '15 minutes ago', ip: '192.168.1.101' },
    { id: 3, action: 'Customer created', user: 'jane@bis.com', timestamp: '1 hour ago', ip: '192.168.1.102' },
    { id: 4, action: 'Role modified', user: 'admin@bis.com', timestamp: '3 hours ago', ip: '192.168.1.100' },
    { id: 5, action: 'Backup completed', user: 'System', timestamp: 'Yesterday', ip: '127.0.0.1' },
  ];
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      console.log('Settings saved:', settings);
    }, 1500);
  };
  
  const handleResetSettings = () => {
    if (window.confirm(t('settings.confirmResetSettings'))) {
      console.log('Reset settings');
    }
  };
  
  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <div className="space-y-6">
    </div>

    // <div className="space-y-6">
    //   {/* Header */}
    //   <div className="flex items-center justify-between">
    //     <div>
    //       <h2 className="text-2xl font-bold tracking-tight">{t('settings.system')}</h2>
    //       <p className="text-muted-foreground">
    //         {t('settings.systemSettingsDescription')}
    //       </p>
    //     </div>
    //     <div className="flex items-center gap-2">
    //       <Button variant="outline" size="sm" className="gap-2" onClick={handleResetSettings}>
    //         <RefreshCw className="h-4 w-4" />
    //         {t('settings.resetDefaults')}
    //       </Button>
    //       <Button size="sm" className="gap-2" onClick={handleSaveSettings} disabled={isSaving}>
    //         {isSaving ? (
    //           <>
    //             <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
    //             {t('status.saving')}
    //           </>
    //         ) : (
    //           <>
    //             <Save className="h-4 w-4" />
    //             {t('settings.saveChanges')}
    //           </>
    //         )}
    //       </Button>
    //     </div>
    //   </div>
      
    //   {/* System Health */}
    //   <Card className="border-border bg-card/50 backdrop-blur-sm">
    //     <CardHeader className="pb-3">
    //       <div className="flex items-center justify-between">
    //         <CardTitle className="flex items-center gap-2">
    //           <Cpu className="h-5 w-5 text-green-500" />
    //           {t('settings.systemHealth')}
    //         </CardTitle>
    //         <Badge className="bg-green-500/10 text-green-600">
    //           <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
    //           {t('settings.healthy')}
    //         </Badge>
    //       </div>
    //     </CardHeader>
    //     <CardContent>
    //       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    //         <div className="space-y-2">
    //           <div className="text-sm text-muted-foreground">{t('settings.uptime')}</div>
    //           <div className="font-semibold flex items-center gap-2">
    //             <Clock className="h-4 w-4 text-primary" />
    //             {systemHealth.uptime}
    //           </div>
    //         </div>
            
    //         <div className="space-y-2">
    //           <div className="text-sm text-muted-foreground">{t('settings.cpuUsage')}</div>
    //           <div className="font-semibold">
    //             {systemHealth.cpuUsage}%
    //             <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-1">
    //               <div 
    //                 className="bg-blue-500 h-full"
    //                 style={{ width: `${systemHealth.cpuUsage}%` }}
    //               />
    //             </div>
    //           </div>
    //         </div>
            
    //         <div className="space-y-2">
    //           <div className="text-sm text-muted-foreground">{t('settings.memoryUsage')}</div>
    //           <div className="font-semibold">
    //             {systemHealth.memoryUsage}%
    //             <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-1">
    //               <div 
    //                 className="bg-purple-500 h-full"
    //                 style={{ width: `${systemHealth.memoryUsage}%` }}
    //               />
    //             </div>
    //           </div>
    //         </div>
            
    //         <div className="space-y-2">
    //           <div className="text-sm text-muted-foreground">{t('settings.diskUsage')}</div>
    //           <div className="font-semibold">
    //             {systemHealth.diskUsage}%
    //             <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-1">
    //               <div 
    //                 className="bg-orange-500 h-full"
    //                 style={{ width: `${systemHealth.diskUsage}%` }}
    //               />
    //             </div>
    //           </div>
    //         </div>
            
    //         <div className="space-y-2">
    //           <div className="text-sm text-muted-foreground">{t('settings.activeSessions')}</div>
    //           <div className="font-semibold flex items-center gap-2">
    //             <Globe className="h-4 w-4 text-green-500" />
    //             {systemHealth.activeSessions}
    //           </div>
    //         </div>
            
    //         <div className="space-y-2">
    //           <div className="text-sm text-muted-foreground">{t('settings.lastBackup')}</div>
    //           <div className="font-semibold text-sm">
    //             {systemHealth.lastBackup}
    //           </div>
    //         </div>
    //       </div>
    //     </CardContent>
    //   </Card>
      
    //   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     {/* Left Column - General & Security Settings */}
    //     <div className="lg:col-span-2 space-y-6">
    //       {/* General Settings */}
    //       <Card className="border-border bg-card/50 backdrop-blur-sm">
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <Globe className="h-5 w-5 text-primary" />
    //             {t('settings.generalSettings')}
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-4">
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="appName">{t('settings.applicationName')}</Label>
    //               <Input
    //                 id="appName"
    //                 value={settings.appName}
    //                 onChange={(e) => handleInputChange('appName', e.target.value)}
    //               />
    //             </div>
                
    //             <div className="space-y-2">
    //               <Label htmlFor="timezone">{t('settings.timezone')}</Label>
    //               <Select
    //                 value={settings.timezone}
    //                 onValueChange={(value) => handleInputChange('timezone', value)}
    //               >
    //                 <SelectTrigger id="timezone">
    //                   <SelectValue placeholder="Select timezone" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (BR)</SelectItem>
    //                   <SelectItem value="America/New_York">America/New_York (US)</SelectItem>
    //                   <SelectItem value="Europe/London">Europe/London (UK)</SelectItem>
    //                   <SelectItem value="Asia/Tokyo">Asia/Tokyo (JP)</SelectItem>
    //                 </SelectContent>
    //               </Select>
    //             </div>
    //           </div>
              
    //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="dateFormat">{t('settings.dateFormat')}</Label>
    //               <Select
    //                 value={settings.dateFormat}
    //                 onValueChange={(value) => handleInputChange('dateFormat', value)}
    //               >
    //                 <SelectTrigger id="dateFormat">
    //                   <SelectValue placeholder="Select format" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
    //                   <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
    //                   <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
    //                 </SelectContent>
    //               </Select>
    //             </div>
                
    //             <div className="space-y-2">
    //               <Label htmlFor="timeFormat">{t('settings.timeFormat')}</Label>
    //               <Select
    //                 value={settings.timeFormat}
    //                 onValueChange={(value) => handleInputChange('timeFormat', value)}
    //               >
    //                 <SelectTrigger id="timeFormat">
    //                   <SelectValue placeholder="Select format" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="24h">24-hour</SelectItem>
    //                   <SelectItem value="12h">12-hour</SelectItem>
    //                 </SelectContent>
    //               </Select>
    //             </div>
                
    //             <div className="space-y-2">
    //               <Label htmlFor="language">{t('settings.language')}</Label>
    //               <Select
    //                 value={settings.language}
    //                 onValueChange={(value) => handleInputChange('language', value)}
    //               >
    //                 <SelectTrigger id="language">
    //                   <SelectValue placeholder="Select language" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="en">English</SelectItem>
    //                   <SelectItem value="pt">Português</SelectItem>
    //                   <SelectItem value="es">Español</SelectItem>
    //                 </SelectContent>
    //               </Select>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
          
    //       {/* Security Settings */}
    //       <Card className="border-border bg-card/50 backdrop-blur-sm">
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <Shield className="h-5 w-5 text-red-500" />
    //             {t('settings.securitySettings')}
    //             <Badge variant="outline" className="ml-2">Critical</Badge>
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-4">
    //           <div className="space-y-4">
    //             <div className="flex items-center justify-between">
    //               <div className="space-y-0.5">
    //                 <Label htmlFor="require2FA">{t('settings.require2FA')}</Label>
    //                 <p className="text-sm text-muted-foreground">
    //                   {t('settings.require2FADescription')}
    //                 </p>
    //               </div>
    //               <Switch
    //                 id="require2FA"
    //                 checked={settings.require2FA}
    //                 onCheckedChange={(checked) => handleInputChange('require2FA', checked)}
    //               />
    //             </div>
                
    //             <div className="flex items-center justify-between">
    //               <div className="space-y-0.5">
    //                 <Label htmlFor="enableAuditLog">{t('settings.enableAuditLog')}</Label>
    //                 <p className="text-sm text-muted-foreground">
    //                   {t('settings.enableAuditLogDescription')}
    //                 </p>
    //               </div>
    //               <Switch
    //                 id="enableAuditLog"
    //                 checked={settings.enableAuditLog}
    //                 onCheckedChange={(checked) => handleInputChange('enableAuditLog', checked)}
    //               />
    //             </div>
    //           </div>
              
    //           <Separator />
              
    //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="sessionTimeout">{t('settings.sessionTimeout')} (min)</Label>
    //               <Input
    //                 id="sessionTimeout"
    //                 type="number"
    //                 value={settings.sessionTimeout}
    //                 onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
    //               />
    //             </div>
                
    //             <div className="space-y-2">
    //               <Label htmlFor="maxLoginAttempts">{t('settings.maxLoginAttempts')}</Label>
    //               <Input
    //                 id="maxLoginAttempts"
    //                 type="number"
    //                 value={settings.maxLoginAttempts}
    //                 onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
    //               />
    //             </div>
                
    //             <div className="space-y-2">
    //               <Label htmlFor="passwordComplexity">{t('settings.passwordComplexity')}</Label>
    //               <Select
    //                 value={settings.passwordComplexity}
    //                 onValueChange={(value) => handleInputChange('passwordComplexity', value)}
    //               >
    //                 <SelectTrigger id="passwordComplexity">
    //                   <SelectValue />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="low">{t('settings.low')}</SelectItem>
    //                   <SelectItem value="medium">{t('settings.medium')}</SelectItem>
    //                   <SelectItem value="high">{t('settings.high')}</SelectItem>
    //                   <SelectItem value="very-high">{t('settings.veryHigh')}</SelectItem>
    //                 </SelectContent>
    //               </Select>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
          
    //       {/* Email Settings */}
    //       <Card className="border-border bg-card/50 backdrop-blur-sm">
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <Mail className="h-5 w-5 text-blue-500" />
    //             {t('settings.emailSettings')}
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-4">
    //           <div className="flex items-center justify-between mb-4">
    //             <div className="space-y-0.5">
    //               <Label htmlFor="emailNotifications">{t('settings.emailNotifications')}</Label>
    //               <p className="text-sm text-muted-foreground">
    //                 {t('settings.emailNotificationsDescription')}
    //               </p>
    //             </div>
    //             <Switch
    //               id="emailNotifications"
    //               checked={settings.emailNotifications}
    //               onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
    //             />
    //           </div>
              
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="smtpHost">{t('settings.smtpHost')}</Label>
    //               <Input
    //                 id="smtpHost"
    //                 value={settings.smtpHost}
    //                 onChange={(e) => handleInputChange('smtpHost', e.target.value)}
    //               />
    //             </div>
                
    //             <div className="space-y-2">
    //               <Label htmlFor="smtpPort">{t('settings.smtpPort')}</Label>
    //               <Input
    //                 id="smtpPort"
    //                 value={settings.smtpPort}
    //                 onChange={(e) => handleInputChange('smtpPort', e.target.value)}
    //               />
    //             </div>
    //           </div>
              
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="smtpUser">{t('settings.smtpUser')}</Label>
    //               <Input
    //                 id="smtpUser"
    //                 value={settings.smtpUser}
    //                 onChange={(e) => handleInputChange('smtpUser', e.target.value)}
    //               />
    //             </div>
                
    //             <div className="space-y-2">
    //               <Label htmlFor="emailFrom">{t('settings.emailFrom')}</Label>
    //               <Input
    //                 id="emailFrom"
    //                 value={settings.emailFrom}
    //                 onChange={(e) => handleInputChange('emailFrom', e.target.value)}
    //               />
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </div>
        
    //     {/* Right Column - System Info & Recent Activity */}
    //     <div className="space-y-6">
    //       {/* System Information */}
    //       <Card className="border-border bg-card/50 backdrop-blur-sm">
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <Server className="h-5 w-5 text-muted-foreground" />
    //             {t('settings.systemInformation')}
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-3">
    //           <div className="space-y-1">
    //             <div className="text-sm text-muted-foreground">{t('settings.appVersion')}</div>
    //             <div className="font-medium">v1.0.0</div>
    //           </div>
              
    //           <div className="space-y-1">
    //             <div className="text-sm text-muted-foreground">{t('settings.environment')}</div>
    //             <div className="flex items-center gap-2">
    //               <Badge className="bg-green-500/10 text-green-600">Production</Badge>
    //               <span className="text-xs text-muted-foreground">Stable</span>
    //             </div>
    //           </div>
              
    //           <div className="space-y-1">
    //             <div className="text-sm text-muted-foreground">{t('settings.database')}</div>
    //             <div className="flex items-center gap-2">
    //               <Database className="h-4 w-4 text-primary" />
    //               <span className="font-medium">PostgreSQL 14.8</span>
    //             </div>
    //           </div>
              
    //           <div className="space-y-1">
    //             <div className="text-sm text-muted-foreground">{t('settings.server')}</div>
    //             <div className="flex items-center gap-2">
    //               <HardDrive className="h-4 w-4 text-purple-500" />
    //               <span className="font-medium">AWS EC2 t3.large</span>
    //             </div>
    //           </div>
              
    //           <div className="space-y-1">
    //             <div className="text-sm text-muted-foreground">{t('settings.lastUpdate')}</div>
    //             <div className="flex items-center gap-2">
    //               <Clock className="h-4 w-4 text-orange-500" />
    //               <span className="font-medium">2024-01-10 03:00 UTC</span>
    //             </div>
    //           </div>
              
    //           <Separator className="my-3" />
              
    //           <div className="space-y-2">
    //             <div className="text-sm text-muted-foreground">{t('settings.systemStatus')}</div>
    //             <div className="space-y-2">
    //               <div className="flex items-center justify-between">
    //                 <span className="text-sm">API Service</span>
    //                 <Badge className="bg-green-500/10 text-green-600">
    //                   <CheckCircle className="h-3 w-3 mr-1" />
    //                   {t('settings.running')}
    //                 </Badge>
    //               </div>
    //               <div className="flex items-center justify-between">
    //                 <span className="text-sm">Database</span>
    //                 <Badge className="bg-green-500/10 text-green-600">
    //                   <CheckCircle className="h-3 w-3 mr-1" />
    //                   {t('settings.connected')}
    //                 </Badge>
    //               </div>
    //               <div className="flex items-center justify-between">
    //                 <span className="text-sm">Cache</span>
    //                 <Badge className="bg-green-500/10 text-green-600">
    //                   <CheckCircle className="h-3 w-3 mr-1" />
    //                   {t('settings.active')}
    //                 </Badge>
    //               </div>
    //               <div className="flex items-center justify-between">
    //                 <span className="text-sm">Email Service</span>
    //                 <Badge className="bg-yellow-500/10 text-yellow-600">
    //                   <AlertTriangle className="h-3 w-3 mr-1" />
    //                   {t('settings.warning')}
    //                 </Badge>
    //               </div>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
          
    //       {/* Recent Activity */}
    //       <Card className="border-border bg-card/50 backdrop-blur-sm">
    //         <CardHeader className="pb-3">
    //           <CardTitle className="flex items-center gap-2 text-base">
    //             <FileText className="h-4 w-4" />
    //             {t('settings.recentActivity')}
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent>
    //           <div className="space-y-3">
    //             {recentActivities.map((activity) => (
    //               <div key={activity.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
    //                 <div className="flex justify-between items-start">
    //                   <div>
    //                     <div className="font-medium text-sm">{activity.action}</div>
    //                     <div className="text-xs text-muted-foreground mt-1">{activity.user}</div>
    //                   </div>
    //                   <div className="text-right">
    //                     <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
    //                     <div className="text-xs font-mono mt-1">{activity.ip}</div>
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //           <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
    //             {t('settings.viewAllActivity')}
    //           </Button>
    //         </CardContent>
    //       </Card>
          
    //       {/* Quick Actions */}
    //       <Card className="border-border bg-card/50 backdrop-blur-sm">
    //         <CardHeader className="pb-3">
    //           <CardTitle className="flex items-center gap-2 text-base">
    //             <Cpu className="h-4 w-4" />
    //             {t('settings.quickActions')}
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-2">
    //           <Button variant="outline" size="sm" className="w-full justify-start gap-2">
    //             <RefreshCw className="h-4 w-4" />
    //             {t('settings.clearCache')}
    //           </Button>
    //           <Button variant="outline" size="sm" className="w-full justify-start gap-2">
    //             <Database className="h-4 w-4" />
    //             {t('settings.runBackup')}
    //           </Button>
    //           <Button variant="outline" size="sm" className="w-full justify-start gap-2">
    //             <Network className="h-4 w-4" />
    //             {t('settings.testConnection')}
    //           </Button>
    //           <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-red-600">
    //             <AlertTriangle className="h-4 w-4" />
    //             {t('settings.maintenanceMode')}
    //           </Button>
    //         </CardContent>
    //       </Card>
    //     </div>
    //   </div>
      
    //   {/* Performance & Maintenance Settings */}
    //   <Card className="border-border bg-card/50 backdrop-blur-sm">
    //     <CardHeader>
    //       <CardTitle className="flex items-center gap-2">
    //         <Cpu className="h-5 w-5 text-purple-500" />
    //         {t('settings.performanceSettings')}
    //       </CardTitle>
    //     </CardHeader>
    //     <CardContent className="space-y-4">
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="cacheEnabled">{t('settings.cacheEnabled')}</Label>
    //           <div className="flex items-center gap-2">
    //             <Switch
    //               id="cacheEnabled"
    //               checked={settings.cacheEnabled}
    //               onCheckedChange={(checked) => handleInputChange('cacheEnabled', checked)}
    //             />
    //             <span className="text-sm">
    //               {settings.cacheEnabled ? t('settings.enabled') : t('settings.disabled')}
    //             </span>
    //           </div>
    //         </div>
            
    //         <div className="space-y-2">
    //           <Label htmlFor="cacheDuration">{t('settings.cacheDuration')} (s)</Label>
    //           <Input
    //             id="cacheDuration"
    //             type="number"
    //             value={settings.cacheDuration}
    //             onChange={(e) => handleInputChange('cacheDuration', parseInt(e.target.value))}
    //             disabled={!settings.cacheEnabled}
    //           />
    //         </div>
            
    //         <div className="space-y-2">
    //           <Label htmlFor="maxUploadSize">{t('settings.maxUploadSize')} (MB)</Label>
    //           <Input
    //             id="maxUploadSize"
    //             type="number"
    //             value={settings.maxUploadSize}
    //             onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
    //           />
    //         </div>
            
    //         <div className="space-y-2">
    //           <Label htmlFor="compressionEnabled">{t('settings.compressionEnabled')}</Label>
    //           <div className="flex items-center gap-2">
    //             <Switch
    //               id="compressionEnabled"
    //               checked={settings.compressionEnabled}
    //               onCheckedChange={(checked) => handleInputChange('compressionEnabled', checked)}
    //             />
    //             <span className="text-sm">
    //               {settings.compressionEnabled ? t('settings.enabled') : t('settings.disabled')}
    //             </span>
    //           </div>
    //         </div>
    //       </div>
          
    //       <Separator />
          
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="maintenanceMode">{t('settings.maintenanceMode')}</Label>
    //           <div className="flex items-center gap-2">
    //             <Switch
    //               id="maintenanceMode"
    //               checked={settings.maintenanceMode}
    //               onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
    //             />
    //             <span className="text-sm">
    //               {settings.maintenanceMode ? t('settings.active') : t('settings.inactive')}
    //             </span>
    //           </div>
    //         </div>
            
    //         <div className="space-y-2">
    //           <Label htmlFor="backupFrequency">{t('settings.backupFrequency')}</Label>
    //           <Select
    //             value={settings.backupFrequency}
    //             onValueChange={(value) => handleInputChange('backupFrequency', value)}
    //           >
    //             <SelectTrigger id="backupFrequency">
    //               <SelectValue />
    //             </SelectTrigger>
    //             <SelectContent>
    //               <SelectItem value="hourly">{t('settings.hourly')}</SelectItem>
    //               <SelectItem value="daily">{t('settings.daily')}</SelectItem>
    //               <SelectItem value="weekly">{t('settings.weekly')}</SelectItem>
    //               <SelectItem value="monthly">{t('settings.monthly')}</SelectItem>
    //             </SelectContent>
    //           </Select>
    //         </div>
            
    //         <div className="space-y-2">
    //           <Label htmlFor="autoUpdate">{t('settings.autoUpdate')}</Label>
    //           <div className="flex items-center gap-2">
    //             <Switch
    //               id="autoUpdate"
    //               checked={settings.autoUpdate}
    //               onCheckedChange={(checked) => handleInputChange('autoUpdate', checked)}
    //             />
    //             <span className="text-sm">
    //               {settings.autoUpdate ? t('settings.enabled') : t('settings.disabled')}
    //             </span>
    //           </div>
    //         </div>
            
    //         <div className="space-y-2">
    //           <Label htmlFor="debugMode">{t('settings.debugMode')}</Label>
    //           <div className="flex items-center gap-2">
    //             <Switch
    //               id="debugMode"
    //               checked={settings.debugMode}
    //               onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
    //             />
    //             <span className="text-sm">
    //               {settings.debugMode ? t('settings.enabled') : t('settings.disabled')}
    //             </span>
    //           </div>
    //         </div>
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>
  );
}