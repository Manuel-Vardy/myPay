// Aliased in place of the real `server-only` package (see vitest.config.mts).
// The real package exists purely to fail the build when server code is pulled
// into a client bundle; under test that guard has nothing to protect.
export {};
