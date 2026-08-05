"use client"
import Image from "next/image"
import PatternStar from "@/public/images/pattern-star.svg"
import { quotes } from "@/app/lib/utils"
import {useEffect, useState} from "react"

export default function Quote(){
    const [index, setIndex] = useState<number>(0)
    
    useEffect(()=>{
        function getRandomIndex(){
            const i = Math.floor(Math.random() * quotes.length)
            setIndex(i)
        }
        getRandomIndex()
    }, [])

    return (
        <div className="hidden md:block overflow-hidden w-[600px] h-[800px] relative rounded-[1rem] 
        bg-linear-to-l from-orange-400 to-orange-700 shadow-quote font-semibold">
            <blockquote 
                className="absolute top-1/2 left-10 w-120 font-bri text-[4rem] tracking-[-2px]
                -translate-y-1/2"
            >
                {quotes[index].quote}
            </blockquote>
            <p className="absolute bottom-10 left-10 text-[1.25rem] leading-[1.3] tracking-[-.3px]">
                <span className="text-[3rem] leading-[0.2] font-extralight relative top-2">-</span> {quotes[index].author}
            </p>
            <Image 
                src={PatternStar} 
                alt="" 
                className="absolute -bottom-30 -right-25 w-116"
            />
        </div>
    )
}