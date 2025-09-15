'use client'

import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import PrimaryButton from '@/modules/shared/components/primary-button'
import { Plus } from 'lucide-react'
import { baseFetch } from '@/actions/fetch'
import { useUser } from '@/modules/shared/hooks/use-user'
import { Plan } from '@/payload-types'

// ✅ Form schema - all strings for form inputs
const formSchema = z.object({
  reviewer: z.string().min(1, 'Name is required'),
  reviewerCountry: z.string().min(1, 'Country is required'),
  review: z.string().min(10, 'Review must be at least 10 characters long'),
  rate: z.string().refine((val) => {
    const num = parseInt(val, 10)
    return !isNaN(num) && num >= 1 && num <= 5
  }, 'Rating must be between 1 and 5'),
})

// ✅ API payload schema - proper types for backend
const apiSchema = z.object({
  reviewer: z.string(),
  reviewerCountry: z.string(),
  review: z.string(),
  rate: z.number(),
  plan: z.string(),
  user: z.string(),
  createdAt: z.string(),
})

type FormData = z.infer<typeof formSchema>
type ApiPayload = z.infer<typeof apiSchema>

interface Props {
  planDetails: Plan
}

export function ReviewDialog({ planDetails }: Props) {
  const t = useTranslations()
  const params = useParams()
  const planId = params?.planId as string
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewer: user?.name || '',
      reviewerCountry: '',
      review: '',
      rate: '5',
    },
    mode: 'onChange',
  })

  // ✅ Transform form data to API payload
  const transformFormData = (
    formData: FormData,
  ): Omit<ApiPayload, 'plan' | 'user' | 'createdAt'> => ({
    reviewer: formData.reviewer.trim(),
    reviewerCountry: formData.reviewerCountry.trim(),
    review: formData.review.trim(),
    rate: parseInt(formData.rate, 10),
  })

  // ✅ React Query mutation with proper error handling
  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (!planId) throw new Error('Plan ID is required')
      if (!user?.id) throw new Error('User authentication required')

      const newReview = {
        ...transformFormData(values),
        hasReviewed: false,
        user: user.id,
      }

      // ✅ baseFetch returns parsed JSON or null
      const data = await baseFetch({
        url: `/api/plans/${planId}`,
        method: 'PATCH',
        body: {
          reviews: [
            ...(planDetails?.reviews || []), // existing reviews
            newReview, // new one
          ],
        },
      })

      console.log({ data })

      if (!data) throw new Error('Failed to submit review')
      return data
    },
    onSuccess: () => {
      toast.success(t('reviewSubmitted'))
      form.reset({
        reviewer: user?.name || '',
        reviewerCountry: '',
        review: '',
        rate: '5',
      })
      setOpen(false)
    },
    onError: (error: Error) => {
      console.error('Review submit error:', error)
      toast.error(error.message || t('reviewFailed'))
    },
  })

  const onSubmit = (values: FormData) => {
    if (!planId) {
      toast.error('Plan ID is missing')
      return
    }
    if (!user?.id) {
      toast.error('Please log in to submit a review')
      return
    }
    mutation.mutate(values)
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <PrimaryButton className="flex gap-2 items-center justify-center">
          <Plus size={16} />
          {t('leaveReview') || 'Leave Review'}
        </PrimaryButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg text-white">
        <DialogHeader>
          <DialogTitle className="font-bold text-center">
            {t('leaveReview') || 'Leave Review'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="reviewer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('name')} {...field} disabled={mutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={form.control}
              name="reviewerCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('country')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('country')} {...field} disabled={mutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Review */}
            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('review')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('review')}
                      {...field}
                      disabled={mutation.isPending}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rate */}
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rating')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      {...field}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending || !form.formState.isValid}
            >
              {mutation.isPending ? t('submitting') : t('submit')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
