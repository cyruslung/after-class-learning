interface PageTitleProps {
  title: string;
  subtitle?: string;
  emoji?: string;
}

export function PageTitle({ title, subtitle, emoji }: PageTitleProps) {
  return (
    <div className="mb-8 text-center">
      {emoji && <div className="mb-2 text-5xl sm:text-6xl">{emoji}</div>}
      <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-base text-muted sm:text-lg">{subtitle}</p>}
    </div>
  );
}
