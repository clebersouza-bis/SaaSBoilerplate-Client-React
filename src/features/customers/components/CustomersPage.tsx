// features/customers/components/CustomersPage.tsx - VERSÃO MODERNA
import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  X, 
  Users,
  TrendingUp,
  Building2,
  BarChart3
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

export function CustomersPage() {
  const { t } = useTranslation();
  
  // State for the immediate input value
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for the actual filter sent to the API (debounced)
  const [activeFilters, setActiveFilters] = useState({ search: '' });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Stats mock data
  const stats = [
    { label: 'Total Customers', value: '1,248', change: '+12%', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Active This Month', value: '842', change: '+8%', icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'New Customers', value: '156', change: '+24%', icon: Plus, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: 'Avg. Revenue', value: '$2,458', change: '+5%', icon: BarChart3, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
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

  const handleView = (customer: Customer) => {
    console.log('View customer:', customer);
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
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {t('table.export')}
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('table.addCustomer')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
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
                  <div className={`h-12 w-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
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
          <CardTitle className="text-lg">Filters & Search</CardTitle>
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
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('table.filters')}
              </Button>
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('table.reset')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table Card */}
      <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>{t('table.allCustomers')}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Active: 842
              </Badge>
              <Badge variant="outline" className="text-xs">
                Total: 1,248
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <CustomersTable
              onEdit={handleEdit}
              onView={handleView}
              filters={activeFilters}
            />
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
          <p>Showing filtered results based on your search criteria</p>
          <p className="text-[10px]">BIS Core CRM • Professional Edition • v1.0.0</p>
        </div>
      </div>
    </div>
  );
}