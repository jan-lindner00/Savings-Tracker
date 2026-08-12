"use client"

import Image from "next/image"
import GoalCard from "@/app/components/GoalCard"
import Filter from "@/app/components/Filter"
import Sort from "@/app/components/Sort"
import {useMemo} from "react"
import { useSearchParams } from "next/navigation"
import getDepositsStats, { formatCurrency } from "@/app/lib/utils"
import useWindowSize from "@/app/lib/hooks/useWindowSize"
import PatternStar from "@/public/images/pattern-star-goals.svg"
import GoalIcon from "@/public/images/icon-target.svg"
import { Temporal } from "@js-temporal/polyfill"
import { useSubscribeDeposits, useSubscribeGoals } from "../lib/hooks/useSubscription"
import { useAppContext } from "@/app/lib/hooks/useContext"

export default function Dashboard(){
    const goals = useSubscribeGoals()
    const deposits = useSubscribeDeposits()
    const {width} = useWindowSize()
    const searchParams = useSearchParams()
    const {setShowGoalModal} = useAppContext()

    const filteredGoals = useMemo(()=>{
        if(searchParams.get("filter_by")?.toLowerCase() === "in_progress"){
            return goals.filter(goal => goal.saved_money !== 0 && goal.target > goal.saved_money)
        }
        if(searchParams.get("filter_by")?.toLowerCase() === "completed"){
            return goals.filter(goal => goal.target <= goal.saved_money)
        }
        if(searchParams.get("filter_by")?.toLowerCase() === "not_started"){
            return goals.filter(goal => goal.saved_money === 0)
        }
        return goals
    }, [goals, searchParams])

    const sortedGoals = useMemo(()=>{
        if(searchParams.get("sort_by")?.toLowerCase() === "alphabetical"){
            return [...filteredGoals].sort((a, b) => {
                if(a.name.toLowerCase() < b.name.toLowerCase()){
                    return -1
                }
                if(a.name.toLowerCase() > b.name.toLowerCase()){
                    return 1
                }
                return 0
            })
        }
        if(searchParams.get("sort_by")?.toLowerCase() === "progress_asc"){
            return [...filteredGoals].sort((a, b) => {
                if((a.saved_money / a.target) < (b.saved_money / b.target)){
                    return -1
                }
                if((a.saved_money / a.target) > (b.saved_money / b.target)){
                    return 1
                }
                return 0
            })
        }
        if(searchParams.get("sort_by")?.toLowerCase() === "progress_desc"){
            return [...filteredGoals].sort((a, b) => {
                if((a.saved_money / a.target) > (b.saved_money / b.target)){
                    return -1
                }
                if((a.saved_money / a.target) < (b.saved_money / b.target)){
                    return 1
                }
                return 0
            })
        }
        if(searchParams.get("sort_by")?.toLowerCase() === "amount_saved"){
            return [...filteredGoals].sort((a, b) => {
                if(a.saved_money > b.saved_money){
                    return -1
                }
                if(a.saved_money < b.saved_money){
                    return 1
                }
                return 0
            })
        }
        if(searchParams.get("sort_by")?.toLowerCase() === "deadline"){
            return [...filteredGoals].sort((a, b) => {
                if(a.deadline === null && b.deadline !== null){
                    return 1
                }
                if(a.deadline !== null && b.deadline === null){
                    return -1
                }
                if(a.deadline === null && b.deadline === null){
                    return 0
                }
                if(a.deadline !== null && b.deadline !== null && Temporal.PlainDate.compare(Temporal.PlainDate.from(a.deadline), Temporal.PlainDate.from(b.deadline)) === -1){
                    return -1
                }
                if(a.deadline !== null && b.deadline !== null && Temporal.PlainDate.compare(Temporal.PlainDate.from(a.deadline), Temporal.PlainDate.from(b.deadline)) === 1){
                    return 1
                }
                return 0
            })
        }
        
        return filteredGoals
    }, [filteredGoals, searchParams])

    const savedAmount = useMemo(()=>{
        return deposits.reduce((acc, current)=>acc + current.amount, 0)
    }, [deposits])

    const depositsStats = useMemo(()=>getDepositsStats(deposits, width), [deposits, width])

    const maxStat = Math.max(...depositsStats.map(stat => stat.saved_amount))

    const statsElements = depositsStats.map((stat)=>{
        return (<div key={stat.id} className="flex flex-col items-center min-w-11 md:w-[5.3125rem] grow">
            <div className="w-full h-36 flex flex-col-reverse">
                <div 
                    className="w-full bg-orange-400 rounded-[.5rem]"
                    aria-disabled="true"
                    style={{height: `${maxStat !== 0 ? stat.saved_amount/maxStat * 100 : 0}%`}}>
                </div>
            </div>
            <p className="overflow-x-hidden mt-[.625rem] text-neutral-300 text-[.6875rem] md:text-[.875rem] 
                font-semibold md:font-medium md:tracking-[-.3px] leading-[1.2] md:leading-[1.4]">
                ${stat.saved_amount.toFixed()}
            </p>
            <p className="mt-1 text-[.6875rem] md:text-[1rem] font-semibold md:font-medium md:tracking-[-.3px] leading-[1.2] md:leading-[1.5]">{stat.name}</p>
        </div>)
    })

    const activeGoals = goals.filter(goal => goal.saved_money < goal.target).length
    const completedGoals = goals.filter(goal => goal.saved_money >= goal.target).length

    return (
        <>
            <section className="w-full max-w-[80rem] mx-auto">
                <div className="grid grid-rows-[repeat(3, 130px)] md:grid-rows-[9.25rem 9.875rem] md:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div className="total-savings p-4 md:p-5 flex flex-col justify-between rounded-[1rem] relative overflow-hidden md:col-span-2">
                        <h2 
                            className="text-[1rem] font-semibold leading-[1.4] tracking-[-.3px]"
                        >
                            Total savings
                        </h2>
                        <p className="font-bri text-[2.75rem] md:text-[4rem] font-semibold tracking-[-.3px]"
                        >
                            ${formatCurrency(savedAmount.toString())}
                        </p>
                    </div>
                    <div className="p-4 md:p-5 flex flex-col justify-between rounded-[1rem] relative overflow-hidden bg-neutral-800
                        border border-neutral-600"
                    >
                        <h2 
                            className="text-[1rem] font-semibold leading-[1.4] tracking-[-.3px]"
                        >
                            Active goals
                        </h2>
                        <p 
                            className={`font-bri text-[2.75rem] md:text-[4rem] font-semibold tracking-[-.3px] ${activeGoals ? "text-orange-400": "text-neutral-400"}`}
                        >
                            {activeGoals}
                        </p>
                        <Image className="absolute w-50 h-50 -right-14 -bottom-24" alt="" src={PatternStar}/>
                    </div>
                    <div className="p-4 md:p-5 flex flex-col justify-between rounded-[1rem] relative overflow-hidden bg-neutral-800
                        border border-neutral-600">
                        <h2 
                            className="text-[1rem] font-semibold leading-[1.4] tracking-[-.3px]"
                        >
                            Completed goals
                        </h2>
                        <p 
                            className={`font-bri text-[2.75rem] md:text-[4rem] font-semibold tracking-[-.3px] ${activeGoals ? "text-green-500": "text-neutral-400"}`}
                        >
                            {completedGoals}
                        </p>
                        <Image className="absolute w-50 h-50 -right-14 -bottom-24" alt="" src={PatternStar}/>
                    </div>
                </div>
                <div 
                    className="monthly-deposits h-65 md:h-[17.875rem] rounded-[1rem] border border-neutral-600 bg-neutral-800 p-4 md:p-5"
                    style={deposits.length === 0 ? {height: "204px"} : undefined}
                >
                    <h2
                        className="text-[1.25rem] leading-[1.2] tracking-[-.3px] font-semibold"
                    >
                        Monthly deposits
                    </h2>
                    <div 
                        tabIndex={0}
                        className="mt-5 flex flex-row-reverse gap-2 md:gap-4 2xl:gap-5 overflow-x-scroll scrollbar-none"
                    >
                        {deposits.length > 0 ? statsElements: (
                            <p 
                                className="w-full mt-12 text-center text-neutral-300 leading-[1.5] tracking-[-.3px]"
                            >
                                No deposits yet
                            </p>
                        )}
                    </div>
                </div>
            </section>
            <section className="mt-13 max-w-[80rem] w-full mx-auto">
                <div className="mb-6 flex flex-col gap-5 md:flex-row md:justify-between">
                    <h1 className="text-[2rem] font-bold leading-[1.2]">Your goals</h1>
                    <div className="flex gap-4 max-xs:justify-between">
                        <Filter />
                        <Sort />
                    </div>
                </div>
                {goals.length > 0 ? (
                <div className="goals-grid grid gap-6">
                    {sortedGoals.map((goal)=>{
                        return (
                            <GoalCard key={goal.id} {...goal} searchParams={searchParams.toString()}/>
                        )
                    })}    
                </div>
                ) : filteredGoals.length > 0 ? (
                    <div className="py-10 px-4 rounded-[1rem] max-w-[80rem] w-full mx-auto">
                        <h2 
                            className="text-[2rem] leading-[1.2] my-5"
                        >
                            No goals match your criteria
                        </h2>
                    </div>
                ) :
                (
                <section 
                    className="no-goals flex flex-col items-center py-10 px-4 rounded-[1rem] max-w-[80rem] w-full mx-auto"
                >
                    <Image src={GoalIcon} alt="" />
                    <h2 
                        className="text-[2rem] leading-[1.2] my-5"
                    >
                        No goals yet
                    </h2>
                    <p
                        className="max-w-128 text-center text-neutral-300 leading-[1.5] tracking-[-.3px] 
                        font-medium mb-8"
                    >
                        Start saving for something that matters. Create your first goal and track your progress.
                    </p>
                    <button 
                        className="py-3 px-5 border-none bg-orange-400 hover:bg-orange-500 rounded-full text-[1rem] 
                        leading-[1.5] tracking-[-.3px] font-medium text-neutral-900"
                        onClick={()=> setShowGoalModal(true)}
                    >
                        <span className="text-[1.625rem] font-regular leading-0">+ </span> 
                        Create your first goal
                    </button>
                </section>     
            )}
            </section>
        </>
    )
}
