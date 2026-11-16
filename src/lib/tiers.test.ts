import { describe, expect, it } from "vitest";
import { GAMEMODES, TIERS, compareTiers, overallTitle, tierLevel, tierMovement, tierPoints } from "./tiers";

describe("tier system", () => {
  it("orders tiers HT1 > LT1 > HT2 > ... > LT5 > Unranked", () => {
    expect(TIERS).toEqual(["HT1", "LT1", "HT2", "LT2", "HT3", "LT3", "HT4", "LT4", "HT5", "LT5", "Unranked"]);
  });

  it("sorts a mixed list from best to worst", () => {
    const sorted = (["LT5", "Unranked", "HT2", "HT1", "LT1"] as const).slice().sort(compareTiers);
    expect(sorted).toEqual(["HT1", "LT1", "HT2", "LT5", "Unranked"]);
  });

  it("treats LT1 to HT1 as a promotion", () => {
    expect(tierMovement("LT1", "HT1")).toBe("up");
    expect(tierMovement("HT3", "LT3")).toBe("down");
    expect(tierMovement(null, "HT4")).toBe("new");
  });

  it("gives higher tiers more points and Unranked none", () => {
    expect(tierPoints("HT1")).toBe(60);
    expect(tierPoints("Unranked")).toBe(0);
    expect(tierLevel("LT2")).toBe(2);
  });

  it("has 12 gamemodes with Spear Mace and Elytra, and no Bow or Crossbow", () => {
    expect(GAMEMODES.map((g) => g.name)).toEqual([
      "Sword", "Axe", "Crystal", "SMP", "UHC", "Pot", "NethPot", "Mace", "Diamond", "Netherite", "Spear Mace", "Elytra",
    ]);
  });
});

describe("overall titles", () => {
  it("150+ points is Combat Master", () => {
    expect(overallTitle(150)).toBe("Combat Master");
    expect(overallTitle(149)).toBe("Combat Specialist");
  });
  it("60+ points is Combat Specialist", () => {
    expect(overallTitle(60)).toBe("Combat Specialist");
    expect(overallTitle(59)).toBe("Noble");
  });
  it("20+ points is Noble", () => {
    expect(overallTitle(20)).toBe("Noble");
    expect(overallTitle(19)).toBe("Noobie");
  });
  it("below 20 points is Noobie", () => {
    expect(overallTitle(0)).toBe("Noobie");
  });
});
