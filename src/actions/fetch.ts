// base get
export interface BaseFetchOptions extends Omit<RequestInit, 'body'> {
  url: string
  body?: Record<string, any> | FormData | string | null
  externalApi?: boolean
}

export async function baseFetch({
  url,
  method = 'GET',
  headers,
  body,
  externalApi,
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
          ...headers,
        },
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
    console.error('baseFetch error:', error.message || error)
    return null
  }
}
