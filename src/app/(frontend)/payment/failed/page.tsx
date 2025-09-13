import Link from 'next/link'
import React from 'react'

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800">
      <h1 className="text-3xl font-bold mb-4">❌ Payment Failed</h1>
      <p className="mb-6">Oops! Something went wrong with your payment.</p>
      <Link href="/plans" className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
        Try Again
      </Link>
    </div>
  )
}
