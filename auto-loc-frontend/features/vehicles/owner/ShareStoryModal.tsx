'use client';

import React, { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import Image from 'next/image';
import {
  X, Share2, Download, MessageSquare, Check, Sparkles,
  Copy, ExternalLink, RefreshCw, Car, MapPin, Gauge, Fuel, ShieldCheck, Quote
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { mainPhoto } from './vehicle-helpers';

interface ShareStoryModalProps {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
}

export type StoryTheme = 'dark_luxe' | 'emerald_brand' | 'clean_light';

export function ShareStoryModal({ vehicle, open, onClose }: ShareStoryModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPunchlineIndex, setSelectedPunchlineIndex] = useState<number>(0);
  const [isCustomPunchline, setIsCustomPunchline] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const deferredCustomText = useDeferredValue(customText);
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>('dark_luxe');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState<boolean>(false);

  if (!vehicle) return null;

  const photoUrl = mainPhoto(vehicle);
  const formattedPrice = Number(vehicle.prixParJour).toLocaleString('fr-FR');
  const vehicleUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/vehicle/${vehicle.id}`
    : `https://autoloc.sn/vehicle/${vehicle.id}`;

  // ── Default punchline presets ───────────────────────────────────────────────
  const punchlinePresets = [
    `🚘 Prêt pour la route ? Louez ma ${vehicle.marque} ${vehicle.modele} à ${formattedPrice} FCFA/j sur AutoLoc !`,
    `✨ Disponible à ${vehicle.ville} ! Réservez ma ${vehicle.marque} ${vehicle.modele} en 2 clics sur AutoLoc.`,
    `🌴 Week-end ou vacances ? Profitez de ma ${vehicle.marque} ${vehicle.modele} dès aujourd'hui !`,
    `🔑 Véhicule vérifié & assuré. Réservez votre trajet en toute sérénité sur AutoLoc.sn`,
    `🚀 Conduisez avec élégance à ${vehicle.ville} dès ${formattedPrice} FCFA/j !`
  ];

  const currentPunchline = isCustomPunchline
    ? (deferredCustomText || punchlinePresets[0])
    : punchlinePresets[selectedPunchlineIndex];

  // ── Draw Story to Canvas (1080 x 1920 HD) ──────────────────────────────────
  const renderStoryCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setRendering(true);
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // Load main vehicle photo with Cloudinary optimization
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    const optimizedPhotoUrl = photoUrl?.includes('cloudinary')
      ? photoUrl.replace('/upload/', '/upload/c_fill,w_1080,h_750,q_auto:best/')
      : photoUrl;
    img.src = optimizedPhotoUrl || '/banner-dark.png';

    const drawContent = () => {
      // 1. Background Fill & Gradients
      if (selectedTheme === 'dark_luxe') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#090d16');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Subtle glow orbs
        const glow1 = ctx.createRadialGradient(W * 0.2, H * 0.15, 0, W * 0.2, H * 0.15, 600);
        glow1.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
        glow1.addColorStop(1, 'transparent');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, W, H);

        const glow2 = ctx.createRadialGradient(W * 0.8, H * 0.8, 0, W * 0.8, H * 0.8, 700);
        glow2.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
        glow2.addColorStop(1, 'transparent');
        ctx.fillStyle = glow2;
        ctx.fillRect(0, 0, W, H);

      } else if (selectedTheme === 'emerald_brand') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#022c22');
        bgGrad.addColorStop(0.5, '#064e3b');
        bgGrad.addColorStop(1, '#022c22');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        const glow1 = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, 800);
        glow1.addColorStop(0, 'rgba(52, 211, 153, 0.22)');
        glow1.addColorStop(1, 'transparent');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, W, H);

      } else {
        // Clean Light
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#f1f5f9');
        bgGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        const glow = ctx.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.2, 700);
        glow.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
      }

      // 2. Header: AutoLoc Logo & Verified Badge
      ctx.textAlign = 'center';
      
      // AutoLoc Badge Top Pill
      const isLight = selectedTheme === 'clean_light';
      const pillX = W / 2 - 240;
      const pillY = 120;
      const pillW = 480;
      const pillH = 76;
      const pillRadius = 38;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
      ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Top Header Text
      ctx.fillStyle = isLight ? '#ffffff' : '#34d399';
      ctx.font = '900 32px sans-serif';
      ctx.fillText('AUTOLOC.SN  •  VÉHICULE CERTIFIÉ', W / 2, pillY + 48);

      // 3. Main Vehicle Image Container (Cropped 4:3 style)
      const imgX = 80;
      const imgY = 250;
      const imgW = W - 160; // 920px
      const imgH = 750;
      const imgRadius = 40;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, imgRadius);
      ctx.clip();

      if (img.complete && img.naturalWidth > 0) {
        // Draw image cover
        const scale = Math.max(imgW / img.naturalWidth, imgH / img.naturalHeight);
        const x = imgX + (imgW - img.naturalWidth * scale) / 2;
        const y = imgY + (imgH - img.naturalHeight * scale) / 2;
        ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
      } else {
        // Fallback color box
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(imgX, imgY, imgW, imgH);
      }

      // Bottom vignette overlay on image
      const imgGrad = ctx.createLinearGradient(0, imgY + imgH - 300, 0, imgY + imgH);
      imgGrad.addColorStop(0, 'transparent');
      imgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = imgGrad;
      ctx.fillRect(imgX, imgY + imgH - 300, imgW, 300);

      // Overlay text inside image bottom
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px sans-serif';
      ctx.fillText(`${vehicle.marque} ${vehicle.modele}`.toUpperCase(), imgX + 40, imgY + imgH - 80);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '700 30px sans-serif';
      ctx.fillText(`${vehicle.annee}  •  ${vehicle.ville}`, imgX + 40, imgY + imgH - 35);

      ctx.restore(); // restore clip

      // Border around Image Box
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, imgRadius);
      ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // 4. Price Floating Badge
      const priceBoxW = 420;
      const priceBoxH = 100;
      const priceBoxX = imgX + imgW - priceBoxW - 30;
      const priceBoxY = imgY + 40;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(priceBoxX, priceBoxY, priceBoxW, priceBoxH, 30);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
      ctx.fill();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px sans-serif';
      ctx.fillText(`${formattedPrice} FCFA`, priceBoxX + priceBoxW / 2, priceBoxY + 58);
      ctx.font = '700 22px sans-serif';
      ctx.fillText('PAR JOUR', priceBoxX + priceBoxW / 2, priceBoxY + 86);
      ctx.restore();

      // 4b. Verified Badge Overlay (Top-Left of Image)
      const verifiedBadgeX = imgX + 30;
      const verifiedBadgeY = imgY + 30;
      const verifiedBadgeW = 180;
      const verifiedBadgeH = 60;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(verifiedBadgeX, verifiedBadgeY, verifiedBadgeW, verifiedBadgeH, 30);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
      ctx.fill();
      ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 4;

      // Shield check icon (approximation with text)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', verifiedBadgeX + 35, verifiedBadgeY + 42);

      // "VÉRIFIÉ" text
      ctx.font = '900 22px sans-serif';
      ctx.fillText('VÉRIFIÉ', verifiedBadgeX + 110, verifiedBadgeY + 40);
      ctx.restore();

      // 5. Punchline Quote Box (Middle section)
      const quoteY = 1040;
      const quoteW = W - 160;
      const quoteX = 80;
      const quoteH = 420;
      const quoteRadius = 36;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(quoteX, quoteY, quoteW, quoteH, quoteRadius);
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.75)';
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(226, 232, 240, 0.9)' : 'rgba(52, 211, 153, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Quote icon decor
      ctx.fillStyle = '#10b981';
      ctx.font = '900 70px serif';
      ctx.textAlign = 'left';
      ctx.fillText('“', quoteX + 45, quoteY + 90);

      // Punchline Text Wrapping
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = '800 38px sans-serif';
      ctx.textAlign = 'left';

      const maxTextWidth = quoteW - 100;
      const words = currentPunchline.split(' ');
      let line = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const startY = quoteY + 140;
      const lineHeight = 56;
      lines.forEach((l, i) => {
        if (i < 4) { // max 4 lines
          ctx.fillText(l.trim(), quoteX + 50, startY + (i * lineHeight));
        }
      });

      // 6. Bottom Call-To-Action (Footer)
      const footerY = 1520;
      const footerW = W - 160;
      const footerX = 80;
      const footerH = 260;

      const footGrad = ctx.createLinearGradient(footerX, footerY, footerX + footerW, footerY);
      footGrad.addColorStop(0, '#10b981');
      footGrad.addColorStop(1, '#059669');

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(footerX, footerY, footerW, footerH, 36);
      ctx.fillStyle = footGrad;
      ctx.fill();
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 42px sans-serif';
      ctx.fillText('RÉSERVEZ SUR AUTOLOC.SN', W / 2, footerY + 105);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '700 28px sans-serif';
      ctx.fillText('🔗 Lien dans la bio / swipe up', W / 2, footerY + 175);
      ctx.restore();

      // 7. AutoLoc Watermark (Bottom-Right Corner)
      const watermarkX = W - 280;
      const watermarkY = H - 100;

      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('AUTOLOC.SN', watermarkX + 230, watermarkY + 20);
      ctx.font = '600 16px sans-serif';
      ctx.fillText('Location P2P au Sénégal', watermarkX + 230, watermarkY + 45);
      ctx.restore();

      // Generate Data URL for preview image
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setPreviewDataUrl(dataUrl);
      } catch (e) {
        console.warn('Canvas export failed:', e);
      } finally {
        setRendering(false);
      }
    };

    img.onload = drawContent;
    img.onerror = () => {
      // Draw even if image fails
      drawContent();
    };

  }, [vehicle, photoUrl, formattedPrice, selectedTheme, currentPunchline]);

  // Re-render canvas whenever punchline or theme changes
  useEffect(() => {
    if (open && vehicle) {
      renderStoryCanvas();
    }
  }, [open, vehicle, renderStoryCanvas]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleWhatsAppShare = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share_story', {
        method: 'whatsapp',
        vehicle_id: vehicle.id,
        vehicle_marque: vehicle.marque,
        vehicle_modele: vehicle.modele,
        theme: selectedTheme,
      });
    }

    const text = `${currentPunchline}\n\n👉 Réservez directement ici : ${vehicleUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    toast.success('WhatsApp ouvert !', {
      description: 'Partagez le message pré-rempli dans vos statuts ou discussions.'
    });
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share_story', {
          method: 'download_png',
          vehicle_id: vehicle.id,
          vehicle_marque: vehicle.marque,
          vehicle_modele: vehicle.modele,
          theme: selectedTheme,
        });
      }

      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `autoloc-story-${vehicle.marque.toLowerCase()}-${vehicle.modele.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Story téléchargée !', {
        description: 'Prête à être publiée sur Instagram, Snapchat ou WhatsApp.'
      });
    } catch (e) {
      toast.error('Erreur lors du téléchargement de l\'image.');
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    const shareText = `${currentPunchline}\n\nEn savoir plus : ${vehicleUrl}`;
    if (navigator.share) {
      try {
        // Analytics tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'share_story', {
            method: 'native_share',
            vehicle_id: vehicle.id,
            vehicle_marque: vehicle.marque,
            vehicle_modele: vehicle.modele,
            theme: selectedTheme,
          });
        }

        await navigator.share({
          title: `Location ${vehicle.marque} ${vehicle.modele} - AutoLoc`,
          text: shareText,
          url: vehicleUrl,
        });
        toast.success('Partagé avec succès !');
        return;
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Error in Web Share:', err);
        }
      }
    }
    // Fallback: Copy link
    handleCopyLink();
  };

  const handleCopyLink = async () => {
    try {
      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share_story', {
          method: 'copy_link',
          vehicle_id: vehicle.id,
          vehicle_marque: vehicle.marque,
          vehicle_modele: vehicle.modele,
          theme: selectedTheme,
        });
      }

      const fullText = `${currentPunchline}\n\n${vehicleUrl}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success('Lien & texte copiés !', {
        description: 'Collez-le directement dans votre story ou message.'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Impossible de copier dans le presse-papier.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] overflow-y-auto rounded-3xl p-0 border border-slate-200 bg-slate-900 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-white tracking-tight">
                Générateur de Story Premium
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-medium">
                Partagez votre {vehicle.marque} {vehicle.modele} sur WhatsApp, Instagram & Snapchat
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 p-6">

          {/* LEFT: Live Story Canvas Preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950 flex items-center justify-center group">
              
              {/* Hidden Canvas element used for rendering HD PNG */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Rendered Preview Image */}
              {previewDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDataUrl}
                  alt="Aperçu Story AutoLoc"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                  <p className="text-xs font-bold">Génération du visuel HD…</p>
                </div>
              )}

              {/* Badge format 9:16 */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Format Story 9:16
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium text-center">
              💡 L&apos;image est optimisée en haute définition (1080×1920) pour tous les téléphones.
            </p>
          </div>

          {/* RIGHT: Controls & Customization */}
          <div className="flex flex-col gap-6">

            {/* 1. Theme Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                1. Choisissez le style visuel
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'dark_luxe', name: 'Dark Luxe', color: 'bg-slate-900 border-emerald-500' },
                  { id: 'emerald_brand', name: 'Émeraude Brand', color: 'bg-emerald-950 border-emerald-400' },
                  { id: 'clean_light', name: 'Épuré Clair', color: 'bg-slate-100 text-slate-900 border-slate-300' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id as StoryTheme)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border-2 text-xs font-bold transition-all",
                      t.color,
                      selectedTheme === t.id
                        ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-[1.02]"
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    {selectedTheme === t.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Punchlines List (User Choice) */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-emerald-400" />
                2. Sélectionnez votre phrase d&apos;accroche
              </label>
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {punchlinePresets.map((preset, idx) => {
                  const isSelected = !isCustomPunchline && selectedPunchlineIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsCustomPunchline(false);
                        setSelectedPunchlineIndex(idx);
                      }}
                      className={cn(
                        "flex items-start gap-3 p-3.5 rounded-2xl border text-left text-xs font-medium transition-all",
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/10"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5",
                        isSelected ? "bg-emerald-400 border-emerald-400 text-slate-950" : "border-slate-600"
                      )}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="leading-relaxed flex-1">{preset}</span>
                    </button>
                  );
                })}

                {/* Custom Punchline Option */}
                <button
                  onClick={() => setIsCustomPunchline(true)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs font-medium transition-all",
                    isCustomPunchline
                      ? "bg-emerald-500/15 border-emerald-400 text-white font-semibold"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0",
                    isCustomPunchline ? "bg-emerald-400 border-emerald-400 text-slate-950" : "border-slate-600"
                  )}>
                    {isCustomPunchline && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>✍️ Écrire ma propre phrase sur-mesure…</span>
                </button>
              </div>

              {isCustomPunchline && (
                <div className="mt-2">
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Tapez votre message d'accroche personnalisé ici..."
                    rows={2}
                    className="w-full rounded-2xl border border-emerald-500/50 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              )}
            </div>

            {/* 3. Action Buttons */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                3. Partager ou Télécharger
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* WhatsApp button */}
                <Button
                  onClick={handleWhatsAppShare}
                  className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <MessageSquare className="w-4 h-4 fill-slate-950" />
                  Statut / Message WhatsApp
                </Button>

                {/* Download PNG Story */}
                <Button
                  onClick={handleDownloadPNG}
                  disabled={downloading}
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  {downloading ? 'Téléchargement...' : 'Télécharger l\'image Story'}
                </Button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {/* Native Share */}
                <Button
                  onClick={handleNativeShare}
                  variant="ghost"
                  className="flex-1 h-10 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  Partager via application...
                </Button>

                {/* Copy Text & Link */}
                <Button
                  onClick={handleCopyLink}
                  variant="ghost"
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  {copied ? 'Copié !' : 'Copier texte & lien'}
                </Button>
              </div>

            </div>

          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
