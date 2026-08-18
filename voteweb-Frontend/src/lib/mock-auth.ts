/**
 * Cookie helpers for clearing legacy auth cookies on sign-out.
 * Real authentication is handled by the backend session cookie via
 * api-client / auth-context; this only cleans up leftover mock-auth cookies
 * from earlier versions of the app.
 */
export function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "campusvote_auth=; path=/; max-age=0";
  }
}
