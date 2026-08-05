import Image from "next/image"
import Logo from "@/public/images/logo-large.svg"
import Quote from "@/app/components/Quote"

export default function AuthWrapper({heading, description="", classDescription, children}:
    {heading: string, description: string, classDescription?: string, children: React.ReactNode}
){
    return(
        <div className="grid grid-cols-1 2xl:grid-cols-[37.5rem_1fr] 2xl:gap-20 min-h-dvh place-items-center p-4 md:py-8 md:px-16">
            <Quote />
           <div className="w-full max-w-[640px]">
            <header className="pb-8 border-b border-neutral-600">
                <Image 
                    src={Logo} 
                    className="w-[280px]" 
                    alt="Savings Tracker"
                    loading="eager"
                 />
                <h1 className="text-neutral-0 text-[2rem] pt-[2.5rem] pb-2 tracking-[-.5px]">
                    {heading}
                </h1>
                <p className={`${classDescription} text-neutral-300 font-medium leading-[1.5] tracking-[-.3px]`}>
                    {description}
                </p>
            </header>
            <main>
                {children}
            </main>
            </div>
        </div>
    )
}