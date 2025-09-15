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

interface ReviewResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export function ReviewDialog() {
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
  const mutation = useMutation<ReviewResponse, Error, FormData>({
    mutationFn: async (values: FormData) => {
      if (!planId) {
        throw new Error('Plan ID is required')
      }
      if (!user?.id) {
        throw new Error('User authentication required')
      }

      const transformedData = transformFormData(values)
      const payload: ApiPayload = {
        ...transformedData,
        plan: planId,
        user: user.id,
        createdAt: new Date().toISOString(),
      }

      const response = await baseFetch({
        url: '/api/reviews',
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to submit review`)
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success(t('reviewSubmitted') || 'Review submitted successfully!')
      form.reset({
        reviewer: user?.name || '',
        reviewerCountry: '',
        review: '',
        rate: '5',
      })
      setOpen(false)

      // Invalidate and refetch reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews', planId],
      })
    },
    onError: (error: Error) => {
      console.error('Review submit error:', error)
      const errorMessage = error.message || t('reviewFailed') || 'Failed to submit review'
      toast.error(errorMessage)
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
                  <FormLabel>{t('name') || 'Name'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('enterName') || 'Enter your name'}
                      {...field}
                      disabled={mutation.isPending}
                    />
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
                  <FormLabel>{t('country') || 'Country'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('enterCountry') || 'Enter your country'}
                      {...field}
                      disabled={mutation.isPending}
                    />
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
                  <FormLabel>{t('review') || 'Review'}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('enterReview') || 'Share your experience...'}
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
                  <FormLabel>{t('rating') || 'Rating (1-5)'}</FormLabel>
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
              {mutation.isPending
                ? t('submitting') || 'Submitting...'
                : t('submit') || 'Submit Review'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
