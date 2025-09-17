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
      name: 'abandonAfterMinutes',
      type: 'number',
      required: true,
      defaultValue: 60, // 1 hour
      label: {
        en: 'Minutes before cart is abandoned',
        ar: 'عدد الدقايق قبل اعتبار السلة مهجورة',
      },
    },
    {
      name: 'messageIntervalMinutes',
      type: 'number',
      required: true,
      defaultValue: 60, // send again every 1 hour
      label: {
        en: 'Minutes between sending messages',
        ar: 'عدد الدقايق بين إرسال الرسائل',
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
  ],
}
