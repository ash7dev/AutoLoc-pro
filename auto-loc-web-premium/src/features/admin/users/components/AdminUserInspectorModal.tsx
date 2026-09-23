'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  User,
  Car,
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

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const FOREST_DARK = '#062a1f';
const GOLD = '#b27c2d';
const CHAMPAGNE = '#F1DFB6';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_24px_70px_-20px_rgba(10,61,46,0.35)] overflow-hidden text-slate-900 dark:text-white"
        style={fontStyle}
      >
        {/* Header Bar */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0 border-b"
          style={{
            background: `linear-gradient(135deg, ${FOREST} 0%, ${FOREST_DARK} 100%)`,
            borderColor: 'rgba(241,223,182,0.15)',
          }}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {u?.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt={fullName}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#F1DFB6]/40 shrink-0"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-full border flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: 'rgba(241,223,182,0.12)', borderColor: 'rgba(241,223,182,0.25)', color: CHAMPAGNE }}
              >
                {fullName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-normal text-white truncate">{fullName}</h2>
                {isStuck && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-200 border border-purple-400/30 font-sans">
                    Inscription incomplète
                  </span>
                )}
                {isBanned && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-200 border border-rose-400/30 font-sans">
                    Compte Suspendu
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(241,223,182,0.65)' }}>
                ID: {user?.userId || user?.id} • Inscription le {user ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-2.5 border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-x-auto">
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
              className={`px-4 py-2.5 text-xs font-normal transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#0A3D2E] text-[#0A3D2E] dark:text-[#F1DFB6] dark:border-[#F1DFB6] bg-white dark:bg-slate-900 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40 dark:bg-slate-950/40">
          {isLoading ? (
            <div className="py-14 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <div
                className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${FOREST} transparent ${FOREST} ${FOREST}` }}
              />
              <span className="text-xs">Chargement du profil détaillé...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal & Contact Details */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4 shadow-xs">
                    <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2 font-sans">
                      <User className="w-4 h-4" style={{ color: FOREST }} /> Informations Personnelles
                    </h3>

                    <div className="space-y-3 text-xs font-sans">
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400">Téléphone:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{user?.phone || u?.telephone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400">Rôle Actuel:</span>
                        <span className="font-bold" style={{ color: GOLD }}>{user?.role}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400">Statut KYC:</span>
                        <span className="font-bold" style={{ color: FOREST }}>{user?.kycStatus}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Date d'inscription:</span>
                        <span className="text-slate-900 dark:text-white font-mono">
                          {user ? new Date(user.createdAt).toLocaleString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metrics */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4 shadow-xs">
                    <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2 font-sans">
                      <Car className="w-4 h-4" style={{ color: FOREST }} /> Activité AutoLoc
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                        <div className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-sans">Véhicules Possédés</div>
                        <div className="text-2xl font-normal text-slate-900 dark:text-white font-mono">{user?._count.vehicles || 0}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                        <div className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-sans">Locations Réalisées</div>
                        <div className="text-2xl font-normal text-slate-900 dark:text-white font-mono">
                          {(user?._count.reservationsLocataire || 0) + (user?._count.reservationsProprietaire || 0)}
                        </div>
                      </div>
                    </div>

                    {isStuck && (
                      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 text-xs space-y-1 font-sans">
                        <div className="font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-purple-600" /> Onboarding Incomplet
                        </div>
                        <p className="text-[11px] leading-relaxed">
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
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Statut du dossier KYC: {user?.kycStatus}</div>
                      {user?.kycRejectionReason && (
                        <div className="text-xs text-rose-600 mt-0.5 font-sans">Raison du rejet: {user.kycRejectionReason}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveKyc(user!.id)}
                        disabled={isMutating}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-medium shadow-xs transition-all disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" /> Valider le KYC
                      </button>
                      <button
                        onClick={() => setShowKycRejectInput(!showKycRejectInput)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-xs font-medium transition-all hover:bg-rose-500/20"
                      >
                        <XCircle className="w-4 h-4" /> Rejeter
                      </button>
                    </div>
                  </div>

                  {showKycRejectInput && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3 font-sans">
                      <label className="text-xs font-semibold text-rose-700 dark:text-rose-300 block">Raison du rejet KYC (communiquée à l'utilisateur):</label>
                      <input
                        type="text"
                        value={kycRejectReason}
                        onChange={(e) => setKycRejectReason(e.target.value)}
                        placeholder="Ex: Document ilisible, pièce d'identité expirée..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-rose-300 dark:border-rose-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                      />
                      <button
                        onClick={() => {
                          onRejectKyc(user!.id, kycRejectReason);
                          setShowKycRejectInput(false);
                        }}
                        disabled={isMutating}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-all shadow-xs"
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
                      <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between font-sans">
                          <span>{doc.label}</span>
                          {doc.url && (
                            <button
                              onClick={() => setZoomedImage(doc.url!)}
                              className="text-emerald-700 dark:text-emerald-400 hover:underline text-[11px] font-medium flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Agrandir
                            </button>
                          )}
                        </div>

                        {doc.url ? (
                          <div
                            onClick={() => setZoomedImage(doc.url!)}
                            className="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer group"
                          >
                            <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1 font-sans">
                              <Eye className="w-4 h-4" /> Cliquer pour agrandir
                            </div>
                          </div>
                        ) : (
                          <div className="h-44 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 text-xs font-sans">
                            <FileText className="w-8 h-8 mb-1 text-slate-400" />
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
                          <div key={v.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex gap-4">
                            {mainPhoto ? (
                              <img src={mainPhoto} alt={v.marque} className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                            ) : (
                              <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                                <Car className="w-8 h-8" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{v.marque} {v.modele} ({v.annee})</h4>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">{v.ville} • {v.prixParJour.toLocaleString()} FCFA / jour</div>
                              <div className="mt-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-sans">
                                  {v.statut}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 font-sans text-xs">
                      Cet utilisateur ne possède aucun véhicule enregistré.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BOOKINGS */}
              {activeTab === 'BOOKINGS' && (
                <div className="space-y-4 font-sans">
                  <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Réservations Récentes</h3>
                  {user?.reservationsLocataire && user.reservationsLocataire.length > 0 ? (
                    <div className="space-y-2">
                      {user.reservationsLocataire.map((r) => (
                        <div key={r.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{r.vehicule}</div>
                            <div className="text-slate-400 text-[11px] font-mono">{new Date(r.creeLe).toLocaleDateString('fr-FR')}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">{r.totalLocataire.toLocaleString()} FCFA</div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">{r.statut}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 text-xs">
                      Aucun historique de réservation disponible.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: MODERATION & ROLES */}
              {activeTab === 'MODERATION' && (
                <div className="space-y-6 font-sans">
                  {/* Ban / Unban Section */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-4 shadow-xs">
                    <h3 className="text-xs font-semibold uppercase text-rose-700 dark:text-rose-400 tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" /> Bannissement / Suspension du compte
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Durée du blocage:</label>
                        <select
                          value={banDays}
                          onChange={(e) => setBanDays(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-600 font-medium"
                        >
                          <option value={1}>1 Jour (Avertissement)</option>
                          <option value={7}>7 Jours (Suspension temporaire)</option>
                          <option value={30}>30 Jours (Mise à l'écart)</option>
                          <option value={3650}>Permanent (Blocage indéfini)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Raison du blocage:</label>
                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Ex: Fraude KYC, comportement abusif..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      {isBanned ? (
                        <button
                          onClick={() => handleApplyBan(true)}
                          disabled={isMutating}
                          className="px-4 py-2.5 rounded-xl text-white text-xs font-medium shadow-xs transition-all flex items-center gap-2"
                          style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
                        >
                          <Unlock className="w-4 h-4" /> Réactiver le compte
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApplyBan(false)}
                          disabled={isMutating}
                          className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-all flex items-center gap-2 shadow-xs"
                        >
                          <Lock className="w-4 h-4" /> Appliquer la suspension
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role Promotion Section */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-4 shadow-xs">
                    <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: GOLD }}>
                      <Award className="w-4 h-4" /> Attribution du Rôle Utilisateur
                    </h3>

                    <div className="flex items-center gap-4">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
                      >
                        <option value="LOCATAIRE">LOCATAIRE</option>
                        <option value="PROPRIETAIRE">PROPRIETAIRE (Hôte)</option>
                        <option value="SUPPORT">SUPPORT (Équipe Support)</option>
                        <option value="ADMIN">ADMINISTRATEUR (Accès complet)</option>
                      </select>

                      <button
                        onClick={handleRoleUpdate}
                        disabled={isMutating || selectedRole === user?.role}
                        className="px-4 py-2.5 rounded-xl text-white text-xs font-medium transition-all disabled:opacity-50 shadow-xs"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, #8c5e1e)` }}
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
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Document" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
