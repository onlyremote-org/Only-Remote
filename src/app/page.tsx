import Link from 'next/link'
import Image from 'next/image'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import FeaturesList from '@/components/FeaturesList'

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

      <div className="flex flex-col overflow-hidden">
        <ContainerScroll
          titleComponent={
            <>
              <div className="flex flex-col items-center justify-center">
                <div className="mb-8">
                  <a href="/jobs" className="inline-flex space-x-6">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                      New Jobs Added Daily
                    </span>
                  </a>
                </div>
                <h1 className="text-4xl font-semibold text-foreground">
                  Find your next <br />
                  <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-primary">
                    Remote Career
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
                  Only Remote curates the best work-from-anywhere opportunities in tech, design, marketing, and more. No commute, no boundaries.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/signup"
                    className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Browse Open Roles
                  </Link>
                  <Link href="/signup" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
                    Create Profile <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </>
          }
        >
          <FeaturesList />
        </ContainerScroll>
      </div>
    </div>
  )
}
