import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { closeDatabase, resetDatabase } from "../helpers/db";
import { createUser } from "../helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

/** Migration 0050: users.email must be stored lowercase. */
describe("users_email_lowercase constraint", () => {
  it("accepts a lowercase email", async () => {
    await expect(createUser({ email: "ama@trite.africa" })).resolves.toMatchObject({ email: "ama@trite.africa" });
  });

  it("rejects a mixed-case email", async () => {
    await expect(createUser({ email: "Ama@Trite.Africa" })).rejects.toThrow(/users_email_lowercase/);
  });

  it("allows a phone-only user with no email", async () => {
    await expect(createUser({ email: null, role: "CUSTOMER", mobile_number: "+233201234567" })).resolves.toBeTruthy();
  });
});
