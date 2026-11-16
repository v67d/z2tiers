import { describe, expect, it } from "vitest";
import { tierEdits } from "./admin-tiers";

describe("tierEdits", () => {
  it("sends only modes whose tier changed", () => {
    expect(tierEdits({ sword: "HT3", axe: "LT2" }, { sword: "HT2", axe: "LT2" })).toEqual({ sword: "HT2" });
  });
  it("removing a tier sends Unranked for that mode", () => {
    expect(tierEdits({ mace: "LT1" }, {})).toEqual({ mace: "Unranked" });
  });
  it("a new player only gets the tiers that were picked", () => {
    expect(tierEdits({}, { crystal: "HT1", elytra: "Unranked" })).toEqual({ crystal: "HT1" });
  });
});
