"use client"
import Image from "next/image"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import {useState, useActionState, useId} from "react"
import supabaseClient from "@/app/lib/supabase/client"
import { calcSetAmount, formatCurrency, formatDate, formatDateGoals} from "@/app/lib/utils"
import BackIcon from "@/public/images/icon-chevron-left.svg"
import GoalModalUpdate from "@/app/components/GoalModalUpdate"
import DeleteModal from "@/app/components/DeleteModal"
import Checkmark from "@/public/images/icon-checkmark.svg"
import DollarIcon from "@/public/images/icon-dollar.svg"
import InfoCircle from "@/public/images/icon-error.svg"
import DepositIcon from "@/public/images/icon-arrow-down.svg"
import { Temporal } from "@js-temporal/polyfill"
import { useSubscribeDeposits, useSubscribeGoals } from "@/app/lib/hooks/useSubscription"
import clsx from "clsx"

export default function GoalDetails(){
    const params = useParams()
    const goalId = params.id?.toString()
    const goals = useSubscribeGoals()
    const deposits = useSubscribeDeposits()
    const goal = goals.find(goal => goal.id === goalId)
    if(!goal){
        notFound()
    }
    const depositsForGoal = deposits.filter(deposit => deposit.goal_id === goalId)
    const id = useId()
    const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const [amount, setAmount] = useState<string>("")
    
    const target = goal?.target || 0
    const savedMoney = goal?.saved_money || 0
    const difference = target - savedMoney
    
    const [error, submitAction, isPending] = useActionState(async(_:unknown, formData: FormData): Promise< Error | null>=>{
        const note: FormDataEntryValue | null = formData.get("note")
        const depositAmount: FormDataEntryValue | null = formData.get("deposit-amount")

        if(typeof depositAmount !== "string" || note && typeof note !== "string"){
            return new Error("Invalid form data")
        }

        if(depositAmount.trim().length === 0){
            return new Error("Deposit amount must not be empty.")
        }

        if(isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) > 10000000){
            return new Error("Deposit amount must be a positive number between 0 and 10,000,000")
        }

        if(!goal){
            console.error("An unexpected error occured")
            return new Error("An unexpected error occured")
        }

        if(parseFloat(depositAmount) > difference){
            return new Error(`Please enter an amount that is smaller than or equal to $${formatCurrency(difference.toString())}`)
        }

        if(note && note.length > 150){
            return new Error("Note must not be longer than 150 characters.")
        }

        try{
            const {error} = await supabaseClient
                .from("deposits")
                .insert({
                    goal_id: goalId,
                    amount: amount,
                    note: note || null
                })
            if(error){
                throw error
            }
            setAmount("")
            return null
        }catch(error: unknown){
            if(typeof error === "string"){
                return new Error(error)
            }else if(error instanceof Error){
                return error
            }else{
                return new Error("An unknown error occurred during inserting deposit")
            }
        }
    }, null)

    function getFinishedGoalText(deadline: string | null): string{
        if(deadline === null || !(depositsForGoal[0]?.created_at)){
            return ""
        }
        const lastDepositDate = Temporal.PlainDate.from(depositsForGoal[0].created_at)
        const deadlineDate = Temporal.PlainDate.from(deadline)
        return Temporal.PlainDate.compare(lastDepositDate, deadlineDate) <= 0 ? ` Finished before your ${formatDateGoals(deadline, true)} deadline.` : (
            ` Didn't finish before your ${formatDateGoals(deadline, true)} deadline.`
        )
    }

    const depositHistoryEls = depositsForGoal.map((deposit)=>{
        return (
            <div
                key={deposit.id} 
                className="py-4 min-h-[4.625rem] flex items-center gap-[.625rem] relative not-last:border-b not-last:border-neutral-800"
            >
                <div className="h-10 w-10 bg-neutral-800 flex items-center justify-center rounded-full">
                    <Image src={DepositIcon} alt="Deposit" />
                </div>
                <div>
                    {deposit.note && <p className="text-[.875rem] leading-1.4 tracking-[-.3px] font-medium">{deposit.note}</p>}
                    <time className="text-[.875rem] leading-1.4 tracking-[-.3px] text-neutral-300 font-medium">{formatDate(deposit.created_at)}</time>
                </div>
                <p 
                    className="absolute top-1/2 right-0 -translate-y-1/2 font-semibold text-green-500 leading-1.4 tracking-[-.3px]">
                    +${formatCurrency(deposit.amount.toString())}
                </p>
            </div>
        )
    })

    const stylesInputs = clsx(`w-full bg-neutral-700 p-4 rounded-[.5rem] border
               placeholder:font-inherit placeholder:text-neutral-300`, error && "border-red-500", 
               !error && "border-neutral-500")
    
    const labelStyles = "flex flex-col gap-3"

    return (
         <>
            <section className="w-full max-w-[70rem] mx-auto">
                <div className="flex justify-between items-center gap-2">
                    <Link 
                        href={`/dashboard`}
                        className="flex items-center gap-[.375rem] text-neutral-400 py-2 md:py-3 rounded-full"
                    >
                        <Image src={BackIcon} alt=""/>
                        Back
                    </Link>
                    <div>
                        <button 
                            className="px-3 py-2 md:px-4 md:py-3 text-[1rem] text-neutral-300 hover:bg-neutral-800 hover:border hover:border-neutral-600 
                            md:text-neutral-0 leading-[1.5] tracking-[-.3px] font-medium rounded-full"
                            onClick={() => setUpdateModalOpen(true)}
                        >
                            Edit goal
                        </button>
                        <button
                            className="px-3 py-2 md:px-4 md:py-3 text-[1rem] text-red-500 leading-[1.5] tracking-[-.3px] font-medium rounded-full
                            hover:bg-neutral-800 hover:border hover:border-neutral-600"
                            onClick={() => setDeleteModalOpen(true)}
                        >
                            Delete Goal
                        </button>
                    </div>
                </div>
                <h1 
                    className="my-[.625rem] font-bri text-[2.75rem] md:text-[4rem] tracking-[-2px] font-semibold"
                >
                    {goal.name}
                </h1>
                <time 
                    className="mt-[.625rem] flex items-center gap-8 font-medium text-neutral-300 leading-[1.5] tracking-[-.3px]"
                >
                    {goal.deadline ? formatDateGoals(goal.deadline) : "No dealine"}
                    <span 
                        className="deadline-info relative before:content-[url('/images/dot.png')] before:absolute before:-top-[3px] before:-left-[18px]"
                    >
                        Created {formatDate(goal.created_at)}
                    </span>
                </time>
                <section className="2xl:grid 2xl:grid-cols-[1fr_393px] gap-12">
                    <section>
                    <div className={` mt-8 rounded-[.75rem] ${goal.saved_money >= goal.target ? "bg-linear-270 from-orange-400 to-orange-700 py-10 px-4 md:py-12 md:px-6" : 
                    "bg-neutral-800 border border-neutral-600 p-4 md:p-6"}`}
                    >
                        
                        {goal.saved_money >= goal.target ? (
                        <>
                            <div 
                                className="w-16 h-16 mb-10 rounded-full flex justify-center items-center bg-[rgba(255,255,255,0.3)] backdrop-blur-xl
                                shadow-complete-checkmark"
                            >
                                <Image src={Checkmark} alt="Checkmark" />
                            </div>
                            <p className="mt-6 font-bri text-[4rem] font-semibold tracking-[-2px]">{(goal.saved_money/goal.target*100).toFixed()}%</p>
                            <h2 className="text-[2rem] font-bold leading-[1.2]">
                                Goal Complete
                            </h2>
                            <p
                                className="mt-[.625rem] font-medium leading-[1.5] tracking-[-.3px]"
                            >
                                You saved ${formatCurrency(goal.target.toString())} across {depositsForGoal.length} deposits. {getFinishedGoalText(goal.deadline)}
                            </p>
                            <div className="mt-10 grid grid-cols-[97px_1fr] md:grid-cols-[132px_1fr]">
                                <div className="flex flex-col gap-2">
                                    <p className="text-[2rem] leading-[1.2] font-bold">5</p>
                                    <p className="uppercase leading-[1.5] tracking-[-.3px] font-medium">Deposits</p>
                                </div>
                                <div className="flex flex-col gap-2 pl-6 md:pl-8 border-l border-[rgba(255,255,255,0.3)]">
                                    <p className="text-[2rem] leading-[1.2] font-bold">${formatCurrency(goal.target.toString())}</p>
                                    <p className="uppercase leading-[1.5] tracking-[-.3px] font-medium">Total saved</p>
                                </div>
                            </div>
                        </>
                        ) : (
                        <>
                            <div className="detail-upper flex justify-between items-center mb-6">
                                <p 
                                    id={id}
                                    className="font-bri font-semibold text-[2.75rem] md:text-[4rem] tracking-[-2px]"
                                >
                                    {(goal.saved_money/goal.target*100).toFixed()}%
                                </p>
                                <p 
                                    className="text-neutral-300 font-semibold leading-[1.4] tracking-[-.3px] md:text-[1.25rem]"
                                >
                                    ${formatCurrency((goal.target-goal.saved_money).toString())} remaining
                                </p>
                            </div>
                            <progress aria-labelledby={id} value={(goal.saved_money/goal.target *100).toFixed()} max={100}>You&apos;ve saved {(goal.saved_money/goal.target).toFixed()}% of your target amnount.</progress>
                            <div className="mt-4 flex justify-between">
                                <div className="flex flex-col gap-1 text-[.875rem] leading-[1.4] tracking-[-.3px] font-medium">
                                    <p>${formatCurrency(goal.saved_money.toString())}</p>
                                    <p className="text-neutral-300">Saved so far</p>
                                </div>
                                <div className="flex flex-col gap-1 text-[.875rem] leading-[1.4] tracking-[-.3px] font-medium text-right">
                                    <p>of ${formatCurrency(goal.target.toString())}</p>
                                    <p className="text-neutral-300">Target</p>
                                </div>
                            </div>
                        </>)}
                    </div>
                    {goal.saved_money < goal.target && (
                    <form 
                        className="mt-6 p-4 md:p-6 flex flex-col gap-6 rounded-[.75rem] bg-neutral-800 border border-neutral-600"
                        action={submitAction}
                        aria-label="This form's purpose is to add deposits to your goal."
                    >
                        <h2 className="md:mb-1 text-[1.25rem] leading-[1.2] tracking-[-.3px] font-semibold">Add deposit</h2>
                        <label className={labelStyles}>
                            Amount
                            <div 
                                style={amount === "" || parseFloat(amount) <= 0 ? {color: "var(--neutral-300)"} : undefined}
                                className={`amount-preview flex items-center gap-3 cursor-pointer relative ${stylesInputs}`}
                               
                            >
                                <input
                                    className="sr-only"
                                    type="number"
                                    name="deposit-amount"
                                    value={amount}
                                    onChange={(e)=> setAmount(calcSetAmount(e.target.value))}
                                    min="0"
                                    max={difference < 10000000 ? difference.toString() : "10000000"} 
                                    step="0.01"
                                    aria-required="true"
                                 />
                                <Image src={DollarIcon} alt="Dollar sign" />
                                <span>{formatCurrency(amount)}</span>
                            </div>
                        </label>
                        <label className={labelStyles}>
                            Note (optional)
                            <textarea
                                className={`${stylesInputs} resize-none`}
                                name="note"
                                maxLength={150}
                                rows={2}
                                placeholder="e.g Monthly savings"
                            >
                            </textarea>
                        </label>
                        {error && (
                        <p className="error" role="alert">
                            <Image src={InfoCircle} alt="" />
                            {error.message}
                        </p>
                        )}
                        <div>
                            <button 
                                type="submit" 
                                className="w-full flex items-center justify-center
                                    bg-orange-400 text-neutral-900 hover:bg-orange-500 rounded-full font-semibold mt-3 h-14 md:mt-1"
                                aria-busy={isPending}
                                disabled={isPending}
                            >
                                Add funds
                            </button>
                        </div>
                    </form> 
                    )} 
                    </section>
                    <section className="mt-8">
                        <div className="border-b border-neutral-800 flex justify-between items-center gap-2 pb-4">
                            <h2 className="text-[1.25rem] leading-[1.2] tracking-[-.3px] font-semibold">Deposit history</h2>
                            <p
                                className="text-[.875rem] leading-[1.4] tracking-[-.3px] font-medium text-neutral-300"
                            >
                                {depositsForGoal.length} deposit{depositsForGoal.length !== 1 ? "s" : ""} </p>
                        </div>
                        {depositHistoryEls}
                    </section>
                </section>
            </section>
            {updateModalOpen && (<GoalModalUpdate
                setIsGoalModalOpen={setUpdateModalOpen}
                goalId={goalId?.toString()|| ""}
                defaultName={goal.name}
                defaultAmount={goal.target.toString()}
                defaultDeadline={goal.deadline}
            />)}
            {deleteModalOpen && (<DeleteModal
                setModalOpen={setDeleteModalOpen}
                goalId={goalId?.toString() || ""}
                goalName={goal.name}
            />)}
        </>
    )
}