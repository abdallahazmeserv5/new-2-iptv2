import { cookies } from 'next/headers'
import CartItems from './cart-items'
import CheckoutButton from './checkout-button'
import SigninForm from '@/modules/auth/components/signin-form'

export default async function CartDetails() {
  const cookieStore = await cookies()
  const payloadToken = cookieStore.get('payload-token')?.value

  let cartItems = []
  let cartId = null
  let user = null

  // Check if user is authenticated by fetching /me endpoint
  if (payloadToken) {
    try {
      // First, check if user is authenticated
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/users/me`, {
        headers: {
          Cookie: `payload-token=${payloadToken}`,
        },
      })

      if (userRes.ok) {
        const userData = await userRes.json()
        user = userData.user

        // If user is authenticated, fetch their cart
        if (user) {
          const cartRes = await fetch(
            `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/carts?limit=1`,
            {
              headers: {
                Cookie: `payload-token=${payloadToken}`,
              },
            },
          )

          if (cartRes.ok) {
            const cartData = await cartRes.json()
            cartItems = cartData?.docs[0]?.items || []
            cartId = cartData?.docs[0]?.id
          }
        }
      }
    } catch (error) {
      console.error('Error checking authentication or fetching cart:', error)
      // User is not authenticated or there was an error, will fall back to localStorage
    }
  }
  return (
    <section className="container mx-auto px-4 flex flex-col gap-5 items-center">
      <CartItems cartItems={cartItems} cartId={cartId} user={user} />
      {user ? <CheckoutButton user={user} /> : <SigninForm isCart />}
    </section>
  )
}
