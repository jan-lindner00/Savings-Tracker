import Link  from "next/link";
import { formatDateGoals, formatCurrencyGoals as formatCurrency } from "@/app/lib/utils";

export default function GoalCard({id, name, deadline, target, saved_money}:{id: string, name: string, deadline: string | null, target: number, saved_money: number, searchParams: string}){
    const dealineText = deadline === null ? "No deadline" : formatDateGoals(deadline) 
    const percentage = (saved_money/target * 100).toFixed()

    return (
        <Link href={`/dashboard/goals/${id}`} className={`goal-card bg-[url("/images/pattern-grid.svg")] bg-neutral-800 rounded-[1rem] border border-neutral-600 p-4
         ${saved_money === target ? "completed" : ""}`}>
            <div className="flex justify-between items-start gap-2">
                <h2
                    className="text-[1.25rem] leading-[1.2] font-semibold tracking-[-.3px]"
                >
                    {name}
                </h2>
                {saved_money === target && (
                    <p 
                        className="mt-0 text-green-500 bg-green-900 py-1 px-[.625rem] rounded-full shadow-complete-label"
                    >
                        Completed
                    </p>
                )}
            </div>
            <div className="mt-19">
                <label 
                    className={`flex flex-col gap-4 text-orange-400 font-semibold text-[2.75rem] tracking-[-.3px] ${saved_money === 0 ? "not-started" : ""}`}>
                    {percentage}%
                    <progress value={percentage} max={100}>You&apos;ve saved {percentage}% of your target amnount.</progress>
                </label>
                <div 
                >
                    <p 
                        className="mt-4 flex items-center gap-5 text-[.875rem] text-medium tracking-[-.3px] leading-[1.4]"
                    >
                        ${formatCurrency(saved_money)} of ${formatCurrency(target)} 
                        <time className="text-neutral-300 relative before:absolute before:content-[url('/images/dot.png')] before:-top-[2px] before:-left-3">
                            {dealineText}
                        </time>
                    </p>
                </div>
            </div>
        </Link>
    )
}