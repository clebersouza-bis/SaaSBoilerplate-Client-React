// features/customers/components/CustomersTable.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers';
import { Customer } from '@/types/customer';
import { useTranslation } from '@/hooks/useTranslation';

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

interface CustomersTableProps {
  onEdit?: (customer: Customer) => void;
  onView?: (customer: Customer) => void;
  filters?: Record<string, string>;
}

export function CustomersTable({ onEdit, onView, filters }: CustomersTableProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Effect to reset pagination when filters change (e.g., user searches for something new)
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, isError, refetch } = useCustomers(page, pageSize, filters);
  const deleteMutation = useDeleteCustomer();

  const handleDelete = async (id: string) => {
    if (window.confirm(t('table.confirmDelete'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">{t('table.failedToLoad')}</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('table.retry')}
        </Button>
      </div>
    );
  }

  const customers = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.phone')}</TableHead>
              <TableHead>{t('table.location')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.created')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {filters?.search 
                    ? t('table.searchNoResults', { search: filters.search })
                    : t('table.noResults')}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.mainPhone || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {customer.address.city}, {customer.address.state}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {customer.address.neighborhood}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[customer.isDeleted ? 'inactive' : 'active']}>
                      {customer.isDeleted 
                        ? t('customer.status.inactive') 
                        : t('customer.status.active')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('table.viewDetails')}
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(customer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {!customer.isDeleted && (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDelete(customer.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('table.delete')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('table.pageInfo', { 
              current: page, 
              total: totalPages, 
              count: totalItems 
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('table.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t('table.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}