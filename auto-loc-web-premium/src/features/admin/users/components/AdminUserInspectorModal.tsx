'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  User,
  Car,
  Calendar,
  Phone,
  Mail,
  Award,
  FileText,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import type { AdminUserDetailResponse } from '../../../../core/api/adminAnalyticsApi';

interface AdminUserInspectorModalProps {
  user: AdminUserDetailResponse | null;
  isLoading: boolean;
  onClose: () => void;
  onBanUser: (userId: string, body: { actif: boolean; bloqueJusqua?: string | null; raison?: string }) => Promise<void>;
  onSetRole: (userId: string, role: string) => Promise<void>;
  onApproveKyc: (userId: string) => Promise<void>;
  onRejectKyc: (userId: string, raison?: string) => Promise<void>;
  isMutating: boolean;
}

export function AdminUserInspectorModal({
  user,
  isLoading,
  onClose,
  onBanUser,
  onSetRole,
  onApproveKyc,
  onRejectKyc,
  isMutating,
}: AdminUserInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'KYC' | 'VEHICLES' | 'BOOKINGS' | 'MODERATION'>('OVERVIEW');
  const [banReason, setBanReason] = useState<string>('');
  const [banDays, setBanDays] = useState<number>(7);
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || 'LOCATAIRE');
  const [kycRejectReason, setKycRejectReason] = useState<string>('');
  const [showKycRejectInput, setShowKycRejectInput] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (!user && !isLoading) return null;

  const u = user?.utilisateur;
  const fullName = u?.fullName || (user?.email ? user.email.split('@')[0] : 'Profil Incomplet');
  const isBanned = user?.isBanned ?? false;
  const isStuck = user?.isStuckOnboarding ?? false;

  const handleApplyBan = async (actif: boolean) => {
    if (!user) return;
    let banDate: string | null = null;
    if (!actif && banDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + banDays);
      banDate = d.toISOString();
    }
    await onBanUser(user.id, {
      actif,
      bloqueJusqua: banDate,
      raison: banReason || undefined,
    });
  };

  const handleRoleUpdate = async () => {
    if (!user || !selectedRole) return;
    await onSetRole(user.id, selectedRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {u?.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt={fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-bold text-base flex items-center justify-center">
                {fullName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{fullName}</h2>
                {isStuck && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
                    Inscription incomplète
                  </span>
                )}
                {isBanned && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    Compte Suspendu
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                <span>ID: {user?.userId || user?.id}</span>
                <span>•</span>
                <span>Créé le {user ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/60 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Vue d\'ensemble' },
            { id: 'KYC', label: `Dossier KYC (${user?.kycStatus || 'NON_VERIFIE'})` },
            { id: 'VEHICLES', label: `Flotte Véhicules (${user?.vehicles?.length || 0})` },
            { id: 'BOOKINGS', label: `Réservations (${(user?.reservationsLocataire?.length || 0) + (user?.reservationsProprietaire?.length || 0)})` },
            { id: 'MODERATION', label: 'Modération & Rôles' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Chargement du profil détaillé...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal & Contact Details */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" /> Informations Personnelles
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-slate-900 font-semibold">{user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Téléphone:</span>
                        <span className="text-slate-900 font-semibold">{user?.phone || u?.telephone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Rôle Actuel:</span>
                        <span className="font-bold text-amber-700">{user?.role}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Statut KYC:</span>
                        <span className="font-bold text-emerald-700">{user?.kycStatus}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Date d'inscription:</span>
                        <span className="text-slate-900 font-medium">
                          {user ? new Date(user.createdAt).toLocaleString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metrics */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider flex items-center gap-2">
                      <Car className="w-4 h-4 text-emerald-600" /> Activité AutoLoc
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-slate-500 text-xs mb-1">Véhicules Possédés</div>
                        <div className="text-2xl font-black text-slate-900 font-mono">{user?._count.vehicles || 0}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-slate-500 text-xs mb-1">Locations Réalisées</div>
                        <div className="text-2xl font-black text-slate-900 font-mono">
                          {(user?._count.reservationsLocataire || 0) + (user?._count.reservationsProprietaire || 0)}
                        </div>
                      </div>
                    </div>

                    {isStuck && (
                      <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-violet-800 text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-violet-600" /> Onboarding Incomplet
                        </div>
                        <p>
                          Cet utilisateur a créé son compte d'authentification mais n'a pas encore saisi son prénom, nom ou numéro de téléphone dans l'application.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: KYC DOCUMENTS */}
              {activeTab === 'KYC' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Statut du dossier KYC: {user?.kycStatus}</div>
                      {user?.kycRejectionReason && (
                        <div className="text-xs text-rose-600 mt-0.5">Raison du rejet: {user.kycRejectionReason}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveKyc(user!.id)}
                        disabled={isMutating}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Valider le KYC
                      </button>
                      <button
                        onClick={() => setShowKycRejectInput(!showKycRejectInput)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                      >
                        <XCircle className="w-4 h-4" /> Rejeter
                      </button>
                    </div>
                  </div>

                  {showKycRejectInput && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                      <label className="text-xs font-bold text-rose-800 block">Raison du rejet KYC (communiquée à l'utilisateur):</label>
                      <input
                        type="text"
                        value={kycRejectReason}
                        onChange={(e) => setKycRejectReason(e.target.value)}
                        placeholder="Ex: Document ilisible, pièce d'identité expirée..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600"
                      />
                      <button
                        onClick={() => {
                          onRejectKyc(user!.id, kycRejectReason);
                          setShowKycRejectInput(false);
                        }}
                        disabled={isMutating}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-sm"
                      >
                        Confirmer le rejet
                      </button>
                    </div>
                  )}

                  {/* Documents Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Pièce d\'identité (Recto)', url: user?.kyc?.documentUrl },
                      { label: 'Pièce d\'identité (Verso)', url: user?.kyc?.documentBackUrl },
                      { label: 'Selfie de vérification', url: user?.kyc?.selfieUrl },
                      { label: 'Permis de conduire', url: user?.kyc?.permisUrl },
                    ].map((doc, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                          <span>{doc.label}</span>
                          {doc.url && (
                            <button
                              onClick={() => setZoomedImage(doc.url!)}
                              className="text-emerald-700 hover:underline text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Agrandir
                            </button>
                          )}
                        </div>

                        {doc.url ? (
                          <div
                            onClick={() => setZoomedImage(doc.url!)}
                            className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                          >
                            <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                              <Eye className="w-4 h-4" /> Cliquer pour agrandir
                            </div>
                          </div>
                        ) : (
                          <div className="h-44 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs">
                            <FileText className="w-8 h-8 mb-1 text-slate-300" />
                            <span>Non fourni</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: VEHICLES */}
              {activeTab === 'VEHICLES' && (
                <div className="space-y-4">
                  {user?.vehicles && user.vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.vehicles.map((v) => {
                        const mainPhoto = v.photos.find((p) => p.estPrincipale)?.url || v.photos[0]?.url;
                        return (
                          <div key={v.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex gap-4">
                            {mainPhoto ? (
                              <img src={mainPhoto} alt={v.marque} className="w-24 h-24 rounded-xl object-cover border border-slate-200" />
                            ) : (
                              <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                <Car className="w-8 h-8" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{v.marque} {v.modele} ({v.annee})</h4>
                              <div className="text-xs text-slate-500 mt-0.5">{v.ville} • {v.prixParJour.toLocaleString()} FCFA / jour</div>
                              <div className="mt-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {v.statut}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                      Cet utilisateur ne possède aucun véhicule enregistré.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BOOKINGS */}
              {activeTab === 'BOOKINGS' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-500">Réservations Récentes</h3>
                  {user?.reservationsLocataire && user.reservationsLocataire.length > 0 ? (
                    <div className="space-y-2">
                      {user.reservationsLocataire.map((r) => (
                        <div key={r.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{r.vehicule}</div>
                            <div className="text-slate-500 text-[11px]">{new Date(r.creeLe).toLocaleDateString('fr-FR')}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-emerald-700">{r.totalLocataire.toLocaleString()} FCFA</div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">{r.statut}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                      Aucun historique de réservation disponible.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: MODERATION & ROLES */}
              {activeTab === 'MODERATION' && (
                <div className="space-y-6">
                  {/* Ban / Unban Section */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-rose-700 tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" /> Bannissement / Suspension du compte
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Durée du blocage:</label>
                        <select
                          value={banDays}
                          onChange={(e) => setBanDays(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-medium"
                        >
                          <option value={1}>1 Jour (Avertissement)</option>
                          <option value={7}>7 Jours (Suspension temporaire)</option>
                          <option value={30}>30 Jours (Mise à l'écart)</option>
                          <option value={3650}>Permanent (Blocage indéfini)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Raison du blocage:</label>
                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Ex: Fraude KYC, comportement abusif..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      {isBanned ? (
                        <button
                          onClick={() => handleApplyBan(true)}
                          disabled={isMutating}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <Unlock className="w-4 h-4" /> Réactiver le compte
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApplyBan(false)}
                          disabled={isMutating}
                          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <Lock className="w-4 h-4" /> Appliquer la suspension
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role Promotion Section */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-amber-800 tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" /> Attribution du Rôle Utilisateur
                    </h3>

                    <div className="flex items-center gap-4">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-600"
                      >
                        <option value="LOCATAIRE">LOCATAIRE</option>
                        <option value="PROPRIETAIRE">PROPRIETAIRE (Hôte)</option>
                        <option value="SUPPORT">SUPPORT (Équipe Support)</option>
                        <option value="ADMIN">ADMINISTRATEUR (Accès complet)</option>
                      </select>

                      <button
                        onClick={handleRoleUpdate}
                        disabled={isMutating || selectedRole === user?.role}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all disabled:opacity-50 shadow-sm"
                      >
                        Mettre à jour le rôle
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal Preview */}
      {zoomedImage && (
        <div className="fixed inset-0 z-60 bg-slate-900/90 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Document" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
