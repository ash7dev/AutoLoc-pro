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
  TrendingUp,
  Users,
  Building,
  DollarSign,
  FileCheck,
  BarChart3,
  Award,
  Clock,
  MessageSquare,
  Zap,
  Target,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { useRoleStore } from '@/features/auth/stores/role.store';

interface OwnerSettingsProps {
  profile?: UserProfile | null;
}

export function OwnerSettings({ profile: initialProfile }: OwnerSettingsProps) {
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
    company: '',
    siret: '',
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
      bookings: true,
      reviews: true,
      payments: true,
    },
    business: {
      autoAccept: false,
      instantBooking: true,
      cancellationPolicy: 'flexible',
      minimumRentalDays: 1,
      maximumRentalDays: 30,
      advanceNotice: 24,
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
        company: '',
        siret: '',
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
      bookings: true,
      reviews: true,
      payments: true,
    },
    business: {
      autoAccept: false,
      instantBooking: true,
      cancellationPolicy: 'flexible',
      minimumRentalDays: 1,
      maximumRentalDays: 30,
      advanceNotice: 24,
    },
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'business', label: 'Activité', icon: Briefcase },
    { id: 'vehicles', label: 'Véhicules', icon: Car },
    { id: 'analytics', label: 'Analytiques', icon: BarChart3 },
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
      {/* Avatar & Stats */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-3xl font-bold text-emerald-600">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-50 rounded-xl shadow-lg flex items-center justify-center border border-emerald-200 hover:bg-emerald-100 transition-colors">
              <Camera className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-emerald-900">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-gray-500 mt-1">Propriétaire Professionnel</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">4.9</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">8 véhicules</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">156 locations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Verification */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-slate-900">Vérifications & Badges</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">Identité vérifiée</p>
                <p className="text-sm text-emerald-700">Compte certifié</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Propriétaire Pro</p>
                <p className="text-sm text-blue-700">Membre premium</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <Zap className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Réponse rapide</p>
                <p className="text-sm text-amber-700">Moins de 1h en moyenne</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <Target className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Super Hôte</p>
                <p className="text-sm text-purple-700">Excellence service</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Personnelles */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Informations professionnelles</h4>
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  readOnly={editingField !== 'firstName'}
                />
                {editingField !== 'firstName' && (
                  <button
                    onClick={() => setEditingField('firstName')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  readOnly={editingField !== 'lastName'}
                />
                {editingField !== 'lastName' && (
                  <button
                    onClick={() => setEditingField('lastName')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Nom de votre entreprise"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                placeholder="Numéro SIRET"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                readOnly={editingField !== 'phone'}
              />
              {editingField !== 'phone' && (
                <button
                  onClick={() => setEditingField('phone')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
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
    </div>
  );

  const renderBusinessTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Paramètres de l'activité</h4>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-900">Acceptation automatique</h5>
              <p className="text-sm text-gray-500 mt-1">Acceptez automatiquement les réservations éligibles</p>
            </div>
            <button
              onClick={() => setFormData({
                ...formData,
                business: { ...formData.business, autoAccept: !formData.business.autoAccept }
              })}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                formData.business.autoAccept ? "bg-blue-600" : "bg-gray-200"
              )}
            >
              <span className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                formData.business.autoAccept ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-900">Réservation instantanée</h5>
              <p className="text-sm text-gray-500 mt-1">Permettez les réservations sans confirmation</p>
            </div>
            <button
              onClick={() => setFormData({
                ...formData,
                business: { ...formData.business, instantBooking: !formData.business.instantBooking }
              })}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                formData.business.instantBooking ? "bg-blue-600" : "bg-gray-200"
              )}
            >
              <span className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                formData.business.instantBooking ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Politique d'annulation</label>
            <select
              value={formData.business.cancellationPolicy}
              onChange={(e) => setFormData({
                ...formData,
                business: { ...formData.business, cancellationPolicy: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="flexible">Flexible (24h)</option>
              <option value="moderate">Modérée (48h)</option>
              <option value="strict">Stricte (72h)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée min. (jours)</label>
              <input
                type="number"
                value={formData.business.minimumRentalDays}
                onChange={(e) => setFormData({
                  ...formData,
                  business: { ...formData.business, minimumRentalDays: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée max. (jours)</label>
              <input
                type="number"
                value={formData.business.maximumRentalDays}
                onChange={(e) => setFormData({
                  ...formData,
                  business: { ...formData.business, maximumRentalDays: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehiclesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Mes véhicules</h4>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Car className="w-4 h-4" />
            Ajouter un véhicule
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Toyota Yaris', type: 'Citadine', status: 'Disponible', earnings: '245,000 XOF' },
              { name: 'BMW 320i', type: 'Berline', status: 'En location', earnings: '380,000 XOF' },
              { name: 'Peugeot 3008', type: 'SUV', status: 'Disponible', earnings: '520,000 XOF' },
              { name: 'Renault Clio', type: 'Citadine', status: 'Maintenance', earnings: '180,000 XOF' },
            ].map((vehicle, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{vehicle.name}</h5>
                    <p className="text-sm text-gray-500">{vehicle.type}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        vehicle.status === 'Disponible' ? "bg-emerald-100 text-emerald-700" :
                        vehicle.status === 'En location' ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{vehicle.earnings}</p>
                    <p className="text-xs text-gray-500">ce mois</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenus ce mois</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,325,000</p>
              <p className="text-sm text-emerald-600 mt-2">+12.5%</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Taux occupation</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">78%</p>
              <p className="text-sm text-emerald-600 mt-2">+5.2%</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Locations totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
              <p className="text-sm text-emerald-600 mt-2">+23</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Performances détaillées</h4>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Note moyenne</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-medium">4.9</span>
                </div>
                <span className="text-sm text-gray-500">/ 5</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Temps de réponse moyen</span>
              <span className="text-sm font-medium text-gray-900">45 min</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Taux d'acceptation</span>
              <span className="text-sm font-medium text-gray-900">92%</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-700">Clients fidèles</span>
              <span className="text-sm font-medium text-gray-900">34</span>
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
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Changer le mot de passe
            </button>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Authentification à deux facteurs</h5>
                <p className="text-sm text-gray-500 mt-1">Sécurité renforcée pour votre compte professionnel</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                Activer
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">API Keys</h5>
                <p className="text-sm text-gray-500 mt-1">Gérez vos clés d'API pour l'intégration</p>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option>Français</option>
              <option>English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option>XOF - Franc CFA</option>
              <option>EUR - Euro</option>
            </select>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Mode sombre</h5>
                <p className="text-sm text-gray-500 mt-1">Interface optimisée pour une utilisation prolongée</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
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
          <h4 className="text-lg font-semibold text-gray-900">Notifications professionnelles</h4>
        </div>
        <div className="p-6 space-y-6">
          {[
            { key: 'email', label: 'Email', description: 'Notifications importantes par email' },
            { key: 'sms', label: 'SMS', description: 'Alertes urgentes sur mobile' },
            { key: 'push', label: 'Push', description: 'Notifications navigateur/desktop' },
            { key: 'bookings', label: 'Réservations', description: 'Nouvelles réservations et annulations' },
            { key: 'reviews', label: 'Avis', description: 'Nouveaux avis des clients' },
            { key: 'payments', label: 'Paiements', description: 'Confirmations de paiements' },
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
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  formData.notifications[key as keyof typeof formData.notifications] ? "bg-blue-600" : "bg-gray-200"
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
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Moyens de paiement</h4>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
            Ajouter un moyen
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">•••• 4242</p>
                  <p className="text-sm text-gray-500">Expire 12/25</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                Principal
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Historique des transactions</h4>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              { date: '28/03/2024', amount: '+75,000 XOF', type: 'Paiement location', status: 'Complété' },
              { date: '27/03/2024', amount: '-2,500 XOF', type: 'Frais de service', status: 'Complété' },
              { date: '26/03/2024', amount: '+120,000 XOF', type: 'Paiement location', status: 'Complété' },
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{transaction.type}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-medium",
                    transaction.amount.startsWith('+') ? "text-emerald-600" : "text-red-600"
                  )}>
                    {transaction.amount}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Centre d'aide propriétaire</h4>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { icon: Building, title: 'Guide propriétaire', description: 'Optimisez vos revenus' },
              { icon: FileCheck, title: 'Documentation API', description: 'Intégrations techniques' },
              { icon: MessageSquare, title: 'Support prioritaire', description: 'Assistance dédiée 24/7' },
              { icon: BarChart3, title: 'Rapports détaillés', description: 'Analysez vos performances' },
              { icon: Shield, title: 'Protection propriétaire', description: 'Garanties et assurances' },
            ].map(({ icon: Icon, title, description }) => (
              <Link
                key={title}
                href="#"
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{title}</h5>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
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
      case 'business': return renderBusinessTab();
      case 'vehicles': return renderVehiclesTab();
      case 'analytics': return renderAnalyticsTab();
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
              <Link href="/dashboard/owner" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Paramètres Propriétaire</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
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
          <div className="flex gap-6 overflow-x-auto py-4">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
