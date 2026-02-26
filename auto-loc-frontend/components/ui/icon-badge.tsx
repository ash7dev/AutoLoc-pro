import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// VARIANTS
// ─────────────────────────────────────────────────────────────────

const iconBadgeVariants = cva(
  [
    "relative inline-flex items-center justify-center flex-shrink-0",
    "rounded-lg border transition-colors duration-150",
  ],
  {
    variants: {
      size: {
        xs: "h-7 w-7",
        sm: "h-8 w-8",
        md: "h-9 w-9",
        lg: "h-10 w-10",
        xl: "h-12 w-12",
      },
      variant: {
        muted:       "bg-muted/60 text-muted-foreground border-border/60",
        ghost:       "bg-transparent text-muted-foreground border-transparent",
        brand:       "bg-amber-50 text-amber-700 border-amber-200/70",
        success:     "bg-green-50 text-green-700 border-green-200/70",
        info:        "bg-blue-50 text-blue-700 border-blue-200/70",
        warning:     "bg-orange-50 text-orange-700 border-orange-200/70",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        // Variante sombre — pour ActionCard / fonds foncés
        dark:        "bg-white/10 text-white/70 border-white/10",
      },
      shadow: {
        none: "",
        sm:   "shadow-sm",
        md:   "shadow-md",
      },
    },
    defaultVariants: {
      size:    "md",
      variant: "muted",
      shadow:  "none",
    },
  }
);

// Taille d'icône corrélée à la taille du badge
const iconSizeMap = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
} as const;

type BadgeSize = keyof typeof iconSizeMap;

// ─────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────

export interface IconBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof iconBadgeVariants> {
  /** Icône Lucide à afficher */
  icon: LucideIcon;
  /** Classes supplémentaires sur l'icône */
  iconClassName?: string;
  /** Épaisseur du trait de l'icône */
  strokeWidth?: number;
  /**
   * Affiche un indicateur point animé (pulse) en haut à droite.
   * Utile pour signaler une action urgente.
   */
  pulse?: boolean;
  /** Couleur du dot pulse — défaut : destructive */
  pulseVariant?: "destructive" | "warning" | "success" | "info";
  /**
   * Rend le wrapper via le composant enfant (Radix Slot).
   * Permet de wrapper un <a> ou un <Link> directement.
   * @example <IconBadge asChild icon={Bell}><Link href="/notifications" /></IconBadge>
   */
  asChild?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// PULSE DOT
// ─────────────────────────────────────────────────────────────────

const pulseDotClass: Record<NonNullable<IconBadgeProps["pulseVariant"]>, string> = {
  destructive: "bg-destructive",
  warning:     "bg-orange-500",
  success:     "bg-green-500",
  info:        "bg-blue-500",
};

// ─────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────

export function IconBadge({
  icon: Icon,
  size,
  variant,
  shadow,
  className,
  iconClassName,
  strokeWidth = 1.5,
  pulse = false,
  pulseVariant = "destructive",
  asChild = false,
  ...props
}: IconBadgeProps) {
  const effectiveSize = (size ?? "md") as BadgeSize;
  const Wrapper = asChild ? Slot : "div";

  return (
    <Wrapper
      className={cn(
        iconBadgeVariants({ size: effectiveSize, variant, shadow }),
        className
      )}
      {...props}
    >
      <Icon
        className={cn(iconSizeMap[effectiveSize], iconClassName)}
        strokeWidth={strokeWidth}
        aria-hidden="true"
      />

      {/* Pulse indicator */}
      {pulse && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
            pulseDotClass[pulseVariant],
            "animate-pulse"
          )}
        />
      )}
    </Wrapper>
  );
}