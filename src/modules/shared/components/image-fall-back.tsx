import Image, { ImageProps } from 'next/image'

interface ImageFallBackProps extends ImageProps {
  fallbackSrc?: string
  src: string
}

export default function ImageFallBack({
  src = '',
  alt = '',
  fallbackSrc,
  ...rest
}: ImageFallBackProps) {
  return <img src={src || fallbackSrc || '/default.png'} unoptimized={true} alt={alt} {...rest} />
}
