// // src/collections/Users.ts
import type { CollectionConfig, PayloadHandler } from 'payload'

// export const Users: CollectionConfig = {
//   slug: 'users',
//   admin: {
//     useAsTitle: 'phone',
//   },
//   // Add access control to allow authentication
//   access: {
//     // Allow anyone to create users (for registration)
//     create: () => true,
//     // Allow users to read their own data, admins to read all
//     read: ({ req: { user } }) => {
//       if (user?.collection === 'admins') return true
//       if (user?.collection === 'users') return { id: { equals: user.id } }
//       return false
//     },
//     // Allow users to update their own data, admins to update all
//     update: ({ req: { user } }) => {
//       if (user?.collection === 'admins') return true
//       if (user?.collection === 'users') return { id: { equals: user.id } }
//       return false
//     },
//     // Only admins can delete users
//     delete: ({ req: { user } }) => user?.collection === 'admins',
//   },
//   hooks: {
//     beforeChange: [
//       async ({ data }) => {
//         console.log('before change')
//         if (data?.phone) {
//           // basic normalization: trim, remove spaces/dashes/parentheses
//           let normalized = String(data.phone)
//             .trim()
//             .replace(/[\s\-()]/g, '')
//           console.log({ normalized })
//           // ensure it starts with '+'; if not, assume already includes country code digits
//           if (!normalized.startsWith('+')) {
//             normalized = `+${normalized}`
//           }
//           data.phone = normalized
//         }
//         return data
//       },
//     ],
//   },
//   endpoints: [
//     {
//       path: '/send-otp',
//       method: 'post',
//       handler: (async (req: any) => {
//         try {
//           console.log('from send otp')
//           // Support both Express-style req.body and NextRequest with req.json()
//           let body: any

//           // NextRequest has req.json()
//           if (typeof req.json === 'function') {
//             body = await req.json()
//           } else if (req.body && typeof req.body.getReader === 'function') {
//             // It's a ReadableStream, manually parse
//             const text = await new Response(req.body).text()
//             try {
//               body = JSON.parse(text)
//             } catch {
//               body = text
//             }
//           } else {
//             body = req.body
//           }
//           let { phone } = (body || {}) as { phone?: string }
//           console.log('send-otp body:', body)
//           console.log({ phone })
//           if (!phone)
//             return new Response(JSON.stringify({ success: false, error: 'Phone required' }), {
//               status: 400,
//               headers: { 'Content-Type': 'application/json' },
//             })

//           // Normalize and validate phone (E.164-like)
//           phone = String(phone)
//             .trim()
//             .replace(/[\s\-()]/g, '')
//           if (!phone.startsWith('+')) phone = `+${phone}`
//           if (!/^\+[0-9]{8,15}$/.test(phone)) {
//             return new Response(JSON.stringify({ success: false, error: 'Invalid phone format' }), {
//               status: 400,
//               headers: { 'Content-Type': 'application/json' },
//             })
//           }

//           const { payload } = req

//           // Upsert user by phone
//           const existing = await payload.find({
//             collection: 'users',
//             where: { phone: { equals: phone } },
//             limit: 1,
//             overrideAccess: true,
//           })
//           const user = existing.docs[0]
//             ? existing.docs[0]
//             : await payload.create({ collection: 'users', data: { phone } })

//           // Cooldown: prevent resending OTP too frequently
//           const now = Date.now()
//           const resendAfterTs = user.otpResendAfter ? new Date(user.otpResendAfter).getTime() : 0
//           if (resendAfterTs && now < resendAfterTs) {
//             const msLeft = resendAfterTs - now
//             return new Response(
//               JSON.stringify({ success: false, error: 'Too Many Requests', msLeft }),
//               { status: 429, headers: { 'Content-Type': 'application/json' } },
//             )
//           }

//           // Generate OTP
//           const otp = String(Math.floor(100000 + Math.random() * 900000))
//           console.log({ otp })
//           const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
//           const resendAfter = new Date(Date.now() + 30 * 1000) // 30s cooldown

//           await payload.update({
//             collection: 'users',
//             id: user.id,
//             data: {
//               otp,
//               otpExpiresAt: expiresAt.toISOString(),
//               phoneVerified: false,
//               otpResendAfter: resendAfter.toISOString(),
//             },
//             overrideAccess: true,
//           })

//           // Send via NeedBots WhatsApp API (optional; uses same envs as your server action)
//           try {
//             const instance_id = process.env.NEXT_PUBLIC_INSTANCE_ID
//             const access_token =
//               process.env.NEXT_PUBLIC_ACCESS_TOKEN || process.env.Access_Token || ''
//             const endpoint = process.env.NEXT_PUBLIC_NEEDBOTS

