'use server'
import { baseFetch } from '../fetch'

export async function sendMessage({
  number,
  message,
  retries = 3,
}: {
  number: string
  message: string
  retries?: number
}) {
  try {
    const cleanNumber = number.startsWith('+') ? number.slice(1) : number
    for (let attempt = 0; attempt <= retries; attempt++) {
      const res = await baseFetch({
        url: process.env.NEXT_PUBLIC_NEED_BOT,
        externalApi: true,
        method: 'POST',
        body: {
          number: cleanNumber,
          type: 'text',
          message,
          instance_id: process.env.INSTANCE_ID,
          access_token: process.env.ACESS_TOKEN,
        },
      })

      if (res) {
        return res
      }

      console.log({ res })

      // wait 200ms before retrying
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    return null
  } catch (error) {
    return null
  }
}
