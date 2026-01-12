// features/auth/components/RegisterForm.tsx - VERSÃO PROFISSIONAL
import * as React from 'react';
import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building2,
  AlertCircle,
  CheckCircle,
  Key,
  ArrowLeft,
  Building
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { register } from '../api/auth.api';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

// Validação de senha
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

export function RegisterForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    language: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordValidation = validatePassword(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpa erros quando o usuário começa a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validações client-side
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.company) {
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
      const language = localStorage.getItem('i18nextLng') || 'en';
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        company: formData.company,
        language: language,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate({ to: '/login' });
      }, 2000);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || t('auth.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate({ to: '/login' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Se o registro foi bem-sucedido, mostra tela de sucesso
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
                  {t('auth.registrationSuccess')}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {t('auth.registrationSuccessMessage')}
                </p>
              </div>

              <div className="pt-4">
                <div className="animate-pulse text-sm text-muted-foreground">
                  {t('auth.redirectingToLogin')}
                </div>
                <div className="h-1 w-32 mx-auto mt-2 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out]"></div>
                </div>
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

        {/* Register Card */}
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
                {t('auth.createAccount')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('auth.createAccountDescription')}
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

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t('auth.companyName')} <span className="text-muted-foreground text-xs"></span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder='Marriott International' 
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Name Field (Optional) */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t('auth.fullName')} <span className="text-muted-foreground text-xs">({t('auth.optional')})</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('auth.email')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.password')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{t('auth.passwordStrength')}:</span>
                    <span className={`text-xs font-bold ${passwordValidation.strengthColor}`}>
                      {passwordValidation.strengthText}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordValidation.strength <= 2 ? 'bg-red-500' :
                          passwordValidation.strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {passwordValidation.checks.length ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Key className="h-3 w-3" />
                      )}
                      <span>{t('auth.minCharacters', { count: 8 })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordValidation.checks.uppercase ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Key className="h-3 w-3" />
                      )}
                      <span>{t('auth.uppercaseLetter')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordValidation.checks.lowercase ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Key className="h-3 w-3" />
                      )}
                      <span>{t('auth.lowercaseLetter')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordValidation.checks.number ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Key className="h-3 w-3" />
                      )}
                      <span>{t('auth.number')}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      {passwordValidation.checks.special ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Key className="h-3 w-3" />
                      )}
                      <span>{t('auth.specialCharacter')}</span>
                    </div>
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
                  className={`pl-10 pr-10 bg-background/50 border-input focus:ring-2 focus:ring-primary/20 ${formData.confirmPassword
                      ? passwordsMatch
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-red-500 focus:border-red-500'
                      : 'focus:border-primary'
                    }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isLoading}
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
                <div className={`flex items-center gap-1 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'
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

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight">
                {t('auth.agreeToTerms')}{' '}
                <button type="button" className="text-primary hover:text-primary/80 underline">
                  {t('auth.termsOfService')}
                </button>{' '}
                {t('common.and')}{' '}
                <button type="button" className="text-primary hover:text-primary/80 underline">
                  {t('auth.privacyPolicy')}
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 mt-4"
              disabled={isLoading || !passwordsMatch || passwordValidation.strength <= 2}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  {t('auth.creatingAccount')}
                </>
              ) : (
                t('auth.createAccountButton')
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">
                {t('auth.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social Login (opcional) */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => console.log('Google register')}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => console.log('Microsoft register')}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Microsoft
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.alreadyHaveAccount')}{' '}
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