import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "./icons";

/**
 * Bottone dell'area tecnica: stesse proporzioni e stessa tipografia dei bottoni
 * della vetrina (10px, uppercase, tracking 0.2em), unica fonte per i 4 stili.
 */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "destructive";

const base =
  "group inline-flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-out-expo disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-ink px-6 py-3.5 text-white hover:bg-grass",
  secondary: "border border-line px-6 py-3.5 text-ink hover:border-ink",
  ghost: "text-ink-soft hover:text-ink",
  danger: "text-soil-deep hover:text-soil",
  destructive: "bg-soil-deep px-6 py-3.5 text-white hover:bg-soil",
};

export type AdminButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
  /** Freccia che scorre a destra sull'hover (pattern dei CTA di vetrina). */
  arrow?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  "aria-label"?: string;
};

export default function AdminButton({
  children,
  variant = "primary",
  className = "",
  href,
  arrow = false,
  type = "button",
  disabled,
  onClick,
  title,
  "aria-label": ariaLabel,
}: AdminButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`.trim();

  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} title={title} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={classes}
    >
      {content}
    </button>
  );
}
