import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "dark";
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: "bg-white border border-slate-200/80 rounded-2xl shadow-xs",
  glass: "glass-card rounded-2xl",
  elevated: "bg-white border border-slate-100 rounded-2xl shadow-md shadow-slate-200/40",
  dark: "bg-brand-dark text-white border border-forest-700/50 rounded-2xl shadow-lg",
};

export const Card: React.FC<CardProps> = ({
  variant = "default",
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
