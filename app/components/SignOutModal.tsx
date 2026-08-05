import { type Dispatch, type RefObject, type SetStateAction, type JSX, useEffect } from "react"
import IconClose from "@/public/images/icon-cross.svg"
import Image from "next/image"
import Link from "next/link"

export default function SignOutModal({setModalOpen, modalRef}: 
    {setModalOpen: Dispatch<SetStateAction<boolean>>, modalRef: RefObject<HTMLDialogElement | null>}
): JSX.Element{
    
    useEffect(()=>{
        if(modalRef?.current === null){
            return
        }
        modalRef.current.showModal()
    }, [])

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
                    <Image src={IconClose} alt="Close" />
                </button>
                <div>
                    <h2 className="mb-3 w-[calc(100%-1.875rem)] text-[1.25rem] font-semibold tracking-[-.3px] leading-[1.2] text-neutral-0">
                        Sign out?
                    </h2>
                    <p className="leading-[1.5] tracking-[-.3px] text-neutral-300">
                        {"This will permanently delete all your goals and deposits. If you want to save your data, "} 
                        <Link 
                            className="text-orange-400 underline underline-offset-4"
                            href="/settings/link-profile"
                        >
                            link your account
                        </Link> 
                        {" to an auth provider."}
                    </p>
                </div>
                <hr className="grow border-b border-neutral-700" />
                <form 
                    action="/auth/logout"
                    method="post"
                >
                    <div className="self-end flex justify-end gap-4 font-medium leading-[1.5] tracking-[-.3px]">
                        <button
                            className="py-3 px-5 rounded-full bg-neutral-700 hover:bg-neutral-600 text-neutral-0 border border-neutral-600" 
                            type="button"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="py-3 px-5 rounded-full bg-red-500 text-neutral-900 hover:bg-neutral-900 hover:text-red-500 hover:border
                            hover:border-neutral-600"
                            type="submit"
                        >
                            Sign out
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}
