'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  HelpCircle,
  Camera,
  Edit3,
  Check,
  X,
  CheckCircle2,
  Award,
  Zap,
  Target,
  Mail,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchUserProfile, updateUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { useRoleStore } from '@/features/auth/stores/role.store';
import { useSwitchToLocataire } from '@/features/owner/hooks/use-switch-to-locataire';
import { Button } from '@/components/ui/button';

interface OwnerSettingsProps {
  profile?: UserProfile | null;
}

export function OwnerSettings({ profile: initialProfile }: OwnerSettingsProps) {
  const { switchToLocataire, loading: switchingRole } = useSwitchToLocataire();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingField, setEditingField] = useState<keyof typeof formData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile || null);
  const [loading, setLoading] = useState(!initialProfile);
  const [saving, setSaving] = useState(false);
  const [errorSync, setErrorSync] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: initialProfile?.prenom || '',
    lastName: initialProfile?.nom || '',
    email: initialProfile?.email || '',
    phone: initialProfile?.telephone || '',
    birthDate: initialProfile?.dateNaissance || '',
  });
  
  // 1. Charger et synchroniser le profil seulement si non fourni
  useEffect(() => {
    // Ne charger que si aucun profil initial n'est fourni (undefined, pas null)
    if (initialProfile === undefined) {
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
    } else {
      // Si un profil est fourni (même null), on arrête le loading
      setLoading(false);
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
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'help', label: 'Aide', icon: HelpCircle },
  ];

  // 2. Sauvegarde des données
  const handleSave = async (field: keyof typeof formData) => {
    if (!profile) return;
    
    setSaving(true);
    setErrorSync(null);

    try {
      // Préparation du payload précis
      const payload: Partial<Pick<UserProfile, 'prenom' | 'nom' | 'dateNaissance'>> = {};
      if (field === 'firstName') payload.prenom = formData.firstName;
      if (field === 'lastName') payload.nom = formData.lastName;
      if (field === 'birthDate') payload.dateNaissance = formData.birthDate;

      // Appel au vrai endpoint NestJS
      await updateUserProfile(payload);

      // Mise à jour de l'état local du proxy `profile`
      setProfile((prev) => prev ? { ...prev, ...payload } : prev);
      
      // Fin d'édition
      setEditingField(null);
    } catch (err) {
      setErrorSync("Erreur lors de la mise à jour des informations.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    // Restaurer les valeurs depuis le profil
    if (profile) {
      setFormData({
        ...formData,
        [editingField as string]: 
          editingField === 'firstName' ? profile.prenom : 
          editingField === 'lastName' ? profile.nom : 
          editingField === 'birthDate' ? profile.dateNaissance : '',
      });
    }
    setEditingField(null);
    setErrorSync(null);
  };

  const renderProfileTab = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Avatar & Identifiant - Responsive */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-50 rounded-xl shadow-lg flex items-center justify-center border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-not-allowed opacity-50">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-emerald-700/80 mt-1 font-medium tracking-tight text-sm sm:text-base">Espace Propriétaire</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
              <span className="text-xs sm:text-sm text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full font-semibold inline-block">
                Actif depuis {profile?.creeLe ? new Date(profile.creeLe).getFullYear() : new Date().getFullYear()}
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-xs sm:text-sm font-medium text-amber-700">
                  {profile?.noteProprietaire ? `${profile.noteProprietaire.toFixed(1)}/5` : 'Nouveau'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges de Confiance - Responsive Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100">
          <h4 className="text-lg font-semibold text-slate-900">Votre statut</h4>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-emerald-900 text-sm sm:text-base truncate">Identité KYC</p>
                <p className="text-xs sm:text-sm text-emerald-700">{profile?.statutKyc === 'APPROVED' ? 'Vérifiée avec succès' : profile?.statutKyc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors">
              <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-blue-900 text-sm sm:text-base truncate">Note Globale</p>
                <p className="text-xs sm:text-sm text-blue-700">{profile?.noteProprietaire ? `${profile.noteProprietaire.toFixed(1)} / 5 étoiles` : "Pas encore d'avis"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-amber-50/50 rounded-xl border border-amber-100 hover:bg-amber-50 transition-colors lg:col-span-1">
              <Zap className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-amber-900 text-sm sm:text-base truncate">Réponse rapide</p>
                <p className="text-xs sm:text-sm text-amber-700">Excellente disponibilité</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'Informations - Responsive */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-lg font-semibold text-slate-900">Informations Personnelles</h4>
          {errorSync && <span className="text-sm text-red-500 font-medium text-center sm:text-right">{errorSync}</span>}
        </div>
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* PRÉNOM */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={cn(
                    "w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm sm:text-base",
                    editingField === 'firstName' ? "bg-white border-emerald-300" : "bg-slate-50 border-slate-200 text-slate-700"
                  )}
                  readOnly={editingField !== 'firstName'}
                />
                {editingField !== 'firstName' ? (
                  <button
                    onClick={() => setEditingField('firstName')}
                    className="absolute right-3 top-2.5 sm:top-3.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleSave('firstName')} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1 text-xs sm:text-sm">
                      {saving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : 'Valider'}
                    </Button>
                    <Button onClick={cancelEdit} disabled={saving} size="sm" variant="outline" className="flex-1 text-xs sm:text-sm">
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* NOM */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={cn(
                    "w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm sm:text-base",
                    editingField === 'lastName' ? "bg-white border-emerald-300" : "bg-slate-50 border-slate-200 text-slate-700"
                  )}
                  readOnly={editingField !== 'lastName'}
                />
                {editingField !== 'lastName' ? (
                  <button
                    onClick={() => setEditingField('lastName')}
                    className="absolute right-3 top-2.5 sm:top-3.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleSave('lastName')} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1 text-xs sm:text-sm">
                      {saving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : 'Valider'}
                    </Button>
                    <Button onClick={cancelEdit} disabled={saving} size="sm" variant="outline" className="flex-1 text-xs sm:text-sm">
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* DATE DE NAISSANCE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date de naissance</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className={cn(
                    "w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm sm:text-base",
                     editingField === 'birthDate' ? "bg-white border-emerald-300" : "bg-slate-50 border-slate-200 text-slate-700"
                  )}
                  readOnly={editingField !== 'birthDate'}
                />
                {editingField !== 'birthDate' ? (
                  <button
                    onClick={() => setEditingField('birthDate')}
                    className="absolute right-3 top-2.5 sm:top-3.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleSave('birthDate')} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1 text-xs sm:text-sm">
                      {saving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : 'Valider'}
                    </Button>
                    <Button onClick={cancelEdit} disabled={saving} size="sm" variant="outline" className="flex-1 text-xs sm:text-sm">
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* EMAIL (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email de contact</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 opacity-80 cursor-not-allowed text-sm sm:text-base"
                  readOnly
                />
                <Mail className="absolute right-3 top-2.5 sm:top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-slate-400 text-center sm:text-left">Le numéro de téléphone est géré au moment de la vérification OTP dans le processus de création de compte.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100">
          <h4 className="text-lg font-semibold text-slate-900">Préférences de Sécurité</h4>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="text-center lg:text-left">
              <h5 className="font-medium text-slate-900 text-base sm:text-lg">Mot de passe</h5>
              <p className="text-sm text-slate-500 mt-1">Vous êtes actuellement connecté via des tokens sécurisés.</p>
            </div>
            <Button variant="outline" className="border-slate-200 w-full sm:w-auto" disabled>
              Changer mon mot de passe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100">
          <h4 className="text-lg font-semibold text-slate-900">Centre d'aide & Contact</h4>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <p className="text-sm text-slate-600 mb-4 text-center sm:text-left">Besoin d'aide avec la configuration de vos véhicules ou de votre planning de location ?</p>
          <div className="text-center sm:text-left">
            <a href="mailto:support@autoloc.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors w-full sm:w-auto">
              <Mail className="w-4 h-4" />
              Nous contacter par email
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'security': return renderSecurityTab();
      case 'help': return renderHelpTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header avec action rapide - Responsive */}
      <div className="bg-emerald-900 text-white border-b border-emerald-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 h-auto sm:h-20 py-4 sm:py-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Paramètres</h1>
              <p className="text-sm text-emerald-200 mt-1">Gérez vos informations personnelles et votre sécurité.</p>
            </div>
            <div className="flex items-center justify-center sm:justify-end">
              <Button
                onClick={switchToLocataire}
                disabled={switchingRole}
                variant="secondary"
                className="bg-emerald-800 hover:bg-emerald-700 text-white border-none shadow-none w-full sm:w-auto"
              >
                {switchingRole ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Mode Locataire
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Epurée) - Responsive */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto py-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-1 py-4 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-sm font-semibold tracking-tight min-w-0",
                    activeTab === tab.id
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
