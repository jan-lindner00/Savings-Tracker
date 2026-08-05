import AuthWrapper from "@/app/components/AuthWrapper";
import Image from "next/image";
import Link from "next/link";
import IconBack from "@/public/images/icon-chevron-left.svg"

export default function ResetSuccess(){
    return (
        <AuthWrapper
            heading="Check your inbox" 
            description="We've sent a reset link to your email"
        >
            <section className="text-[1rem] text-medium leading-[1.2] tracking-[.5px]">
                <div className="flex flex-col gap-8 mb-4 mt-8">
                    <p className="text-neutral-0">The link expires in 30 minutes.</p>
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
                            href="/auth/reset-password" 
                            replace
                        >
                            Resend email
                        </Link>
                    </p>
                </div>
                <Link 
                    href="/login"
                    className="flex items-center gap-[.375rem] text-neutral-300 no-underline font-medium leading-[1.4] tracking-[-.3px]"
                    replace
                >
                    <Image src={IconBack} alt="Arrow left" />
                    Back to sign in
                </Link>
            </section>
        </AuthWrapper>
    )
}