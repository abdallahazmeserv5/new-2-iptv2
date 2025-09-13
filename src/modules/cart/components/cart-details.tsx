import { cookies } from 'next/headers'
import CartItems from './cart-items'
import CheckoutButton from './checkout-button'

export default async function CartDetails() {
  const cookieStore = await cookies()
  const payloadToken = cookieStore.get('payload-token')?.value

  // 2️⃣ Fetch the cart for the logged-in user
  const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/carts?limit=1`, {
    headers: {
      Cookie: `payload-token=${payloadToken}`, // send auth cookie
    },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Failed to fetch cart:', text)
    return []
  }
  // 3️⃣ Parse JSON safely
  const data = await res.json()
  const cartItems = data?.docs[0]?.items
  return (
    <section className="container mx-auto px-4 flex flex-col gap-5 items-center">
      <CartItems cartItems={cartItems} cartId={data.docs[0].id} />
      <CheckoutButton />
    </section>
  )
}
