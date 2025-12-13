// components/TenantSwitcher.tsx - VERSÃO COMPLETA ATUALIZADA
import * as React from 'react';
import { useState } from 'react';
import { Building2, ChevronsUpDown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { cn } from '@/lib/utils';
import { ConfirmSwitchModal } from '@/components/ConfirmSwitchModal';
import { useTranslation } from '@/hooks/useTranslation';

export function TenantSwitcher() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  
  const { 
    currentTenantId, 
    tenantAccesses,
    switchTenant: storeSwitchTenant,
    isLoading: storeLoading
  } = useAuthStore();
  
  // Get current tenant access
  const currentAccess = tenantAccesses.find(t => t.tenantId === currentTenantId);
  
  // Se só tem 1 tenant, mostra badge simples
  if (tenantAccesses.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {currentAccess?.tenantName || t('tenant.noTenant')}
          </span>
          {currentAccess?.isDefaultLogin && (
            <Badge variant="outline" className="text-xs mt-1">
              {t('tenant.default')}
            </Badge>
          )}
        </div>
      </div>
    );
  }
  
  // Handler para selecionar tenant
  const handleSelect = (tenantId: string) => {
    if (tenantId === currentTenantId || isSwitching) {
      setOpen(false);
      return;
    }
    
    setSelectedTenantId(tenantId);
    setConfirmOpen(true);
    setOpen(false);
  };
  
  // Handler para confirmar switch
  const handleConfirmSwitch = async () => {
    if (!selectedTenantId) return;
    
    setIsSwitching(true);
    
    try {
      // 1. Switch tenant na store
      const success = await storeSwitchTenant(selectedTenantId);
      
      if (success) {
        // 2. Pequeno delay para garantir store foi atualizado
        setTimeout(() => {
          // 3. Redireciona para dashboard com novo tenant
          window.location.href = '/';
        }, 300);
      } else {
        throw new Error('Switch tenant failed');
      }
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      alert('Failed to switch tenant. Please try again.');
      setIsSwitching(false);
      setConfirmOpen(false);
    }
  };
  
  // Obter nome do tenant selecionado para o modal
  const selectedTenantName = tenantAccesses.find(t => t.tenantId === selectedTenantId)?.tenantName || t('tenant.noTenant');

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label={t('tenant.selectTenant')}
            className="w-[220px] justify-between"
            disabled={storeLoading || isSwitching}
          >
            <div className="flex items-center gap-2">
              {isSwitching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <div className="flex flex-col items-start">
                <span className="truncate text-sm font-medium">
                  {currentAccess?.tenantName || t('tenant.selectTenant')}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {t('tenant.tenants', { 
                      count: tenantAccesses.length,
                      s: tenantAccesses.length !== 1 ? 's' : ''
                    })}
                  </span>
                  {currentAccess?.isDefaultLogin && (
                    <Badge variant="outline" className="text-xs">
                      {t('tenant.default')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandInput placeholder={t('tenant.searchTenant')} />
            <CommandList>
              <CommandEmpty>{t('tenant.noTenantFound')}</CommandEmpty>
              
              <CommandGroup heading={t('tenant.current')}>
                <CommandItem
                  disabled
                  className="py-3 opacity-100 cursor-default"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{currentAccess?.tenantName}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {t('tenant.current')}
                          </Badge>
                          {currentAccess?.isDefaultLogin && (
                            <Badge variant="outline" className="text-xs">
                              {t('tenant.default')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading={t('tenant.availableTenants')}>
                {tenantAccesses
                  .filter(access => access.tenantId !== currentTenantId)
                  .map((access) => (
                    <CommandItem
                      key={access.tenantId}
                      onSelect={() => handleSelect(access.tenantId)}
                      className="py-3"
                      disabled={isSwitching}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{access.tenantName}</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {t('tenant.permissions', { count: access.permissions?.length || 0 })}
                              </Badge>
                              {access.isDefaultLogin && (
                                <Badge variant="outline" className="text-xs">
                                  {t('tenant.default')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Modal de Confirmação */}
      <ConfirmSwitchModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tenantName={selectedTenantName}
        onConfirm={handleConfirmSwitch}
      />
    </>
  );
}