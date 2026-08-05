"use client"
import {useActionState} from "react"
import Link from "next/link"
import Image from "next/image"
import {useRouter} from "next/navigation"
import AuthWrapper from "@/app/components/AuthWrapper"
import IconError from "@/public/images/icon-error.svg"
import { signUpWithPassword } from "@/app/lib/auth"
import clsx from "clsx"

export default function SignUp(){
    const {replace} = useRouter()

    const [error, submitAction, isPending] = useActionState(async(_: unknown, formData: FormData): Promise<Error | null>=> {
        const fullName: FormDataEntryValue | null = formData.get("full_name")
        const email: FormDataEntryValue | null = formData.get("email")
        const password: FormDataEntryValue | null = formData.get("password")
        const passwordConfirm: FormDataEntryValue | null = formData.get("password-confirm")
    
        if(typeof fullName !== "string" || typeof email !== "string" || typeof password !== "string" || typeof passwordConfirm !== "string"){
            return new Error("Invalid form data")
        }

        if(fullName.trim().length < 2 || fullName.trim().length > 150 || email.trim().length > 150 || password.trim().length < 6 || password.trim().length > 50){
            return new Error("Invalid form data")
        }

        if(password.trim() !== passwordConfirm.trim()){
            return new Error("Passwords do not match")
        }
        const {success, error} = await signUpWithPassword(email, password, fullName)
        if(error){
            return new Error(error)
        }
        if(success){
            replace("/auth/signup-success")
        }
        return null
    }, null)

   const stylesInputs = clsx(`w-full bg-neutral-700 p-4 rounded-[.5rem] border
           placeholder:font-inherit placeholder:text-neutral-300`, error && "border-red-500", 
           !error && "border-neutral-500")

    const labelStyles = "flex flex-col gap-3"

    return (
        <AuthWrapper
            heading="Create your account" 
            description="Start tracking exchange rates today"
        >
            <form 
                className="mt-8 flex flex-col gap-5 text-medium text-neutral-0 text-[1rem] 
                leading-[1.2] tracking-[-.5px] font-medium"
                action={submitAction}
             >
                <label className={labelStyles}>
                    Full name
                    <input 
                        className={stylesInputs}
                        type="text"
                        name="full_name"
                        minLength={2} 
                        maxLength={150}
                        aria-required="true"
                        autoComplete="name"
                        required
                        />
                </label>
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
                        autoComplete="off"
                        aria-invalid={error !== null}
                        required 
                    />
                </label>
                <label className={labelStyles}>
                    Confirm new password
                    <input
                        className={stylesInputs} 
                        type="password"
                        name="password-confirm"
                        minLength={6}
                        maxLength={50}
                        aria-required="true"
                        aria-invalid={error !== null}
                        autoComplete="off"
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
                    {isPending ? "Creating Account" : "Create Account"}
                </button>
                <p className="text-neutral-300 flex items-center flex-wrap gap-2 self-center font-medium leading-[1.4] tracking-[-.3px]">
                    Already have an account? 
                    <Link
                        className="text-neutral-0 underline
                        underline-offset-4"
                        href="/login"
                        style={isPending ? {pointerEvents: "none"} : undefined}
                        replace
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthWrapper>
    )
}