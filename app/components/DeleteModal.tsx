"use client"
import Image from "next/image"
import { Dispatch, SetStateAction, useActionState, useEffect, useRef } from "react"
import supabaseClient from "@/app/lib/supabase/client"
import { useRouter } from "next/navigation"
import IconClose from "@/public/images/icon-cross.svg"
import InfoCircle from "@/public/images/icon-error.svg"

type DeleteModalProps = {
    goalId: string | undefined,
    goalName: string,
    setModalOpen: Dispatch<SetStateAction<boolean>>
}

export default function DeleteModal({goalId, goalName, setModalOpen}: DeleteModalProps){
    
    const {replace} = useRouter()
    const modalRef = useRef<HTMLDialogElement | null>(null)

    useEffect(()=>{
        modalRef.current?.showModal()
    }, [])

    const [error, submitAction, isPending] = useActionState(async()=>{
        if(!goalId){
            return new Error("Invalid goal id")
        }
        try{
            const {error} =  await supabaseClient
                .from("goals")
                .delete()
                .eq("id", goalId)

            if(error){
                throw error
            }
            replace("/dashboard")
            return null
        }catch(error: unknown){
            if(typeof error === "string"){
                return new Error(error)
            }else if(error instanceof Error){
                return error
            }else{
                return new Error("An unknown error occurred during deleting goal ")
            }
        }
    }, null)
    
    return (
        <dialog
            ref={modalRef}
            className="py-5 px-4 md:p-8 relative rounded-[1rem] bg-neutral-800 border border-neutral-600
            w-[calc(100vw-2rem)] h-fit max-w-[42.5rem] mx-auto mt-[50dvh] -translate-y-1/2"
            onKeyDown={(e)=>{
                if(e.key === "Escape"){
                    e.preventDefault()
                    setModalOpen(false)
                }
            }}
        >
            <div className="flex flex-col gap-6">
                <button 
                    className="absolute top-[1.5625rem] right-[1.5625rem] rounded-full"
                    onClick={() => setModalOpen(false)}
                >
                    <Image src={IconClose} alt="X" />
                </button>
                <div>
                    <h2 className="mb-3 w-[calc(100%-1.875rem)] text-[1.25rem] font-semibold tracking-[-.3px] leading-[1.2] text-neutral-0">
                        Delete {goalName}?
                    </h2>
                    <p className="leading-[1.5] tracking-[-.3px] text-neutral-300">
                        This will permanently delete this goal and all its deposit history. This cannot be undone.
                    </p>
                </div>
                <hr className="grow border-b border-neutral-700" />
                <form action={submitAction}>
                    {error && (
                    <p className="flex items-center gap-[.375rem] leading-[1.5] tracking-[-.3px] text-red-500" role="alert">
                        <Image src={InfoCircle} alt="" />
                        {error.message}
                    </p>
                    )}
                    <div className="self-end flex justify-end gap-4 font-medium leading-[1.5] tracking-[-.3px]">
                        <button 
                            type="button"
                            className="py-3 px-5 rounded-full bg-neutral-700 hover:bg-neutral-600 text-neutral-0 border border-neutral-600"
                            disabled={isPending}
                            aria-busy={isPending}
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="py-3 px-5 rounded-full bg-red-500 text-neutral-900 hover:bg-neutral-900 hover:text-red-500 hover:border
                            hover:border-neutral-600"
                            disabled={isPending}
                            aria-busy={isPending}
                        >
                            Delete goal
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}