'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, FileText, ImageOff, Loader2 } from 'lucide-react';
import { useModalBehavior } from '../hooks/useModalBehavior';

export const isPdfUrl = (url: string) => /\.pdf(\?|#|$)/i.test(url);

export interface LightboxItem {
    id: string;
    src: string;
    title: string;
    caption?: string;
}

interface LightboxProps {
    items: LightboxItem[];
    index: number;
    onIndexChange: (index: number) => void;
    onClose: () => void;
    /** Actions contextuelles de l'élément affiché (ex. définir comme couverture, supprimer) */
    renderActions?: (item: LightboxItem) => React.ReactNode;
}

type View = { zoom: number; rot: number; x: number; y: number };
const INITIAL_VIEW: View = { zoom: 1, rot: 0, x: 0, y: 0 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const TOOL =
    'inline-flex h-10 w-10 items-center justify-center rounded-full text-white/85 hover:bg-white/10 hover:text-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1DFB6]';
const NAV =
    'absolute top-1/2 -translate-y-1/2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#041912]/70 text-white hover:bg-[#041912] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1DFB6]';

export const Lightbox: React.FC<LightboxProps> = ({ items, index, onIndexChange, onClose, renderActions }) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

    const [view, setView] = useState<View>(INITIAL_VIEW);
    const [dragging, setDragging] = useState(false);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const [loaded, setLoaded] = useState<{ id: string; w: number; h: number } | null>(null);
    const [failedId, setFailedId] = useState<string | null>(null);

    useModalBehavior(rootRef, onClose);

    const safeIndex = items.length ? clamp(index, 0, items.length - 1) : 0;
    const current = items[safeIndex];
    const currentId = current?.id;
    const hasCurrent = Boolean(current);
    const isPdf = current ? isPdfUrl(current.src) : false;

    // Chaque nouvel élément repart d'une vue neutre
    useEffect(() => {
        setView(INITIAL_VIEW);
        setDragging(false);
        drag.current = null;
    }, [currentId]);

    // Taille de la scène, pour ajuster l'image et borner le déplacement
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [hasCurrent]);

    // Zoom à la molette (listener non passif pour pouvoir empêcher le scroll)
    useEffect(() => {
        const el = stageRef.current;
        if (!el || isPdf) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            setView((v) => {
                const zoom = clamp(v.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), MIN_ZOOM, MAX_ZOOM);
                return zoom === 1 ? { ...v, zoom, x: 0, y: 0 } : { ...v, zoom };
            });
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [isPdf, hasCurrent]);

    // La vignette active reste visible dans la bande
    useEffect(() => {
        rootRef.current
            ?.querySelector<HTMLElement>('[data-thumb][aria-current="true"]')
            ?.scrollIntoView({ block: 'nearest', inline: 'center' });
    }, [safeIndex]);

    const go = useCallback(
        (delta: number) => {
            if (items.length < 2) return;
            onIndexChange((safeIndex + delta + items.length) % items.length);
        },
        [items.length, safeIndex, onIndexChange],
    );

    if (!current || typeof document === 'undefined') return null;

    // ---- Géométrie : l'image est ajustée à la scène, puis zoomée / tournée / déplacée
    const natural = loaded?.id === current.id ? loaded : null;
    const failed = failedId === current.id;
    const odd = Math.abs(view.rot / 90) % 2 === 1;
    const nw = natural?.w ?? 0;
    const nh = natural?.h ?? 0;
    const baseW = odd ? nh : nw;
    const baseH = odd ? nw : nh;
    const fit = natural && size.w > 0 && size.h > 0 ? Math.min(size.w / baseW, size.h / baseH) : 1;
    const scale = fit * view.zoom;
    const maxX = Math.max(0, (baseW * scale - size.w) / 2);
    const maxY = Math.max(0, (baseH * scale - size.h) / 2);
    const x = clamp(view.x, -maxX, maxX);
    const y = clamp(view.y, -maxY, maxY);

    const zoomBy = (factor: number) =>
        setView((v) => {
            const zoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
            return zoom === 1 ? { ...v, zoom, x: 0, y: 0 } : { ...v, zoom };
        });
    const rotate = () => setView((v) => ({ ...v, rot: v.rot + 90, x: 0, y: 0 }));
    const toggleZoom = () => setView((v) => (v.zoom > 1 ? { ...v, zoom: 1, x: 0, y: 0 } : { ...v, zoom: 2.5 }));

    // ---- Gestes : déplacement si zoomé, balayage horizontal pour changer d'élément sinon
    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        drag.current = { sx: e.clientX, sy: e.clientY, ox: x, oy: y };
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d || view.zoom <= 1) return;
        setDragging(true);
        const nx = clamp(d.ox + e.clientX - d.sx, -maxX, maxX);
        const ny = clamp(d.oy + e.clientY - d.sy, -maxY, maxY);
        setView((v) => ({ ...v, x: nx, y: ny }));
    };
    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        drag.current = null;
        setDragging(false);
        if (!d || view.zoom > 1) return;
        const dx = e.clientX - d.sx;
        const dy = e.clientY - d.sy;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowLeft':
                go(-1);
                break;
            case 'ArrowRight':
                go(1);
                break;
            case '+':
            case '=':
                zoomBy(1.25);
                break;
            case '-':
                zoomBy(1 / 1.25);
                break;
            case '0':
                setView(INITIAL_VIEW);
                break;
            case 'r':
            case 'R':
                rotate();
                break;
            default:
                return;
        }
        e.preventDefault();
    };

    const counter = items.length > 1 ? `${safeIndex + 1} sur ${items.length}` : null;
    const subtitle = [current.caption, counter].filter(Boolean).join(', ');

    return createPortal(
        <div
            ref={rootRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Visionneuse : ${current.title}`}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className="fixed inset-0 z-[60] flex flex-col bg-[#041912]/95 text-white backdrop-blur-sm outline-none font-sans"
        >
            {/* Barre du haut */}
            <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-2 sm:px-6">
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{current.title}</h2>
                    {subtitle && <p className="truncate text-xs text-white/60">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-0.5">
                    {!isPdf && (
                        <>
                            <button type="button" className={TOOL} onClick={() => zoomBy(1 / 1.25)} disabled={view.zoom <= MIN_ZOOM} aria-label="Zoom arrière" title="Zoom arrière (-)">
                                <ZoomOut className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setView(INITIAL_VIEW)}
                                aria-label="Réinitialiser la vue"
                                title="Réinitialiser (0)"
                                className="hidden h-10 min-w-[3.5rem] items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums text-white/85 hover:bg-white/10 sm:inline-flex cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1DFB6]"
                            >
                                {Math.round(view.zoom * 100)} %
                            </button>
                            <button type="button" className={TOOL} onClick={() => zoomBy(1.25)} disabled={view.zoom >= MAX_ZOOM} aria-label="Zoom avant" title="Zoom avant (+)">
                                <ZoomIn className="h-5 w-5" />
                            </button>
                            <button type="button" className={TOOL} onClick={rotate} aria-label="Pivoter de 90 degrés" title="Pivoter (R)">
                                <RotateCw className="h-5 w-5" />
                            </button>
                            <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-white/20" />
                        </>
                    )}
                    <button type="button" data-autofocus className={TOOL} onClick={onClose} aria-label="Fermer la visionneuse" title="Fermer (Échap)">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Scène */}
            <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden">
                {isPdf ? (
                    <iframe src={current.src} title={current.title} className="absolute inset-0 h-full w-full bg-white" />
                ) : (
                    <div
                        className="absolute inset-0 touch-none select-none"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        onDoubleClick={toggleZoom}
                    >
                        {failed ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/70">
                                <ImageOff className="h-8 w-8" />
                                <span>Impossible de charger ce fichier.</span>
                            </div>
                        ) : (
                            <>
                                {!natural && (
                                    <Loader2 className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-spin text-white/60 motion-reduce:animate-none" />
                                )}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    key={current.id}
                                    src={current.src}
                                    alt={current.title}
                                    draggable={false}
                                    onLoad={(e) =>
                                        setLoaded({ id: current.id, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
                                    }
                                    onError={() => setFailedId(current.id)}
                                    className={`absolute left-1/2 top-1/2 max-w-none ${dragging ? '' : 'transition-transform duration-200 motion-reduce:transition-none'
                                        }`}
                                    style={
                                        natural
                                            ? {
                                                width: nw,
                                                height: nh,
                                                marginLeft: -nw / 2,
                                                marginTop: -nh / 2,
                                                transform: `translate(${x}px, ${y}px) rotate(${view.rot}deg) scale(${scale})`,
                                                cursor: view.zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
                                            }
                                            : { opacity: 0 }
                                    }
                                />
                            </>
                        )}
                    </div>
                )}

                {items.length > 1 && (
                    <>
                        <button type="button" className={`${NAV} left-3`} onClick={() => go(-1)} aria-label="Élément précédent">
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button type="button" className={`${NAV} right-3`} onClick={() => go(1)} aria-label="Élément suivant">
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}
            </div>

            {/* Actions + bande de vignettes */}
            {(renderActions || items.length > 1) && (
                <footer className="shrink-0 space-y-3 px-4 pb-4 pt-3 sm:px-6">
                    {renderActions && (
                        <div className="flex flex-wrap items-center justify-center gap-2">{renderActions(current)}</div>
                    )}
                    {items.length > 1 && (
                        <div className="flex justify-start gap-2 overflow-x-auto py-1 sm:justify-center scrollbar-none">
                            {items.map((it, i) => {
                                const active = i === safeIndex;
                                return (
                                    <button
                                        key={it.id}
                                        type="button"
                                        data-thumb
                                        onClick={() => onIndexChange(i)}
                                        aria-label={`Afficher ${it.title}${it.caption ? `, ${it.caption}` : ''}`}
                                        aria-current={active ? 'true' : undefined}
                                        className={`relative h-12 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-white/10 ring-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1DFB6] ${active ? 'ring-[#F1DFB6]' : 'opacity-60 ring-transparent hover:opacity-100'
                                            }`}
                                    >
                                        {isPdfUrl(it.src) ? (
                                            <FileText className="mx-auto h-full w-5 text-white/70" />
                                        ) : (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={it.src} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </footer>
            )}
        </div>,
        document.body,
    );
};