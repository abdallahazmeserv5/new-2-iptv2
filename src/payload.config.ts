// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { en } from '@payloadcms/translations/languages/en'
import { ar } from '@payloadcms/translations/languages/ar'

import { Media } from './collections/Media'
import { Settings } from './globals/Settings'
import { HeroSlides } from './collections/HeroSlides'
import { Packages } from './collections/Packages'
import { Plans } from './collections/Plans'
import { Testimonial } from './collections/Testimonial'
import { Banners } from './collections/Banners'
import { Faq } from './collections/Faq'
import { Cart } from './collections/Cart'
import { Orders } from './collections/Order'
import { Users } from './collections/Users'
import { Pages } from './collections/Pages'
// import { Admins } from './collections/Admins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: [
        'src/modules/payload/components/notification-icon#NotificationIcon',
        'src/modules/payload/components/cart-icon#CartIcon',
      ],
    },
  },
  // Allow browser requests from your Next.js app (dev)
  cors: '*',
  csrf: [
    process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL ||
      'http://localhost:3000' ||
      'https://new-2-iptv2.vercel.app',
    'https://tornado-tv4k.com',
    process.env.VERCEL_URL,
    '*',
  ],
  globals: [Settings],

  collections: [
    Users,
    Media,
    HeroSlides,
    Packages,
    Plans,
    Testimonial,
    Banners,
    Faq,
    Cart,
    Orders,
    Pages,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  i18n: {
    fallbackLanguage: 'ar',
    supportedLanguages: { en, ar },
  },

  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Arabic',
        code: 'ar',
        rtl: true,
      },
    ],
    defaultLocale: 'ar',
    fallback: true,
  },

  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,

  plugins: [payloadCloudPlugin()],
})
