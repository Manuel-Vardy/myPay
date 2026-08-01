/**
 * Triton API request signing helper (SPEC §10.2).
 * Requires Node.js 18+ (node:crypto Ed25519).
 */
import { createPrivateKey, sign } from 'node:crypto';

export const TRITON_AUTH_HEADERS = {
    keyId: 'x-triton-key-id',
    timestamp: 'x-triton-timestamp',
    nonce: 'x-triton-nonce',
    signature: 'x-triton-signature',
} as const;

export interface ApiSignatureParts {
    method: string;
    url: string;
    timestamp: string;
    nonce: string;
    body: string;
}

/** Canonical signed payload: METHOD URL TIMESTAMP NONCE BODY (single spaces). */
export function buildApiSignaturePayload(parts: ApiSignatureParts): string {
    return `${parts.method.toUpperCase()} ${parts.url} ${parts.timestamp} ${parts.nonce} ${parts.body}`;
}

export interface SignApiRequestInput {
    /** Credential UUID (`X-Triton-Key-Id`). */
    keyId: string;
    /** PKCS#8 DER Ed25519 private key, base64 (from credential creation). */
    privateKeyBase64: string;
    method: string;
    /** Path + query only, e.g. `/invoices` or `/invoices?skip=0` — no scheme/host. */
    url: string;
    /** Exact request body; empty string when absent. */
    body?: string;
    timestamp?: string;
    nonce?: string;
}

export interface SignedApiRequest {
    keyId: string;
    timestamp: string;
    nonce: string;
    signature: string;
    canonicalPayload: string;
    headers: Record<string, string>;
}

/** Sign a Triton API request and return auth headers. */
export function signApiRequest(input: SignApiRequestInput): SignedApiRequest {
    const timestamp = input.timestamp ?? new Date().toISOString();
    const nonce = input.nonce ?? `nonce-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const body = input.body ?? '';

    const canonicalPayload = buildApiSignaturePayload({
        method: input.method,
        url: input.url,
        timestamp,
        nonce,
        body,
    });

    const privateKey = createPrivateKey({
        key: Buffer.from(input.privateKeyBase64, 'base64'),
        format: 'der',
        type: 'pkcs8',
    });
    const signature = sign(null, Buffer.from(canonicalPayload, 'utf8'), privateKey).toString('base64');

    const headers: Record<string, string> = {
        [TRITON_AUTH_HEADERS.keyId]: input.keyId,
        [TRITON_AUTH_HEADERS.timestamp]: timestamp,
        [TRITON_AUTH_HEADERS.nonce]: nonce,
        [TRITON_AUTH_HEADERS.signature]: signature,
    };

    return { keyId: input.keyId, timestamp, nonce, signature, canonicalPayload, headers };
}

export interface TritonFetchOptions {
    baseUrl: string;
    keyId: string;
    privateKeyBase64: string;
    method: string;
    url: string;
    body?: string;
    headers?: Record<string, string>;
}

/** Sign and send an HTTP request to Triton. */
export async function tritonFetch(options: TritonFetchOptions): Promise<Response> {
    const body = options.body ?? '';
    const signed = signApiRequest({
        keyId: options.keyId,
        privateKeyBase64: options.privateKeyBase64,
        method: options.method,
        url: options.url,
        body,
    });

    const headers: Record<string, string> = {
        ...signed.headers,
        ...options.headers,
    };
    if (body) {
        headers['content-type'] ??= 'application/json';
    }

    return fetch(`${options.baseUrl.replace(/\/$/, '')}${options.url}`, {
        method: options.method.toUpperCase(),
        headers,
        body: body || undefined,
    });
}