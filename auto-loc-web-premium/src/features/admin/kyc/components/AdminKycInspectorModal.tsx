'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Camera,
  FileText,
  Clock,
  Phone,
  Mail,
  User,
  AlertTriangle,
} from 'lucide-react';
import type { AdminKycQueueItem } from '../../../../core/api/adminAnalyticsApi';

interface AdminKycInspectorModalProps {
  item: AdminKycQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string, raison?: string) => Promise<void>;
  isMutating?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';

const PRESET_REJECTION_REASONS = [
  'Document flou ou illisible',
  "Pièce d'identité expirée",
  "Verso de la pièce d'identité manquant",
  'Photo selfie ne correspondant pas à la pièce d\'identité',
  'Permis de conduire non conforme ou périmé',
  'Incohérence sur le nom ou la date de naissance',
];

export const AdminKycInspectorModal: React.FC<AdminKycInspectorModalProps> = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isMutating,
}) => {
  const [activeDoc, setActiveDoc] = useState<'recto' | 'verso' | 'selfie' | 'permis'>('recto');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen || !item) return null;

  const docs = item.documents;
  const currentImageUrl =
    activeDoc === 'recto'
      ? docs.documentUrl
      : activeDoc === 'verso'
      ? docs.documentBackUrl
      : activeDoc === 'selfie'
      ? docs.selfieUrl
      : docs.permisUrl;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetImage = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleApproveAction = async () => {
    await onApprove(item.id);
  };

  const handleRejectAction = async () => {
    const finalReason = selectedPreset === 'AUTRE' ? customReason : selectedPreset;
    if (!finalReason) return;
    await onReject(item.id, finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-fraunces" style={fontStyle}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="fixed inset-4 sm:inset-6 md:inset-10 z-10 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1DFB6] text-[#041912] font-normal flex items-center justify-center text-base shrink-0 border border-black/5">
              {item.prenom?.[0] || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-normal text-[#041912] dark:text-white">
                  {item.fullName}
                </h2>
                {item.waitHours !== undefined && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                    <Clock className="w-3 h-3 inline mr-1" /> {item.waitHours}h d'attente
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                {item.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {item.phone}
                  </span>
                )}
                {item.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {item.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Left Column: Document HD Viewer (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col min-h-0 bg-slate-950/95 relative overflow-hidden">
            {/* Toolbar Document Tabs */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => { setActiveDoc('recto'); handleResetImage(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-all ${
                    activeDoc === 'recto' ? 'bg-[#0A3D2E] text-white shadow-xs' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> CIN Recto
                </button>

                <button
                  onClick={() => { setActiveDoc('verso'); handleResetImage(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-all ${
                    activeDoc === 'verso' ? 'bg-[#0A3D2E] text-white shadow-xs' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> CIN Verso
                </button>

                <button
                  onClick={() => { setActiveDoc('selfie'); handleResetImage(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-all ${
                    activeDoc === 'selfie' ? 'bg-[#0A3D2E] text-white shadow-xs' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" /> Selfie
                </button>

                <button
                  onClick={() => { setActiveDoc('permis'); handleResetImage(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-all ${
                    activeDoc === 'permis' ? 'bg-[#0A3D2E] text-white shadow-xs' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Permis
                </button>
              </div>

              {/* Viewer Controls */}
              {currentImageUrl && (
                <div className="flex items-center gap-1 text-slate-300">
                  <button onClick={handleZoomOut} title="Zoom Arrière" className="p-1.5 hover:bg-slate-800 rounded-lg">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={handleZoomIn} title="Zoom Avant" className="p-1.5 hover:bg-slate-800 rounded-lg">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={handleRotate} title="Pivoter 90°" className="p-1.5 hover:bg-slate-800 rounded-lg">
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <a href={currentImageUrl} target="_blank" rel="noreferrer" title="Ouvrir l'image HD" className="p-1.5 hover:bg-slate-800 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Image Canvas Container */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="Document KYC HD"
                  className="max-h-full max-w-full object-contain rounded-xl transition-transform duration-200 select-none shadow-2xl"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                />
              ) : (
                <div className="text-center text-slate-500 text-xs space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p>Aucun document fourni pour cette pièce.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Verification Checklist & Decision Panel (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between p-6 space-y-6 overflow-y-auto text-xs">
            {/* Control Checklist */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-medium block">Guide d'inspection visuelle :</span>
                  Vérifiez la concordance entre la photo du selfie et la CIN, la validité de la date d'expiration et la présence du permis.
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">
                  Checklist de conformité
                </span>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">Pièces 100% lisibles et nettes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">Nom & Prénom conformes à l'état civil</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">Document non expiré</span>
                  </label>
                </div>
              </div>

              {/* Rejection Reasons Form */}
              {isRejecting && (
                <div className="space-y-3 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 animate-fade-in">
                  <span className="font-medium text-rose-900 dark:text-rose-200 block">Motif du rejet :</span>
                  
                  <div className="space-y-1.5">
                    {PRESET_REJECTION_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setSelectedPreset(reason)}
                        className={`w-full text-left p-2 rounded-lg text-[11px] transition-all border ${
                          selectedPreset === reason
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}

                    <button
                      onClick={() => setSelectedPreset('AUTRE')}
                      className={`w-full text-left p-2 rounded-lg text-[11px] transition-all border ${
                        selectedPreset === 'AUTRE'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                      }`}
                    >
                      Autre raison spécifique...
                    </button>
                  </div>

                  {selectedPreset === 'AUTRE' && (
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Précisez la raison détaillée du rejet..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-1 focus:ring-rose-500 h-20"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {!isRejecting ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRejecting(true)}
                    disabled={isMutating}
                    className="flex-1 py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Rejeter
                  </button>

                  <button
                    onClick={handleApproveAction}
                    disabled={isMutating}
                    className="flex-1 py-3 px-4 rounded-xl font-normal text-white transition-opacity flex items-center justify-center gap-2 shadow-xs"
                    style={{ backgroundColor: FOREST }}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approuver KYC
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRejecting(false)}
                    disabled={isMutating}
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                  >
                    Annuler
                  </button>

                  <button
                    onClick={handleRejectAction}
                    disabled={isMutating || (!selectedPreset || (selectedPreset === 'AUTRE' && !customReason.trim()))}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Confirmer le Rejet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