//             if (endpoint && instance_id && access_token) {
//               const payloadBody = {
//                 number: Number(phone.replace(/^\+/, '')),
//                 type: 'text',
//                 message: otp,
//                 instance_id,
//                 access_token,
//               }
//               await fetch(endpoint, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payloadBody),
//               })
//             }
//           } catch (e) {
//             console.log('error', { e })
//           }
//           console.log('before sending')

//           return new Response(JSON.stringify({ success: true }), {
//             status: 200,
//             headers: { 'Content-Type': 'application/json' },
//           })
//         } catch (err: any) {
//           console.log('from catch', { err })
//           return new Response(
//             JSON.stringify({ success: false, error: err?.message || 'Bad Request' }),
//             { status: 400, headers: { 'Content-Type': 'application/json' } },
//           )
//         }
//       }) as PayloadHandler,
//     },
//   ],
//   auth: {
//     // Enable authentication for this collection
//     disableLocalStrategy: true,
//     strategies: [
//       {
//         name: 'phone-otp',
//         authenticate: async (params: any) => {
//           console.log('from authenticate')
//           const { headers, payload, body } = params

//           const getHeader = (key: string) => {
//             if (!headers) return undefined
//             if (typeof headers.get === 'function') return headers.get(key)
//             return (headers as any)[key] ?? (headers as any)[key.toLowerCase()]
//           }

//           // check headers first
//           let phone = getHeader('x-phone') || getHeader('phone')
//           let otp = getHeader('x-otp') || getHeader('otp')

//           // fallback to JSON body
//           if ((!phone || !otp) && body) {
//             phone = phone || body.phone
//             otp = otp || body.otp
//           }

//           // normalize & trim
//           if (phone) {
//             phone = String(phone)
//               .trim()
//               .replace(/[\s\-()]/g, '')
//             if (!String(phone).startsWith('+')) phone = `+${phone}`
//           }
//           if (otp) otp = String(otp).trim()
//           console.log('authenticate received:', { phone, otp })

//           // fallback to x-payload-body header
//           if (!phone || !otp) {
//             const bodyHeader = getHeader('x-payload-body')
//             if (bodyHeader) {
//               try {
//                 const parsed = typeof bodyHeader === 'string' ? JSON.parse(bodyHeader) : bodyHeader
//                 phone = phone || parsed?.phone
//                 otp = otp || parsed?.otp
//               } catch {}
//             }
//           }

//           if (!phone || !otp) {
//             return { user: null }
//           }

//           // now do the same user lookup & OTP validation as you already have
//           const usersQuery = await payload.find({
//             collection: 'users',
//             where: { phone: { equals: phone } },
//             limit: 1,
//             overrideAccess: true,
//           })

//           const userDoc = usersQuery?.docs?.[0]
//           if (!userDoc) return { user: null }

//           const now = Date.now()
//           const otpExpiresAt = userDoc.otpExpiresAt
//             ? new Date(userDoc.otpExpiresAt).getTime()
//             : null

//           if (!userDoc.otp || !otpExpiresAt || now > otpExpiresAt) {
//             return { user: null }
//           }

//           if (String(otp) !== String(userDoc.otp)) {
//             return { user: null }
//           }

//           await payload.update({
//             collection: 'users',
//             id: userDoc.id,
//             data: {
//               otp: null,
//               otpExpiresAt: null,
//               phoneVerified: true,
//             },
//             overrideAccess: true,
//           })

//           const fresh = await payload.findByID({
//             collection: 'users',
//             id: userDoc.id,
//             overrideAccess: true,
//           })

//           return {
//             user: fresh ? { collection: 'users', ...fresh } : null,
//           }
//         },
//       },
//     ],
//   },

//   fields: [
//     {
//       name: 'phone',
//       type: 'text',
//       unique: true,
//       required: true,
//       admin: { description: 'E.164 format, e.g. +201234567890' },
//     },
//     {
//       name: 'phoneVerified',
//       type: 'checkbox',
//       defaultValue: false,
//     },
//     {
//       name: 'otp',
//       type: 'text',
//       admin: { hidden: true },
//       access: {
//         read: () => false,
//         update: () => false,
//       },
//     },
//     {
//       name: 'otpExpiresAt',
//       type: 'date',
//       admin: { hidden: true },
//       access: {
//         read: () => false,
//         update: () => false,
//       },
//     },
//     {
//       name: 'otpResendAfter',
//       type: 'date',
//       admin: { hidden: true },
//       access: {
//         read: () => false,
//         update: () => false,
//       },
//     },
//   ],
// }

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: () => true, // allow public signups
    read: () => true, // optional, if you want users readable
    update: ({ req }) => !!req.user, // only logged in users can update themselves
    delete: () => false, // usually block delete
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true, // local strategy enabled by default (email/password)
  // access: {
  //   // Optional: only admins can see other admins
  //   read: ({ req: { user } }) => Boolean(user),
  // },
  fields: [
    // add any admin-specific fields here
  ],
}
