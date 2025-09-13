import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

/** @type {import('next').NextConfig} */
const baseConfig = {
  images: {
    unoptimized: true, // disable Next.js image optimization globally
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
}

const nextIntlPlugin = createNextIntlPlugin()
const nextConfig = withPayload(baseConfig, { devBundleServerPackages: false })

// Compose NextIntl on top of Payload
export default nextIntlPlugin(nextConfig)
