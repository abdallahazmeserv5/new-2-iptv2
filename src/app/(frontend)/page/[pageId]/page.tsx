import { configuredPayload } from '@/actions'
import { Card } from '@/components/ui/card'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import { isMedia } from '@/modules/shared/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface Props {
  params: Promise<{ pageId: string }>
}
export default async function HomePage({ params }: Props) {
  const { pageId } = await params
  const payload = await configuredPayload()
  const pageData = await payload.findByID({
    collection: 'pages',
    id: pageId,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />

            <div className={`relative px-6 py-12 md:px-12 md:py-20 `}>
              <div className="mx-auto flex flex-col items-center gap-5 ">
                <h1
                  className={`text-balance font-sans text-4xl font-bold tracking-tight    text-white  md:text-5xl text-center my-5`}
                >
                  {pageData.title}
                </h1>
                {isMedia(pageData.image) && (
                  <div className="mt-8 overflow-hidden rounded-lg shadow-2xl">
                    <ImageFallBack
                      src={pageData.image.url || '/placeholder.svg'}
                      alt={pageData.image.alt}
                      width={800}
                      height={400}
                      className="h-64 w-full object-cover md:h-80 lg:h-96"
                      priority
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <Card className="p-8 md:p-12 border border-muted text-white bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <RichText data={pageData.content} />
          </Card>
        </div>
      </main>
    </div>
  )
}
