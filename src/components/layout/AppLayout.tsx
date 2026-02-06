// components/layout/AppLayout.tsx
import * as React from 'react';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Home,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { useTranslation } from '@/hooks/useTranslation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasPermission } = usePermissions();

  const menuItems = [
    { 
      label: t('navigation.dashboard'),
      to: '/', 
      icon: Home, 
      permission: 'dashboard.view',
      badge: null 
    },
    { 
      label: t('navigation.customers'),
      to: '/customers', 
      icon: Users, 
      permission: 'customers.read',
      badge: null 
    },
    { 
      label: t('navigation.settings'),
      to: '/settings', 
      icon: Settings, 
      permission: 'settings.view',
      badge: null 
    },
  ];

  const visibleItems = menuItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-200 ease-in-out
          ${sidebarCollapsed ? 'lg:w-20' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          h-screen
        `}
      >
        {/* Sidebar Header */}
        <div className={`
          p-4 border-b border-gray-200 dark:border-gray-700
          flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
        `}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">BIS</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Professional</p>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
          )}

          {/* Close mobile menu button */}
          <Button
            className="lg:hidden absolute right-4 top-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{
                className: 'bg-primary/10 text-primary dark:bg-primary/20'
              }}
              inactiveProps={{
                className: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {item.badge && !sidebarCollapsed && (
                <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={`
          p-4 border-t border-gray-200 dark:border-gray-700
          ${sidebarCollapsed ? 'flex justify-center' : 'space-y-4'}
        `}>
          {!sidebarCollapsed && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                v1.0.0 • ELYON
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} BIS Corp
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={`hidden lg:flex ${sidebarCollapsed ? 'w-full justify-center' : 'ml-auto'}`}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            {!sidebarCollapsed && <span className="ml-2 text-xs">{t('common.collapse')}</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:ml-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <Button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('common.search')}
                className="pl-10 w-64 lg:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Theme Toggle (mantido no header - mais usado) */}
            <ThemeToggle />

            {/* User Menu (agora com tenant, language, etc.) */}
            <UserMenu />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}