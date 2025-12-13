// components/LanguageSwitcher.tsx
import * as React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, getCurrentLanguage } = useTranslation();
  const currentLang = getCurrentLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={currentLanguage === 'en' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇺🇸</span>
          <span>English</span>
          {currentLanguage === 'en' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('pt')}
          className={currentLanguage === 'pt' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇧🇷</span>
          <span>Português</span>
          {currentLanguage === 'pt' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('es')}
          className={currentLanguage === 'es' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇪🇸</span>
          <span>Español</span>
          {currentLanguage === 'es' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}