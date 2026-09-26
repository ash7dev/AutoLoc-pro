
import React from "react";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "dark" | "gold" | "white" | "emerald";
  className?: string;
  children: React.ReactNode;
}

const levelClasses: Record<number, string> = {
  1: "text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight",
  2: "text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight",
  3: "text-xl sm:text-2xl leading-tight",
  4: "text-lg sm:text-xl leading-snug",
  5: "text-base sm:text-lg font-semibold",
  6: "text-sm font-semibold tracking-wide",
};

const variantClasses: Record<string, string> = {
  dark: "text-brand-dark",
  gold: "text-champagne",
  white: "text-white",
  emerald: "text-emerald-500",
};

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  variant = "dark",
  className = "",
  children,
  ...props
}) => {
  const baseClasses = "font-fraunces font-normal";
  const sizeClass = levelClasses[level] || levelClasses[1];
  const colorClass = variantClasses[variant] || variantClasses.dark;
  const combinedClass = `${baseClasses} ${sizeClass} ${colorClass} ${className}`;

  switch (level) {
    case 1:
      return <h1 className={combinedClass} {...props}>{children}</h1>;
    case 2:
      return <h2 className={combinedClass} {...props}>{children}</h2>;
    case 3:
      return <h3 className={combinedClass} {...props}>{children}</h3>;
    case 4:
      return <h4 className={combinedClass} {...props}>{children}</h4>;
    case 5:
      return <h5 className={combinedClass} {...props}>{children}</h5>;
    case 6:
      return <h6 className={combinedClass} {...props}>{children}</h6>;
    default:
      return <h1 className={combinedClass} {...props}>{children}</h1>;
  }
};
