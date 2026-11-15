import bg from "@/assets/stormy-arena-bg.png.asset.json";

/** Full-screen Minecraft storm background used on the login and admin pages. */
export function StormBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <img src={bg.url} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--primary)_0%,transparent_60%)] opacity-15" />
    </div>
  );
}
