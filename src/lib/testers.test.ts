import { describe, expect, it } from "vitest";
import { sortTesters, testerStatus } from "./testers";

const members = [
  { username: "Z2n5", status: "online" },
  { username: "f4tal", status: "idle" },
];

describe("tester Discord status", () => {
  it("matches the Discord name ignoring case", () => {
    expect(testerStatus("z2N5", members)).toBe("online");
    expect(testerStatus("F4TAL", members)).toBe("idle");
  });
  it("is offline when not in the online list or no Discord name is set", () => {
    expect(testerStatus("someone", members)).toBe("offline");
    expect(testerStatus(null, members)).toBe("offline");
  });
  it("moves offline testers below online testers", () => {
    const sorted = sortTesters([
      { username: "A", status: "offline" as const, tests: 50 },
      { username: "B", status: "online" as const, tests: 1 },
      { username: "C", status: "dnd" as const, tests: 2 },
    ]);
    expect(sorted.map((t) => t.username)).toEqual(["C", "B", "A"]);
  });
});
