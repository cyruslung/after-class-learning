import Link from "next/link";

interface BackLinkProps {
  href: string;
  label?: string;
}

export function BackLink({ href, label = "返回" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-foreground sm:text-base"
    >
      ← {label}
    </Link>
  );
}
