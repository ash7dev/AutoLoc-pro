import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "emerald" | "forest" | "neutral" | "rose";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  gold: "bg-gold-50 text-gold-500 border border-gold-200/60",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  forest: "bg-forest-50 text-forest-800 border border-forest-200/60",
  neutral: "bg-slate-100 text-slate-700 border border-slate-200/60",
  rose: "bg-rose-50 text-rose-700 border border-rose-200/60",
};

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-0.5 text-[11px] font-medium rounded-md",
  md: "px-2.5 py-1 text-xs font-medium rounded-lg",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "gold",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 leading-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
