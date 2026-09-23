'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Comportement commun à toute surface modale (drawer, lightbox, boîte de confirmation).
 *
 * - Échap ferme uniquement la couche du dessus (pile de modales)
 * - le scroll de la page est verrouillé (compteur, donc sûr avec des modales empilées)
 * - le focus est piégé dans la modale (Tab / Maj+Tab)
 * - le focus initial va sur [data-autofocus], sinon sur le conteneur
 * - le focus revient sur l'élément qui avait ouvert la modale
 */

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

const stack: symbol[] = [];
let lockCount = 0;
let prevOverflow = '';
let prevPaddingRight = '';

function lockScroll() {
    if (lockCount++ > 0) return;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    prevOverflow = document.body.style.overflow;
    prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`; // évite le saut de mise en page
}

function unlockScroll() {
    if (--lockCount > 0) return;
    document.body.style.overflow = prevOverflow;
    document.body.style.paddingRight = prevPaddingRight;
}

export function useModalBehavior(ref: RefObject<HTMLElement | null>, onClose: () => void) {
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    });

    useEffect(() => {
        const root = ref.current;
        if (!root) return;

        const id = Symbol('modal');
        stack.push(id);
        lockScroll();

        const previouslyFocused = document.activeElement as HTMLElement | null;
        (root.querySelector<HTMLElement>('[data-autofocus]') ?? root).focus({ preventScroll: true });

        const onKeyDown = (e: KeyboardEvent) => {
            if (stack[stack.length - 1] !== id) return; // une autre modale est au-dessus

            if (e.key === 'Escape') {
                e.preventDefault();
                closeRef.current();
                return;
            }
            if (e.key !== 'Tab') return;

            const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                (n) => n.offsetParent !== null || n === document.activeElement,
            );
            if (nodes.length === 0) {
                e.preventDefault();
                root.focus();
                return;
            }
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            const active = document.activeElement;

            if (!root.contains(active)) {
                e.preventDefault();
                first.focus();
            } else if (e.shiftKey && (active === first || active === root)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            const i = stack.indexOf(id);
            if (i > -1) stack.splice(i, 1);
            unlockScroll();
            if (previouslyFocused && document.contains(previouslyFocused)) {
                previouslyFocused.focus({ preventScroll: true });
            }
        };
    }, [ref]);
}