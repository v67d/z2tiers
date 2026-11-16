/** Discord statuses that count as "online" for a tester. */
const ONLINE = new Set(["online", "idle", "dnd"]);

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export type DiscordMember = { username: string; status: string };

function norm(name: string) {
  return name.trim().toLowerCase();
}

/** A tester's Discord status, matched case-insensitively by Discord name. Offline when not listed. */
export function testerStatus(discordName: string | null, members: DiscordMember[]): DiscordStatus {
  if (!discordName) return "offline";
  const m = members.find((x) => norm(x.username) === norm(discordName));
  return m && ONLINE.has(m.status) ? (m.status as DiscordStatus) : "offline";
}

/** Online testers first, offline testers moved to the bottom; then by tests run, then name. */
export function sortTesters<T extends { username: string; status: DiscordStatus; tests: number }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      Number(b.status !== "offline") - Number(a.status !== "offline") ||
      b.tests - a.tests ||
      a.username.localeCompare(b.username),
  );
}
