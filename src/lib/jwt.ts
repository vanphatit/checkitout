// src/lib/jwt.ts
export function decodeJwt(token?: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // JWT uses base64url; normalize before decoding.
    const normalizeBase64Url = (input: string) => {
      const padded = input.replace(/-/g, "+").replace(/_/g, "/");
      const paddingNeeded = 4 - (padded.length % 4);
      return paddingNeeded < 4 ? padded + "=".repeat(paddingNeeded) : padded;
    };

    const payloadString = atob(normalizeBase64Url(parts[1]));
    return JSON.parse(
      decodeURIComponent(
        Array.prototype.map
          .call(
            payloadString,
            (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );
  } catch {
    return null;
  }
}

export function getRoleFromToken(token?: string | null): string | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  // Normalize to uppercase string just in case backend returns lowercase
  return typeof payload.role === "string" ? payload.role.toUpperCase() : null;
}

export function isTokenExpired(token?: string | null): boolean {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  // exp is usually in seconds
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}
