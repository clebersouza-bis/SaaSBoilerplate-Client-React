// features/customers/components/CustomerForm.tsx
import * as React from 'react';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types/customer';
import { useTranslation } from '@/hooks/useTranslation';

// Schema de validação com mensagens traduzidas
const createCustomerFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(2, {
      message: t('form.minLength')
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
        country: 'US', // Default
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
          country: customer.address.country || 'US',
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

  // Lista de estados (US) - poderia ser traduzido também
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('customer.basicInfo')}</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customer.fullName')} *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('customer.fullName')} 
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
                  <FormLabel>{t('customer.email')} *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('customer.email')} 
                      type="email" 
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
                  <FormLabel>{t('customer.phoneNumber')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('customer.phoneNumber')} 
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
                <FormLabel>{t('customer.notes')}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t('customer.additionalInfo')}
                    className="min-h-[80px]"
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
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('customer.addressInfo')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customer.street')} *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('customer.street')} 
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
                  <FormLabel>{t('customer.number')} *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('customer.number')} 
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
                  <FormLabel>{t('customer.city')} *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('customer.city')} 
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
                  <FormLabel>{t('customer.state')} *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('customer.selectState')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
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
                  <FormLabel>{t('customer.zipCode')} *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('customer.zipCode')} 
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
                <FormLabel>{t('customer.country')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('customer.country')} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                {isEditMode ? t('status.updating') : t('status.creating')}
              </>
            ) : (
              <>
                {isEditMode ? t('customer.edit') : t('customer.create')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}