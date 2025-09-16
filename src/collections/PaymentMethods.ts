import { CollectionConfig } from 'payload'
import { isAdmin } from '@/modules/payload/utils'

export const PaymentMethods: CollectionConfig = {
  slug: 'payment-methods',
  labels: {
    singular: { en: 'Payment Method', ar: 'طريقة دفع' },
    plural: { en: 'Payment Methods', ar: 'طرق الدفع' },
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'PaymentMethodEn',
  },
  fields: [
    {
      name: 'PaymentMethodId',
      type: 'number',
      required: true,
      unique: true,
      label: { en: 'Payment Method ID', ar: 'معرف طريقة الدفع' },
    },
    {
      name: 'PaymentMethodAr',
      type: 'text',
      required: true,
      label: { en: 'Arabic Name', ar: 'الاسم بالعربية' },
      localized: true,
    },
    {
      name: 'PaymentMethodEn',
      type: 'text',
      required: true,
      label: { en: 'English Name', ar: 'الاسم بالإنجليزية' },
      localized: true,
    },
    {
      name: 'PaymentMethodCode',
      type: 'text',
      required: true,
      label: { en: 'Code', ar: 'الكود' },
    },

    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      label: { en: 'Payment Image', ar: 'صورة الشعار' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'IsDirectPayment',
          type: 'checkbox',
          required: true,
          label: { en: 'Is Direct Payment', ar: 'دفع مباشر؟' },
          admin: {
            width: '33%',
          },
        },
        {
          name: 'active',
          type: 'checkbox',
          required: true,
          label: { en: 'Enable ', ar: 'مفعله' },
          defaultValue: 'true',
          admin: {
            width: '33%',
          },
        },
      ],
    },
  ],
}

export default PaymentMethods
