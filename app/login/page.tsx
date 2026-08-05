import Link from "next/link"
import Image from "next/image"
import IconGoogle from "@/public/images/icon-google.svg"
import IconEmail from "@/public/images/icon-email.svg"
import { signInAnonymously, signInWithOAuth } from "@/app/lib/auth"
import AuthWrapper from "@/app/components/AuthWrapper"

export default function Login(){
    
    return(
        <AuthWrapper 
            heading="Welcome back"
            description="Sign in to your account"
        >
            <section className="w-full flex flex-col items-center gap-6">
                <div className="w-full mt-10 py-12 px-6 rounded-[.75rem] border border-neutral-600
                text-neutral-0 leading-[1.2] tracking-[-.5px] text-[1rem] xs:text-[1.25rem]">
                    <form action={signInWithOAuth}>
                        <button 
                            type="submit" 
                            className="w-full flex items-center justify-center gap-4
                            bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-0 rounded-[.5rem] p-4 mb-8"
                            >
                                <Image  className="w-8" src={IconGoogle} alt="Google logo" />
                                Continue with Google
                        </button>
                    </form>
                    <div>
                        <Link href="/login/email" className="w-full flex items-center justify-center gap-4
                            bg-neutral-800 border hover:bg-neutral-700 border-neutral-600 text-neutral-0  rounded-[.5rem] p-4
                            no-underline visited:no-underline">
                            <Image className="w-8" src={IconEmail} alt="Email icon" />
                            Continue with Email
                        </Link>
                    </div>
                    <div className="flex items-center relative py-10 text-medium 
                    text-neutral-200 text-[1.25rem] leading-[1.2] tracking-[-.5px]">
                        <hr aria-hidden="true" className="grow border-b border-neutral-600" />
                        <span className="absolute top-[50%] left-[50%] -translate-1/2 bg-inherit">OR</span>
                    </div>
                    <form className="text-medium" action={signInAnonymously}>
                        <button 
                            type="submit" 
                            className="w-full text-neutral-900 bg-orange-400 hover:bg-orange-500 rounded-[.5rem] p-4 font-semibold"
                        >
                            Continue as Guest
                        </button>
                    </form>
                </div>
                <p className="flex gap-2 flex-wrap justify-center text-neutral-300 leading-[1.4] tracking-[-.3px] font-medium">
                    Don&apos;t have an account? 
                    <Link 
                        className="text-neutral-0 underline underline-offset-4"
                        href="auth/signup" 
                    >
                        Create one
                    </Link>
                </p>
            </section>
        </AuthWrapper>
    )
}
