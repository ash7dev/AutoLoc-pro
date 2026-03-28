'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  MapPin,
  Globe,
  Smartphone,
  Lock,
  HelpCircle,
  ChevronRight,
  Star,
  Car,
  Calendar,
  Mail,
  Phone,
  Camera,
  Edit3,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  Heart,
  FileText,
  LogOut,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { useRoleStore } from '@/features/auth/stores/role.store';

interface TenantSettingsProps {
  profile?: UserProfile | null;
}

export function TenantSettings({ profile: initialProfile }: TenantSettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile || null);
  const [loading, setLoading] = useState(!initialProfile);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Sénégal',
    language: 'Français',
    currency: 'XOF',
    notifications: {
      email: true,
      sms: false,
      push: true,
      newsletter: false,
    },
  });
  
  useEffect(() => {
    if (!initialProfile) {
      const loadProfile = async () => {
        try {
          const accessToken = useRoleStore.getState().accessToken;
          if (accessToken) {
            const userProfile = await fetchUserProfile(accessToken);
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadProfile();
    }
  }, [initialProfile]);
  
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.prenom || '',
        lastName: profile.nom || '',
        email: profile.email || '',
        phone: profile.telephone || '',
        birthDate: profile.dateNaissance || '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Sénégal',
    language: 'Français',
    currency: 'XOF',
    notifications: {
      email: true,
      sms: false,
      push: true,
      newsletter: false,
    },
      });
    }
  }, [profile]);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Paiement', icon: CreditCard },
    { id: 'help', label: 'Aide', icon: HelpCircle },
  ];

  const handleSave = (field: string) => {
    setEditingField(null);
    // Logique de sauvegarde ici
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </span>
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-50 rounded-xl shadow-lg flex items-center justify-center border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-gray-500 mt-1">Membre depuis {profile?.creeLe ? new Date(profile.creeLe).getFullYear() : '2024'}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">4.8</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">12 locations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Personnelles */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Informations personnelles</h4>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  readOnly={editingField !== 'firstName'}
                />
                {editingField !== 'firstName' && (
                  <button
                    onClick={() => setEditingField('firstName')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  readOnly={editingField !== 'lastName'}
                />
                {editingField !== 'lastName' && (
                  <button
                    onClick={() => setEditingField('lastName')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                readOnly
              />
              <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                readOnly={editingField !== 'phone'}
              />
              {editingField !== 'phone' && (
                <button
                  onClick={() => setEditingField('phone')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {editingField && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleSave(editingField)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Adresse */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-slate-900">Adresse</h4>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rue, numéro, etc."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option>Sénégal</option>
                <option>Côte d'Ivoire</option>
                <option>Mali</option>
                <option>France</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Sécurité du compte</h4>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value="password123"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 pr-12"
                readOnly
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Changer le mot de passe
            </button>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Authentification à deux facteurs</h5>
                <p className="text-sm text-gray-500 mt-1">Ajoutez une couche de sécurité supplémentaire</p>
              </div>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium">
                Activer
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Connexions actives</h5>
                <p className="text-sm text-gray-500 mt-1">Gérez vos appareils connectés</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Préférences générales</h4>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option>Français</option>
              <option>English</option>
              <option>العربية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option>XOF - Franc CFA</option>
              <option>EUR - Euro</option>
              <option>USD - Dollar américain</option>
            </select>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Mode sombre</h5>
                <p className="text-sm text-gray-500 mt-1">Réduisez la fatigue oculaire</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Préférences de notification</h4>
        </div>
        <div className="p-6 space-y-6">
          {[
            { key: 'email', label: 'Email', description: 'Recevez des mises à jour importantes par email' },
            { key: 'sms', label: 'SMS', description: 'Alertes instantanées sur votre téléphone' },
            { key: 'push', label: 'Push', description: 'Notifications dans votre navigateur' },
            { key: 'newsletter', label: 'Newsletter', description: 'Nouveautés et offres spéciales' },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">{label}</h5>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
              <button
                onClick={() => setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, [key]: !formData.notifications[key as keyof typeof formData.notifications] }
                })}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                  formData.notifications[key as keyof typeof formData.notifications] ? "bg-emerald-600" : "bg-gray-200"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  formData.notifications[key as keyof typeof formData.notifications] ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Moyens de paiement</h4>
        </div>
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h5 className="font-medium text-gray-900 mb-2">Aucun moyen de paiement</h5>
            <p className="text-sm text-gray-500 mb-4">Ajoutez une carte de paiement pour faciliter vos réservations</p>
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium">
              Ajouter une carte
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Historique des paiements</h4>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun paiement effectué</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Centre d'aide</h4>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { icon: FileText, title: 'Guide utilisateur', description: 'Apprenez à utiliser AutoLoc' },
              { icon: HelpCircle, title: 'FAQ', description: 'Questions fréquemment posées' },
              { icon: Mail, title: 'Contact support', description: 'Contactez notre équipe' },
              { icon: Shield, title: 'Signalement', description: 'Signalez un problème' },
            ].map(({ icon: Icon, title, description }) => (
              <Link
                key={title}
                href="#"
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{title}</h5>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'security': return renderSecurityTab();
      case 'preferences': return renderPreferencesTab();
      case 'notifications': return renderNotificationsTab();
      case 'payment': return renderPaymentTab();
      case 'help': return renderHelpTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/reservations" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-1 py-2 border-b-2 transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
