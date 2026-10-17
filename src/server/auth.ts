import crypto from 'crypto';

const TOKEN_SECRET = process.env.SESSION_SECRET || 'dromos-run-sec-token-vault-2026-key-athletic';
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Hash password with PBKDF2 and random 16-byte salt (100,000 iterations, SHA-512)
 * Prevents rainbow table attacks, dictionary attacks, and timing exploits.
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a plain text password against stored hash and salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    const computedBuffer = Buffer.from(computedHash, 'hex');
    if (hashBuffer.length !== computedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuffer, computedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically signed auth token
 * Format: base64(payload).base64(signature)
 */
export function createAuthToken(userId: string, email: string): string {
  const payload = JSON.stringify({
    uid: userId,
    em: email,
    exp: Date.now() + TOKEN_EXPIRY_MS,
    rnd: crypto.randomBytes(8).toString('hex'),
  });

  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verify and decode an auth token
 */
export function verifyAuthToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, providedSignature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    const expectedBuf = Buffer.from(expectedSignature);
    const providedBuf = Buffer.from(providedSignature);

    if (expectedBuf.length !== providedBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) return null;

    const decodedStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const data = JSON.parse(decodedStr);

    if (typeof data.exp !== 'number' || Date.now() > data.exp) {
      return null; // Expired
    }

    if (!data.uid || typeof data.uid !== 'string') {
      return null;
    }

    return { userId: data.uid, email: data.em };
  } catch {
    return null;
  }
}
