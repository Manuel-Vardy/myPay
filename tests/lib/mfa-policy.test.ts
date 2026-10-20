import { describe, expect, it } from "vitest";
import {
  MFA_ENROLLMENT_REQUIRED_CODE,
  MFA_REQUIRED_ROLES,
  mfaRequiredForRole,
} from "@/lib/mfa-policy";
import type { UserRole } from "@/lib/types";

/**
 * The BoG licensing response states that administrative access carries
 * mandatory MFA. This is the single source of that rule, so it is pinned to
 * the exact role set that was claimed to the regulator.
 */
describe("mfaRequiredForRole", () => {
  it("requires MFA for every staff role that reaches the admin terminal", () => {
    expect(mfaRequiredForRole("SUPER_ADMIN")).toBe(true);
    expect(mfaRequiredForRole("ADMIN")).toBe(true);
    expect(mfaRequiredForRole("SUPPORT")).toBe(true);
  });

  it("leaves MFA opt-in for merchants and customers", () => {
    expect(mfaRequiredForRole("MERCHANT")).toBe(false);
    expect(mfaRequiredForRole("CUSTOMER")).toBe(false);
  });

  it("does not require MFA for an unknown role by accident", () => {
    expect(mfaRequiredForRole("SOMETHING_ELSE" as UserRole)).toBe(false);
  });

  it("pins the exact required-role set", () => {
    expect([...MFA_REQUIRED_ROLES].sort()).toEqual(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  });

  it("exposes a machine-readable code so clients can route to enrollment", () => {
    expect(MFA_ENROLLMENT_REQUIRED_CODE).toBe("MFA_ENROLLMENT_REQUIRED");
  });
});
