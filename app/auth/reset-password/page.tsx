"use client"
import {useActionState} from "react"
import Link from "next/link"
import Image from "next/image"
import {useRouter} from "next/navigation"
import AuthWrapper from "@/app/components/AuthWrapper"
import IconError from "@/public/images/icon-error.svg"
import { resetPassword } from "@/app/lib/auth"
import clsx from "clsx"

export default function ResetPassword(){ 
    const {replace} = useRouter()

    const [error, submitAction, isPending] = useActionState(async(_: unknown, formData: FormData): Promise<Error | null>=> {
        const email: FormDataEntryValue | null = formData.get("email")
        
        if(typeof email !== "string"){
            return new Error("Invalid form data")
        }

        if(email.length > 150){
            return new Error("Invalid form data")
        }

        const {success, error} = await resetPassword(email.trim())
        if(error){
            return new Error(error)
        }
        if(success){
            replace("/auth/reset-password-success")    
        }
        return null
    }, null)

    const stylesInputs = clsx(`w-full bg-neutral-700 p-4 rounded-[.5rem] border
            placeholder:font-inherit placeholder:text-neutral-300`, error && "border-red-500", 
            !error && "border-neutral-500")
        
    const labelStyles = "flex flex-col gap-3"

    return (
         <AuthWrapper
            heading="Forgot your password?" 
            description="Enter your email address and we'll send you a link to reset it."
            classDescription="max-w-90"
        >
            <form 
                className="mt-8 flex flex-col gap-5 text-medium text-neutral-0 text-[1rem] 
                leading-[1.2] tracking-[-.5px] font-medium"
                action={submitAction}
             >
                <label className={labelStyles}>
                    Email address
                    <input 
                        className={stylesInputs}
                        type="email"
                        name="email" 
                        maxLength={150}
                        aria-required="true"
                        aria-invalid={error !== null}
                        autoComplete="email"
                        required
                    />
                </label>
                {error && (
                    <p className="flex items-center gap-3 text-red-500" role="alert">
                        <Image className="w-4" src={IconError} alt="Error"/>
                        {error.message}
                    </p>
                )}
                <button
                    className="w-full flex items-center justify-center
                    bg-orange-400 text-neutral-900 hover:bg-orange-500 rounded-full font-semibold mt-3 h-14"
                    type="submit"
                    aria-busy={isPending}
                    disabled={isPending}
                >
                    {isPending ? "Sending reset link..." : "Send reset link"}
                </button>
                <Link
                    className="text-neutral-0 visited:text-neutral-0 underline
                    underline-offset-4 self-center font-medium leading-[1.5] tracking-[-.3px]"
                    href="/login"
                    style={isPending ? {pointerEvents: "none"} : undefined}
                    replace
                >
                    Back to sign in
                </Link>
            </form>
        </AuthWrapper>
    )
}
