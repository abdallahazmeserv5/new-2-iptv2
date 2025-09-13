import Image from 'next/image'

interface ImageFallBackProps {
  src?: string
  alt?: string
  fallbackSrc?: string
  [key: string]: any
}

export default function ImageFallBack({
  src = '',
  alt = '',
  fallbackSrc,
  ...rest
}: ImageFallBackProps) {
  // Ensure the src is an absolute URL in production
  const resolvedSrc = src.startsWith('http')
    ? src
    : `${process.env.NEXT_PUBLIC_APP_URL || ''}${src}`

  return (
    <Image
      src={resolvedSrc || fallbackSrc || '/default.png'}
      alt={alt}
      unoptimized // disables Next.js optimization to avoid fetch errors
      {...rest}
    />
  )
}
