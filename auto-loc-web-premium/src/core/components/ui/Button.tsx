import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "champagne" | "emerald" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  brand:
    "bg-brand-main text-white hover:bg-forest-700 shadow-md shadow-brand-main/15 focus:ring-brand-main/20",
  champagne:
    "bg-champagne text-brand-dark hover:bg-gold-100 shadow-sm focus:ring-champagne/30 font-medium",
  emerald:
    "btn-emerald text-white shadow-emerald-500/20 focus:ring-emerald-500/30",
  outline:
    "border border-slate-200 text-brand-dark bg-white hover:bg-slate-50 focus:ring-slate-200",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-brand-dark focus:ring-slate-200",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-2xl gap-2.5",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "brand",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  return (
    <button
      className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
