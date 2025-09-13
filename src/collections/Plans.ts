import { CollectionConfig } from 'payload'

export const Plans: CollectionConfig = {
  slug: 'plans',
  labels: {
    singular: { en: 'Plan', ar: 'خطة' },
    plural: { en: 'Plans', ar: 'الخطط' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Plan Title',
        ar: 'اسم الخطة',
      },
    },

    // Prices
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          label: {
            en: 'Plan Price',
            ar: 'سعر الخطة',
          },
        },
        {
          name: 'priceBeforeDiscount',
          type: 'number',
          min: 0,
          label: {
            en: 'Plan Price Before Discount',
            ar: 'سعر الخطة قبل الخصم',
          },
        },
      ],
    },

    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: {
        en: 'Plan Image',
        ar: 'صورة الخطة',
      },
    },

    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Plan Description',
        ar: 'وصف الخطة',
      },
    },

    {
      name: 'numberOfSubscriptions',
      type: 'number',
      required: true,
      min: 1,
      label: {
        en: 'Number of Subscriptions',
        ar: 'عدد الإشتراكات',
      },
    },

    // Features
    {
      name: 'features',
      type: 'array',
      required: true,
      label: {
        en: 'Features',
        ar: 'المميزات',
      },
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
          localized: true,
          label: {
            en: 'Feature',
            ar: 'الميزة',
          },
        },
      ],
    },

    // Reviews
    {
      name: 'reviews',
      type: 'array',
      label: {
        en: 'Reviews',
        ar: 'المراجعات',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: {
            en: 'User Image',
            ar: 'صورة المستخدم',
          },
        },
        {
          name: 'reviewer',
          type: 'text',
          required: true,
          localized: true,
          label: {
            en: 'Reviewer Name',
            ar: 'اسم المراجع',
          },
        },
        {
          name: 'reviewerCountry',
          type: 'text',
          required: true,
          localized: true,
          label: {
            en: 'Reviewer Country',
            ar: 'بلد المراجع',
          },
        },
        {
          name: 'review',
          type: 'textarea',
          required: true,
          localized: true,
          label: {
            en: 'Review',
            ar: 'المراجعة',
          },
        },
        {
          name: 'rate',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          label: {
            en: 'Review Rate',
            ar: 'التقييم',
          },
        },
        {
          name: 'hasReviewed',
          type: 'checkbox',
          label: {
            en: 'Has been reviewed?',
            ar: 'هل تمت مراجعتها؟',
          },
        },
      ],
    },

    // Platforms
    {
      name: 'downloadPlatforms',
      type: 'array',
      required: true,
      label: {
        en: 'Download Platforms',
        ar: 'منصات التحميل',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: {
            en: 'Platform Name',
            ar: 'اسم المنصة',
          },
        },
        {
          name: 'platformImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: {
            en: 'Platform Image',
            ar: 'صورة المنصة',
          },
        },
      ],
    },
  ],
}
