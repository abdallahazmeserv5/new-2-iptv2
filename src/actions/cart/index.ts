import { toast } from 'sonner'

export async function addToCart(planId: string) {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ planId, quantity: 1 }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data?.error || 'Could not add to cart')
      return
    }

    toast.success('Success')
  } catch (err) {
    console.error(err)
    toast.error('Something went wrong')
  }
}
