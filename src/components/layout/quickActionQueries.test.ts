import { describe, expect, it } from "vitest";
import { shouldLoadQuickActionData } from "./quickActionQueries";

describe("quick action query gating", () => {
  it("does not load invoices or accounts while no modal is open", () => {
    expect(shouldLoadQuickActionData(null, "invoices")).toBe(false);
    expect(shouldLoadQuickActionData(null, "accounts")).toBe(false);
  });

  it("loads only the data required by the active modal", () => {
    expect(shouldLoadQuickActionData("new-expense", "accounts")).toBe(true);
    expect(shouldLoadQuickActionData("new-expense", "invoices")).toBe(false);
    expect(shouldLoadQuickActionData("record-payment", "invoices")).toBe(true);
    expect(shouldLoadQuickActionData("record-payment", "accounts")).toBe(true);
  });
});
