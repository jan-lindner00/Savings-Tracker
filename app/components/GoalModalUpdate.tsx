import Image from "next/image"
import {useState, useActionState, useRef, useEffect} from "react"
import type {Dispatch, SetStateAction} from "react"
import {adjustForTimezone, formatCurrency, calcSetAmount, getMinDeadline, getDateString} from "@/app/lib/utils"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import supabaseClient from "@/app/lib/supabase/client"
import InfoCircle from "@/public/images/icon-error.svg"
import CloseIcon from "@/public/images/icon-cross.svg"
import DollarIcon from "@/public/images/icon-dollar.svg"
import CalendarIcon from "@/public/images/icon-calendar.svg"
import { Temporal } from "@js-temporal/polyfill"
import clsx from "clsx"

export default function GoalModalUpdate({ setIsGoalModalOpen, goalId, defaultName, defaultAmount, defaultDeadline}: 
    {
        setIsGoalModalOpen: Dispatch<SetStateAction<boolean>>, goalId: string, defaultName: string, defaultAmount: string, 
        defaultDeadline: string | null
    }
){
    const [deadlineDate, setDeadlineDate] = useState<Date | null>(defaultDeadline ? new Date(defaultDeadline) : null)
    const [amount, setAmount] = useState<string>(defaultAmount)
    const amountInputRef = useRef<HTMLInputElement>(null)
    const datepreviewRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDialogElement | null>(null)

    useEffect(()=>{
        modalRef.current?.showModal()
    }, [])

    const [error, submitAction, isPending] = useActionState(async(_: unknown, formData: FormData): Promise<Error | null> => {
        const goalName: FormDataEntryValue | null = formData.get("goal-name")
        const targetAmount: FormDataEntryValue | null = formData.get("target-amount")
        const deadline: string | null = !deadlineDate ? null : `${deadlineDate.getFullYear()}-${(deadlineDate.getMonth() + 1).toString().padStart(2, '0')}-${deadlineDate.getDate().toString().padStart(2, '0')}`

        if(typeof goalName !== "string" || typeof targetAmount !== "string"){
            return new Error("Invalid form data")
        }

        if(goalName.trim().length === 0 || goalName.trim().length > 100){
            return new Error("Goal name must be between 1 and 100 characters")
        }

        if(isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0 || parseFloat(targetAmount) > 10000000){
            return new Error("Target amount must be a positive number between 0 and 10,000,000")
        }

        if(deadline && Temporal.PlainDate.compare(Temporal.PlainDate.from(deadline), Temporal.Now.plainDateISO()) === -1){
            return new Error("Deadline must be a future date")
        }

        try{
            const {error} = await supabaseClient
                .from("goals")
                .update({
                    name: goalName.trim(),
                    target: parseFloat(targetAmount),
                    deadline: deadline || null,
                })
                .eq("id", goalId)
            if(error){
                throw error
            }
            setAmount("")
            setDeadlineDate(null)
            setIsGoalModalOpen(false)
            return null
        }catch(error: unknown){
            if(typeof error === "string"){
                return new Error(error)
            }else if(error instanceof Error){
                return error
            }else{
                return new Error("An unknown error occurred during inserting goal ")
            }
        }
    }, null)


    function closeModal(): void{
        setIsGoalModalOpen(false)
    }

    const stylesInputs = clsx(`w-full bg-neutral-700 p-4 rounded-[.5rem] border
                   placeholder:font-inherit placeholder:text-neutral-300`, error && "border-red-500", 
                   !error && "border-neutral-500")
        
    const labelStyles = "flex flex-col gap-3"

    return(
        <dialog 
            aria-label={`Edit goal ${defaultName}`}
            ref={modalRef}
            tabIndex={0}
            className="py-5 px-4 md:p-8 relative rounded-[1rem] bg-neutral-800 border border-neutral-600
            w-[calc(100vw-2rem)] h-fit max-w-[42.5rem] mx-auto mt-[50dvh] -translate-y-1/2"
            onKeyDown={(e)=>{
                if(e.key === "Escape"){
                    e.preventDefault()
                    setIsGoalModalOpen(false)
                }
            }}
        >
            <div className="flex flex-col gap-6 text-neutral-0">
                <h2 className="font-[1.5rem] leading-[1.2] font-semibold tracking-[-.3px]">Edit goal</h2>
                <button  aria-label="Close modal" className="absolute top-[1.5625rem] right-[1.5625rem] rounded-full" onClick={closeModal}>
                    <Image src={CloseIcon} alt=""/>
                </button>
                <hr className="grow border-b border-neutral-700" />
                <form className="flex flex-col gap-5" action={submitAction}>
                    <label className={labelStyles}>
                        Goal name
                        <input
                            className={stylesInputs}
                            type="text"
                            name="goal-name"
                            maxLength={100}
                            aria-required="true"
                            defaultValue={defaultName}
                            required />
                    </label>
                    <label className={labelStyles}>
                        Target amount
                        <div 
                            style={amount === "" || parseFloat(amount) <= 0 ? {color: "var(--color-neutral-300)"} : undefined}
                            className={`amount-preview flex items-center gap-3 cursor-pointer relative ${stylesInputs}`}
                            onClick={() => amountInputRef.current?.focus()}
                        >
                            <input
                                className="sr-only"
                                ref={amountInputRef}
                                type="number" 
                                name="target-amount"
                                value={amount}
                                onChange={(e)=> setAmount(calcSetAmount(e.target.value))}
                                min="0"
                                max="10000000" 
                                step="0.01"
                                required
                                placeholder="0.00"
                                aria-required="true"
                                style={error ? {borderColor: "var(--color-red-500)"} : undefined}
                            />
                            <Image src={DollarIcon} alt="Dollar sign" />
                            <span>{formatCurrency(amount)}</span>
                        </div>
                    </label>
                    <label className={labelStyles}>
                        Deadline (optional)
                        <DatePicker
                            selected={deadlineDate || adjustForTimezone(new Date(new Date().setMonth(new Date().getMonth()-1)))}
                            onChange={(date: Date | null) => setDeadlineDate(adjustForTimezone(date))}
                            minDate={new Date(getMinDeadline())}
                            tabIndex={0}
                            timeZone="UTC"
                            customInput={(
                                <div
                                    ref={datepreviewRef}
                                    className={`amount-preview flex items-center gap-3 cursor-pointer relative ${stylesInputs}`}
                                    style={error ? {borderColor: "var(--red-500)"} : undefined}
                                >
                                    <Image src={CalendarIcon} alt="Calendar icon" />
                                    <time>{getDateString(deadlineDate) || "Select a date"}</time>
                                    </div>)
                            }
                        />
                        
                    </label>
                    {error && (
                    <p className="flex items-center gap-[.375rem] leading-[1.5] tracking-[-.3px] text-red-500" role="alert">
                        <Image src={InfoCircle} alt=""/>
                        {error.message}
                    </p>
                    )}
                    <div className="fself-end flex justify-end gap-4 font-medium leading-[1.5] tracking-[-.3px]">
                        <button 
                            type="button" 
                            className="py-3 px-5 rounded-full bg-neutral-700 hover:bg-neutral-600 text-neutral-0 border border-neutral-600"
                            aria-busy={isPending}
                            disabled={isPending}
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="py-3 px-5 rounded-full bg-orange-400 hover:bg-orange-500 text-neutral-900"
                            aria-busy={isPending}
                            disabled={isPending}
                        >
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}