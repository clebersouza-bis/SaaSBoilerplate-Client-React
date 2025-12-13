// components/layout/UserMenu.tsx - VERSÃO SIMPLIFICADA COM COMPONENTES
import * as React from 'react';
import { useState } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  HelpCircle,
  ChevronDown,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { logout as apiLogout } from '@/features/auth/api/auth.api';
import { useTranslation } from '@/hooks/useTranslation';
import { TenantSwitcher } from '@/components/TenantSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function UserMenu() {
  const { t } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { user, logout: storeLogout, tenantAccesses, currentTenantId } = useAuthStore();
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
      await storeLogout();
      window.location.href = '/login';
    } catch (error) {
      await storeLogout();
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return '?';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.name && user.name.trim() !== '') {
      return user.name;
    }
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      const nameParts = emailPart.split(/[._-]/);
      const capitalized = nameParts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      );
      return capitalized.join(' ');
    }
    return t('common.user');
  };

  // Current tenant info
  const currentTenant = tenantAccesses.find(t => t.tenantId === currentTenantId);
  const hasMultipleTenants = tenantAccesses.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 px-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {getUserInitials()}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium truncate max-w-[120px]">
                {getDisplayName()}
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                {currentTenant?.tenantName || t('tenant.currentTenant')}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end">
        {/* User Info Section */}
        <DropdownMenuLabel className="flex flex-col space-y-2 p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          {/* Current Tenant Badge */}
          {currentTenant && (
            <div className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-md p-2">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium flex-1 truncate">{currentTenant.tenantName}</span>
              {currentTenant.isDefaultLogin && (
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                  {t('tenant.default')}
                </span>
              )}
            </div>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Tenant Switcher Section */}
        {hasMultipleTenants && (
          <div className="px-3 py-2">
            <div className="text-xs text-muted-foreground mb-2">
              {t('tenant.switchTenant')}
            </div>
            <div className="border rounded-lg p-2">
              <TenantSwitcher />
            </div>
          </div>
        )}
        
        {/* Language & Theme Section */}
        <div className="px-3 py-2">
          <div className="text-xs text-muted-foreground mb-2">
            {t('common.preferences')}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <LanguageSwitcher />
              {useTranslation().currentLanguage}
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Main Navigation Links */}
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="cursor-pointer px-3 py-2"
            onClick={() => window.location.href = '/profile'}
          >
            <User className="mr-2 h-4 w-4" />
            <span>{t('navigation.profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer px-3 py-2"
            onClick={() => window.location.href = '/settings'}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('navigation.settings')}</span>
          </DropdownMenuItem>
          {user?.permissions?.includes('admin') && (
            <DropdownMenuItem 
              className="cursor-pointer px-3 py-2"
              onClick={() => window.location.href = '/admin'}
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>{t('navigation.admin')}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Help & Support */}
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="cursor-pointer px-3 py-2"
            onClick={() => window.open('/docs', '_blank')}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>{t('common.helpDocumentation')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600 cursor-pointer px-3 py-2"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>
            {isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}