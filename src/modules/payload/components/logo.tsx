import Image from 'next/image'
import React from 'react'

export function Logo() {
  return (
    <Image
      src={'/tornado.svg'}
      alt="tornado-4ktv"
      width={113}
      height={49}
      className="w-[113px] h-[49px]"
    ></Image>
  )
}
