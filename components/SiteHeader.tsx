import Link from "next/link";
import { ZhuyinText } from "@/components/ZhuyinText";

export function SiteHeader() {
  return (
    <header className="border-b border-orange-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-primary sm:text-xl">
          <span className="text-2xl">🎒</span>
          <ZhuyinText>下課輕鬆學</ZhuyinText>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-orange-100 sm:px-4 sm:py-2 sm:text-base"
          >
            <ZhuyinText>學習報表</ZhuyinText>
          </Link>
          <Link
            href="/review"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-orange-100 sm:px-4 sm:py-2 sm:text-base"
          >
            <ZhuyinText>錯題複習</ZhuyinText>
          </Link>
          <Link
            href="/writing"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-orange-100 sm:px-4 sm:py-2 sm:text-base"
          >
            <ZhuyinText>練字坊</ZhuyinText>
          </Link>
          <Link
            href="/admin"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-orange-100 sm:px-4 sm:py-2 sm:text-base"
          >
            <ZhuyinText>管理</ZhuyinText>
          </Link>
        </nav>
      </div>
    </header>
  );
}
