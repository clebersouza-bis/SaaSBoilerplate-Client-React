// features/customers/components/CustomerDetailsPage.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home, 
  Building2,
  Globe,
  Calendar,
  FileText,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCustomer } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useCustomers';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { CustomerAddressDto } from '@/types/customer';
import { CustomerDialog } from './CustomerDialog';
import { toast } from '@/hooks/use-toast';

export function CustomerDetailsPage() {
  const { id } = useParams({ from: '/customers/$id' });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm } = useConfirmationDialog();
  const { hasPermission } = usePermissions();
  
  const { data: customer, isLoading, error } = useCustomer(id);
  const deleteMutation = useDeleteCustomer();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddressDto | null>(null);

  // Verifica permissões
  const canEditCustomer = hasPermission('customers.update');
  const canDeleteCustomer = hasPermission('customers.delete');
  const canEditAddress = hasPermission('customers.addresses.update');
  const canDeleteAddress = hasPermission('customers.addresses.delete');

  const handleDeleteCustomer = async () => {
    if (!customer || !canDeleteCustomer) return;

    const confirmed = await confirm({
      title: t('common.confirm'),
      description: t('customer.deleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(customer.id);
      toast({
        title: t('customer.deleteSuccess'),
        description: t('customer.deleteSuccessDescription'),
      });
      navigate({ to: '/customers' });
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!canDeleteAddress) {
      toast({
        title: t('errors.accessDenied'),
        description: t('errors.requiresPermission', { permission: 'customers.addresses.delete' }),
        variant: 'destructive',
      });
      return;
    }

    const confirmed = await confirm({
      title: t('common.confirm'),
      description: t('address.deleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });

    if (!confirmed) return;

    // TODO: Implementar API call para deletar endereço
    console.log('Delete address:', addressId);
    toast({
      title: t('address.deleteSuccess'),
      description: t('address.deleteSuccessDescription'),
    });
  };

  const handleSetPrimaryAddress = (addressId: string) => {
    if (!canEditAddress) {
      toast({
        title: t('errors.accessDenied'),
        description: t('errors.requiresPermission', { permission: 'customers.addresses.update' }),
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implementar API call para setar endereço primário
    console.log('Set primary address:', addressId);
    toast({
      title: t('address.setPrimarySuccess'),
      description: t('address.setPrimarySuccessDescription'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Customer not found</h3>
        <p className="text-muted-foreground mt-2">
          The customer you're looking for doesn't exist or you don't have access.
        </p>
        <Button
          onClick={() => navigate({ to: '/customers' })}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/customers' })}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {customer.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn(
                  customer.isActive 
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400',
                  'px-2 py-1'
                )}>
                  {customer.isActive ? t('customer.active') : t('customer.inactive')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {customer.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Edit Button - só se tem permissão */}
          {canEditCustomer && (
            <Button
              onClick={() => setEditDialogOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('common.edit')}
            </Button>
          )}
          
          {/* Delete Button - só se tem permissão */}
          {canDeleteCustomer && (
            <Button
              onClick={handleDeleteCustomer}
              variant="destructive"
              className="gap-2"
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          )}
          
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                {t('customer.generateReport')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('customer.createOrder')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="h-4 w-4 mr-2" />
                {t('customer.createInvoice')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('customer.exportData')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">{t('customer.overview')}</TabsTrigger>
          <TabsTrigger value="addresses">{t('customer.addresses')}</TabsTrigger>
          <TabsTrigger value="orders">{t('customer.orders')}</TabsTrigger>
          <TabsTrigger value="invoices">{t('customer.invoices')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('customer.basicInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('customer.email')}</p>
                      <p className="font-medium">{customer.email || t('customer.noEmail')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('customer.phone')}</p>
                      <p className="font-medium">{customer.phone || t('customer.noPhone')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('customer.memberSince')}</p>
                      <p className="font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('customer.totalOrders')}</p>
                      <p className="font-medium">0</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customer.totalSpent')}</p>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customer.avgOrderValue')}</p>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customer.lastOrder')}</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500/20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customer.openInvoices')}</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <FileText className="h-8 w-8 text-red-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('customer.addresses')}
              </CardTitle>
              {/* Botão Add Address - só se tem permissão */}
              {hasPermission('customers.addresses.create') && (
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('address.addNew')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-4">
                  {customer.addresses.map((address) => (
                    <Card key={address.id} className={cn(
                      "border-2 transition-colors",
                      address.isPrimary ? "border-primary/20 bg-primary/5" : "border-border"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            {/* Address Header */}
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <Home className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">
                                    {address.label || t('address.noLabel')}
                                  </h3>
                                  {address.isPrimary && (
                                    <Badge className="bg-primary/10 text-primary text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      {t('address.primary')}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {address.line1 || t('address.noAddress')}
                                </p>
                              </div>
                            </div>

                            {/* Address Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-13">
                              {address.line1 && (
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('address.street')}</p>
                                  <p className="font-medium">{address.line1}</p>
                                </div>
                              )}
                              
                              {address.line2 && (
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('address.complement')}</p>
                                  <p className="font-medium">{address.line2}</p>
                                </div>
                              )}
                              
                              {(address.city || address.state) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('address.cityState')}</p>
                                  <p className="font-medium">
                                    {[address.city, address.state].filter(Boolean).join(', ')}
                                  </p>
                                </div>
                              )}
                              
                              {address.postalCode && (
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('address.postalCode')}</p>
                                  <p className="font-medium">{address.postalCode}</p>
                                </div>
                              )}
                              
                              {address.country && (
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('address.country')}</p>
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{address.country}</p>
                                  </div>
                                </div>
                              )}
                              
                              {address.contactName && (
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('address.contactName')}</p>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{address.contactName}</p>
                                  </div>
                                </div>
                              )}
                              
                              {address.contactPhone && (
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('address.contactPhone')}</p>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{address.contactPhone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {address.notes && (
                              <div className="pl-13">
                                <p className="text-sm text-muted-foreground">{t('address.notes')}</p>
                                <p className="text-sm">{address.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Address Actions */}
                          <div className="flex flex-col gap-2 ml-4">
                            {/* Set Primary - só se tem permissão e não é primary */}
                            {canEditAddress && !address.isPrimary && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetPrimaryAddress(address.id)}
                                className="justify-start gap-2 text-xs"
                              >
                                <Star className="h-3 w-3" />
                                {t('address.setPrimary')}
                              </Button>
                            )}
                            
                            {/* Edit Address - só se tem permissão */}
                            {canEditAddress && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAddress(address)}
                                className="justify-start gap-2 text-xs"
                              >
                                <Edit className="h-3 w-3" />
                                {t('common.edit')}
                              </Button>
                            )}
                            
                            {/* Delete Address - só se tem permissão e não é primary */}
                            {canDeleteAddress && !address.isPrimary && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id)}
                                className="justify-start gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                                {t('common.delete')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium">{t('address.noAddressesTitle')}</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    {t('address.noAddressesDescription')}
                  </p>
                  {hasPermission('customers.addresses.create') && (
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('address.addFirstAddress')}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab (Placeholder) */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t('customer.orders')}</CardTitle>
              <CardDescription>
                {t('customer.ordersDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">{t('customer.noOrdersTitle')}</h3>
                <p className="text-muted-foreground mt-2">
                  {t('customer.noOrdersDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab (Placeholder) */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>{t('customer.invoices')}</CardTitle>
              <CardDescription>
                {t('customer.invoicesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">{t('customer.noInvoicesTitle')}</h3>
                <p className="text-muted-foreground mt-2">
                  {t('customer.noInvoicesDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {canEditCustomer && (
        <CustomerDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          customer={customer}
          onSuccess={() => {
            setEditDialogOpen(false);
            // TODO: Refetch customer data
          }}
        />
      )}

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-2 md:hidden">
        <Button
          onClick={() => navigate({ to: '/customers' })}
          variant="outline"
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        {canEditCustomer && (
          <Button
            onClick={() => setEditDialogOpen(true)}
            className="flex-1 gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('common.edit')}
          </Button>
        )}
      </div>
    </div>
  );
}
