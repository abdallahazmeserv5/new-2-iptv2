import buildConfig from '@/payload.config'
import { getPayload } from 'payload'

export async function configuredPayload() {
  return getPayload({ config: buildConfig })
}
