import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let activeScrollLocks = 0;
let originalOverflowBody = "";
let originalOverflowHtml = "";

export function lockScroll() {
  if (typeof window === "undefined") return;
  if (activeScrollLocks === 0) {
    originalOverflowBody = document.body.style.overflow || "";
    originalOverflowHtml = document.documentElement.style.overflow || "";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }
  activeScrollLocks++;
}

export function unlockScroll() {
  if (typeof window === "undefined") return;
  activeScrollLocks = Math.max(0, activeScrollLocks - 1);
  if (activeScrollLocks === 0) {
    document.body.style.overflow = originalOverflowBody;
    document.documentElement.style.overflow = originalOverflowHtml;
  }
}

