import Link from "next/link";
import { withZhuyin } from "@/components/ZhuyinText";

interface BigButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover border-primary",
  secondary: "bg-secondary text-white hover:opacity-90 border-secondary",
  outline: "bg-white text-foreground hover:bg-orange-50 border-orange-300",
};

export function BigButton({
  href,
  onClick,
  children,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}: BigButtonProps) {
  const baseClass = `inline-flex min-h-[3rem] items-center justify-center rounded-2xl border-2 px-8 py-3 text-lg font-bold shadow-sm transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[3.5rem] sm:px-10 sm:text-xl ${variants[variant]} ${className}`;
  const content = withZhuyin(children);

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClass}>
      {content}
    </button>
  );
}
