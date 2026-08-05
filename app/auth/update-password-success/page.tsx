import AuthWrapper from "@/app/components/AuthWrapper";
import Link from "next/link";

export default async function AuthError(){
    return(
        <AuthWrapper 
            heading="Password reset"
            description="Your password has been reset successfully."
        >
            <section className="mt-8">
                <Link href="/login" 
                    replace 
                    className="w-full h-12 flex items-center justify-center rounded-full
                    text-medium bg-orange-400 hover:bg-orange-500 font-semibold">
                    Back to sign in
                </Link>
            </section>
        </AuthWrapper>
    )
}