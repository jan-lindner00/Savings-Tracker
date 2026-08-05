import AuthWrapper from "@/app/components/AuthWrapper";
import Link from "next/link";

export default async function AuthError(){
    return(
        <AuthWrapper 
            heading="Authentication Error"
            description="An error occurred during authentification"
        >
            <section className="mt-8">
                <Link href="/login" 
                    replace 
                    className="w-full h-12 flex items-center justify-center rounded-full
                    text-medium bg-orange-400 hover:bg-orange-500 font-semibold text-neutral-900">
                    Back to sign in
                </Link>
            </section>
        </AuthWrapper>
    )
}