/**
 * An in-memory stand-in for the Next.js cookie store.
 *
 * `src/lib/session.ts` is the only module in src/lib that imports
 * `next/headers`, and everything session-based funnels through its
 * `getSession()` -> `cookies()`. Outside a request context that call has
 * nothing to read, which is what kept the whole session-guard surface
 * untestable.
 *
 * Usage — the `vi.mock` factory has to be at the top of the test file, since
 * vitest hoists it above the imports:
 *
 * ```ts
 * vi.mock("next/headers", async () => {
 *   const { cookiesMock } = await import("../helpers/cookie-jar");
 *   return { cookies: cookiesMock };
 * });
 * ```
 *
 * Then drive it with `cookieJar.set(...)` / `cookieJar.clear()` in the test.
 */

export interface StoredCookie {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

const store = new Map<string, StoredCookie>();

/** Mirrors the subset of Next's cookie store that session.ts uses. */
const cookieStore = {
  get(name: string): { name: string; value: string } | undefined {
    const found = store.get(name);
    return found ? { name: found.name, value: found.value } : undefined;
  },
  set(name: string, value: string, options: Record<string, unknown> = {}) {
    store.set(name, { name, value, options });
  },
  delete(name: string) {
    store.delete(name);
  },
};

/** Stand-in for `cookies()`, which is async in this Next version. */
export const cookiesMock = async () => cookieStore;

export const cookieJar = {
  /** Seed a cookie as though the browser had sent it. */
  set(name: string, value: string, options: Record<string, unknown> = {}) {
    cookieStore.set(name, value, options);
  },
  get(name: string): StoredCookie | undefined {
    return store.get(name);
  },
  /** The options a `set` was called with — for asserting httpOnly/secure/etc. */
  optionsFor(name: string): Record<string, unknown> | undefined {
    return store.get(name)?.options;
  },
  has(name: string): boolean {
    return store.has(name);
  },
  names(): string[] {
    return [...store.keys()];
  },
  /** Call in a beforeEach so cookies never leak between tests. */
  clear() {
    store.clear();
  },
};
