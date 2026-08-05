import AuthWrapper from "@/app/components/AuthWrapper"
import Link from "next/link"

export default function ConfirmationSuccess(){
    return(
        <AuthWrapper 
                heading="Confirmation"
                description="Your email has been confirmed successfuly. You can login now."
        >
            <section className="text-medium">
                <Link href="/login" replace className="w-full rounded-full h-12 flex items-center 
                justify-center bg-orange-400 hover:bg-orange-500 text-neutral-900 font-semibold mt-8">
                    Sign in to your account
                </Link>
            </section>
        </AuthWrapper>
    )
}