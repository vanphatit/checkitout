// src/lib/jwt.ts
export function decodeJwt(token?: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      decodeURIComponent(
        Array.prototype.map
          .call(
            atob(parts[1]),
            (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );
    return payload;
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