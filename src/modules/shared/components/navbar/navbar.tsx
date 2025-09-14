import type { Media, Setting, User } from '@/payload-types'
import ActionButtons from './action-buttons'
import Logo from './logo'
import Navigation from './navigation'
import MobileMenu from './mobile-menu'

interface Props {
  settings: Setting
  user:
    | (User & {
        collection: 'users'
      })
    | null
}

export default function Navbar({ settings, user }: Props) {
  return (
    <div className="bg-background ">
      <header className="container mx-auto px-4 flex items-center justify-between">
        <Logo logo={settings.logo as Media} />
        {/* lg screen and above */}
        <div className="hidden lg:block">
          <Navigation />
        </div>
        <ActionButtons user={user} />
        {/* mobile screen */}
        <MobileMenu user={user} />
      </header>
    </div>
  )
}
