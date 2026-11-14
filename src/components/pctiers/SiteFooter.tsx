import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">The competitive standard for Minecraft PvP.</p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/rankings" className="hover:text-foreground">Rankings</Link>
          <span>Not affiliated with Mojang or Microsoft.</span>
        </div>
      </div>
    </footer>
  );
}
