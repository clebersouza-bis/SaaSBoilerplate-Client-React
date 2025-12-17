// features/auth/components/ForgotPasswordForm.tsx
import * as React from 'react';
import { useState } from 'react';
import { 
  Mail, 
  Building2, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Send
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { forgotPassword } from '../api/auth.api';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!email) {
      setError(t('auth.emailRequired'));
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await forgotPassword(email);
      console.log('Forgot password response:', result);
      setSuccess(true);
      
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || t('auth.resetPasswordFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    navigate({ to: '/login' });
  };
  
  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative w-full max-w-md">
          {/* Language & Theme Toggle */}
          <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          
          {/* Back to Login */}
          <div className="absolute top-0 left-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLogin}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Button>
          </div>
          
          {/* Success Card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t('auth.resetEmailSent')}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {t('auth.resetEmailInstructions')}
                </p>
                
                <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
                  <p className="font-medium">{email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('auth.checkSpamFolder')}
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  {t('auth.backToLogin')}
                </Button>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>{t('auth.didntReceiveEmail')}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuccess(false)}
                  className="text-primary"
                >
                  {t('auth.resendEmail')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Language & Theme Toggle */}
        <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        
        {/* Back to Login */}
        <div className="absolute top-0 left-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLogin}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToLogin')}
          </Button>
        </div>
        
        {/* Forgot Password Card */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Branding */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold tracking-tight">ELYON</h1>
                <p className="text-sm text-muted-foreground">AI Hotel Operation</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t('auth.forgotPasswordTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('auth.forgotPasswordDescription')}
              </p>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('auth.email')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {t('auth.sendingInstructions')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('auth.sendResetLink')}
                </>
              )}
            </Button>
          </form>
          
          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.rememberPassword')}{' '}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
                disabled={isLoading}
              >
                {t('auth.signIn')}
              </button>
            </p>
          </div>
          
          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>© {new Date().getFullYear()} BIS Corporation. All rights reserved.</p>
              <div className="flex justify-center gap-4">
                <button className="hover:text-foreground transition-colors">
                  Privacy Policy
                </button>
                <button className="hover:text-foreground transition-colors">
                  Terms of Service
                </button>
                <button className="hover:text-foreground transition-colors">
                  Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}