import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, subtitle, icon }: { eyebrow: string; title: string; subtitle: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      {icon && (
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
          {icon}
        </span>
      )}
      <div>
        <div className="font-pixel text-[11px] uppercase tracking-wider text-primary">{eyebrow}</div>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-1.5 text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
