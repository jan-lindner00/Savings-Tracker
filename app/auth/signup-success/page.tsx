import AuthWrapper from "@/app/components/AuthWrapper"
import Link from "next/link"
import Image from "next/image"
import IconBack from "@/public/images/icon-chevron-left.svg"

export default function SignUpSuccess(){
    return (
        <AuthWrapper
            heading="Signup successful" 
            description="We sent an email to confirm your account"
        >
            <section className="text-[1rem] text-medium leading-[1.2] tracking-[.5px]">
                <div className="flex flex-col gap-8 mb-4 mt-8">
                    <p className="text-neutral-0">Confirm your email</p>
                    <Link
                        href="https://mail.google.com" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex justify-center items-center h-14 rounded-full 
                        bg-neutral-800 border border-neutral-600 text-neutral-0 font-semibold"
                    >
                        Open email app
                    </Link>
                    <p className="text-neutral-300 flex flex-wrap gap-2">
                        {"Didn't receive it?"}
                        <Link 
                            className="text-neutral-0 mb-4 underline underline-offset-4"
                            href="/auth/resend-confirmation" 
                            replace
                        >
                            Resend email
                        </Link>
                    </p>
                </div>
                <Link 
                    href="/login"
                    className="flex items-center gap-[.375rem] text-neutral-200 no-underline text-medium"
                    replace
                >
                    <Image src={IconBack} alt="Arrow left" />
                    Back to sign in
                </Link>
            </section>
        </AuthWrapper>
    )
}