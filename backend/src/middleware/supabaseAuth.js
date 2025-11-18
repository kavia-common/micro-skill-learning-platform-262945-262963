'use strict';
/**
 * Middleware for verifying Supabase JWTs via JWKS and gracefully falling back to legacy local JWTs during migration.
 * - Verifies RS256 Supabase JWTs using JWKS from `${SUPABASE_URL}/auth/v1/keys`
 * - Caches keys with TTL and rotates on kid mismatch
 * - On success, attaches req.user = { id, email, authProvider: 'supabase' }
 * - If Supabase verify fails, attempts legacy verify using local JWT secret (migration window)
 *
 * PUBLIC_INTERFACE
 * supabaseOrLegacyAuth
 *   Express middleware that accepts either Supabase tokens or legacy local JWTs.
 */

const jwkToPem = require('jwk-to-pem'); // lightweight conversion
const jwt = require('jsonwebtoken');
const https = require('https');
const { getPrisma } = require('../db/prisma');

// Simple in-memory JWKS cache
const JWKS_CACHE = {
  keysByKid: new Map(),
  expiresAt: 0,
};

const JWKS_TTL_MS = 60 * 60 * 1000; // 1 hour

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      const { statusCode } = res;
      if (statusCode !== 200) {
        res.resume(); // drain
        reject(new Error(`Failed to fetch JWKS: ${statusCode}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function getSupabaseJwks() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    const err = new Error('SUPABASE_URL not configured');
    err.status = 500;
    err.code = 'CONFIG_ERROR';
    throw err;
  }
  const now = Date.now();
  if (JWKS_CACHE.expiresAt > now && JWKS_CACHE.keysByKid.size > 0) {
    return JWKS_CACHE;
  }
  const url = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/keys`;
  const body = await fetchJson(url);
  const keys = Array.isArray(body.keys) ? body.keys : [];
  const map = new Map();
  keys.forEach((jwk) => {
    if (jwk.kid) {
      map.set(jwk.kid, jwk);
    }
  });
  JWKS_CACHE.keysByKid = map;
  JWKS_CACHE.expiresAt = now + JWKS_TTL_MS;
  return JWKS_CACHE;
}

async function verifySupabaseJwt(token) {
  const decodedHeader = decodeJwtHeader(token);
  if (!decodedHeader || !decodedHeader.kid) {
    throw Object.assign(new Error('Missing kid in token header'), { status: 401 });
  }
  let jwks = await getSupabaseJwks();
  let jwk = jwks.keysByKid.get(decodedHeader.kid);
  if (!jwk) {
    // refresh once in case of rotation
    JWKS_CACHE.expiresAt = 0;
    jwks = await getSupabaseJwks();
    jwk = jwks.keysByKid.get(decodedHeader.kid);
    if (!jwk) {
      const err = new Error('Unable to find matching JWK');
      err.status = 401;
      throw err;
    }
  }
  const pem = jwkToPem(jwk);
  // Verify RS256 signature
  const payload = jwt.verify(token, pem, { algorithms: ['RS256'] });
  // Extract user info from Supabase claims
  const sub = payload.sub;
  const email = payload.email || payload.user_metadata?.email || payload['https://hasura.io/jwt/claims']?.['x-hasura-user-email'];
  if (!sub) {
    const err = new Error('Supabase token missing sub');
    err.status = 401;
    throw err;
  }
  return { sub, email, raw: payload };
}

function decodeJwtHeader(token) {
  try {
    const [head] = token.split('.');
    if (!head) return null;
    const json = Buffer.from(head, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Upsert a local user mapped to Supabase user id (sub).
 * For Supabase-managed users, do not store passwordHash; create or link by email when available.
 */
async function upsertSupabaseUser({ sub, email }) {
  const prisma = getPrisma();
  // Try find by a hypothetical supabaseUserId field if present in model; otherwise link by email
  // Our schema doesn't have supabaseUserId, so we link by email and ensure a record exists.
  let user = null;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
  }
  if (!user) {
    // Create a placeholder passwordHash for compatibility; never used for Supabase users
    const placeholder = 'supabase_managed';
    user = await prisma.user.upsert({
      where: { email: email || `${sub}@supabase.local` },
      update: {},
      create: {
        email: email || `${sub}@supabase.local`,
        passwordHash: placeholder,
        name: null,
      },
    });
  }
  return { id: user.id, email: user.email, name: user.name };
}

/**
 * PUBLIC_INTERFACE
 * supabaseOrLegacyAuth
 *   Middleware that validates Authorization bearer token as Supabase JWT first,
 *   if fails then falls back to legacy local JWT (migration).
 */
async function supabaseOrLegacyAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Authorization token required' } });
  }

  // Try Supabase first
  try {
    const sup = await verifySupabaseJwt(token);
    const localUser = await upsertSupabaseUser({ sub: sup.sub, email: sup.email });
    req.user = { id: localUser.id, email: localUser.email, authProvider: 'supabase', supabaseSub: sup.sub };
    return next();
  } catch (e) {
    // Fall back to legacy local JWT only if configured
  }

  // Legacy fallback
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('Legacy JWT not enabled');
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, email: payload.email, authProvider: 'legacy' };
    return next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
}

module.exports = {
  // PUBLIC_INTERFACE
  supabaseOrLegacyAuth,
};
