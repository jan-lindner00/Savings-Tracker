import Image from "next/image"
import { Suspense } from "react"
import LogoLarge from "@/public/images/logo-large.svg"
import LogoSmall from "@/public/images/logo-small.svg"
import Header from "@/app/components/Header"
import { GoalsProvider, DepositsProvider } from "@/app/context/SubscribeContext" 
import AppContextProvider from "@/app/context/AppContext"

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppContextProvider>
      <div className="flex flex-col items-center">
          <Suspense fallback={(
            <header className="max-w-[90rem] w-full h-18 md:h-20 fixed top-0 bottom-0 z-2 px-4 md:px-6 2xl:px-12 border-b border-neutral-800">
              <section className="h-full px-4 md:px-6 2xl:px-12 flex items-center">
                  <Image className="md:hidden" src={LogoSmall} alt="Savings Tracker logo" loading="eager"/>
                  <Image className="hidden md:block" src={LogoLarge} alt="Savings Tracker logo" loading="eager"/>
              </section>
          </header>
          )}>
            <Header/>
          </Suspense>
          <main className="mt-18 md:mt-20 px-4 py-8 md:px-6 md:py-12 2xl:px-12 md:flex flex-col md:align-center w-full max-w-[1440px]">
              <GoalsProvider>
                <DepositsProvider>
                  {children}
                </DepositsProvider>
              </GoalsProvider>
          </main>
      </div>
    </AppContextProvider>
  );
}
