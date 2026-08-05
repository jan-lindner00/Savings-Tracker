"use client"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useId, useRef } from "react"
import supabaseClient from "@/app/lib/supabase/client"
import LogoSmall from "@/public/images/logo-small.svg"
import LogoLarge from "@/public/images/logo-large.svg"
import { UserData } from "@/app/lib/types"
import { getInitials, trySupabase } from "@/app/lib/utils"
import SignOutModal from "@/app/components/SignOutModal"
import { useAppContext } from "@/app/lib/hooks/useContext"
import GoalModalCreate from "./GoalModalCreate"

export default function Header(){
    const {showGoalModal, setShowGoalModal} = useAppContext()
    const id = useId()
    const [toggle, setToggle] = useState<boolean>(false)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const modalRef = useRef<HTMLDialogElement | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const freshLoad = useRef<boolean>(true)

    useEffect(()=>{
        if(freshLoad.current){
            freshLoad.current = false
            return
        }
        if(toggle){
            menuRef.current?.focus()
        }else{
            buttonRef.current?.focus()
        }
    }, [toggle])

    useEffect(()=>{
        async function fetchUserData(){
            const {data} = await supabaseClient.auth.getUser()
            if(!data?.user || data?.user?.is_anonymous){
                return
            }

            const {success, error, data: profileData} = await trySupabase(() => ( 
                supabaseClient
                    .from("user_profiles")
                    .select()
                    .eq("id", data.user?.id)
                    .single()
                )
            )
            if(!success || error || !profileData){
                return setUserData(null)
            }
            setUserData(profileData)
        }
        fetchUserData()
    }, [])

    return(
        <>
        <header className="w-full h-18 md:h-20 fixed top-0 bottom-0 z-2 px-4 md:px-6 2xl:px-12 bg-neutral-900 border-b border-neutral-800">
            <section className="h-full relative flex justify-between items-center max-w-[80rem] mx-auto">
                <Image className="md:hidden" src={LogoSmall} alt="Savings Tracker logo" loading="eager"/>
                <Image className="hidden md:block" src={LogoLarge} alt="Savings Tracker logo" loading="eager"/>
                <div className="flex items-center gap-4">
                    <button 
                        className="bg-orange-400 hover:bg-orange-500 text-neutral-900 font-medium relative py-3 font-semibold pl-[3.375rem] pr-5 rounded-full
                        before:content-['+'] before:absolute before:top-[.175rem] before:left-6 before:text-neutral-900 before:text-[1.625rem] before:font-regular"
                        onClick={() => setShowGoalModal(true)}
                    >
                        New goal
                    </button>
                    <button 
                        ref={buttonRef}
                        aria-controls={id}
                        aria-expanded={toggle}
                        aria-label="Open user settings"
                        className="rounded-full border-none"
                        onClick={()=> setToggle(prev => !prev)}
                    >
                        {userData?.avatar_url ? (
                        <Image
                            className="w-12 rounded-full border border-neutral-500"
                            alt={`Profile picture of ${userData?.full_name}`} 
                            src={userData.avatar_url}
                            width={200}
                            height={200}
                        />

                        ): (
                        <div className="w-12 h-12 flex justify-center rounded-full items-center border border-neutral-500
                        bg-neutral-700 text-neutral-0 tracking-[1px] leading-[1.2]">
                            <p>{getInitials(userData?.full_name)}</p>
                        </div>
                        )}
                    </button>
                </div>
                {toggle && (
                <div 
                    tabIndex={0}
                    ref={menuRef}
                    className="fixed top-[4.625rem] md:top-[5.25rem] right-0 w-[17.5rem] rounded-[.75rem]
                    bg-neutral-800 border border-neutral-600 p-2 z-2"
                    id={id}
                    onKeyDown={(e)=>{
                        if(e.key === "Escape"){
                            setToggle(false)
                        }
                    }}
                    onBlur={(e)=>{
                        if(!menuRef.current?.contains(e.relatedTarget)){
                            setToggle(false)
                        }
                    }}
                >
                    <div className="flex items-center gap-3 pb-3 border-b border-neutral-600">
                        {userData?.avatar_url ? (
                        <Image
                            className="w-12 rounded-full border border-neutral-500"
                            alt={`Profile picture of ${userData?.full_name}`} 
                            src={userData.avatar_url}
                            width={200}
                            height={200}
                        />

                        ): (
                        <div className="w-12 h-12 flex justify-center rounded-full items-center border border-neutral-500
                        bg-neutral-700 text-neutral-0 tracking-[1px] leading-[1.2]">
                            <p>{getInitials(userData?.full_name)}</p>
                        </div>
                        )}
                        
                        <div className="flex flex-col gap-2 text-neutral-300">
                            <p className="text-[.875rem] leading-[1.5] tracking-[-.3px]">
                                {userData?.full_name || "Guest"}
                            </p>
                            {userData?.email && (
                                <p className="text-[.75rem] leading-[1.5] tracking-[-.3px]">
                                    {userData.email}
                                </p>)}
                        </div>
                    </div>
                    {userData ? (
                    <div className="py-5 flex flex-col border-b border-neutral-600">
                        <Link
                        className="px-2 text-neutral-0 no-underline"
                        href="/settings/password"
                        >
                            Change password
                        </Link>
                    </div>): (
                    <div className="py-5 flex flex-col border-b border-neutral-600">
                        <Link
                        className="px-2 text-neutral-0 no-underline"
                        href="/settings/link-profile"
                        >
                            Link profile
                        </Link>
                    </div>
                    )}
                    {userData ? (
                    <form action="/auth/logout" method="post">
                        <button 
                            type="submit"
                            className="w-full p-2 mt-3 text-red-500 border-none flex justify-start"
                        >
                            Log out
                        </button>
                    </form>) : (
                    <button 
                        className="w-full p-2 mt-3 text-red-500 border-none flex justify-start"
                        onClick={()=>setModalOpen(true)}
                    >
                        Log out
                    </button>
                    )}
                    
                </div>
                )}
                {(!userData && modalOpen) && <SignOutModal modalRef={modalRef} setModalOpen={setModalOpen}/>}
            </section>
        </header>
        {showGoalModal && <GoalModalCreate/>}
        </>
    )
}
