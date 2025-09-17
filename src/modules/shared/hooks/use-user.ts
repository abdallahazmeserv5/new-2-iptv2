import { baseFetch } from '@/actions/fetch'
import { useQuery } from '@tanstack/react-query'

export const useUser = () => {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['/me'],
    queryFn: async () => {
      const res = await baseFetch({ url: '/api/users/me' })
      return res?.user ?? null
    },
  })
  const user = data

  return { isLoading, user }
}
