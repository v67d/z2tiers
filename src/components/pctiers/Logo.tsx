import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="PCTIERS home">
      <span className="relative grid size-9 place-items-center rounded-lg bg-gradient-brand shadow-glow">
        <span className="grid grid-cols-3 gap-[2px]">
          {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((on, i) => (
            <span key={i} className={on ? "size-[5px] bg-primary-foreground" : "size-[5px] bg-primary-foreground/25"} />
          ))}
        </span>
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        PC<span className="text-gradient">TIERS</span>
      </span>
    </Link>
  );
}
