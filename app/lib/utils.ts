import supabaseClient from "@/app/lib/supabase/client"; 
import { withScope, captureException } from "@sentry/nextjs";
import {  PostgrestError } from "@supabase/supabase-js";
import { Temporal } from "@js-temporal/polyfill";

export async function trySupabase<T>(operation: () => PromiseLike<{data: T | null, error: PostgrestError | null}>):
 Promise<{success: boolean, data?: T | undefined, error?: string | undefined  }>
{
    try{
        const {data, error} = await operation()
        if(error){
            const expectedCodes = ["PGRST116"]
            const isExpected = expectedCodes.includes(error.code)

            if(!isExpected){
                withScope(scope => {
                    scope.setTag("supabase.code", error.code)
                    scope.setContext("supabase_error", {...error})
                    scope.setLevel("error")
                    captureException(new Error(error.message))
                })

                return {success: false, error: error.message}
            }
        }
        if(data === null){
            return { success: false, error: "No data returned"}
        }
        return {success: true, data}
    }catch(error){
        captureException(error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }
    }
}

export async function fetchGoals() {
    const {success, data, error} = await trySupabase(() => (
        supabaseClient
            .from("goals")
            .select()
        )
    ) 
    if(!success || error){
        return null
    }
    return data
}

export async function fetchDeposits() {
    const {success, data, error} = await trySupabase(()=>(
        supabaseClient
        .from("deposits")
        .select()
        .order("created_at", {ascending: false})
    ))
     
    if(!success || error){
        return null
    }
    return data
} 

export function formatCurrency(amount: string): string{
    const numericAmount = parseFloat(amount)
    if(isNaN(numericAmount) || numericAmount <= 0){
        return "0.00"
    }
    const formattedAmount = `${parseFloat(numericAmount.toFixed(2)).toLocaleString("en-US")}`
    if(!formattedAmount.includes(".")){
        return formattedAmount + ".00"
    }
    if(formattedAmount.includes(".") && formattedAmount.split(".")[1].length < 2){
        return formattedAmount + "0"
    }
    return formattedAmount
}

export function isSafeNext(next: string | null): string {
  if (!next) return '/dashboard'
  if (!next.startsWith('/')) return '/dashboard'
  if (next.startsWith('//') || next.startsWith('/\\')) return '/dashboard'
  return next
}

export function getInitials(name:string | undefined){
    if(!name){
        return "G"
    }
    if(name.split(" ").length === 1){
        return name[0].toUpperCase()
    }
    const names = name.split(" ")
    return (names[0][0] + names[names.length-1][0]).toUpperCase()
}

export function getDateString(deadlineDate: Date | null): string{
    const selectedDate = deadlineDate?.toISOString().split("T")[0]
    if(selectedDate){
        return formatDate(selectedDate)
    }else{
        return ""
    }
}

export function getMinDeadline(): string{
    const today = Temporal.Now.plainDateISO()
    const year = today.year
    const month = today.month
    const day = today.day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

export function formatDate(dateString: string): string{
    const date = Temporal.PlainDate.from(dateString)
    const monthName = monthNames[date.month-1]
    const day = date.day
    const year = date.year
    return `${monthName} ${day}, ${year}`
}

export function formatDateGoals(dateString: string, detail=false): string{
    const dateNow = Temporal.Now.plainDateISO()
    const deadline = Temporal.PlainDate.from(dateString)
    const monthName = monthNames[deadline.month-1]
    const day = deadline.day
    const year = deadline.year

    if(detail){
        return `${day} ${monthName} ${year}`
    }

    if(Temporal.PlainDate.compare(dateNow, deadline) === -1){
        return `Due ${day} ${monthName} ${year}`
    }
    if(Temporal.PlainDate.compare(dateNow, deadline) === 1){
        return "Deadline expired"
    }
    if(dateNow.equals(deadline)){
        return "Due today"
    }

    return "Deadline expired"
}

export function adjustForTimezone(date:Date | null):Date | null{
    if(date === null){
        return null
    }
    const timeOffsetInMS:number = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() - timeOffsetInMS);
    return date
}

export function formatCurrencyGoals(amount: number): string{
    return `${parseFloat(amount.toFixed()).toLocaleString("en-US")}`
}

export function calcSetAmount(amount: string): string{
    if(amount === ""){
        return ""
    }
    if(parseFloat(amount) > 10000000){
        return "10000000"
    }
    if(amount.split(".")[1]?.length > 2){
        return [amount.split(".")[0], amount.split(".")[1].slice(0, 2)].join(".")
    }
    if(amount.includes(".")){
        return [amount.split(".")[0], amount.split(".")[1]].join(".")
    }
    return amount  
}

const monthNames: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const filterCategories = [
    {
        text: "In progress",
        value: "in_progress",
        aria: "Show all goals that are in progress."
    },
    {
        text: "Completed",
        value: "completed",
        aria: "Show all goals that are completed."
    },
    {
        text: "Not started",
        value: "not_started",
        aria: "Show all goals that you haven't started."
    }
]

export const sortCategories = [
    {
        text: "Deadline (soonest first)",
        value: "deadline",
        aria: "Sort by deadline. Soonest deadline first."
    },
    {
        text: "Progress (highest first)",
        value: "progress_desc",
        aria: "Sort by process in descending order."
    },
    {
        text: "Progress (lowest first)",
        value: "progress_asc",
        aria: "Sort by process in ascending order."
    },
    {
        text: "Amount saved",
        value: "amount_saved",
        aria: "Sort by the amount saved for your goal."
    },
    {
        text: "Alphabetical (A-Z)",
        value: "alphabetical",
        aria: "Sort by alphabetic order (A-Z)."
    }
]

export const quotes = [
  {
    author: "Benjamin Franklin",
    quote: "A penny saved is a penny earned."
  },
  {
    author: "Benjamin Franklin",
    quote: "Beware of little expenses; a small leak will sink a great ship."
  },
  {
    author: "Thomas Jefferson",
    quote: "Never spend your money before you have it."
  },
  {
    author: "Warren Buffett",
    quote: "Do not save what is left after spending, but spend what is left after saving."
  },
  {
    author: "Warren Buffett",
    quote: "Price is what you pay. Value is what you get."
  },
  {
    author: "Epictetus",
    quote: "Wealth consists not in having great possessions, but in having few wants."
  },
  {
    author: "Proverb",
    quote: "The art is not in making money, but in keeping it."
  },
  {
    author: "W. Clement Stone",
    quote: "Saving is a great habit."
  },
  {
    author: "Japanese Proverb",
    quote: "Money grows on the tree of persistence."
  },
  {
    author: "Kin Hubbard",
    quote: "The safest way to double your money is to fold it over once and put it in your pocket."
  },
  {
    author: "Will Rogers",
    quote: "Too many people spend money they earned to buy things they don't want."
  },
  {
    author: "Dave Ramsey",
    quote: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make."
  },
  {
    author: "P. T. Barnum",
    quote: "Money is a terrible master but an excellent servant."
  },
  {
    author: "Charles A. Jaffe",
    quote: "It's not your salary that makes you rich, it's your spending habits."
  },
  {
    author: "Unknown",
    quote: "Save today, enjoy tomorrow."
  }
];