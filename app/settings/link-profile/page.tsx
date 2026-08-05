import Link from "next/link"
import Image from "next/image"
import IconGoogle from "@/public/images/icon-google.svg"
import { linkIdentity } from "@/app/lib/auth"
import AuthWrapper from "@/app/components/AuthWrapper"

export default function Login(){
    
    return(
        <AuthWrapper 
            heading="Link your account"
            description="Link to google to save your data"
        >
            <section className="w-full flex flex-col items-center gap-6">
                <div className="w-full mt-10 py-12 px-6 rounded-[.75rem] border border-neutral-600
                text-neutral-0 leading-[1.2] tracking-[-.5px] text-[1rem] xs:text-[1.25rem]">
                    <form action={linkIdentity}>
                        <button 
                            type="submit" 
                            className="w-full flex items-center justify-center gap-4
                            bg-neutral-700 border border-neutral-500 rounded-[.5rem] p-4"
                            >
                                <Image  className="w-8" src={IconGoogle} alt="Google logo" />
                                Link to Google
                        </button>
                    </form>
                </div>
                <p className="flex gap-2 flex-wrap justify-center text-neutral-200 leading-[1.2] tracking-[1px]">
                    {"Want to stay anonymous?"} 
                    <Link 
                        className="text-neutral-0 underline underline-offset-4"
                        href="/dashboard" 
                    >
                        Back to dashboard
                    </Link>
                </p>
            </section>
        </AuthWrapper>
    )
}
