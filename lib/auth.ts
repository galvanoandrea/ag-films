import { cookies } from 'next/headers'

export const COOKIE_NAME = 'admin_token'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function isValidAdminToken(value: string | undefined): boolean {
  const validToken = process.env.ADMIN_TOKEN
  return Boolean(value && validToken && value === validToken)
}

export async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  return isValidAdminToken(token)
}
