'use client'
// this form for the admin so he can send the data for paid order
import { FC } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { baseFetch } from '@/actions/fetch'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  data: any // order document
}

// Define validation schema with Zod
const credentialsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const SendCredentialsForm = ({ orderId }: { orderId: string }) => {
  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof credentialsSchema>) => {
    try {
      const res = await baseFetch({
        url: `/api/orders/${orderId}/send-credentials`,
        method: 'POST',
        body: values,
      })

      if (res?.success) {
        alert('Credentials sent successfully!')
        form.reset()
      } else {
        alert(res?.message || 'Failed to send credentials')
      }
    } catch (err: any) {
      alert(err.message || 'Error sending credentials')
    }
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mt-4">
      <h3 className="font-bold mb-4">Send User Credentials</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Send Credentials</Button>
        </form>
      </Form>
    </div>
  )
}
