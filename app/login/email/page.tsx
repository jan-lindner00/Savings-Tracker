"use client"
import {useActionState} from "react"
import Link from "next/link"
import Image from "next/image"
import {useRouter} from "next/navigation"
import AuthWrapper from "@/app/components/AuthWrapper"
import IconError from "@/public/images/icon-error.svg"
import { signInWithPassword } from "@/app/lib/auth"
import clsx from "clsx"

export default function LoginEmail(){
    const {replace} = useRouter()

    const [error, submitAction, isPending] = useActionState(async(_: unknown, formData: FormData): Promise<Error | null>=> {
        const email: FormDataEntryValue | null = formData.get("email")
        const password: FormDataEntryValue | null = formData.get("password")
        
        if(typeof email !== "string" || typeof password !== "string"){
            return new Error("Invalid form data")
        }

        if(email.length > 150 || password.length < 6 || password.length > 50){
            return new Error("Invalid form data")
        }
        const {success, error} = await signInWithPassword(email, password)
        if(error){
            return new Error(error)
        }
        if(success){
            replace("/dashboard")
        }
        return null
    }, null)
    
    const stylesInputs = clsx(`w-full bg-neutral-600 p-4 rounded-[.5rem] border
            placeholder:font-inherit placeholder:text-neutral-200`, error && "border-red-500", 
            !error && "border-neutral-400")
    
    const labelStyles = "flex flex-col gap-3"

    return (
        <AuthWrapper
            heading="Welcome back" 
            description="Sign in to your account"
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
                    <label className={labelStyles}>
                    Password
                    <input 
                        className={stylesInputs}
                        type="password" 
                        name="password" 
                        minLength={6} 
                        maxLength={50} 
                        aria-required="true"
                        aria-invalid={error !== null}
                        autoComplete="current-password"
                        required 
                    />
                </label>
                <Link 
                    className="text-neutral-100 visited-text-neutral-100 no-underline self-end" 
                    href="/auth/reset-password" 
                    style={isPending ? {pointerEvents: "none"} : undefined}
                    replace
                >
                    Forgot password?
                </Link>
                {error && (
                    <p className="flex items-center gap-3 text-red-500" role="alert">
                        <Image className="w-4" src={IconError} alt="Error"/>
                        {error.message}
                    </p>
                )}
                <button
                    className="w-full flex items-center justify-center
                    bg-orange-400 hover:bg-orange-500 text-neutral-900 rounded-full font-semibold mt-3 h-14"
                    type="submit"
                    aria-busy={isPending}
                    disabled={isPending}
                >
                    {isPending ? "Signing in..." : "Sign in"}
                </button>
                <p className="text-neutral-300 flex items-center flex-wrap gap-2 self-center font-medium leading-[1.4] tracking-[-.3px]">
                    {"Can't sign in?"} 
                    <Link
                        className="text-neutral-0 visited:text-neutral-0 underline
                        underline-offset-4"
                        href="/login"
                        style={isPending ? {pointerEvents: "none"} : undefined}
                        replace
                    >
                        Use another method
                    </Link>
                </p>
            </form>
        </AuthWrapper>
    )
}