// features/customers/components/CustomerForm.tsx - VERSÃO COMPLETA ATUALIZADA
import * as React from 'react';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Globe,
  Tag,
  MessageSquare,
  User as ContactUser,
  Phone as ContactPhone,
  Save,
  X,
  Loader2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { CustomerDto, CreateCustomerRequest, UpdateCustomerRequest, CustomerAddressDto } from '@/types/customer';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { useUpdateCustomer, useCreateCustomer } from '../hooks/useCustomerMutations';
import { PermissionErrorModal } from '@/components/modals/PermissionErrorModal';

// Schema de validação
const createCustomerFormSchema = (t: (key: string, params?: Record<string, any>) => string) => {
  return z.object({
    name: z.string().min(2, {
      message: t('form.minLength', { count: 2 })
    }).max(100, {
      message: t('form.maxLength', { count: 100 })
    }),
    email: z.string().email({
      message: t('form.invalidEmail')
    }).optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    isActive: z.boolean().default(true),
    // Endereço principal (opcional)
    address: z.object({
      label: z.string().optional(),
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      isPrimary: z.boolean().default(true),
      notes: z.string().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
    }).optional(),
  });
};

type CustomerFormValues = z.infer<ReturnType<typeof createCustomerFormSchema>>;

interface CustomerFormProps {
  customer?: CustomerDto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({
  customer,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const { t } = useTranslation();
  const isEditMode = !!customer;

  // Cria o schema com as traduções
  const customerFormSchema = createCustomerFormSchema(t);

  // Form setup
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      isActive: true,
      address: {
        label: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isPrimary: true,
        notes: '',
        contactName: '',
        contactPhone: '',
      },
    },
  });

  // Usando hooks com tratamento de permissão
  const {
    mutation: updateMutation,
    permissionError: updatePermissionError,
    clearPermissionError: clearUpdateError
  } = useUpdateCustomer();

  const {
    mutation: createMutation,
    permissionError: createPermissionError,
    clearPermissionError: clearCreateError
  } = useCreateCustomer();

  const permissionError = isEditMode ? updatePermissionError : createPermissionError;
  const clearPermissionError = isEditMode ? clearUpdateError : clearCreateError;
  const isSubmitting = isEditMode ? updateMutation.isPending : createMutation.isPending;

  // Preencher form se for edição
  useEffect(() => {
    if (customer) {
      // Encontra endereço principal ou usa o primeiro
      const primaryAddress = customer.addresses?.find(addr => addr.isPrimary) || customer.addresses?.[0];

      form.reset({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        isActive: customer.isActive,
        address: primaryAddress ? {
          label: primaryAddress.label || '',
          line1: primaryAddress.line1 || '',
          line2: primaryAddress.line2 || '',
          city: primaryAddress.city || '',
          state: primaryAddress.state || '',
          postalCode: primaryAddress.postalCode || '',
          country: primaryAddress.country || '',
          isPrimary: primaryAddress.isPrimary,
          notes: primaryAddress.notes || '',
          contactName: primaryAddress.contactName || '',
          contactPhone: primaryAddress.contactPhone || '',
        } : undefined,
      });
    }
  }, [customer, form]);

 const handleSubmit = async (values: CustomerFormValues) => {
  try {
    if (isEditMode && customer) {
      // Preparar dados para atualização
      const updateData: UpdateCustomerRequest = {
        customerId: customer.id,
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        isActive: values.isActive,
      };

      await updateMutation.mutateAsync({
        id: customer.id,
        data: updateData,
      });
    } else {
      // Preparar dados para criação
      const createData: CreateCustomerRequest = {
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        isActive: values.isActive,
        addressIsPrimary: values.address?.isPrimary || true,
      };

      // Inclui customerAddress APENAS se tiver dados
      if (values.address && Object.values(values.address).some(val => val)) {
        createData.customerAddress = {
          ...values.address,
          isPrimary: values.address.isPrimary,
        } as CustomerAddressDto;
      }

      await createMutation.mutateAsync(createData);
    }

    // Sucesso - fecha o form ou faz redirect
    onSuccess();

  } catch (error) {
    // Erro já tratado pelos hooks/interceptors
    console.error('Form submission error:', error);
  }
};

  // Países comuns para select
  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'BR', label: 'Brazil' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'ES', label: 'Spain' },
    { value: 'IT', label: 'Italy' },
    { value: 'JP', label: 'Japan' },
  ];

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Informações Básicas do Customer */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {t('customer.basicInfo')}
                </CardTitle>
                <div className="ml-auto">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormLabel className="text-sm">
                          {field.value ? t('customer.active') : t('customer.inactive')}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {t('customer.name')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.name')}
                        className="input-custom"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('customer.nameDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {t('customer.email')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.email')}
                          type="email"
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {t('customer.phone')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.phone')}
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço Principal (opcional) */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {t('customer.primaryAddress')}
                </CardTitle>
                <Badge variant="outline" className="ml-auto text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {t('customer.primary')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('customer.addressOptional')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address.label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      {t('customer.addressLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.e.g., Home, Office, Warehouse')}
                        className="input-custom"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('customer.addressLine1')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.street')}
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('customer.addressLine2')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.apt, suite, building')}
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customer.city')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.city')}
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customer.state')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.state')}
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customer.postalCode')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.postalCode')}
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      {t('customer.country')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.country')}
                        className="input-custom"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ContactUser className="h-3 w-3" />
                        {t('customer.contactName')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.contactName')}
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ContactPhone className="h-3 w-3" />
                        {t('customer.contactPhone')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customer.contactPhone')}
                          className="input-custom"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      {t('customer.addressNotes')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('customer.specialInstructions')}
                        className="input-custom min-h-[80px] resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Ações do Formulário */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 btn-hover-effect relative"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode ? t('status.updating') : t('status.creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? t('customer.saveChanges') : t('customer.createCustomer')}
                </>
              )}

              {/* Indicador visual de erro de permissão */}
              {permissionError.show && (
                <span className="absolute -top-1 -right-1">
                  <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal de erro de permissão */}
      <PermissionErrorModal
        open={permissionError.show}
        onOpenChange={(open) => {
          if (!open) clearPermissionError();
        }}
        error={{
          resource: permissionError.resource ?? '',
          action: permissionError.action ?? '',
          message: t('errors.cannotPerformAction', {
            action: permissionError.action ?? '',
            resource: permissionError.resource ?? '',
          })
        }}
      />
    </>
  );
}