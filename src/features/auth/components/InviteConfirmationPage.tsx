// features/auth/components/InviteConfirmationPage.tsx - VERSÃO REFINADA
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { 
  CheckCircle, 
  Shield, 
  Mail, 
  UserPlus, 
  ArrowRight, 
  Lock, 
  KeyRound,
  Building2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  LogIn,
  LucideBuilding,
  LucideBuilding2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordInput } from '@/components/ui/password-input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

type InviteStatus = 'loading' | 'valid' | 'invalid' | 'expired' | 'existing-user' | 'error';

interface ValidateInviteResponse {
  companyName: string;
  isValidToken: boolean;
  isTokenExpired: boolean;
  isNewUser: boolean;
}

interface InviteData {
  companyName: string;
  email?: string;
  invitedBy?: string;
  role?: string;
}

const validateInviteInFlight = new Map<string, Promise<ValidateInviteResponse>>();

export function InviteConfirmationPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/invite/confirm' }) as { token?: string };
  const { token } = search;
  
  const [status, setStatus] = useState<InviteStatus>('loading');
  const [message, setMessage] = useState('');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para senha
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
  const { t } = useTranslation();
  
  // Ref para controlar se a verificação já foi feita
  const hasVerified = useRef(false);

  useEffect(() => {
    // Se já verificamos, não faz nada
    if (hasVerified.current) {
      return;
    }

    const validateInvite = async () => {
      if (!token) {
        setStatus('invalid');
        setMessage(t('auth.noInvitationToken'));
        hasVerified.current = true;
        return;
      }

      try {
        console.log('Validating invite with token:', token);

        const pendingRequest =
          validateInviteInFlight.get(token) ||
          api.post<ValidateInviteResponse>('/auth/validate-invite',
            { token },
            {
              skipAuth: true,
              skipErrorToast: true,
            }
          ).then((response) => response.data);

        validateInviteInFlight.set(token, pendingRequest);

        const responseData = await pendingRequest;
        
        console.log('Validation response:', responseData);
        
        const { isValidToken, isTokenExpired, isNewUser, companyName } = responseData;
        
        // Token inválido
        if (!isValidToken) {
          setStatus('invalid');
          setMessage(t('auth.inviteInvalid'));
        }
        // Token expirado
        else if (isTokenExpired) {
          setStatus('expired');
          setMessage(t('auth.inviteExpiredDescription'));
        }
        // Usuário existente (já tem conta)
        else if (!isNewUser) {
          setStatus('existing-user');
          setInviteData({ companyName });
        }
        // Novo usuário - precisa criar senha
        else {
          setStatus('valid');
          setInviteData({ 
            companyName,

          });
        }
        
      } catch (error: any) {
        console.error('Validation error:', error);
        
        // Tratamento de erros baseado no status HTTP
        if (error.response?.status === 400) {
          setStatus('invalid');
          setMessage(t('auth.inviteInvalid'));
        } else if (error.response?.status === 410) {
          setStatus('expired');
          setMessage(t('auth.inviteExpiredDescription'));
        } else {
          setStatus('error');
          setMessage(error.response?.data?.message || t('common.somethingWentWrong'));
        }
      } finally {
        hasVerified.current = true;
        if (token) {
          validateInviteInFlight.delete(token);
        }
      }
    };

    validateInvite();
  }, [token]);

  const validatePassword = () => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push(t('auth.passwordMinLength'));
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push(t('auth.passwordUppercase'));
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push(t('auth.passwordNumber'));
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(t('auth.passwordSpecialChar'));
    }
    
    if (password !== confirmPassword) {
      errors.push(t('auth.passwordsDontMatch'));
    }
    
    if (errors.length > 0) {
      setPasswordError(errors.join('. '));
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const checkPasswordStrength = () => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    return score;
  };

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = (score: number) => {
    switch (score) {
      case 0: return t('auth.veryWeak');
      case 1: return t('auth.weak');
      case 2: return t('auth.fair');
      case 3: return t('auth.good');
      case 4: return t('auth.strong');
      default: return t('auth.veryWeak');
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) return;
    
    if (!validatePassword()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const payload = {
        token,
        password,
        confirmPassword
      };
      
      console.log('Accepting invitation with password:', payload);
      
      // Endpoint POST invite-accept
      await api.post('/auth/invite-accept', payload, {
        skipAuth: true,
        skipErrorToast: true
      });
      
      // Sucesso - redireciona para login
      console.log('Caiu aqui sucesso...deveria mostrar toast')
      toast.success(t('auth.accountCreated'), {
        description: t('auth.redirectingToLogin')
      });
      
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 4000);
      
    } catch (error: any) {
      console.error('Accept error:', error);
      
      if (error.response?.status === 400) {
        setMessage(error.response.data?.errors?.[0] || error.response.data?.message || t('auth.inviteInvalid'));
      } else if (error.response?.status === 410) {
        setMessage(t('auth.inviteExpired'));
      } else {
        setMessage(error.response?.data?.message || t('common.somethingWentWrong'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate({ to: '/login' });
  };

  const handleExistingUserConfirm = () => {
    navigate({ to: '/login' });
  };

  const passwordStrength = checkPasswordStrength();

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
              <h3 className="text-xl font-semibold">{t('auth.validatingInvite')}</h3>
              <p className="text-muted-foreground">
                {t('auth.checkingInvitation')}
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full animate-[loading_2s_ease-in-out_infinite]" />
            </div>
          </div>
        );

      case 'valid':
          console.log('Renderizando valid com inviteData:', inviteData);

        return (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">
                {t('auth.welcomeTo')} {inviteData?.companyName || 'erro'}
              </h3>
              <p className="text-muted-foreground">
                {t('auth.setupPasswordToContinue')}
              </p>
            </div>
            
            <Separator />
            
            {/* Password Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">{t('auth.createYourPassword')}</h4>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.enterPassword')}
                    onFocus={() => setShowPasswordRequirements(true)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPassword')}
                    required
                  />
                </div>
                
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('auth.passwordStrength')}:</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength >= 3 ? 'text-green-500' : 
                        passwordStrength === 2 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Password Requirements */}
                {showPasswordRequirements && (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium">{t('auth.passwordRequirements')}:</h4>
                    <ul className="text-xs space-y-1">
                      <li className={`flex items-center gap-2 ${
                        password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          password.length >= 8 ? 'bg-green-500' : 'bg-muted-foreground'
                        }`} />
                        {t('auth.minimum8Characters')}
                      </li>
                      <li className={`flex items-center gap-2 ${
                        /[A-Z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-muted-foreground'
                        }`} />
                        {t('auth.oneUppercaseLetter')}
                      </li>
                      <li className={`flex items-center gap-2 ${
                        /[0-9]/.test(password) ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          /[0-9]/.test(password) ? 'bg-green-500' : 'bg-muted-foreground'
                        }`} />
                        {t('auth.oneNumber')}
                      </li>
                      <li className={`flex items-center gap-2 ${
                        /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-500' : 'bg-muted-foreground'
                        }`} />
                        {t('auth.oneSpecialCharacter')}
                      </li>
                      <li className={`flex items-center gap-2 ${
                        password === confirmPassword && password !== '' ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          password === confirmPassword && password !== '' ? 'bg-green-500' : 'bg-muted-foreground'
                        }`} />
                        {t('auth.passwordsMustMatch')}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAcceptInvitation}
                disabled={isSubmitting || !password}
                className="w-full h-11"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.creatingAccount')}
                  </>
                ) : (
                  <>
                    {t('auth.createAccount')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleGoToLogin}
                className="w-full"
              >
                {t('auth.backToLogin')}
              </Button>
            </div>
          </div>
        );

      case 'existing-user':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('auth.accountFound')}</h3>
              <p className="text-muted-foreground">
                {t('auth.existingAccountMessage', { company: inviteData?.companyName || '' })}
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleExistingUserConfirm}
                className="w-full h-11 gap-2"
              >
                <LogIn className="h-4 w-4" />
                {t('auth.proceedToLogin')}
              </Button>
            </div>
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
              <h3 className="text-xl font-semibold">{t('auth.inviteExpired')}</h3>
              <p className="text-muted-foreground">
                {t('auth.inviteExpiredDescription')}
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate({ to: '/' })}
                className="w-full h-11"
              >
                {t('common.goHome')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGoToLogin}
                className="w-full"
              >
                {t('auth.backToLogin')}
              </Button>
            </div>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('auth.inviteInvalid')}</h3>
              <p className="text-muted-foreground">
                {message || t('auth.inviteInvalidDescription')}
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate({ to: '/' })}
                className="w-full h-11"
              >
                {t('common.goHome')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGoToLogin}
                className="w-full"
              >
                {t('auth.backToLogin')}
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('common.error')}</h3>
              <p className="text-muted-foreground">
                {message || t('common.somethingWentWrong')}
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate({ to: '/' })}
                className="w-full h-11"
              >
                {t('common.goHome')}
              </Button>
            </div>
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
              {status === 'loading' ? t('auth.validatingInvite') : 
               status === 'valid' ? t('auth.completeRegistration') :
               status === 'existing-user' ? t('auth.welcomeBack') :
               t('auth.invitationError')}
            </CardTitle>
            <CardDescription>
              {status === 'loading' ? t('common.loadingPleaseWait') : ''}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderStatusContent()}
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
