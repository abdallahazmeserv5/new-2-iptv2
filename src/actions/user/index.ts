'use server'
import { headers as nextHeaders } from 'next/headers'
import { configuredPayload } from '..'

export async function getUser() {
  const [headers, payload] = await Promise.all([nextHeaders(), configuredPayload()])

  const fullUser = await payload.auth({ headers })
  return fullUser.user
}
