// getRandomValues also works on HTTP LAN origins, where randomUUID is unavailable.
export function requestId() { return Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join(''); }
