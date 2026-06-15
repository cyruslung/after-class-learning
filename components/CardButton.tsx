import Link from "next/link";
import { ZhuyinText } from "@/components/ZhuyinText";

interface CardButtonProps {
  href: string;
  label: string;
  description?: string;
  emoji?: string;
  className?: string;
}

export function CardButton({ href, label, description, emoji, className = "" }: CardButtonProps) {
  return (
    <Link
      href={href}
      className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-2xl border-2 px-4 py-5 text-center shadow-sm transition hover:scale-[1.02] hover:shadow-md active:scale-[0.98] sm:min-h-[5rem] sm:px-6 sm:py-6 ${className}`}
    >
      {emoji && <span className="mb-1 text-3xl sm:text-4xl">{emoji}</span>}
      <span className="text-lg font-bold sm:text-xl">
        <ZhuyinText>{label}</ZhuyinText>
      </span>
      {description && (
        <span className="mt-1 text-sm text-muted">
          <ZhuyinText>{description}</ZhuyinText>
        </span>
      )}
    </Link>
  );
}
