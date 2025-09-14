interface ImageFallBackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  src: string
}

export default function ImageFallBack({ src, alt, fallbackSrc, ...rest }: ImageFallBackProps) {
  return <img src={src} alt={alt || ''} {...rest} />
}
