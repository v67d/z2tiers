export function Position({ n }: { n: number }) {
  const podium = n <= 3;
  return (
    <span
      className={
        podium
          ? "grid size-8 place-items-center rounded-lg bg-gradient-brand font-pixel text-sm text-primary-foreground shadow-glow"
          : "grid size-8 place-items-center font-pixel text-sm text-muted-foreground"
      }
    >
      {n}
    </span>
  );
}
