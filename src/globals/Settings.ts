import { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: {
    en: 'Settings',
    ar: 'الإعدادات',
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: {
        en: 'Logo',
        ar: 'الشعار',
      },
    },
    // social media
    {
      name: 'socialMedia',
      type: 'array',
      fields: [
        {
          name: 'socialMediaName',
          type: 'text',
          localized: true,
          label: {
            ar: 'اسم المنصة',
            en: 'Social Platform name',
          },
        },
        {
          name: 'socialMediaLink',
          type: 'text',
          label: {
            ar: 'لينك المنصة',
            en: 'Social media link',
          },
        },
        {
          name: 'socialMediaImage',
          type: 'upload',
          relationTo: 'media',
          label: {
            ar: 'شعار المنصة',
            en: 'Social media logo',
          },
        },
      ],
    },

    // message time
    {
      name: 'abandonAfterHours',
      type: 'number',
      required: true,
      defaultValue: 1,
      label: {
        en: 'Hours before cart is abandoned',
        ar: 'عدد الساعات قبل اعتبار السلة مهجورة',
      },
    },

    // WhatsApp configuration
    {
      name: 'whatsappNumber',
      type: 'text',
      defaultValue: '#',
      label: {
        en: 'WhatsApp Number',
        ar: 'رقم الواتساب',
      },
      admin: {
        description: {
          en: 'Enter WhatsApp number with country code (e.g., +966501234567)',
          ar: 'أدخل رقم الواتساب مع رمز الدولة (مثال: +966501234567)',
        },
      },
    },
    // WhatsApp configuration admin
    {
      name: 'adminWhatsApp',
      type: 'text',
      defaultValue: '',
      label: {
        en: 'WhatsApp Number Admin',
        ar: 'رقم الواتساب الأدمن',
      },
      admin: {
        description: {
          en: 'Enter WhatsApp Admin number with country code (e.g., +966501234567)',
          ar: 'أدخل رقم الواتساب الأدمن مع رمز الدولة (مثال: +966501234567)',
        },
      },
    },
  ],
}
