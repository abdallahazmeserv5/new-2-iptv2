import { getTranslations } from 'next-intl/server'
import { toast } from 'sonner'

// base get
export interface BaseFetchOptions extends Omit<RequestInit, 'body'> {
  url: string
  body?: Record<string, any> | FormData | string | null
  externalApi?: boolean
  lang?: string
}

export async function baseFetch({
  url,
  method = 'GET',
  headers,
  body,
  externalApi,
  lang = 'ar',
  credentials = 'include',
  ...rest
}: BaseFetchOptions) {
  try {
    const response = await fetch(
      externalApi ? url : `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}${url}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang,
          ...headers,
        },
        cache: 'no-store',
        credentials,
        body: body ? JSON.stringify(body) : undefined,
        ...rest,
      },
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')

      throw new Error(`Fetch failed: ${response.status} ${response.statusText} → ${errorText}`)
    }
    const data = response.json()
    return data
  } catch (error: any) {
    try {
      const parsed = JSON.parse(error?.message?.split('→')[1].trim())
      toast.error(parsed.errors[0].message || parsed.errors[0].data.errors[0].message)
      return null
    } catch {
      return null
    }
  }
}
