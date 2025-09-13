interface ImageFallBackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  src: string
}

export default function ImageFallBack({ src, alt, fallbackSrc, ...rest }: ImageFallBackProps) {
  // Use fallback if src is missing
  let resolvedSrc = src || fallbackSrc || '/default.png'

  // Remove /api prefix for Payload images
  resolvedSrc = resolvedSrc.replace(/^\/api/, '')

  // Prepend absolute URL in production
  if (resolvedSrc.startsWith('/')) {
    resolvedSrc = `${process.env.NEXT_PUBLIC_APP_URL || ''}${resolvedSrc}`
  }

  return <img src={resolvedSrc} alt={alt || ''} {...rest} />
}
