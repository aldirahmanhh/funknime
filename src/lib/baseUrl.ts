import { headers } from "next/headers";

/**
 * Build an absolute base URL for server-side fetches.
 *
 * Priority:
 * 1) NEXTAUTH_URL (recommended in Vercel)
 * 2) VERCEL_URL
 * 3) request headers (host)
 * 4) localhost
 */
export async function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}
