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
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Media } from './collections/Media'
import { Settings } from './globals/Settings'
import { PrivateData } from './globals/PrivateData'
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
import { PaymentMethods } from './collections/PaymentMethods'
import { Features } from './collections/Features'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
export default buildConfig({
  admin: {
    user: Users.slug,

    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: 'src/modules/payload/components/logo#Logo',
        Icon: 'src/modules/payload/components/logo#Logo',
      },
      beforeDashboard: [
        'src/modules/payload/components/notification-icon#NotificationIcon',
        'src/modules/payload/components/cart-icon#CartIcon',
      ],
    },
  },

  cors: [
    process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL,
    'http://localhost:3000',
    'https://new-2-iptv2.vercel.app',
    'https://tornado-tv4k.com',
    'https://www.tornado-tv4k.com',
    process.env.VERCEL_URL,
  ],
  csrf: [
    process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL,
    'http://localhost:3000',
    'https://new-2-iptv2.vercel.app',
    'https://tornado-tv4k.com',
    'https://www.tornado-tv4k.com',
    process.env.VERCEL_URL,
  ],
  globals: [Settings, PrivateData],

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
    PaymentMethods,
    Features,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  i18n: {
    fallbackLanguage: 'ar',
    supportedLanguages: { en, ar },
    translations: {
      en,
      ar: {
        general: {
          save: 'حفظ',
          cancel: 'إلغاء',
          delete: 'حذف',
          confirm: 'تأكيد',
          continue: 'متابعة',
          back: 'رجوع',
          yes: 'نعم',
          no: 'لا',
          loading: 'جارٍ التحميل...',
          error: 'حدث خطأ ما',
        },
        validation: {
          required: 'هذا الحقل مطلوب.',
          invalid: 'القيمة غير صحيحة.',
          email: 'البريد الإلكتروني غير صالح.',
          emailTaken: 'هذا البريد الإلكتروني مسجل بالفعل.',
          minLength: 'عدد الحروف أقل من المسموح.',
          maxLength: 'عدد الحروف أكبر من المسموح.',
          number: 'يجب إدخال رقم صحيح.',
          match: 'القيمتان غير متطابقتين.',
          in: 'القيمة غير مسموح بها.',
          notUnique: 'القيمة موجودة بالفعل.',
        },
        auth: {
          login: 'تسجيل الدخول',
          logout: 'تسجيل الخروج',
          loginFailed: 'فشل تسجيل الدخول. تحقق من البيانات.',
          loggedIn: 'تم تسجيل الدخول بنجاح.',
          loggedOut: 'تم تسجيل الخروج.',
          invalidCredentials: 'بيانات الدخول غير صحيحة.',
          emailNotVerified: 'يرجى تفعيل البريد الإلكتروني قبل المتابعة.',
          accountLocked: 'تم إغلاق الحساب مؤقتًا.',
          tokenInvalid: 'رمز التحقق غير صالح.',
          tokenExpired: 'انتهت صلاحية رمز التحقق.',
          passwordReset: 'تم إعادة تعيين كلمة المرور بنجاح.',
          passwordResetFailed: 'فشل في إعادة تعيين كلمة المرور.',
        },
        upload: {
          uploading: 'جارٍ رفع الملف...',
          maxFileSize: 'حجم الملف أكبر من المسموح.',
          mimeTypeNotAllowed: 'نوع الملف غير مسموح.',
          fileRequired: 'الرجاء اختيار ملف للرفع.',
        },
        fields: {
          email: 'البريد الإلكتروني',
          password: 'كلمة المرور',
          confirmPassword: 'تأكيد كلمة المرور',
          name: 'الاسم',
          title: 'العنوان',
          description: 'الوصف',
          createdAt: 'تاريخ الإنشاء',
          updatedAt: 'تاريخ التحديث',
        },
        errors: {
          default: 'حدث خطأ غير متوقع.',
          notFound: 'العنصر غير موجود.',
          forbidden: 'غير مسموح بالوصول.',
          serverError: 'خطأ في الخادم.',
          badRequest: 'طلب غير صالح.',
          validation: 'يوجد خطأ في البيانات المدخلة.',
        },
      },
    },
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
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: {
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
