import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Settings, Calendar, Globe,
  Lock, Eye, EyeOff, Camera, LogOut, Save, X, AlertCircle,
  CheckCircle, Clock, MapPin, Monitor, Smartphone, Tablet,
  Trash2, Key, Languages, Palette, Bell, Download, Upload
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  
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
    loadProfileData();
    loadSessions();
  }, []);
  
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setProfileData({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        photoPath: data.photoPath || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t('profile.updateError'));
      toast({
        title: t('common.error'),
        description: t('profile.updateError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadSessions = async () => {
    try {
      const data = await getUserSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };
  
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
      
      // Limpar mensagem após 3 segundos
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
  
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validações
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('common.error'),
        description: 'Por favor, selecione um arquivo de imagem',
        variant: 'destructive',
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: t('common.error'),
        description: 'Arquivo muito grande. Máximo 5MB',
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
        description: err.response?.data?.message || 'Erro ao fazer upload da foto',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
      // Limpar input
      event.target.value = '';
    }
  };
  
  const handleRemovePhoto = async () => {
    try {
      setIsUploadingPhoto(true);
      // Chamada para remover foto (implementar no backend)
      // await removeProfilePhoto();
      
      setProfile(prev => prev ? { ...prev, photoPath: '' } : null);
      toast({
        title: t('common.success'),
        description: 'Foto removida com sucesso',
      });
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: 'Erro ao remover foto',
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
        description: 'Sessão revogada com sucesso',
      });
    } catch (err) {
      toast({
        title: t('common.error'),
        description: 'Erro ao revogar sessão',
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
        description: 'Todas as sessões foram revogadas',
      });
    } catch (err) {
      toast({
        title: t('common.error'),
        description: 'Erro ao revogar sessões',
        variant: 'destructive',
      });
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
          <p className="text-muted-foreground">Erro ao carregar perfil</p>
          <Button onClick={loadProfileData}>Tentar novamente</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais, segurança e preferências
          </p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Profile Photo */}
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background">
                      <AvatarImage src={profile.photoPath} alt={`${profile.firstName} ${profile.lastName}`} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
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
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                        {isUploadingPhoto ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        ) : (
                          <Camera className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {/* Name and Role */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-muted-foreground mt-1">{profile.email}</p>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant={profile.active ? "default" : "secondary"}>
                        {profile.active ? t('profile.active') : t('profile.inactive')}
                      </Badge>
                      {profile.roles?.map(role => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">{t('profile.emailVerified')}</div>
                      <div className="mt-1">
                        {profile.emailConfirmed ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('profile.verified')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            {t('profile.notVerified')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">{t('profile.phoneVerified')}</div>
                      <div className="mt-1">
                        {profile.phoneConfirmed ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('profile.verified')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {t('profile.notVerified')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Member Since */}
                  <div className="text-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    {t('profile.memberSince')} {formatDate(profile.createdAt)}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-3">
                {success && (
                  <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {success}
                    </p>
                  </div>
                )}
                
                {error && (
                  <div className="w-full bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </CardFooter>
            </Card>
            
            {/* Quick Stats */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-lg">{t('profile.activity')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('profile.lastLogin')}</span>
                  <span className="text-sm font-medium">
                    {profile.lastLogin ? formatDate(profile.lastLogin) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('profile.sessions')}</span>
                  <span className="text-sm font-medium">{sessions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Tabs Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('profile.personalInfo')}
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t('profile.security')}
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('profile.preferences')}
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('profile.activity')}
                </TabsTrigger>
              </TabsList>
              
              {/* Personal Info Tab */}
              <TabsContent value="personal">
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{t('profile.personalInfo')}</CardTitle>
                        <CardDescription>
                          Gerencie suas informações pessoais
                        </CardDescription>
                      </div>
                      <Button
                        variant={editMode ? "outline" : "default"}
                        onClick={() => setEditMode(!editMode)}
                      >
                        {editMode ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            {t('common.cancel')}
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            {t('profile.editProfile')}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('profile.firstName')}
                        </label>
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          disabled={!editMode || isUpdating}
                          placeholder={t('profile.firstName')}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('profile.lastName')}
                        </label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          disabled={!editMode || isUpdating}
                          placeholder={t('profile.lastName')}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('profile.email')}
                        </label>
                        <Input
                          value={profile.email}
                          disabled
                          className="bg-muted/50"
                        />
                        <div className="flex items-center gap-2 text-sm">
                          {profile.emailConfirmed ? (
                            <Badge default="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {t('profile.verified')}
                            </Badge>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                              <Mail className="h-3 w-3" />
                              {t('profile.resendVerification')}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('profile.phone')}
                        </label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          disabled={!editMode || isUpdating}
                          placeholder="(00) 00000-0000"
                        />
                        <div className="flex items-center gap-2 text-sm">
                          {profile.phoneConfirmed ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {t('profile.verified')}
                            </Badge>
                          ) : profileData.phone && (
                            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                              <Phone className="h-3 w-3" />
                              {t('profile.resendVerification')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Photo Upload Section */}
                    {editMode && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t('profile.profilePicture')}
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                disabled={isUploadingPhoto}
                              />
                              <Button variant="outline" type="button" disabled={isUploadingPhoto}>
                                {isUploadingPhoto ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-2" />
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
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('profile.removePhoto')}
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t('profile.maxFileSize')} • {t('profile.allowedFormats')}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  {editMode && (
                    <CardFooter className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setEditMode(false)}
                        disabled={isUpdating}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
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
                  <CardHeader>
                    <CardTitle>{t('profile.security')}</CardTitle>
                    <CardDescription>
                      Gerencie suas configurações de segurança
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Change Password Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t('profile.changePassword')}</h3>
                          <p className="text-sm text-muted-foreground">
                            Atualize sua senha regularmente para manter sua conta segura
                          </p>
                        </div>
                        <Button
                          variant={changePasswordMode ? "outline" : "default"}
                          onClick={() => setChangePasswordMode(!changePasswordMode)}
                        >
                          {changePasswordMode ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              {t('common.cancel')}
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4 mr-2" />
                              {t('profile.changePassword')}
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {changePasswordMode && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Senha Atual
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className="pl-10"
                                placeholder="Digite sua senha atual"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Nova Senha
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="pl-10"
                                placeholder="Digite sua nova senha"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                            
                            {passwordData.newPassword && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs">{t('profile.passwordStrength')}:</span>
                                  <span className={`text-xs font-bold ${passwordValidation.strengthColor}`}>
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
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Confirmar Nova Senha
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className={`pl-10 ${
                                  passwordData.confirmPassword 
                                    ? passwordsMatch 
                                      ? 'border-green-500' 
                                      : 'border-red-500'
                                    : ''
                                }`}
                                placeholder="Confirme sua nova senha"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                            
                            {passwordData.confirmPassword && (
                              <div className={`flex items-center gap-1 text-xs ${
                                passwordsMatch ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {passwordsMatch ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                                <span>
                                  {passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword || !passwordsMatch || passwordValidation.strength <= 2}
                            className="w-full"
                          >
                            {isChangingPassword ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                            ) : null}
                            {t('profile.changePassword')}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Two-Factor Authentication */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t('profile.twoFactor')}</h3>
                          <p className="text-sm text-muted-foreground">
                            Adicione uma camada extra de segurança à sua conta
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Delete Account - Danger Zone */}
                    <div className="space-y-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-destructive">{t('profile.deleteAccount')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('profile.deleteAccountWarning')}
                          </p>
                        </div>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
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
                  <CardHeader>
                    <CardTitle>{t('profile.preferences')}</CardTitle>
                    <CardDescription>
                      Personalize sua experiência na plataforma
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('profile.language')}
                        </label>
                        <Select defaultValue="pt">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt">
                              <div className="flex items-center gap-2">
                                <span>🇧🇷</span>
                                <span>Português</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="en">
                              <div className="flex items-center gap-2">
                                <span>🇺🇸</span>
                                <span>English</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="es">
                              <div className="flex items-center gap-2">
                                <span>🇪🇸</span>
                                <span>Español</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('profile.theme')}
                        </label>
                        <Select defaultValue="system">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tema" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                <span>{t('common.light')}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                <span>{t('common.dark')}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span>{t('common.system')}</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('profile.timezone')}
                        </label>
                        <Select defaultValue="America/Sao_Paulo">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um fuso horário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                            <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Notificações</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Notificações por Email</p>
                            <p className="text-sm text-muted-foreground">
                              Receba atualizações importantes por email
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Notificações Push</p>
                            <p className="text-sm text-muted-foreground">
                              Receba notificações no navegador
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      {t('common.save')}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Sessions Tab */}
              <TabsContent value="sessions">
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{t('profile.sessions')}</CardTitle>
                        <CardDescription>
                          Gerencie suas sessões ativas em diferentes dispositivos
                        </CardDescription>
                      </div>
                      {sessions.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRevokeAllSessions}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('profile.revokeAll')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.length === 0 ? (
                        <div className="text-center py-8">
                          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Nenhuma sessão ativa</p>
                        </div>
                      ) : (
                        sessions.map((session) => (
                          <div
                            key={session.id}
                            className={`flex items-center justify-between p-4 border rounded-lg ${
                              session.current ? 'border-primary/50 bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                {getDeviceIcon(session.device)}
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{session.device}</p>
                                  {session.current && (
                                    <Badge variant="default" className="text-xs">
                                      Atual
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {session.browser}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {session.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
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
                              >
                                <LogOut className="h-4 w-4" />
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