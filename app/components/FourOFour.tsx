import Image from "next/image"
import {createClient} from "@/app/lib/supabase/server"
import Link from "next/link"
import LogoLarge from "@/public/images/logo-large.svg"

export default async function FourOFour({logo=true, text="Site not found", style=undefined}:{logo?: boolean, text?: string, style?: React.CSSProperties | undefined}){
    const supabase = await createClient()
    const claims = await supabase.auth.getClaims()
    const session = claims?.data?.claims?.sub ?? null


    return (
        <section style={style} className={`${logo ? "h-dvh " : "h-[calc(100dvh-72px)] md:h-[calc(100dvh-80px)] "}w-full p-4 flex flex-col items-center justify-center gap-9`}>
            {logo && <Image src={LogoLarge} className="mb-4" alt="Savings Tracker Logo"/>}
            <h1 className="text-[2.5rem] font-semibold tracking-[-2px]"><span className="text-neutral-300">404 | </span>{text}</h1>
            <div className="w-full max-w-[500px]" aria-hidden>
                <hr className="grow rounded-full border border-b-neutral-400" />
            </div>
            <Link href={session ? `/dashboard` : "/signin"} className="w-full  max-w-[500px] flex items-center justify-center
                    bg-orange-400 text-neutral-900 hover:bg-orange-500 rounded-full font-semibold mt-4 h-14">{session ? "Back to dashboard" : "Back to sign in"}</Link>
        </section>
    )
}