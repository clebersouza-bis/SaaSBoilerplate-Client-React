// features/customers/components/CustomersPage.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Download, X } from 'lucide-react';
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
    // Ideally, trigger a refetch here if necessary, 
    // but the react-query invalidation in the hook usually handles this.
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveFilters({ search: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('customer.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('customer.manageCustomers')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('table.export')}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('table.addCustomer')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('table.searchPlaceholder')}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {t('table.filters')}
              </Button>
              {/* Show Reset button only if there is a search term */}
              {searchTerm && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  <X className="mr-2 h-4 w-4" />
                  {t('table.reset')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('table.allCustomers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomersTable
            onEdit={handleEdit}
            onView={handleView}
            filters={activeFilters}
          />
        </CardContent>
      </Card>

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}