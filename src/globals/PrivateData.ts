import { GlobalConfig } from 'payload'

export const PrivateData: GlobalConfig = {
  slug: 'private-data',
  label: {
    en: 'Private Data',
    ar: 'البيانات الخاصة',
  },
  access: {
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'myfatoorahApiKey',
      type: 'text',
      defaultValue: '',
      label: {
        en: 'MyFatoorah API Key',
        ar: 'مفتاح MyFatoorah',
      },
      admin: {
        description: {
          en: 'Enter your MyFatoorah API key',
          ar: 'أدخل مفتاح MyFatoorah',
        },
      },
    },
  ],
}
