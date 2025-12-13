// features/customers/components/CustomerForm.tsx - VERSÃO MODERNA
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
  Building,
  FileText,
  Navigation,
  Home,
  Globe,
  Save,
  X,
  Loader2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types/customer';
import { useTranslation } from '@/hooks/useTranslation';

// Schema de validação com mensagens traduzidas
const createCustomerFormSchema = (t: (key: string, params?: Record<string, any>) => string) => {
  return z.object({
    name: z.string().min(2, {
      message: t('form.minLength', { count: 2 })
    }),
    email: z.string().email({
      message: t('form.invalidEmail')
    }),
    mainPhone: z.string().optional(),
    notes: z.string().optional(),
    address: z.object({
      street: z.string().min(1, {
        message: t('form.streetRequired')
      }),
      number: z.string().min(1, {
        message: t('form.numberRequired')
      }),
      neighborhood: z.string().optional(),
      city: z.string().min(1, {
        message: t('form.cityRequired')
      }),
      state: z.string()
        .min(2, {
          message: t('form.stateLength')
        })
        .max(2, {
          message: t('form.stateLength')
        }),
      zipCode: z.string().min(5, {
        message: t('form.zipRequired')
      }),
      complement: z.string().optional(),
      county: z.string().optional(),
      country: z.string().optional(),
    }),
  });
};

type CustomerFormValues = z.infer<ReturnType<typeof createCustomerFormSchema>>;

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: CreateCustomerDto | UpdateCustomerDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isSubmitting = false,
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
      mainPhone: '',
      notes: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        complement: '',
        county: '',
        country: 'USA',
      },
    },
  });

  // Preencher form se for edição
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email,
        mainPhone: customer.mainPhone || '',
        notes: customer.notes || '',
        address: {
          street: customer.address.street,
          number: customer.address.number || '',
          neighborhood: customer.address.neighborhood || '',
          city: customer.address.city,
          state: customer.address.state,
          zipCode: customer.address.zipCode,
          complement: customer.address.complement || '',
          county: customer.address.county || '',
          country: customer.address.country || 'USA',
        },
      });
    }
  }, [customer, form]);

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Lista de estados brasileiros
  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Card de Informações Básicas */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">
                {t('customer.basicInfo')}
              </CardTitle>
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
                    {t('customer.fullName')}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('customer.fullName')}
                      className="input-custom"
                      {...field}
                    />
                  </FormControl>
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
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.email')}
                        type="email"
                        className="input-custom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mainPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {t('customer.phoneNumber')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.phoneNumber')}
                        className="input-custom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {t('customer.notes')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('customer.additionalInfo')}
                      className="input-custom min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('customer.anyRelevantNotes')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Card de Endereço */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">
                {t('customer.addressInfo')}
              </CardTitle>
              <Badge variant="outline" className="ml-auto text-xs">
                <Navigation className="h-3 w-3 mr-1" />
                US
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Home className="h-3 w-3" />
                      {t('customer.street')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.street')}
                        className="input-custom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {t('customer.number')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.number')}
                        className="input-custom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customer.neighborhood')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('customer.neighborhood')}
                      className="input-custom"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customer.city')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.city')}
                        className="input-custom"
                        {...field}
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
                    <FormLabel>
                      {t('customer.state')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="input-custom">
                          <SelectValue placeholder={t('customer.selectState')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        {brazilianStates.map((state) => (
                          <SelectItem
                            key={state}
                            value={state}
                            className="focus:bg-primary/10"
                          >
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customer.zipCode')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.zipCode')}
                        className="input-custom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.complement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('customer.complement')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.complement')}
                        className="input-custom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('customer.county')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('customer.county')}
                        className="input-custom"
                        {...field}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
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
            className="gap-2 btn-hover-effect"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditMode ? t('status.updating') : t('status.creating')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? t('customer.edit') : t('customer.create')}
              </>
            )}
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="text-xs text-muted-foreground text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>
              {isEditMode
                ? 'Editing customer information'
                : 'Creating new customer record'}
            </span>
          </div>
        </div>
      </form>
    </Form>
  );
}