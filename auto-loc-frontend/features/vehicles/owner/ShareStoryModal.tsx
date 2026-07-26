'use client';

import React, { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import {
  X, Share2, Download, MessageSquare, Check, Sparkles,
  Copy, RefreshCw, Quote
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription
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
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);

  if (!vehicle) return null;

  const photoUrl = mainPhoto(vehicle);
  const formattedPrice = Number(vehicle.prixParJour).toLocaleString('fr-FR');
  const vehicleUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/vehicle/${vehicle.id}`
    : `https://autoloc.sn/vehicle/${vehicle.id}`;

  // ── Short, punchy presets (kept under ~55 chars so they always fit 2-3 lines) ──
  const punchlinePresets = [
    `🚘 ${vehicle.marque} ${vehicle.modele} dispo dès ${formattedPrice} FCFA/j`,
    `✨ Réservez en 2 clics à ${vehicle.ville} !`,
    `🌴 Parfaite pour vos vacances ou week-ends`,
    `🔑 Véhicule vérifié & assuré sur AutoLoc`,
    `🚀 Roulez avec style à ${vehicle.ville}`
  ];

  const currentPunchline = isCustomPunchline
    ? (deferredCustomText || punchlinePresets[0])
    : punchlinePresets[selectedPunchlineIndex];

  // ── Helper: wrap text and auto-shrink font so it always fits the box ──────
  const fitTextInBox = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxHeight: number,
    maxFontSize: number,
    minFontSize: number,
    lineHeightRatio = 1.35,
    fontWeight = '800'
  ): { lines: string[]; fontSize: number; lineHeight: number } => {
    let fontSize = maxFontSize;

    while (fontSize >= minFontSize) {
      ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);

      const lineHeight = fontSize * lineHeightRatio;
      const totalHeight = lines.length * lineHeight;

      if (totalHeight <= maxHeight) {
        return { lines, fontSize, lineHeight };
      }
      fontSize -= 2;
    }

    // Fallback at minimum size, truncate with ellipsis if still too tall
    ctx.font = `${fontWeight} ${minFontSize}px sans-serif`;
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    const lineHeight = minFontSize * lineHeightRatio;
    const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      kept[maxLines - 1] = kept[maxLines - 1].replace(/\s+$/, '') + '…';
      return { lines: kept, fontSize: minFontSize, lineHeight };
    }
    return { lines, fontSize: minFontSize, lineHeight };
  };

  // ── Draw Story to Canvas (1080 x 1920 HD) ──────────────────────────────────
  const renderStoryCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const img = new window.Image();
    const optimizedPhotoUrl = photoUrl?.includes('cloudinary')
      ? photoUrl.replace('/upload/', '/upload/c_fill,w_1080,h_750,q_auto:best/')
      : photoUrl;

    // Only set crossOrigin when we actually need pixel access (we always toDataURL,
    // so we need it) — but if it fails, we still draw everything else and just
    // fall back to a solid color for the photo area instead of a stuck spinner.
    img.crossOrigin = 'anonymous';
    img.src = optimizedPhotoUrl || '';

    const drawContent = (imageOk: boolean) => {
      setImageLoadFailed(!imageOk);

      // 1. Background
      if (selectedTheme === 'dark_luxe') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#090d16');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

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

      const isLight = selectedTheme === 'clean_light';

      // 2. Top badge pill
      ctx.textAlign = 'center';
      const pillX = W / 2 - 240;
      const pillY = 120;
      const pillW = 480;
      const pillH = 76;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 38);
      ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isLight ? '#ffffff' : '#34d399';
      ctx.font = '900 30px sans-serif';
      ctx.fillText('AUTOLOC.SN  •  VÉHICULE CERTIFIÉ', W / 2, pillY + 48);

      // 3. Main image box
      const imgX = 80;
      const imgY = 250;
      const imgW = W - 160;
      const imgH = 750;
      const imgRadius = 40;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, imgRadius);
      ctx.clip();

      if (imageOk && img.naturalWidth > 0) {
        const scale = Math.max(imgW / img.naturalWidth, imgH / img.naturalHeight);
        const x = imgX + (imgW - img.naturalWidth * scale) / 2;
        const y = imgY + (imgH - img.naturalHeight * scale) / 2;
        ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
      } else {
        const fallbackGrad = ctx.createLinearGradient(imgX, imgY, imgX, imgY + imgH);
        fallbackGrad.addColorStop(0, '#1e293b');
        fallbackGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = fallbackGrad;
        ctx.fillRect(imgX, imgY, imgW, imgH);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '700 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📷 Photo indisponible', imgX + imgW / 2, imgY + imgH / 2);
      }

      const imgGrad = ctx.createLinearGradient(0, imgY + imgH - 300, 0, imgY + imgH);
      imgGrad.addColorStop(0, 'transparent');
      imgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = imgGrad;
      ctx.fillRect(imgX, imgY + imgH - 300, imgW, 300);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      const { lines: titleLines, fontSize: titleFontSize, lineHeight: titleLH } = fitTextInBox(
        ctx, `${vehicle.marque} ${vehicle.modele}`.toUpperCase(), imgW - 80, 110, 48, 30, 1.15, '900'
      );
      titleLines.forEach((l, i) => {
        ctx.font = `900 ${titleFontSize}px sans-serif`;
        ctx.fillText(l, imgX + 40, imgY + imgH - 90 + i * titleLH);
      });

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '700 30px sans-serif';
      ctx.fillText(`${vehicle.annee}  •  ${vehicle.ville}`, imgX + 40, imgY + imgH - 35);

      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, imgRadius);
      ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // 4. Price badge
      const priceBoxW = 420;
      const priceBoxH = 100;
      const priceBoxX = imgX + imgW - priceBoxW - 30;
      const priceBoxY = imgY + 40;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(priceBoxX, priceBoxY, priceBoxW, priceBoxH, 30);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 42px sans-serif';
      ctx.fillText(`${formattedPrice} FCFA`, priceBoxX + priceBoxW / 2, priceBoxY + 58);
      ctx.font = '700 22px sans-serif';
      ctx.fillText('PAR JOUR', priceBoxX + priceBoxW / 2, priceBoxY + 86);
      ctx.restore();

      // 4b. Verified badge
      const vX = imgX + 30;
      const vY = imgY + 30;
      const vW = 180;
      const vH = 60;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(vX, vY, vW, vH, 30);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', vX + 35, vY + 40);
      ctx.font = '900 20px sans-serif';
      ctx.fillText('VÉRIFIÉ', vX + 112, vY + 38);
      ctx.restore();

      // 5. Punchline box — height now generous and text auto-fits inside it
      const quoteY = 1040;
      const quoteX = 80;
      const quoteW = W - 160;
      const quoteH = 420;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(quoteX, quoteY, quoteW, quoteH, 36);
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.75)';
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(226, 232, 240, 0.9)' : 'rgba(52, 211, 153, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#10b981';
      ctx.font = '900 70px serif';
      ctx.textAlign = 'left';
      ctx.fillText('"', quoteX + 45, quoteY + 90);

      const textPadding = 60;
      const availableW = quoteW - textPadding * 2;
      const availableH = quoteH - 130; // leaves room for the quote mark + padding

      const { lines, fontSize, lineHeight } = fitTextInBox(
        ctx, currentPunchline, availableW, availableH, 44, 24
      );

      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.textAlign = 'left';
      const blockHeight = lines.length * lineHeight;
      const startY = quoteY + 120 + (availableH - blockHeight) / 2 + fontSize * 0.8;
      lines.forEach((l, i) => {
        ctx.font = `800 ${fontSize}px sans-serif`;
        ctx.fillText(l, quoteX + textPadding, startY + i * lineHeight);
      });

      // 6. Footer CTA
      const footerY = 1520;
      const footerX = 80;
      const footerW = W - 160;
      const footerH = 260;

      const footGrad = ctx.createLinearGradient(footerX, footerY, footerX + footerW, footerY);
      footGrad.addColorStop(0, '#10b981');
      footGrad.addColorStop(1, '#059669');

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(footerX, footerY, footerW, footerH, 36);
      ctx.fillStyle = footGrad;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 42px sans-serif';
      ctx.fillText('RÉSERVEZ SUR AUTOLOC.SN', W / 2, footerY + 105);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '700 28px sans-serif';
      ctx.fillText('🔗 Lien dans la bio / swipe up', W / 2, footerY + 175);
      ctx.restore();

      // 7. Watermark
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('AUTOLOC.SN', W - 50, H - 80);
      ctx.font = '600 16px sans-serif';
      ctx.fillText('Location P2P au Sénégal', W - 50, H - 55);
      ctx.restore();

      try {
        setPreviewDataUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Canvas export failed (likely a CORS-tainted photo):', e);
        // Re-render everything with the fallback color block instead of the photo
        // so the user still gets a usable preview/export.
        if (imageOk) {
          drawContent(false);
        }
      }
    };

    img.onload = () => drawContent(true);
    img.onerror = () => drawContent(false);

    // Safety net: if the image never fires load/error (slow network), don't
    // leave the user staring at a spinner forever.
    const timeout = setTimeout(() => {
      if (!img.complete) drawContent(false);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [vehicle, photoUrl, formattedPrice, selectedTheme, currentPunchline]);

  useEffect(() => {
    if (open && vehicle) {
      const cleanup = renderStoryCanvas();
      return cleanup;
    }
  }, [open, vehicle, renderStoryCanvas]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const trackShare = (method: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share_story', {
        method,
        vehicle_id: vehicle.id,
        vehicle_marque: vehicle.marque,
        vehicle_modele: vehicle.modele,
        theme: selectedTheme,
      });
    }
  };

  const handleWhatsAppShare = () => {
    trackShare('whatsapp');
    const text = `${currentPunchline}\n\n👉 Réservez directement ici : ${vehicleUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    toast.success('WhatsApp ouvert !', {
      description: 'Partagez le message pré-rempli dans vos statuts ou discussions.'
    });
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      trackShare('download_png');
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `autoloc-story-${vehicle.marque.toLowerCase()}-${vehicle.modele.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Story téléchargée !', {
        description: 'Prête à être publiée sur Instagram, Snapchat ou WhatsApp.'
      });
    } catch (e) {
      toast.error("Erreur lors du téléchargement de l'image.");
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    const shareText = `${currentPunchline}\n\nEn savoir plus : ${vehicleUrl}`;
    if (navigator.share) {
      try {
        trackShare('native_share');
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
    handleCopyLink();
  };

  const handleCopyLink = async () => {
    try {
      trackShare('copy_link');
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
      <DialogContent className="max-w-4xl w-[92vw] sm:w-[95vw] max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-0 border border-slate-200 bg-slate-900 text-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                Générateur de Story
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                {vehicle.marque} {vehicle.modele} — WhatsApp, Instagram & Snapchat
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 sm:gap-6 p-4 sm:p-6">

          {/* LEFT: Live Story Canvas Preview */}
          <div className="flex flex-col items-center gap-3 lg:sticky lg:top-24 lg:self-start">
            <div className="relative w-full max-w-[240px] sm:max-w-[280px] aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950 flex items-center justify-center mx-auto">

              <canvas ref={canvasRef} className="hidden" />

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
                  <p className="text-xs font-bold">Génération du visuel…</p>
                </div>
              )}

              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                9:16
              </div>
            </div>

            {imageLoadFailed && (
              <p className="text-[11px] text-amber-400 font-medium text-center px-2">
                ⚠️ La photo du véhicule n&apos;a pas pu être chargée dans le visuel (problème CORS/réseau) — un fond de secours est utilisé à la place.
              </p>
            )}
            <p className="text-[11px] text-slate-400 font-medium text-center px-2">
              Image HD (1080×1920), optimisée pour tous les téléphones.
            </p>
          </div>

          {/* RIGHT: Controls & Customization */}
          <div className="flex flex-col gap-5 sm:gap-6 min-w-0">

            {/* 1. Theme Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                1. Style visuel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'dark_luxe', name: 'Dark Luxe', color: 'bg-slate-900 border-emerald-500' },
                  { id: 'emerald_brand', name: 'Émeraude', color: 'bg-emerald-950 border-emerald-400' },
                  { id: 'clean_light', name: 'Épuré Clair', color: 'bg-slate-100 text-slate-900 border-slate-300 col-span-2 sm:col-span-1' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id as StoryTheme)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-2 rounded-2xl border-2 text-xs font-bold transition-all truncate",
                      t.color,
                      selectedTheme === t.id
                        ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-[1.02]"
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    {selectedTheme === t.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Punchlines List */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-emerald-400" />
                2. Phrase d&apos;accroche
              </label>
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
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
                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                        isSelected ? "bg-emerald-400 border-emerald-400 text-slate-950" : "border-slate-600"
                      )}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="leading-relaxed flex-1 break-words">{preset}</span>
                    </button>
                  );
                })}

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
                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                    isCustomPunchline ? "bg-emerald-400 border-emerald-400 text-slate-950" : "border-slate-600"
                  )}>
                    {isCustomPunchline && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>✍️ Écrire ma propre phrase…</span>
                </button>
              </div>

              {isCustomPunchline && (
                <div className="mt-2">
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Message d'accroche personnalisé (le texte s'adapte automatiquement à l'image)…"
                    rows={2}
                    maxLength={140}
                    className="w-full rounded-2xl border border-emerald-500/50 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 text-right">{customText.length}/140</p>
                </div>
              )}
            </div>

            {/* 3. Action Buttons */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                3. Partager ou télécharger
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleWhatsAppShare}
                  className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <MessageSquare className="w-4 h-4 fill-slate-950" />
                  Statut / Message WhatsApp
                </Button>

                <Button
                  onClick={handleDownloadPNG}
                  disabled={downloading}
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  {downloading ? 'Téléchargement...' : "Télécharger l'image"}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <Button
                  onClick={handleNativeShare}
                  variant="ghost"
                  className="flex-1 h-10 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  Partager via application
                </Button>

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