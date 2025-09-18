import { isAdmin } from '@/modules/payload/utils'
import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    cookies: {
      sameSite: 'None',
      secure: true,
    },
  },
  labels: {
    singular: { en: 'User', ar: 'مستخدم' },
    plural: { en: 'Users', ar: 'المستخدمون' },
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: () => true,
    read: () => true,
    update: ({ req }) => !!req.user,
    delete: isAdmin,
    admin: ({ req }) => {
      const user = req.user
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'phone',
      label: { en: 'Phone Number', ar: 'رقم الهاتف' },
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: { en: 'Role', ar: 'الدور' },
      type: 'select',
      options: [
        { label: { en: 'Admin', ar: 'مشرف' }, value: 'admin' },
        { label: { en: 'User', ar: 'مستخدم' }, value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
    },
  ],
}
