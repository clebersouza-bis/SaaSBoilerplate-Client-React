// features/subscription/components/SubscriptionPage.tsx
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Check,
  ChevronRight,
  Sparkles,
  Building2,
  Zap,
  Eye,
  Star,
  HelpCircle,
  Mail,
  Phone,
  Calendar,
  Award,
  HeadphonesIcon,
  Lock,
  Eye as EyeIcon,
  EyeOff,
  User,
  ArrowLeft,
  Hotel,
  AlertCircle,
  CheckCircle,
  Key
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { register } from '@/features/auth/api/auth.api';
import { extractApiErrorMessage } from '@/lib/api/error-utils';
import { toast } from 'sonner';

interface PlanFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  minMonthly: number;
  setupFee: number;
  setupDescription: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  badgeText: string;
  features: PlanFeature[];
  popular?: boolean;
  enterprise?: boolean;
}

interface BillingCycle {
  value: string;
  label: string;
  discount: number;
  months: number;
}

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

export function SubscriptionPage() {
  const { t, hasTranslation } = useTranslation();
  const navigate = useNavigate();

  // Plan & Billing
  const [selectedPlan, setSelectedPlan] = useState<string>('autopilot');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');
  const [rooms, setRooms] = useState<number>(50);
  const [roomsInput, setRoomsInput] = useState<string>('50');
  
  // Registration Form
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // UI State
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  const plans: Plan[] = [
    {
      id: 'core',
      code: 'CORE',
      name: 'ELYON CORE',
      description: t('subscription.plans.core.description'),
      price: 1.50,
      minMonthly: 150,
      setupFee: 0,
      setupDescription: t('subscription.plans.core.setupDescription'),
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500',
      badgeColor: 'bg-blue-600',
      badgeText: 'Core',
      popular: false,
      features: [
        { name: t('subscription.features.housekeepingApp'), included: true },
        { name: t('subscription.features.effortPoints'), included: true },
        { name: t('subscription.features.maintenanceLog'), included: true },
        { name: t('subscription.features.realTimeDashboard'), included: true },
        { name: t('subscription.features.aiDispatch'), included: false, tooltip: t('subscription.tooltips.aiDispatch') },
        { name: t('subscription.features.guestMessaging'), included: false, tooltip: t('subscription.tooltips.guestMessaging') },
        { name: t('subscription.features.shiftForecast'), included: false, tooltip: t('subscription.tooltips.shiftForecast') },
        { name: t('subscription.features.multiProperty'), included: false, tooltip: t('subscription.tooltips.multiProperty') },
      ]
    },
    {
      id: 'autopilot',
      code: 'AUTOPILOT',
      name: 'ELYON AUTOPILOT',
      description: t('subscription.plans.autopilot.description'),
      price: 2.75,
      minMonthly: 0,
      setupFee: 1500,
      setupDescription: t('subscription.plans.autopilot.setupDescription'),
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      borderColor: 'border-purple-500',
      badgeColor: 'bg-purple-600',
      badgeText: 'Popular',
      popular: true,
      features: [
        { name: t('subscription.features.allCore'), included: true },
        { name: t('subscription.features.aiDispatch'), included: true },
        { name: t('subscription.features.aiTriage'), included: true },
        { name: t('subscription.features.guestPortal'), included: true },
        { name: t('subscription.features.guestMessaging'), included: true },
        { name: t('subscription.features.aiRiskEngine'), included: true },
        { name: t('subscription.features.operationalTimeline'), included: true },
        { name: t('subscription.features.shiftForecast'), included: false, tooltip: t('subscription.tooltips.shiftForecast') },
      ]
    },
    {
      id: 'vision',
      code: 'VISION',
      name: 'ELYON VISION',
      description: t('subscription.plans.vision.description'),
      price: 4.00,
      minMonthly: 0,
      setupFee: 5000,
      setupDescription: t('subscription.plans.vision.setupDescription'),
      icon: Eye,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500',
      borderColor: 'border-amber-500',
      badgeColor: 'bg-amber-600',
      badgeText: 'Enterprise',
      enterprise: true,
      features: [
        { name: t('subscription.features.allAutopilot'), included: true },
        { name: t('subscription.features.aiShiftFeasibility'), included: true },
        { name: t('subscription.features.shiftForecast'), included: true },
        { name: t('subscription.features.multiPropertyDashboard'), included: true },
        { name: t('subscription.features.hapiIntegration'), included: true },
        { name: t('subscription.features.advancedReports'), included: true },
        { name: t('subscription.features.prioritySupport'), included: true },
        { name: t('subscription.features.staffAnalytics'), included: true },
      ]
    }
  ];

  const billingCycles: BillingCycle[] = [
    { value: 'monthly', label: t('subscription.monthly'), discount: 0, months: 1 },
    { value: 'annual', label: t('subscription.annual'), discount: 20, months: 12 },
  ];

  const getSelectedPlan = () => plans.find(p => p.id === selectedPlan) || plans[1];
  const selectedPlanData = getSelectedPlan();
  const selectedCycle = billingCycles.find(c => c.value === billingCycle) || billingCycles[0];

  const handleRoomsChange = (value: string) => {
    setRoomsInput(value);
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setRooms(num);
    }
  };

  const handleRoomsBlur = () => {
    const num = parseInt(roomsInput);
    if (isNaN(num) || num < 1) {
      setRoomsInput('1');
      setRooms(1);
    } else {
      setRoomsInput(num.toString());
    }
  };

  const incrementRooms = (step: number = 10) => {
    const newValue = rooms + step;
    setRooms(newValue);
    setRoomsInput(newValue.toString());
  };

  const decrementRooms = (step: number = 10) => {
    const newValue = Math.max(1, rooms - step);
    setRooms(newValue);
    setRoomsInput(newValue.toString());
  };

  const calculateMonthlyPrice = () => {
    const basePrice = selectedPlanData.price * rooms;
    const discount = selectedCycle.discount / 100;
    return basePrice * (1 - discount);
  };

  const calculateSetupFee = () => {
    if (selectedPlanData.setupFee === 0) return 0;
    return selectedPlanData.setupFee;
  };

  const calculateTotalFirstYear = () => {
    const monthly = calculateMonthlyPrice();
    const setup = calculateSetupFee();
    return (monthly * 12) + setup;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validações
    if (!companyName || !companyEmail || !password || !confirmPassword) {
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

    if (!agreeTerms) {
      setError(t('auth.agreeToTermsRequired'));
      setIsLoading(false);
      return;
    }

    try {
      const language = localStorage.getItem('i18nextLng') || 'en';
      
      // Register user
      await register({
        email: companyEmail,
        password: password,
        name: fullName || undefined,
        company: companyName,
        language: language,
      });

      // Send subscription data
      const subscriptionData = {
        planCode: selectedPlanData.code,
        billingCycle: billingCycle,
        rooms: rooms,
        companyName: companyName,
        companyEmail: companyEmail,
        companyPhone: companyPhone || undefined,
        promoCode: promoCode || undefined
      };
      
      console.log('Subscription data:', subscriptionData);
      
      setSuccess(true);
      
      toast.success(t('subscription.registrationSuccess'), {
        duration: 5000,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 2000);

    } catch (error) {
      toast.error(
        extractApiErrorMessage(error, {
          t,
          hasTranslation,
          fallbackMessage: t('common.errorSaving'),
        }),
        {
          duration: 10000
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const FeatureTooltip = ({ feature }: { feature: PlanFeature }) => {
    if (!feature.tooltip) return null;
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground cursor-help inline hover:text-primary transition-colors" />
        </DialogTrigger>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm">{feature.name}</DialogTitle>
            <DialogDescription className="text-xs">
              {feature.tooltip}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
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
          {/* Success Card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t('subscription.registrationSuccess')}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {t('subscription.registrationSuccessMessage')}
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Top Bar with Logo and Actions */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Hotel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ELYON</span>
            <Badge variant="outline" className="ml-2 border-primary/30 text-primary">
              AI Hotel Operation
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate({ to: '/login' })}
            >
              {t('auth.signIn')}
            </Button>
          </div>
        </div>
      </div>

      {/* Back to Login */}
      <div className="pt-20 pb-4 max-w-7xl mx-auto px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/login' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.backToLogin')}
        </Button>
      </div>

      <div className="pb-16 max-w-7xl mx-auto px-4 relative">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 px-4 py-1 text-xs border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('subscription.tagline')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('subscription.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Rooms Counter - Centralized and Larger with input */}
        <div className="flex justify-center mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border-border w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t('subscription.numberOfRooms')}
                </Label>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => decrementRooms(10)}
                    className="h-10 w-10 rounded-full"
                  >
                    -10
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => decrementRooms(1)}
                    className="h-10 w-10 rounded-full"
                  >
                    -1
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={roomsInput}
                    onChange={(e) => handleRoomsChange(e.target.value)}
                    onBlur={handleRoomsBlur}
                    className="w-20 h-16 text-3xl font-bold text-center bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => incrementRooms(1)}
                    className="h-10 w-10 rounded-full"
                  >
                    +1
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => incrementRooms(10)}
                    className="h-10 w-10 rounded-full"
                  >
                    +10
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('subscription.roomsDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-card/80 backdrop-blur-sm p-1.5 rounded-full border border-border inline-flex">
            {billingCycles.map((cycle) => (
              <Button
                key={cycle.value}
                variant={billingCycle === cycle.value ? "default" : "ghost"}
                onClick={() => setBillingCycle(cycle.value)}
                className={`relative px-8 py-2 rounded-full ${
                  billingCycle === cycle.value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cycle.label}
                {cycle.discount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 bg-green-500 text-white border-0 text-xs px-2 py-0.5"
                  >
                    {t('subscription.save', { percent: cycle.discount })}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const monthlyTotal = plan.price * rooms;
            const discountedTotal = monthlyTotal * (1 - (selectedCycle.discount / 100));
            const qualifiesForMin = plan.minMonthly > 0 && discountedTotal < plan.minMonthly;

            return (
              <Card
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? `ring-4 ring-${plan.color.replace('text-', '')} shadow-2xl scale-[1.02] bg-card`
                    : 'hover:shadow-xl hover:scale-[1.01] bg-card/50 backdrop-blur-sm hover:bg-card/80'
                } border-2 ${
                  isSelected ? plan.borderColor : 'border-border'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1.5 text-sm font-bold shadow-lg">
                      <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                      {t('subscription.mostPopular')}
                    </Badge>
                  </div>
                )}

                {/* Enterprise Badge */}
                {plan.enterprise && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 px-3 py-1">
                      <Award className="h-3 w-3 mr-1" />
                      {t('subscription.enterprise')}
                    </Badge>
                  </div>
                )}

                <CardHeader className={`text-center ${plan.popular ? 'pt-8' : ''}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${plan.bgColor} bg-opacity-20 flex items-center justify-center border-2 ${plan.borderColor}`}>
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t('subscription.perRoomMonth')}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="text-sm text-muted-foreground mb-1">{t('subscription.yourPrice')}</div>
                        <div className="flex items-baseline justify-center gap-2">
                          {selectedCycle.discount > 0 && (
                            <span className="text-sm line-through text-muted-foreground">
                              {formatCurrency(monthlyTotal)}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(discountedTotal)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {t('subscription.perMonth')}
                          </span>
                        </div>
                        
                        {qualifiesForMin && (
                          <Alert variant="destructive" className="mt-2 bg-destructive/10 border-destructive/30">
                            <AlertDescription className="text-xs text-destructive">
                              {t('subscription.minimumRequired', { amount: formatCurrency(plan.minMonthly) })}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center ${
                          feature.included ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Check className={`h-3 w-3 ${feature.included ? '' : 'opacity-50'}`} />
                        </div>
                        <span className={`text-sm ml-3 ${!feature.included && 'text-muted-foreground'}`}>
                          {feature.name}
                          <FeatureTooltip feature={feature} />
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Setup & Minimum */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('subscription.setup')}:</span>
                      <span className={plan.setupFee === 0 ? 'text-green-500 font-medium' : ''}>
                        {plan.setupFee === 0 ? t('subscription.free') : formatCurrency(plan.setupFee)}
                      </span>
                    </div>
                    {plan.setupDescription && (
                      <div className="text-xs text-muted-foreground">
                        {plan.setupDescription}
                      </div>
                    )}
                    
                    {plan.minMonthly > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('subscription.minimum')}:</span>
                        <span className="font-medium">{formatCurrency(plan.minMonthly)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <div className={`w-full py-2 px-4 rounded-lg text-center font-medium border-2 ${
                    isSelected 
                      ? `${plan.borderColor} bg-${plan.color.replace('text-', '')} bg-opacity-10`
                      : 'border-border text-muted-foreground'
                  }`}>
                    {isSelected ? t('subscription.selected') : t('subscription.clickToSelect')}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Registration Form */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-2xl">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl">{t('subscription.createAccount')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('subscription.createAccountDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-medium">
                      {t('auth.fullName')} <span className="text-xs text-muted-foreground">({t('auth.optional')})</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder={t('auth.fullNamePlaceholder')}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-sm font-medium">
                      {t('auth.companyName')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder={t('auth.companyPlaceholder')}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email" className="text-sm font-medium">
                      {t('auth.businessEmail')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company-email"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="pl-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder={t('auth.emailPlaceholder')}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone" className="text-sm font-medium">
                      {t('auth.phoneNumber')}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company-phone"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="pl-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="+55 11 99999-9999"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      {t('auth.password')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {password && (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t('auth.passwordStrength')}:</span>
                          <span className={`text-xs font-bold ${passwordValidation.strengthColor}`}>
                            {t(`auth.${passwordValidation.strengthText.toLowerCase()}`)}
                          </span>
                        </div>
                        <Progress 
                          value={(passwordValidation.strength / 5) * 100} 
                          className="h-1.5 bg-muted"
                        />
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

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      {t('auth.confirmPassword')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 bg-background/50 border-input focus:ring-2 focus:ring-primary/20 ${
                          confirmPassword && !passwordsMatch ? 'border-destructive' : ''
                        }`}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                    </div>
                    
                    {confirmPassword && (
                      <div className={`flex items-center gap-1 text-xs ${
                        passwordsMatch ? 'text-green-600' : 'text-destructive'
                      }`}>
                        {passwordsMatch ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span>
                          {passwordsMatch ? t('auth.passwordsMatch') : t('auth.passwordsDontMatch')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-code" className="text-sm font-medium">
                      {t('subscription.promoCode')}
                    </Label>
                    <Input
                      id="promo-code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="EXCLUSIVE2024"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Selected Plan Summary */}
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-2">{t('subscription.selectedPlan')}:</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${selectedPlanData.bgColor} bg-opacity-20 flex items-center justify-center border ${selectedPlanData.borderColor}`}>
                        <selectedPlanData.icon className={`h-4 w-4 ${selectedPlanData.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selectedPlanData.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedPlanData.description}</p>
                      </div>
                      <Badge variant="outline" className="border-border">
                        {selectedCycle.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="font-medium mb-3">{t('subscription.priceSummary')}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('subscription.basePrice')}:</span>
                    <span>{formatCurrency(selectedPlanData.price * rooms)}{t('subscription.perMonth')}</span>
                  </div>
                  
                  {selectedCycle.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t('subscription.discount', { percent: selectedCycle.discount })}:</span>
                      <span>-{formatCurrency((selectedPlanData.price * rooms) * (selectedCycle.discount / 100))}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>{t('subscription.monthlyTotal')}:</span>
                    <span className="text-primary text-lg">{formatCurrency(calculateMonthlyPrice())}</span>
                  </div>
                  
                  {calculateSetupFee() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('subscription.setupFee')}:</span>
                      <span>{formatCurrency(calculateSetupFee())}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('subscription.firstYearTotal')}:</span>
                    <span>{formatCurrency(calculateTotalFirstYear())}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    {t('auth.agreeToTerms')}{' '}
                    <button type="button" className="text-primary hover:text-primary/80 underline">
                      {t('auth.termsOfService')}
                    </button>{' '}
                    {t('common.and')}{' '}
                    <button type="button" className="text-primary hover:text-primary/80 underline">
                      {t('auth.privacyPolicy')}
                    </button>
                  </Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-12 text-base font-medium"
                    disabled={isLoading || !companyName || !companyEmail || !password || !agreeTerms || !passwordsMatch}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        {t('auth.creatingAccount')}
                      </>
                    ) : (
                      <>
                        {t('subscription.registerNow')}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowContactDialog(true)}
                    className="h-12"
                  >
                    <HeadphonesIcon className="h-4 w-4 mr-2" />
                    {t('subscription.talkToSales')}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Sales Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle>{t('subscription.contactSales')}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t('subscription.contactSalesDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{t('subscription.callUs')}</p>
                  <p className="text-xs text-muted-foreground">+1 (888) 555-0123</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{t('subscription.emailUs')}</p>
                  <p className="text-xs text-muted-foreground">sales@elyon.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{t('subscription.scheduleDemo')}</p>
                  <p className="text-xs text-muted-foreground">{t('subscription.scheduleDemoDescription')}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Separator />
          <div className="text-xs text-muted-foreground space-y-2 mt-6">
            <p>© {new Date().getFullYear()} ELYON AI Hotel Operation. {t('common.allRightsReserved')}</p>
            <div className="flex justify-center gap-6">
              <button className="hover:text-foreground transition-colors">{t('auth.privacyPolicy')}</button>
              <button className="hover:text-foreground transition-colors">{t('auth.termsOfService')}</button>
              <button className="hover:text-foreground transition-colors">{t('common.support')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}