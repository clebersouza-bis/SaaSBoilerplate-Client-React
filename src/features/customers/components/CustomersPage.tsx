// features/customers/components/CustomersPage.tsx - VERSÃO ATUALIZADA
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  X, 
  Users,
  TrendingUp,
  Building2,
  Clock,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CustomersTable } from './CustomersTable';
import { CustomerDialog } from './CustomerDialog';
import type { Customer } from '@/types/customer';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomers } from '../hooks/useCustomers';

export function CustomersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for the immediate input value
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for the actual filter sent to the API (debounced)
  const [activeFilters, setActiveFilters] = useState({ search: '' });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Buscar dados reais dos clientes
  const { data: customersData, isLoading, isError } = useCustomers({
    page: 1,
    pageSize: 1000, // Pegar mais dados para calcular estatísticas
    search: activeFilters.search
  });

  // Calcular estatísticas baseadas nos dados reais
  const calculateStats = () => {
    const customers = customersData?.items || [];
    
    // Total de clientes
    const totalCustomers = customers.length;

    // Clientes ativos
    const activeCustomers = customers.filter(c => c.isActive).length;
    
    // Clientes inativos
    const inactiveCustomers = customers.filter(c => !c.isActive).length;
    
    // Clientes criados este mês (exemplo)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Nota: A API não retorna createdDate, então usamos um mock
    // Quando a API tiver createdDate, ajuste:
    // const newThisMonth = customers.filter(c => {
    //   const created = new Date(c.createdDate);
    //   return created.getMonth() === currentMonth && 
    //          created.getFullYear() === currentYear;
    // }).length;
    
    const newThisMonth = Math.round(totalCustomers * 0.12); // 12% do total como mock
    
    // Porcentagens
    const activePercentage = totalCustomers > 0 ? 
      Math.round((activeCustomers / totalCustomers) * 100) : 0;
    const inactivePercentage = totalCustomers > 0 ? 
      Math.round((inactiveCustomers / totalCustomers) * 100) : 0;
    const newPercentage = totalCustomers > 0 ? 
      Math.round((newThisMonth / totalCustomers) * 100) : 0;

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      newThisMonth,
      activePercentage,
      inactivePercentage,
      newPercentage
    };
  };

  const statsData = calculateStats();

  // Stats cards usando dados reais
  const stats = [
    { 
      label: t('stats.totalCustomers'), 
      value: statsData.totalCustomers.toLocaleString(), 
      icon: Users, 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-500/10',
      description: t('stats.totalCustomersDesc')
    },
    { 
      label: t('stats.activeCustomers'), 
      value: statsData.activeCustomers.toLocaleString(), 
      change: `+${statsData.activePercentage}%`, 
      icon: TrendingUp, 
      color: 'text-green-500', 
      bgColor: 'bg-green-500/10',
      description: t('stats.activeCustomersDesc')
    },
    { 
      label: t('stats.newThisMonth'), 
      value: statsData.newThisMonth.toLocaleString(), 
      change: `+${statsData.newPercentage}%`, 
      icon: Calendar, 
      color: 'text-purple-500', 
      bgColor: 'bg-purple-500/10',
      description: t('stats.newThisMonthDesc')
    },
    { 
      label: t('stats.inactiveCustomers'), 
      value: statsData.inactiveCustomers.toLocaleString(), 
      change: `${statsData.inactivePercentage}%`, 
      icon: Clock, 
      color: 'text-amber-500', 
      bgColor: 'bg-amber-500/10',
      description: t('stats.inactiveCustomersDesc')
    },
  ];

  // Debounce logic: Wait 500ms after user stops typing to update activeFilters
  useEffect(() => {
    const handler = setTimeout(() => {
      setActiveFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleCreate = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleViewDetails = (customer: Customer) => {
  navigate({ 
    to: '/customers/$id', 
    params: { id: customer.id } 
  });
};

  const handleDialogSuccess = () => {
    console.log('Customer operation successful');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveFilters({ search: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {t('customer.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('customer.manageCustomers')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
              {t('table.export')}
            </Button>
            <Button 
              onClick={handleCreate} 
              className="gap-2"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              {t('table.addCustomer')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="border-border bg-card/50 backdrop-blur-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                      {stat.change && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            stat.label.includes('inactive') ? 'bg-amber-500/20 text-amber-600' : ''
                          }`}
                        >
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                    {stat.description && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {stat.description}
                      </p>
                    )}
                  </div>
                  <div className={`h-12 w-12 ${stat.bgColor} rounded-xl flex items-center justify-center ml-4`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('table.filtersAndSearch')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder={t('table.searchPlaceholder')}
                className="pl-10 input-custom"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                disabled={isLoading}
              >
                <Filter className="h-4 w-4" />
                {t('table.filters')}
              </Button>
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  {t('table.reset')}
                </Button>
              )}
            </div>
          </div>
          {/* Status da busca */}
          {isLoading && (
            <div className="mt-3 text-sm text-muted-foreground">
              {t('status.searching')}
            </div>
          )}
          {activeFilters.search && customersData?.items && (
            <div className="mt-3 text-sm text-muted-foreground">
              {t('table.showingResultsFor', { 
                count: customersData.items.length, 
                search: activeFilters.search 
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customers Table Card */}
      <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>{t('table.allCustomers')}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600">
                {t('stats.active')}: {statsData.activeCustomers}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t('stats.total')}: {statsData.totalCustomers}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  {t('status.loadingCustomers')}
                </p>
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-destructive">
                <p>{t('status.errorLoadingCustomers')}</p>
              </div>
            ) : (
              <CustomersTable
                onEdit={handleEdit}
                onView={handleViewDetails}
                filters={activeFilters}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSuccess={handleDialogSuccess}
      />

      {/* Footer */}
      <div className="text-center pt-8">
        <Separator className="mb-6" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            {t('footer.dataBasedOnApi', { 
              timestamp: new Date().toLocaleTimeString() 
            })}
          </p>
          <p className="text-[10px]">BIS Core CRM • Professional Edition • v1.0.0</p>
        </div>
      </div>
    </div>
  );
}