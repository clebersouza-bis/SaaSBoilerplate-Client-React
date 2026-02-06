// features/auth/components/InviteConfirmationPage.tsx - VERSÃO CORRIGIDA
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  CheckCircle, 
  Shield, 
  Mail, 
  UserPlus, 
  ArrowRight, 
  Lock, 
  Key,
  Users,
  Building,
  Sparkles,
  AlertCircle,
  KeyRound
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordInput } from '@/components/ui/password-input'; // Componente customizado

interface InviteData {
  email: string;
  invitedBy: string;
  invitedAt: string;
  company: string;
  role: string;
  fullName?: string;
  requiresPassword: boolean;
}

export function InviteConfirmationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

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

  useEffect(() => {
    const loadInviteData = async () => {
      setIsLoading(true);
      
      try {
        const response = await api.get(`/auth/validate-invite?token=${token}&email=${email}`, {
          skipAuth: true,
          skipErrorToast: true
        });
        
        setInviteData({
          email: response.data.email,
          invitedBy: response.data.invitedBy,
          invitedAt: response.data.invitedAt,
          company: response.data.company,
          role: response.data.role,
          fullName: response.data.fullName,
          requiresPassword: response.data.requiresPassword
        });
        
      } catch (err: any) {
        console.error('Error loading invite:', err);
        
        if (err.response?.status === 404) {
          setError(t('auth.inviteInvalid'));
        } else if (err.response?.status === 410) {
          setError(t('auth.inviteExpired'));
        } else if (err.response?.status === 409) {
          setError(t('auth.inviteAlreadyUsed'));
        } else {
          setError(t('common.somethingWentWrong'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token && email) {
      loadInviteData();
    } else {
      setError(t('auth.noInvitationToken'));
      setIsLoading(false);
    }
  }, [token, email, t]);

  const handleAcceptInvitation = async () => {
    if (!token || !inviteData) return;
    
    if (inviteData.requiresPassword) {
      if (!validatePassword()) {
        return;
      }
    }
    
    setIsVerifying(true);
    setError(null);
    
    try {
      const payload: any = {
        token,
        email: inviteData.email
      };
      
      if (inviteData.requiresPassword && password) {
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }
      
      const response = await api.post('/auth/invite-email', payload, {
        skipAuth: true,
        skipErrorToast: true
      });
      
      setIsConfirmed(true);
      
      toast.success(t('auth.inviteAccepted'), {
        description: t('auth.redirectingToLogin')
      });
      
      setTimeout(() => {
        navigate({ 
          to: '/login',
          search: {
            email: inviteData.email,
            message: 'invite_accepted'
          }
        });
      }, 3000);
      
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      
      if (err.response?.status === 400) {
        const errorMsg = err.response.data?.errors?.[0] || err.response.data?.message;
        setError(errorMsg || t('auth.inviteInvalid'));
      } else if (err.response?.status === 410) {
        setError(t('auth.inviteExpired'));
      } else if (err.response?.status === 409) {
        setError(t('auth.inviteAlreadyUsed'));
      } else {
        setError(t('common.somethingWentWrong'));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const passwordStrength = checkPasswordStrength();

  // ... (resto do componente similar ao anterior, mas atualizando a parte de senha) ...

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header mantido igual */}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {!isConfirmed && inviteData && (
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('auth.welcomeToTeam')}</CardTitle>
              <CardDescription className="text-lg">
                {t('auth.youveBeenInvited')} <span className="font-semibold">{inviteData.company}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Invitation Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">{t('auth.invitedEmail')}</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{inviteData.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">{t('auth.role')}</Label>
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      {inviteData.role}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('auth.invitedBy')}</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span>{inviteData.invitedBy}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Password Section */}
              {inviteData.requiresPassword && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t('auth.setupYourPassword')}</h3>
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
                    
                    {passwordError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}
              
              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">{t('auth.byAcceptingYouAgree')}</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>{t('auth.termsConfidentiality')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>{t('auth.termsSecurity')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>{t('auth.termsTeamGuidelines')}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button
                onClick={handleAcceptInvitation}
                disabled={isVerifying || (inviteData.requiresPassword && !password)}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {inviteData.requiresPassword 
                      ? t('auth.creatingAccount') 
                      : t('auth.verifyingInvitation')
                    }
                  </>
                ) : (
                  <>
                    {inviteData.requiresPassword 
                      ? t('auth.createAccount') 
                      : t('auth.acceptInvitation')
                    }
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                {inviteData.requiresPassword 
                  ? t('auth.byCreatingAccountYouAgree')
                  : t('auth.byAcceptingYouConfirm')
                }
              </p>
            </CardFooter>
          </Card>
        )}
        
        {/* Loading, Error, and Success states mantidos similares */}
      </div>
    </div>
  );
}