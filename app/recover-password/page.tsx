"use client"
import clsx from "clsx"
import { useActionState } from "react"
import IconError from "@/public/images/icon-error.svg"
import AuthWrapper from "@/app/components/AuthWrapper"
import { useRouter } from "next/navigation"
import { updatePasswordRecovery } from "@/app/lib/auth"
import Image from "next/image"

export default function ChangePassword(){ 
    const {replace} = useRouter()
    const [error, submitAction, isPending] = useActionState(async (_: unknown, formData: FormData): Promise<Error | null> => {
        const password: FormDataEntryValue | null = formData.get("password")
        const passwordConfirm: FormDataEntryValue | null = formData.get("password-confirm")
        
        if(typeof password !== "string" || typeof passwordConfirm !== "string"){
            return new Error("Invalid form data")
        }
        if(password.trim().length < 6 || password.trim().length > 50){
            return new Error("Password must be between 6 and 50 characters")
        }
        if(password.trim() !== passwordConfirm.trim()){
            return new Error("Passwords do not match")
        }

        const { success, error } = await updatePasswordRecovery(password)
        if (error){
            return new Error(error)
        }
        if(success){
            replace("/auth/update-password-success")
        }
        
        return null
    }, null)

    const stylesInputs = clsx(`w-full bg-neutral-600 p-4 rounded-[.5rem] border
        placeholder:font-inherit placeholder:text-neutral-200`, error && "border-red-500", 
        !error && "border-neutral-400")

    const labelStyles = "flex flex-col gap-3"

    return(  
        <AuthWrapper
            heading="Recover password" 
            description="Enter your new password below."
        >
            <form 
                className="mt-8 flex flex-col gap-5 text-medium text-neutral-0 text-[1rem] 
                leading-[1.2] tracking-[-.5px]"
                action={submitAction}
             >
                <label className={labelStyles}>
                    New password
                    <input
                        className={stylesInputs}
                        type="password"
                        name="password"
                        minLength={6}
                        maxLength={50}
                        aria-required="true"
                        aria-invalid={error !== null}
                        autoComplete="new-password"
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
                        autoComplete="new-password"
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
                    bg-lime-500 text-neutral-900 rounded-full text-semibold mt-3 h-14"
                    type="submit"
                    aria-busy={isPending}
                    disabled={isPending}
                >
                    {isPending ? "Updating password..." : "Update password"}
                </button>
            </form>
        </AuthWrapper>
    )
}