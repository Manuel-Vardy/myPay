import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

const secretKey = process.env.AUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

const COOKIE_NAME = "session";
const SESSION_TTL_DAYS = 7;

export interface SessionPayload extends JWTPayload {
  userId: string;
  role: UserRole;
  expiresAt: string; // ISO date string
}

/**
 * Sign a JWT containing the session payload.
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(encodedKey);
}

/**
 * Verify & decode a JWT, returning the session payload or null on failure.
 */
export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create a new session cookie for the given user.
 */
export async function createSession(
  userId: string,
  role: UserRole
): Promise<string> {
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const payload: SessionPayload = {
    userId,
    role,
    expiresAt: expiresAt.toISOString(),
  };

  const token = await encrypt(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return token;
}

/**
 * Read and decrypt the current session from the cookie.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return decrypt(token);
}

/**
 * Delete the session cookie (logout).
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
