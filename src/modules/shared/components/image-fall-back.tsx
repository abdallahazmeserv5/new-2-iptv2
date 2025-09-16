import Image from 'next/image'

interface ImageFallBackProps {
  src: string
  alt?: string
  fallbackSrc?: string
  width?: number | `${number}`
  height?: number | `${number}`
  [key: string]: any
}

export default function ImageFallBack({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  ...rest
}: ImageFallBackProps) {
  return <Image src={src} alt={alt || ''} width={width} height={height} {...rest} />
}
