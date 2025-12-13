// features/customers/components/CustomersTable.tsx - VERSÃO MODERNA
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
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers';
import { Customer } from '@/types/customer';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const statusColors = {
  active: 'bg-green-500/10 text-green-600 dark:text-green-400',
  inactive: 'bg-red-500/10 text-red-600 dark:text-red-400',
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
};

interface CustomersTableProps {
  onEdit?: (customer: Customer) => void;
  onView?: (customer: Customer) => void;
  filters?: Record<string, string>;
}

export function CustomersTable({ onEdit, onView, filters }: CustomersTableProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const pageSize = 10;
  
  // Effect to reset pagination when filters change
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="h-12 w-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <RefreshCw className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p className="text-destructive font-medium mb-2">{t('table.failedToLoad')}</p>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('table.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const customers = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  return (
    <div className="space-y-6">
      {/* Table Header Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <User className="h-3 w-3" />
            {customers.length} customers
          </span>
          {filters?.search && (
            <span className="flex items-center gap-2">
              <Search className="h-3 w-3" />
              Filtered by: "{filters.search}"
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-muted px-2 py-1 rounded">
            Page {page} of {totalPages}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {t('table.name')}
                  {sortField === 'name' && (
                    <ArrowUpDown className={cn(
                      "h-3 w-3 ml-1",
                      sortDirection === 'desc' && 'rotate-180'
                    )} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {t('table.email')}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {t('table.phone')}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {t('table.location')}
                </div>
              </TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t('table.created')}
                </div>
              </TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="space-y-3">
                    <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {filters?.search 
                          ? t('table.searchNoResults', { search: filters.search })
                          : t('table.noResults')}
                      </p>
                      {filters?.search && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPage(1)}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="hover:bg-muted/20 transition-colors group"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {customer.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate max-w-[180px]">{customer.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.mainPhone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{customer.mainPhone}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {customer.address.city}, {customer.address.state}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {customer.address.neighborhood || 'No neighborhood'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      statusColors[customer.isDeleted ? 'inactive' : 'active'],
                      "px-2 py-1 text-xs font-medium"
                    )}>
                      {customer.isDeleted 
                        ? t('customer.status.inactive') 
                        : t('customer.status.active')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {onView && (
                          <DropdownMenuItem 
                            onClick={() => onView(customer)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t('table.viewDetails')}
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem 
                            onClick={() => onEdit(customer)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {!customer.isDeleted && (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
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
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={pageNum === page}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

// Import Search icon se não tiver
import { Search } from 'lucide-react';