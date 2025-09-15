import { User } from '@/payload-types'
import { Bell } from 'lucide-react'
import AuthButton from './auth-button'
import Cart from './cart'

export default function ActionButtons() {
  return (
    <div className="flex items-center gap-2 lg:gap-8">
      <Cart />
      <Bell className="text-white" />
      <AuthButton />
    </div>
  )
}
