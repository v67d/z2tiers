import { Link } from "@tanstack/react-router";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { DISCORD_URL } from "@/lib/tiers";
import { Logo } from "./Logo";

const navLink =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:bg-muted";

export function SiteHeader() {
  const { session } = useSession();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1">
          <Link to="/" className={navLink} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/rankings" className={navLink}>
            Rankings
          </Link>
          {session ? (
            <Link to="/admin" className={navLink}>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> Admin
              </span>
            </Link>
          ) : (
            <Link to="/auth" className={navLink}>
              Admin login
            </Link>
          )}
          <Button asChild variant="glass" size="sm" className="ml-2 hidden sm:inline-flex">
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">
              <MessageCircle /> Discord
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
