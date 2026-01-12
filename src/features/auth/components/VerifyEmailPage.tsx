import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircle, XCircle, Mail, AlertTriangle, ArrowRight, RefreshCw, Building2 } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '../api/auth.api';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Input } from '@/components/ui/input';

type VerificationStatus = 'loading' | 'success' | 'invalid' | 'expired' | 'error';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: '/verify-email' }) as { token?: string };
  
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { t, currentLanguage } = useTranslation();
  
  // Ref para controlar se a verificação já foi feita
  const hasVerified = useRef(false);

  useEffect(() => {
    // Se já verificamos ou não temos token, não faz nada
    if (hasVerified.current) {
      console.log('Já verificou, ignorando...');
      return;
    }

    const verifyToken = async () => {
      if (!token) {
        setStatus('invalid');
        setMessage(t('auth.invalidToken'));
        hasVerified.current = true;
        return;
      }

      try {
        console.log('Verifying token:', token);
        const result = await verifyEmail(token);
        
        if (result.success) {
          setStatus('success');
          setMessage(t('auth.emailVerified'));
          if (result.email) setEmail(result.email);
        } else {
          setStatus('error');
          setMessage(result.message || t('auth.emailVerificationFailed'));
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        
        if (error.response?.status === 400) {
          setStatus('invalid');
          setMessage(t('auth.invalidToken'));
        } else if (error.response?.status === 410) {
          setStatus('expired');
          setMessage(t('auth.tokenExpired'));
        } else {
          setStatus('error');
          setMessage(error.response?.data?.message || t('auth.emailVerificationFailed'));
        }
      } finally {
        // Marca como verificado independente do resultado
        hasVerified.current = true;
      }
    };

    verifyToken();
  }, [token, t]);

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setMessage(t('auth.pleaseEnterEmail'));
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    
    try {
      await resendVerificationEmail(resendEmail);
      setResendSuccess(true);
      setMessage(t('auth.resendSuccess'));
    } catch (error: any) {
      setMessage(error.response?.data?.message || t('auth.resendError'));
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate({ to: '/login' });
  };

  const renderStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('auth.verifyingEmail')}</h3>
              <p className="text-muted-foreground">
                {t('auth.checkYourEmail')}
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full animate-[loading_2s_ease-in-out_infinite]" />
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('auth.emailVerified')}</h3>
              <p className="text-muted-foreground">
                {email ? (
                  <>
                    <span className="font-medium text-foreground">{email}</span>{' '}
                    {t('auth.verifiedSuccessfully')}
                  </>
                ) : (
                  t('auth.verifiedSuccessfully')
                )}
              </p>
            </div>
            <Button 
              onClick={handleGoToLogin}
              className="w-full h-11 group"
            >
              {t('auth.goToLogin')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('auth.invalidToken')}</h3>
              <p className="text-muted-foreground">
                {t('auth.tokenExpired')}
              </p>
            </div>
            
            {/* Resend verification form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('auth.enterEmailToResend')}
                </label>
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="bg-background/50"
                  disabled={isResending}
                />
              </div>
              <Button 
                onClick={handleResendVerification}
                disabled={isResending || !resendEmail}
                className="w-full h-11"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.sending')}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {t('auth.resendVerification')}
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'invalid':
      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('auth.emailVerificationFailed')}</h3>
              <p className="text-muted-foreground">
                {message}
              </p>
            </div>
            <Button 
              onClick={handleGoToLogin}
              variant="outline"
              className="w-full h-11"
            >
              {t('auth.goToLogin')}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

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

        {/* Logo/Branding */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight">ELYON</h1>
              <p className="text-sm text-muted-foreground">AI Hotel Operation</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">
              {t('auth.verifyEmail')}
            </CardTitle>
            <CardDescription>
              {status === 'loading' ? t('auth.checkYourEmail') : ''}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderStatusContent()}
            
            {/* Resend success message */}
            {resendSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-600">
                    {t('auth.resendSuccess')} {t('auth.checkInbox')}
                  </p>
                </div>
              </div>
            )}

            {/* Error message */}
            {message && !resendSuccess && status !== 'loading' && status !== 'success' && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    {message}
                  </p>
                </div>
              </div>
            )}

            {/* Additional info */}
            <div className="border-t border-border pt-4 mt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t('auth.needHelp')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('auth.verificationHelpText')}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    {t('auth.contactSupport')}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={handleGoToLogin}>
                    {t('auth.backToLogin')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>© {new Date().getFullYear()} BIS Corporation. {t('common.allRightsReserved')}</p>
            <div className="flex justify-center gap-4">
              <button className="hover:text-foreground transition-colors">
                {t('common.privacyPolicy')}
              </button>
              <button className="hover:text-foreground transition-colors">
                {t('common.support')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}