import type { Media, Page, Setting, User } from '@/payload-types'
import ActionButtons from './action-buttons'
import Logo from './logo'
import Navigation from './navigation'
import MobileMenu from './mobile-menu'
import { PaginatedDocs } from 'payload'

interface Props {
  settings: Setting
  user:
    | (User & {
        collection: 'users'
      })
    | null
  pages: PaginatedDocs<Page>
}

export default function Navbar({ settings, user, pages }: Props) {
  return (
    <div className="bg-background py-5">
      <header className="container mx-auto px-4 flex items-center justify-between">
        <Logo logo={settings.logo as Media} />
        {/* lg screen and above */}
        <div className="hidden lg:block">
          <Navigation pages={pages} />
        </div>
        <ActionButtons user={user} />
        {/* mobile screen */}
        <MobileMenu user={user} />
      </header>
    </div>
  )
}
