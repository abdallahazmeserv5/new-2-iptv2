'use server'

import { baseFetch } from '../fetch'

export async function sendMessage({ number, message }: { number: string; message: string }) {
  try {
    const x = await baseFetch({
      url: process.env.NEXT_PUBLIC_NEED_BOT,
      externalApi: true,
      method: 'POST',
      body: {
        number,
        type: 'text',
        message,
        instance_id: process.env.INSTANCE_ID,
        access_token: process.env.ACESS_TOKEN,
      },
    })

    return x
  } catch (error) {
    console.error(JSON.stringify(error, null, 2))
  }
}
