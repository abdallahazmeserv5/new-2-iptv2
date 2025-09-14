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
  let finalSrc = src
  if (src.startsWith('/api/media/file/')) {
    const filename = src.replace('/api/media/file/', '')
    finalSrc = `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/media/${filename}`
  }

  return <Image src={finalSrc} alt={alt || ''} width={width} height={height} {...rest} />
}
