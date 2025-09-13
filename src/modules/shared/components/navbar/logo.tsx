import { Media } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ImageFallBack from '../image-fall-back'

export default function Logo({ logo }: { logo: Media }) {
  return (
    <Link href={'/'}>
      <ImageFallBack alt={logo?.alt} src={logo?.url || ''} width={113} height={90} />
    </Link>
  )
}
