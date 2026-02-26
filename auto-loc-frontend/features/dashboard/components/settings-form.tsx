'use client';

import React, { useState } from 'react';
import { User, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/nestjs/auth';
import { updateUserProfile } from '@/lib/nestjs/auth';

interface Props {
    profile: UserProfile;
}

export function SettingsForm({ profile }: Props): React.ReactElement {
    const [prenom, setPrenom] = useState(profile.prenom ?? '');
    const [nom, setNom] = useState(profile.nom ?? '');
    const [dateNaissance, setDateNaissance] = useState(
        profile.dateNaissance ? profile.dateNaissance.split('T')[0] : '',
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    async function handleSave() {
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            await updateUserProfile({
                prenom: prenom.trim(),
                nom: nom.trim(),
                dateNaissance: dateNaissance || undefined,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-md shadow-slate-900/20">
                    {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-white" strokeWidth={1.5} />
                    )}
                </div>
                <div>
                    <p className="text-[14px] font-bold text-black">Photo de profil</p>
                    <p className="text-[12px] text-black/40 mt-0.5">
                        La modification de l'avatar sera disponible prochainement
                    </p>
                </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Prénom" value={prenom} onChange={setPrenom} />
                <FormField label="Nom" value={nom} onChange={setNom} />
                <FormField
                    label="Date de naissance"
                    value={dateNaissance}
                    onChange={setDateNaissance}
                    type="date"
                />
                <FormField label="Email" value={profile.email} onChange={() => { }} disabled />
                <FormField label="Téléphone" value={profile.telephone} onChange={() => { }} disabled />
            </div>

            {/* Error / success */}
            {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-700 font-medium">
                    {error}
                </div>
            )}
            {saved && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[13px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Profil mis à jour avec succès
                </div>
            )}

            {/* Save button */}
            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-xl px-6 py-3',
                        'text-[13px] font-bold transition-all duration-200',
                        'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
                        'hover:bg-emerald-600 hover:shadow-xl',
                        saving && 'opacity-60 pointer-events-none',
                    )}
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );
}

function FormField({
    label,
    value,
    onChange,
    type = 'text',
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1.5">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={cn(
                    'w-full rounded-xl border px-4 py-3 text-[14px] font-medium transition-all',
                    disabled
                        ? 'border-slate-100 bg-slate-50 text-black/40 cursor-not-allowed'
                        : 'border-slate-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400',
                )}
            />
        </div>
    );
}
