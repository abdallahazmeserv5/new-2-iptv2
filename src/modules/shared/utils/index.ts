import { Media } from '@/payload-types'

export function isMedia(obj: any): obj is Media {
  return obj && typeof obj === 'object' && 'url' in obj
}
