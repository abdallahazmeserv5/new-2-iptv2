import { cn } from '@/lib/utils'
import React from 'react'

interface Props {
  sectionHeader: string
  className?: string
}

export default function SectionHeader({ sectionHeader, className }: Props) {
  const [firstWord, rest] = sectionHeader.split(' ', 2)
  return (
    <h2
      className={cn(
        'text-white flex flex-col gap-5 text-center my-5 lg:my-10 font-bold text-4xl',
        className,
      )}
    >
      <div className="flex gap-1 w-fit mx-auto">
        <span>{firstWord}</span> <span className="text-primary">{rest}</span>
      </div>
      <div className="flex gap-1 w-fit mx-auto">
        <div className="h-[6px] w-[95px] bg-primary" />
        <div className="h-[6px] w-[29px] bg-primary" />
        <div className="h-[6px] w-[29px] bg-primary" />
      </div>
    </h2>
  )
}
