// lib/nonceStore.ts

// Shared nonce store used by both auth.ts and nonce/route.ts
export const nonceStore = new Map<string, { 
  nonce: string; 
  expires: number 
}>();

export function storeNonce(nonce: string): void {
  // Store by nonce value itself as key
  nonceStore.set(nonce, {
    nonce,
    expires: Date.now() + 5 * 60 * 1000, // 5 min
  });
}

export function verifyAndConsumeNonce(nonce: string): boolean {
  const stored = nonceStore.get(nonce);

  if (!stored) return false;
  if (Date.now() > stored.expires) {
    nonceStore.delete(nonce);
    return false;
  }

  nonceStore.delete(nonce); // consume it
  return true;
}