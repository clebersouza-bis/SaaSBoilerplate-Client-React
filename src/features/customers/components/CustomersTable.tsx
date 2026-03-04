// features/customers/components/CustomersTable.tsx - VERSÃO RESPONSIVA
import * as React from 'react';
import { useState, useEffect } from 'react';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';
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
  Home,
  Search,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Smartphone
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
import type { CustomerDto } from '@/types/customer';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statusColors = {
  active: 'bg-green-500/10 text-green-600 dark:text-green-400',
  inactive: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

interface CustomersTableProps {
  onEdit?: (customer: CustomerDto) => void;
  onView?: (customer: CustomerDto) => void;
  filters?: Record<string, string>;
}

export function CustomersTable({ onEdit, onView, filters }: CustomersTableProps) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const { confirm } = useConfirmationDialog();
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const pageSize = 20;

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useCustomers({
    page,
    pageSize,
    search: filters?.search
  });

  const deleteMutation = useDeleteCustomer();

const handleDelete = async (id: string) => {
  if (!hasPermission('customers.delete')) {
    console.warn('You don\'t have permission to delete customers.');
    return;
  }

  const confirmed = await confirm({
    title: t('common.confirm'),
    description: t('table.confirmDelete'),
    confirmText: t('common.delete'),
    cancelText: t('common.cancel'),
  });

  if (!confirmed) return;

  await deleteMutation.mutateAsync(id);
};

  const handleViewMobile = (customer: CustomerDto) => {
    setSelectedCustomer(customer);
    setShowMobileDetails(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="h-12 w-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <p className="text-destructive font-medium">
            {t('table.failedToLoad')}
          </p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-2 mt-4"
          >
            <RefreshCw className="h-4 w-4" />
            {t('table.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const customers = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || Math.ceil(totalItems / pageSize) || 1;

  // Mobile View - Card Layout
  if (isMobileView) {
    return (
      <>
        <div className="space-y-4">
          {/* Header Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>{customers.length} {t('table.customers')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {t('customer.table.pageOf', { current: page, total: totalPages })}
              </Badge>
            </div>
          </div>

          {/* Customers Cards */}
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filters?.search
                  ? t('table.searchNoResults', { search: filters.search })
                  : t('table.noResults')}
              </p>
            </div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="border rounded-lg p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => handleViewMobile(customer)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {customer.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {customer.email || t('customer.table.noEmail')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      <Badge className={cn(
                        statusColors[customer.isActive ? 'active' : 'inactive'],
                        "px-2 py-0.5 text-xs"
                      )}>
                        {customer.isActive ? t('customer.status.active') : t('customer.status.inactive')}
                      </Badge>
                    </div>
                  </div>

                  {hasPermission('customers.update') && onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit(customer);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Pagination Mobile */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('common.previous')}
              </Button>

              <div className="text-sm text-muted-foreground">
                {t('table.pageOf', { current: page, total: totalPages })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="gap-2"
              >
                {t('common.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Details Dialog */}
        <Dialog open={showMobileDetails} onOpenChange={setShowMobileDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCustomer?.name}</DialogTitle>
              <DialogDescription>
                {t('customer.details')}
              </DialogDescription>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customer.email')}</p>
                    <p>{selectedCustomer.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customer.phone')}</p>
                    <p>{selectedCustomer.phone || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">{t('customer.status')}</p>
                  <Badge className={cn(
                    statusColors[selectedCustomer.isActive ? 'active' : 'inactive'],
                    "mt-1"
                  )}>
                    {selectedCustomer.isActive ? t('customer.status.active') : t('customer.status.inactive')}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-4">
                  {hasPermission('customers.update') && onEdit && selectedCustomer && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        onEdit(selectedCustomer);
                        setShowMobileDetails(false);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('common.edit')}
                    </Button>
                  )}
                  {hasPermission('customers.delete') && selectedCustomer && (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        handleDelete(selectedCustomer.id);
                        setShowMobileDetails(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('customer.table.delete')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop View - Table Layout
  return (
    <div className="space-y-6">
      {/* Table Header Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <User className="h-3 w-3" />
            {t('customer.table.totalCustomers', { count: totalItems })}
          </span>
          {filters?.search && (
            <span className="flex items-center gap-2">
              <Search className="h-3 w-3" />
              {t('customer.table.filteredBy', { search: filters.search })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-muted px-2 py-1 rounded">
            {t('customer.table.pageOf', { current: page, total: totalPages })}
          </span>
        </div>
      </div>

      {/* Table Container with Responsive Wrapper */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <div className="min-w-[800px]"> {/* Garante largura mínima */}
          <Table className="w-full">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[250px]">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {t('customer.table.name')}
                  </div>
                </TableHead>
                <TableHead className="w-[200px]">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {t('customer.table.email')}
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {t('customer.table.phone')}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {t('customer.table.address')}
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    {t('customer.table.addresses')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">{t('customer.table.status')}</TableHead>
                <TableHead className="w-[80px] text-right">{t('table.actions')}</TableHead>
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
                      <p className="font-medium text-muted-foreground">
                        {t('customer.table.noResults')}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {customer.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {customer.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">
                          {customer.email || t('customer.table.noEmail')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {t('customer.table.noPhone')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          {customer.addresses?.[0]?.line1 || t('customer.table.noAddress')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer.addresses?.[0]?.city || ''}
                          {customer.addresses?.[0]?.state ? `, ${customer.addresses?.[0]?.state}` : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {customer.addresses?.length || 0} {t('customer.table.addresses')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        statusColors[customer.isActive ? 'active' : 'inactive'],
                        "px-2 py-1 text-xs font-medium"
                      )}>
                        {customer.isActive
                          ? t('customer.status.active')
                          : t('customer.status.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(customer)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t('table.viewDetails')}
                            </DropdownMenuItem>
                          )}
                          {hasPermission('customers.update') && onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(customer)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                          )}

                          {(onView || (hasPermission('customers.update') && onEdit)) &&
                            hasPermission('customers.delete') && (
                              <DropdownMenuSeparator />
                            )}

                          {hasPermission('customers.delete') && (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDelete(customer.id)}
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {t('table.showingItems', {
              start: ((page - 1) * pageSize) + 1,
              end: Math.min(page * pageSize, totalItems),
              total: totalItems
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
