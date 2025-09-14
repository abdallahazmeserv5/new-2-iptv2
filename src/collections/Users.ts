import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: () => true,
    read: () => true,
    update: ({ req }) => !!req.user,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
    },
  ],
}
