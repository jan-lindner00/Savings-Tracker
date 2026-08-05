"use client"
import {useActionState, useState, useEffect, useRef} from "react"
import Link from "next/link"
import Image from "next/image"
import AuthWrapper from "@/app/components/AuthWrapper"
import IconError from "@/public/images/icon-error.svg"
import { resendConfirmationEmail} from "@/app/lib/auth"
import clsx from "clsx"

export default function ResendConfirmation(){ 
    const [limit, setLimit] = useState<boolean>(false)
    const [timer, setTimer] = useState<number>(60)
    const [success, setSuccess] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const firstLoad = useRef<boolean>(true)
    const [error, submitAction, isPending] = useActionState(async(_: unknown, formData: FormData): Promise<Error | null>=> {
        setSuccess(false)
        const email: FormDataEntryValue | null = formData.get("email")
        
        if(typeof email !== "string"){
            return new Error("Invalid form data")
        }

        if(email.length > 150){
            return new Error("Invalid form data")
        }

        const {error, success} = await resendConfirmationEmail(email.trim())
        if(error){
            setLimit(true)
            return new Error(error)
        }
        if(success){
            setEmail(email)
            setSuccess(true)
        }
        setLimit(true)
        return null
    }, null)

    useEffect(()=>{
        if(firstLoad.current){
            firstLoad.current = false
            return
        }
        if(limit === false){
            return
        }
        const timerInterval = setInterval(()=>{
            setTimer(prev => { 
                return prev > 0 ? prev - 1 : 0
            })
        }, 1000)
        const timeout = setTimeout(()=>{
            setLimit(false)
            setTimer(60)
        }, 60000)

        return () => {
            clearInterval(timerInterval)
            clearTimeout(timeout)
        }
    }, [limit])

    const stylesInputs = clsx(`w-full bg-neutral-700 p-4 rounded-[.5rem] border
        placeholder:font-inherit placeholder:text-neutral-300`, error && "border-red-500", 
        !error && "border-neutral-500")
        
    const labelStyles = "flex flex-col gap-3"

    return (
         <AuthWrapper
            heading="Resend confirmation email" 
            description="Enter your email address and we'll send you a link to confirm your email"
            classDescription="max-w-100"
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
                    className="w-full flex items-center justify-center hover:bg-orange-500
                    bg-orange-400 text-neutral-900 rounded-full text-semibold mt-3 h-14"
                    type="submit"
                    aria-busy={isPending || limit}
                    disabled={isPending || limit}
                >
                    {isPending ? "Resending confirmation link..." : "Resend confirmation link"}
                </button>
                <div className="flex flex-col gap-3 mt-2">
                    {success && (
                        <p className="text-neutral-0">
                            {"We've send an email to "} 
                            <span className="text-neutral-300">
                                {email}
                            </span>
                        </p>
                    )}
                    {(limit && !isPending) && (
                        <p className="text-neutral-0">
                            {"Wait "} 
                            <span className="text-orange-400">
                                {timer}s
                            </span>
                            {" before trying again"}
                        </p>
                    )}
                </div>
                <Link
                    className="text-neutral-0 underline
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