// features/auth/components/ProfilePage.tsx - VERSÃO CORRIGIDA
import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Settings, Calendar, Globe,
  Lock, Eye, EyeOff, Camera, LogOut, Save, X, AlertCircle,
  CheckCircle, Clock, MapPin, Monitor, Smartphone, Tablet,
  Trash2, Key, Upload
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '../stores/auth.store';
import { 
  getUserProfile, 
  updateProfile, 
  changePassword, 
  uploadProfilePhoto,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  getUserPreferences,
  updatePreferences,
  UserProfile,
  UserSession,
  ChangePasswordRequest
} from '../api/profile.api';
import { toast } from '@/hooks/use-toast';

// Função de validação de senha
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
    strengthText = 'weak';
    strengthColor = 'text-red-500';
  } else if (strength <= 4) {
    strengthText = 'medium';
    strengthColor = 'text-yellow-500';
  } else {
    strengthText = 'strong';
    strengthColor = 'text-green-500';
  }
  
  return { checks, strength, strengthText, strengthColor };
};

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingTimezone, setIsSavingTimezone] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  
  // Estados do formulário
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    photoPath: '',
  });
  
  // Estados para alteração de senha
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Erros e mensagens
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Carregar dados do perfil
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Carrega perfil
        const profileData = await getUserProfile();
        setProfile(profileData);
        setProfileData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone || '',
          photoPath: profileData.photoPath || '',
        });
        
        // Carrega sessões (pode retornar array vazio)
        // const sessionsData = await getUserSessions();
        // setSessions(sessionsData);
        
        // Carrega preferências
        const preferences = await getUserPreferences();
        if (preferences.timezone) {
          setTimezone(preferences.timezone);
        }
        
      } catch (err: any) {
        console.error('Error loading profile data:', err);
        setError(t('profile.updateError'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleProfileUpdate = async () => {
    if (!profile) return;
    
    try {
      setIsUpdating(true);
      setError('');
      
      const updatedProfile = await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || undefined,
      });
      
      setProfile(updatedProfile);
      setEditMode(false);
      setSuccess(t('profile.updateSuccess'));
      
      toast({
        title: t('common.success'),
        description: t('profile.updateSuccess'),
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('profile.updateError'));
      toast({
        title: t('common.error'),
        description: err.response?.data?.message || t('profile.updateError'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePasswordChange = async () => {
    try {
      setIsChangingPassword(true);
      setError('');
      
      // Validações
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError(t('auth.passwordsDontMatch'));
        return;
      }
      
      const validation = validatePassword(passwordData.newPassword);
      if (validation.strength <= 2) {
        setError(t('auth.passwordTooWeak'));
        return;
      }
      
      const result = await changePassword(passwordData);
      
      if (result.success) {
        setSuccess(t('profile.passwordUpdateSuccess'));
        setChangePasswordMode(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        toast({
          title: t('common.success'),
          description: t('profile.passwordUpdateSuccess'),
        });
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('profile.updateError'));
      toast({
        title: t('common.error'),
        description: err.response?.data?.message || t('profile.updateError'),
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleTimezoneSave = async () => {
    try {
      setIsSavingTimezone(true);
      
      await updatePreferences({ timezone });
      
      toast({
        title: t('common.success'),
        description: t('profile.timezoneUpdated'),
      });
      
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.response?.data?.message || t('profile.timezoneError'),
        variant: 'destructive',
      });
    } finally {
      setIsSavingTimezone(false);
    }
  };
  
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validações
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('common.error'),
        description: t('profile.selectImageFile'),
        variant: 'destructive',
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: t('common.error'),
        description: t('profile.fileTooLarge'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsUploadingPhoto(true);
      const result = await uploadProfilePhoto(file);
      
      setProfile(prev => prev ? { ...prev, photoPath: result.photoPath } : null);
      setSuccess(t('profile.photoUpdateSuccess'));
      
      toast({
        title: t('common.success'),
        description: t('profile.photoUpdateSuccess'),
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.response?.data?.message || t('profile.photoUploadError'),
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };
  
  const handleRemovePhoto = async () => {
    try {
      setIsUploadingPhoto(true);
      setProfile(prev => prev ? { ...prev, photoPath: '' } : null);
      toast({
        title: t('common.success'),
        description: t('profile.photoRemoved'),
      });
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: t('profile.removePhotoError'),
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: t('common.success'),
        description: t('profile.sessionRevoked'),
      });
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('profile.revokeSessionError'),
        variant: 'destructive',
      });
    }
  };
  
  const handleRevokeAllSessions = async () => {
    try {
      await revokeAllSessions();
      setSessions([]);
      toast({
        title: t('common.success'),
        description: t('profile.allSessionsRevoked'),
      });
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('profile.revokeAllError'),
        variant: 'destructive',
      });
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };
  
  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return <Smartphone className="h-4 w-4" />;
    if (device.toLowerCase().includes('tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };
  
  const passwordValidation = validatePassword(passwordData.newPassword);
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{t('profile.errorLoadingProfile')}</p>
          <Button onClick={() => window.location.reload()}>{t('profile.tryAgain')}</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-4 md:py-8 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8 px-2 sm:px-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            {t('profile.managePersonalInfo')}, {t('profile.manageSecurity')} {t('profile.managePreferences')}
          </p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* Profile Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col items-center space-y-3 md:space-y-4">
                  {/* Profile Photo */}
                  <div className="relative">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 border-4 border-background">
                      <AvatarImage src={profile.photoPath} alt={`${profile.firstName} ${profile.lastName}`} />
                      <AvatarFallback className="text-lg md:text-xl lg:text-2xl bg-primary text-primary-foreground">
                        {getInitials(profile.firstName, profile.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isUploadingPhoto}
                      />
                      <div className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                        {isUploadingPhoto ? (
                          <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        ) : (
                          <Camera className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {/* Name and Role */}
                  <div className="text-center">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{profile.email}</p>
                    
                    <div className="flex items-center justify-center gap-1 md:gap-2 mt-2 flex-wrap">
                      <Badge variant={profile.active ? "default" : "secondary"} className="text-xs">
                        {profile.active ? t('profile.active') : t('profile.inactive')}
                      </Badge>
                      {profile.roles?.map(role => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 md:gap-4 w-full">
                    <div className="text-center p-2 md:p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">{t('profile.emailVerified')}</div>
                      <div className="mt-1">
                        {profile.emailConfirmed ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('profile.verified')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <X className="h-3 w-3 mr-1" />
                            {t('profile.notVerified')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center p-2 md:p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">{t('profile.phoneVerified')}</div>
                      <div className="mt-1">
                        {profile.phoneConfirmed ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('profile.verified')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {t('profile.notVerified')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Member Since */}
                  <div className="text-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline-block mr-1" />
                    {t('profile.memberSince')} {formatDate(profile.createdAt)}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2 md:gap-3 px-3 md:px-6 pb-4 md:pb-6">
                {success && (
                  <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-2 md:p-3">
                    <p className="text-xs text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                      {success}
                    </p>
                  </div>
                )}
                
                {error && (
                  <div className="w-full bg-destructive/10 border border-destructive/20 rounded-lg p-2 md:p-3">
                    <p className="text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                      {error}
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full h-8 md:h-10 text-xs md:text-sm"
                  onClick={() => logout()}
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  {t('common.close')}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Quick Stats */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-lg">{t('profile.activity')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t('profile.lastLogin')}</span>
                  <span className="text-xs font-medium">
                    {profile.lastLogin ? formatDate(profile.lastLogin) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t('profile.sessions')}</span>
                  <span className="text-xs font-medium">{sessions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Tabs Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4 md:mb-6 h-auto p-1">
                <TabsTrigger value="personal" className="flex items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm">
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">{t('profile.personalInfo')}</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm">
                  <Shield className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">{t('profile.security')}</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm">
                  <Settings className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">{t('profile.preferences')}</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm">
                  <Globe className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">{t('profile.activity')}</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Personal Info Tab */}
              <TabsContent value="personal">
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                  <CardHeader className="p-3 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm md:text-lg">{t('profile.personalInfo')}</CardTitle>
                        <CardDescription className="text-xs">
                          {t('profile.managePersonalInfo')}
                        </CardDescription>
                      </div>
                      <Button
                        variant={editMode ? "outline" : "default"}
                        size="sm"
                        onClick={() => setEditMode(!editMode)}
                        className="self-start sm:self-auto h-8 md:h-10 text-xs md:text-sm"
                      >
                        {editMode ? (
                          <>
                            <X className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            {t('common.cancel')}
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            {t('profile.editProfile')}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs font-medium">
                          {t('profile.firstName')}
                        </label>
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          disabled={!editMode || isUpdating}
                          placeholder={t('profile.firstName')}
                          className="h-8 md:h-10 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs font-medium">
                          {t('profile.lastName')}
                        </label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          disabled={!editMode || isUpdating}
                          placeholder={t('profile.lastName')}
                          className="h-8 md:h-10 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs font-medium">
                          {t('profile.email')}
                        </label>
                        <Input
                          value={profile.email}
                          disabled
                          className="bg-muted/50 h-8 md:h-10 text-sm"
                        />
                        <div className="flex items-center gap-1 md:gap-2 text-xs">
                          {profile.emailConfirmed ? (
                            <Badge variant="default" className="gap-1 text-[10px] md:text-xs">
                              <CheckCircle className="h-2 w-2 md:h-3 md:w-3" />
                              {t('profile.verified')}
                            </Badge>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-6 md:h-7 px-1 md:px-2 gap-1 text-xs">
                              <Mail className="h-2 w-2 md:h-3 md:w-3" />
                              {t('profile.resendVerification')}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs font-medium">
                          {t('profile.phone')}
                        </label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          disabled={!editMode || isUpdating}
                          placeholder="(00) 00000-0000"
                          className="h-8 md:h-10 text-sm"
                        />
                        <div className="flex items-center gap-1 md:gap-2 text-xs">
                          {profile.phoneConfirmed ? (
                            <Badge variant="default" className="gap-1 text-[10px] md:text-xs">
                              <CheckCircle className="h-2 w-2 md:h-3 md:w-3" />
                              {t('profile.verified')}
                            </Badge>
                          ) : profileData.phone && (
                            <Button variant="ghost" size="sm" className="h-6 md:h-7 px-1 md:px-2 gap-1 text-xs">
                              <Phone className="h-2 w-2 md:h-3 md:w-3" />
                              {t('profile.resendVerification')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Photo Upload Section */}
                    {editMode && (
                      <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t">
                        <div className="space-y-1 md:space-y-2">
                          <label className="text-xs font-medium">
                            {t('profile.profilePicture')}
                          </label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                disabled={isUploadingPhoto}
                              />
                              <Button variant="outline" type="button" disabled={isUploadingPhoto} size="sm" className="h-8 md:h-10 text-xs">
                                {isUploadingPhoto ? (
                                  <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1 md:mr-2" />
                                ) : (
                                  <Upload className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                )}
                                {t('profile.uploadPhoto')}
                              </Button>
                            </label>
                            
                            {profile.photoPath && (
                              <Button
                                variant="ghost"
                                type="button"
                                onClick={handleRemovePhoto}
                                disabled={isUploadingPhoto}
                                size="sm"
                                className="h-8 md:h-10 text-xs"
                              >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                {t('profile.removePhoto')}
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            {t('profile.maxFileSize')} • {t('profile.allowedFormats')}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  {editMode && (
                    <CardFooter className="flex justify-end gap-2 md:gap-3 p-3 md:p-6 pt-0">
                      <Button
                        variant="outline"
                        onClick={() => setEditMode(false)}
                        disabled={isUpdating}
                        size="sm"
                        className="h-8 md:h-10 text-xs md:text-sm"
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={isUpdating}
                        size="sm"
                        className="h-8 md:h-10 text-xs md:text-sm"
                      >
                        {isUpdating ? (
                          <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-1 md:mr-2" />
                        ) : (
                          <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        )}
                        {t('common.save')}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                  <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-sm md:text-lg">{t('profile.security')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('profile.manageSecurity')}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
                    {/* Change Password Section */}
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium">{t('profile.changePassword')}</h3>
                          <p className="text-xs text-muted-foreground">
                            {t('profile.manageSecurity')}
                          </p>
                        </div>
                        <Button
                          variant={changePasswordMode ? "outline" : "default"}
                          onClick={() => setChangePasswordMode(!changePasswordMode)}
                          size="sm"
                          className="self-start sm:self-auto h-8 md:h-10 text-xs md:text-sm"
                        >
                          {changePasswordMode ? (
                            <>
                              <X className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              {t('common.cancel')}
                            </>
                          ) : (
                            <>
                              <Key className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              {t('profile.changePassword')}
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {changePasswordMode && (
                        <div className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-lg bg-muted/30">
                          <div className="space-y-1 md:space-y-2">
                            <label className="text-xs font-medium">
                              {t('profile.currentPassword')}
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className="pl-8 md:pl-10 h-8 md:h-10 text-sm"
                                placeholder={t('profile.currentPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-1 md:space-y-2">
                            <label className="text-xs font-medium">
                              {t('profile.newPassword')}
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="pl-8 md:pl-10 h-8 md:h-10 text-sm"
                                placeholder={t('profile.newPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                            
                            {passwordData.newPassword && (
                              <div className="space-y-1 mt-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px]">{t('profile.passwordStrength')}:</span>
                                  <span className={`text-[10px] font-bold ${passwordValidation.strengthColor}`}>
                                    {t(`profile.${passwordValidation.strengthText}`)}
                                  </span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-300 ${
                                      passwordValidation.strength <= 2 ? 'bg-red-500' :
                                      passwordValidation.strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1 md:space-y-2">
                            <label className="text-xs font-medium">
                              {t('profile.confirmPassword')}
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className={`pl-8 md:pl-10 h-8 md:h-10 text-sm ${
                                  passwordData.confirmPassword 
                                    ? passwordsMatch 
                                      ? 'border-green-500' 
                                      : 'border-red-500'
                                    : ''
                                }`}
                                placeholder={t('profile.confirmPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                            
                            {passwordData.confirmPassword && (
                              <div className={`flex items-center gap-1 text-[10px] ${
                                passwordsMatch ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {passwordsMatch ? (
                                  <CheckCircle className="h-2 w-2 md:h-3 md:w-3" />
                                ) : (
                                  <AlertCircle className="h-2 w-2 md:h-3 md:w-3" />
                                )}
                                <span>
                                  {passwordsMatch ? t('profile.passwordsMatch') : t('profile.passwordsDontMatch')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword || !passwordsMatch || passwordValidation.strength <= 2}
                            className="w-full h-8 md:h-10 text-xs md:text-sm"
                          >
                            {isChangingPassword ? (
                              <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-1 md:mr-2" />
                            ) : null}
                            {t('profile.changePassword')}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Delete Account - Danger Zone */}
                    <div className="space-y-3 md:space-y-4 p-3 md:p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium text-destructive">{t('profile.deleteAccount')}</h3>
                          <p className="text-xs text-muted-foreground">
                            {t('profile.deleteAccountWarning')}
                          </p>
                        </div>
                        <Button variant="destructive" size="sm" className="self-start sm:self-auto h-8 md:h-10 text-xs md:text-sm">
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          {t('profile.deleteAccount')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                  <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-sm md:text-lg">{t('profile.settings')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('profile.configureSystem')}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
                    <div className="space-y-3 md:space-y-4">
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs font-medium">
                          {t('profile.timezone')}
                        </label>
                        <Select 
                          value={timezone} 
                          onValueChange={setTimezone}
                        >
                          <SelectTrigger className="h-8 md:h-10 text-sm">
                            <SelectValue placeholder={t('profile.timezone')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Los Angeles (GMT-8)</SelectItem>
                            <SelectItem value="America/Chicago">Chicago (GMT-6)</SelectItem>
                            <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                            <SelectItem value="Australia/Sydney">Sydney (GMT+10)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {t('profile.affectsSchedule')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end p-3 md:p-6 pt-0">
                    <Button 
                      onClick={handleTimezoneSave}
                      disabled={isSavingTimezone}
                      size="sm"
                      className="h-8 md:h-10 text-xs md:text-sm"
                    >
                      {isSavingTimezone ? (
                        <>
                          <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-1 md:mr-2" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          {t('common.save')}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Sessions Tab */}
              <TabsContent value="sessions">
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                  <CardHeader className="p-3 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm md:text-lg">{t('profile.sessions')}</CardTitle>
                        <CardDescription className="text-xs">
                          {t('profile.manageActivity')}
                        </CardDescription>
                      </div>
                      {sessions.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRevokeAllSessions}
                          className="self-start sm:self-auto h-8 md:h-10 text-xs md:text-sm"
                        >
                          <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          {t('profile.revokeAll')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-3 md:p-6">
                    <div className="space-y-3 md:space-y-4">
                      {sessions.length === 0 ? (
                        <div className="text-center py-4 md:py-8">
                          <Globe className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-2 md:mb-4" />
                          <p className="text-xs text-muted-foreground">{t('profile.noActiveSessions')}</p>
                        </div>
                      ) : (
                        // Usando optional chaining para segurança
                        sessions?.map?.((session) => (
                          <div
                            key={session.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 md:p-4 border rounded-lg ${
                              session.current ? 'border-primary/50 bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2 md:gap-4 mb-2 sm:mb-0">
                              <div className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                {getDeviceIcon(session.device)}
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                  <p className="text-xs font-medium">{session.device}</p>
                                  {session.current && (
                                    <Badge variant="default" className="text-[8px] md:text-xs px-1 py-0">
                                      {t('profile.current')}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 md:gap-4 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-2 w-2 md:h-3 md:w-3" />
                                    {session.browser}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-2 w-2 md:h-3 md:w-3" />
                                    {session.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-2 w-2 md:h-3 md:w-3" />
                                    {new Date(session.lastActivity).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {!session.current && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                className="self-end sm:self-auto h-6 md:h-8 w-6 md:w-8 p-0"
                              >
                                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}