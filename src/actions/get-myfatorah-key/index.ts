'use server'
import { configuredPayload } from '..'

export async function getMyFatoorahKey() {
  const payload = await configuredPayload()
  const settings = await payload.findGlobal({ slug: 'private-data' })

  return settings?.myfatoorahApiKey
}
