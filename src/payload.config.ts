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

import { Users } from './collections/Users'
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
// import { Admins } from './collections/Admins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // Allow browser requests from your Next.js app (dev)
  // cors: [process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000'],
  // csrf: [process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000'],
  globals: [Settings],
  collections: [Users, Media, HeroSlides, Packages, Plans, Testimonial, Banners, Faq, Cart, Orders],
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

  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
