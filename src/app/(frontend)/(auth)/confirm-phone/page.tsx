import ConfirmPhoneForm from '@/modules/auth/components/confirm-phone-form'
import SigninForm from '@/modules/auth/components/signin-form'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import React from 'react'

export default function Signin() {
  return (
    <div className="bg-black py-10">
      <section className="container mx-auto px-4 flex gap-5 my-5">
        <ImageFallBack
          src="/auth/signin-bg.webp"
          alt="Signin"
          width={440}
          height={640}
          className="lg:w-[300px] 2xl:w-[450px] hidden lg:flex"
        />
        <ConfirmPhoneForm />
      </section>
    </div>
  )
}
