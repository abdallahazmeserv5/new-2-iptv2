import { isAdmin } from '@/modules/payload/utils'
import { CollectionConfig } from 'payload'

export const Testimonial: CollectionConfig = {
  slug: 'testimonial',
  labels: {
    singular: { en: 'Testimonial', ar: 'رأي العميل' },
    plural: { en: 'Testimonials', ar: 'آراء العملاء' },
  },
  access: {
    create: isAdmin, // only admin can create
    read: () => true, // everyone can read/query
    update: isAdmin, // only admin can update
    delete: isAdmin, // only admin can delete
  },
  admin: {
    useAsTitle: 'reviewer', // show reviewer name in dashboard
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
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
      name: 'reviewerJob',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Reviewer Job',
        ar: 'وظيفة المراجع',
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
  ],
}
