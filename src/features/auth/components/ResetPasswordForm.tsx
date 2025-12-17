// features/auth/components/ResetPasswordForm.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Building2, 
  AlertCircle,
  CheckCircle,
  Key,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { resetPassword } from '../api/auth.api';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

// Validação de senha (mesma do Register)
const validatePassword = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const strength = Object.values(checks).filter(Boolean).length;
  let strengthText = '';
  let strengthColor = '';
  
  if (strength <= 2) {
    strengthText = 'Weak';
    strengthColor = 'text-red-500';
  } else if (strength <= 4) {
    strengthText = 'Medium';
    strengthColor = 'text-yellow-500';
  } else {
    strengthText = 'Strong';
    strengthColor = 'text-green-500';
  }
  
  return { checks, strength, strengthText, strengthColor };
};

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: '/reset-password' }) as { token?: string };
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  
  const passwordValidation = validatePassword(formData.newPassword);
  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  
  useEffect(() => {
    if (!token) {
      setTokenError(true);
      setError(t('auth.invalidResetToken'));
    }
  }, [token, t]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tokenError || !token) {
      setError(t('auth.invalidResetToken'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Validações
    if (!formData.newPassword || !formData.confirmPassword) {
      setError(t('auth.allFieldsRequired'));
      setIsLoading(false);
      return;
    }
    
    if (!passwordsMatch) {
      setError(t('auth.passwordsDontMatch'));
      setIsLoading(false);
      return;
    }
    
    if (passwordValidation.strength <= 2) {
      setError(t('auth.passwordTooWeak'));
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await resetPassword(token, formData.newPassword);
      console.log('Reset password response:', result);
      setSuccess(true);
      
      // Redireciona para login após 3 segundos
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 3000);
      
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || t('auth.resetPasswordFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    navigate({ to: '/login' });
  };
  
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          
          {/* Success Card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t('auth.passwordResetSuccess')}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {t('auth.passwordResetSuccessMessage')}
                </p>
              </div>
              
              <div className="pt-4">
                <div className="animate-pulse text-sm text-muted-foreground">
                  {t('auth.redirectingToLogin')}
                </div>
                <div className="h-1 w-32 mx-auto mt-2 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-[loading_3s_ease-in-out]"></div>
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
        
        {/* Reset Password Card */}
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
                {t('auth.resetPasswordTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('auth.resetPasswordDescription')}
              </p>
            </div>
          </div>
          
          {/* Token Error */}
          {tokenError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{t('auth.invalidResetToken')}</p>
            </div>
          )}
          
          {/* Error Message */}
          {error && !tokenError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                {t('auth.newPassword')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t('auth.newPasswordPlaceholder')}
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading || tokenError}
                />
                <button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isLoading || tokenError}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{t('auth.passwordStrength')}:</span>
                    <span className={`text-xs font-bold ${passwordValidation.strengthColor}`}>
                      {passwordValidation.strengthText}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordValidation.strength <= 2 ? 'bg-red-500' :
                        passwordValidation.strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {t('auth.confirmPassword')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`pl-10 pr-10 bg-background/50 border-input focus:ring-2 focus:ring-primary/20 ${
                    formData.confirmPassword 
                      ? passwordsMatch 
                        ? 'border-green-500 focus:border-green-500' 
                        : 'border-red-500 focus:border-red-500'
                      : 'focus:border-primary'
                  }`}
                  disabled={isLoading || tokenError}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isLoading || tokenError}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className={`flex items-center gap-1 text-xs ${
                  passwordsMatch ? 'text-green-600' : 'text-red-600'
                }`}>
                  {passwordsMatch ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  <span>
                    {passwordsMatch 
                      ? t('auth.passwordsMatch') 
                      : t('auth.passwordsDontMatch')}
                  </span>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 mt-4"
              disabled={isLoading || tokenError || !passwordsMatch || passwordValidation.strength <= 2}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  {t('auth.resettingPassword')}
                </>
              ) : (
                t('auth.resetPasswordButton')
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