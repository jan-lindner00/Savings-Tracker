import Image from "next/image"
import type { JSX } from "react"
import {Link, useParams, useLocation} from "react-router"
import {useState, useEffect, useRef, useActionState} from "react"
import type { Goal, Deposit } from "../layouts/AppLayout.tsx"
import supabase from "../../supabase-client.ts"
import { formatCurrency, formatDate, formatDateGoals} from "../../utils.ts"
import BackIcon from "../../assets/images/icon-chevron-left.svg"
import GoalModalUpdate from "./GoalModalUpdate.tsx"
import DeleteModal from "./DeleteModal.tsx"
import Loading from "./Loading.tsx"
import Checkmark from "../../assets/images/icon-checkmark.svg"
import DollarIcon from "../../assets/images/icon-dollar.svg"
import InfoCircle from "../../assets/images/icon-error.svg"
import DepositIcon from "../../assets/images/icon-arrow-down.svg"
import "../../css/goalDetail.css"
import {useMetadata} from "../../hooks/useMetadata.tsx"
import { Temporal } from "temporal-polyfill"
import FourOFour from "./FourOFour.tsx"

export default function GoalDetails(): JSX.Element{
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [showContent, setShowContent] = useState<boolean>(false)
    const [goal, setGoal] = useState<Goal | null>(null)
    const [depositsList, setDepositsList] = useState<Deposit[]>([])
    const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const [amount, setAmount] = useState<string>("")
    const [currencyError, setCurrencyError] = useState<string>("")
    const updateModalRef = useRef<HTMLDialogElement>(null)
    const deleteModalRef = useRef<HTMLDialogElement>(null)
    const params = useParams()
    const goalId = params.goalId
    const location = useLocation()
    const search = location.state?.search ? `?${location.state.search}` : ""
    const target = goal?.target || 0
    const savedMoney = goal?.saved_money || 0
    const difference = target - savedMoney
    
    useMetadata({title: "Savings Tracker | Goal Details", description: "See detailed information about your goal and add funds"})

    const [error, submitAction, isPending] = useActionState(async(_:unknown, formData: FormData): Promise< Error | null>=>{
        const note: FormDataEntryValue | null = formData.get("note")
        const depositAmount: FormDataEntryValue | null = formData.get("deposit-amount")

        if(typeof depositAmount !== "string" || note && typeof note !== "string"){
            console.error("Invalid form data")
            return new Error("Invalid form data")
        }

        if(depositAmount.trim().length === 0){
            console.error("Invalid form data. Deposit amount must not be empty.")
            return new Error("Invalid form data")
        }

        if(isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) > 10000000){
            console.error("Invalid form data: Target amount must be a positive number between 0 and 10,000,000")
            setCurrencyError("Deposit amount must be a positive number between 0 and 10,000,000")
            return new Error("Deposit amount must be a positive number between 0 and 10,000,000")
        }

        if(!goal){
            console.error("An unexpected error occured")
            setCurrencyError("")
            return new Error("An unexpected error occured")
        }

        if(parseFloat(depositAmount) > difference){
            console.error("Invalid form data: Deposit amount must not be greater than the difference between target amount and saved money")
            setCurrencyError(`Please enter a number that is smaller than or equal to $${formatCurrency(difference.toString())}`)
            return new Error(`Please enter a number that is smaller than or equal to $${formatCurrency(difference.toString())}`)
        }

        if(note && note.length > 150){
            console.error("Invalid form data. Note must not be longer than 150 characters.")
            return new Error("Note must not be longer than 150 characters.")
        }
        setCurrencyError("")

        try{
            const {error} = await supabase
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
                console.error("Error inserting deposit: ", error)
                return new Error(error)
            }else if(error instanceof Error){
                console.error("Error inserting deposit: ", error.message)
                return error
            }else{
                console.error("An unknown error occurred during inserting deposit")
                return new Error("An unknown error occurred during inserting deposit")
            }
        }
    }, null)

    useEffect(()=>{
        if(updateModalRef.current === null){
            return
        }
        if(!updateModalOpen){
            updateModalRef.current?.classList.remove("show")
            updateModalRef.current.close()
            return
        }
        updateModalRef.current.showModal()
        
    }, [updateModalOpen])

    useEffect(()=>{
        if(deleteModalRef.current === null){
            return
        }
        if(!deleteModalOpen){
            deleteModalRef.current.close()
            return
        }
        deleteModalRef.current.showModal()

    }, [deleteModalOpen])

    async function fetchGoals(): Promise<void>{
        try{
            const {error, data} = await supabase
                .from("goals")
                .select()
                .eq("id", goalId)
                .single()
            if(error){
                throw error
            }
            if(data){
                setGoal(data)
                return
            }
            setGoal(null)
        }catch(error: unknown){
            if(typeof error === "string"){
                console.error("Error fetching data: ", error)
            }else if(error instanceof Error){
                console.error("Error fetching data: ", error.message)
            }else{
                console.error("An unknown error occurred while fetching data.")
            }
            setGoal(null)
        } 
    }

    async function fetchDeposits(): Promise<void>{
        try{
            const {error, data} = await supabase
                .from("deposits")
                .select()
                .eq("goal_id", goalId)
                .order("created_at", {ascending: false})
            if(error){
                throw error
            }
            if(data){
                return setDepositsList(data)
            }
            setDepositsList([])
        }catch(error: unknown){
            if(typeof error === "string"){
                console.error("Error fetching deposits data: ", error)
            }else if(error instanceof Error){
                console.error("Error fetching data: ", error.message)
            }else{
                console.error("An unknown error occurred while fetching data.")
            }
            setDepositsList([])
        }   
    }

    function getFinishedGoalText(deadline: string | null): string{
        if(deadline === null || !(depositsList[0]?.created_at)){
            return ""
        }
        const lastDepositDate = Temporal.PlainDate.from(depositsList[0].created_at)
        const deadlineDate = Temporal.PlainDate.from(deadline)
        return Temporal.PlainDate.compare(lastDepositDate, deadlineDate) <= 0 ? ` Finished before your ${formatDateGoals(deadline, true)} deadline.` : (
            ` Didn't finish before your ${formatDateGoals(deadline, true)} deadline.`
        )
    }

    function handleDepositAmountChange(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void{
        if(e.target.value === ""){
           return setAmount("")
        }
        if(Number(e.target.value) > 10000000){
            return setAmount("10000000")
        }
        if(Number(e.target.value) > difference){
            return setAmount(difference.toString())
        }
        if(e.target.value.split(".").length === 2 && e.target.value.split(".")[1].length > 2){
            const amount = e.target.value.split(".")[0] + "." + e.target.value.split(".")[1].slice(0,2)
            return setAmount(amount)
        }
        if(e.target.value.endsWith(".") || e.target.value.endsWith(",")){
            return setAmount(e.target.value + "0")
        }
        setAmount(e.target.value)
    }

    useEffect(()=>{
        fetchGoals()
        fetchDeposits()
        const goalsChannel = supabase
            .channel("goaldetail-changes")
            .on(
                'postgres_changes',{
                    event: "*",
                    schema: "public",
                    table: "goals"
                },
                () =>{
                    fetchGoals()
                }
            )
            .subscribe()
        const depositsChannel = supabase
            .channel("depositdetail-changes")
            .on(
                'postgres_changes',{
                    event: "*",
                    schema: "public",
                    table: "deposits"
                },
                () =>{
                    fetchDeposits()
                }   
            )
            .subscribe()
       
        setIsLoading(false)

        return () => {
            supabase.removeChannel(goalsChannel)
            supabase.removeChannel(depositsChannel)
        }
    },[])

    useEffect(()=>{
        if(isLoading){
            return
        }
        const delay = setTimeout(()=>{
            setShowContent(true)
        }, 700)

        return () => clearTimeout(delay)
        
    }, [isLoading])

    const depositHistoryEls = depositsList.map((deposit)=>{
        return (
            <div
                key={deposit.id} 
                className="history"
            >
                <div>
                    <Image src={DepositIcon} alt="Deposit" />
                </div>
                <div>
                    {deposit.note && <p className="note">{deposit.note}</p>}
                    <time className="deposit-date">{formatDate(deposit.created_at)}</time>
                </div>
                <p>+${formatCurrency(deposit.amount.toString())}</p>
            </div>
        )
    })

    if(!showContent){
        return <Loading />
    }

    if(!goal){
        return <FourOFour logo={false} style={{height: "calc(100dvh - 82px)"}} text="Goal not Found" />
    }

    return (
         <>
            <section className="goal-detail">
                <div className="actions">
                    <Link to={`/dashboard${search}`}>
                        <Image src={BackIcon} aria-disabled="true"/>
                        Back
                    </Link>
                    <div>
                        <button 
                            className="edit-goal"
                            onClick={() => setUpdateModalOpen(true)}
                        >
                            Edit goal
                        </button>
                        <button
                            className="delete-goal"
                            onClick={() => setDeleteModalOpen(true)}
                        >
                            Delete Goal
                        </button>
                    </div>
                </div>
                <h1>{goal.name}</h1>
                <time className="deadline-info">
                    {goal?.deadline ? formatDateGoals(goal?.deadline) : "No dealine"}
                    <time>Created {formatDate(goal?.created_at)}</time>
                </time>
                <section>
                    <section>
                    <div className={`goal-detail-main ${goal.saved_money >= goal.target ? "completed" : ""}`}>
                        
                        {goal.saved_money >= goal.target ? (
                        <>
                            <div className="checkmark-container">
                                <Image src={Checkmark} alt="Checkmark" />
                            </div>
                            <p className="progress-100">{(goal.saved_money/goal.target*100).toFixed()}%</p>
                            <h2>Goal Complete</h2>
                            <p>You saved ${formatCurrency(goal.target.toString())} across {depositsList.length} deposits. {getFinishedGoalText(goal.deadline)}
                            </p>
                            <div>
                                <div>
                                    <p>5</p>
                                    <p>Deposits</p>
                                </div>
                                <div>
                                    <p>${formatCurrency(goal.target.toString())}</p>
                                    <p>Total saved</p>
                                </div>
                            </div>
                        </>
                        ) : (
                        <>
                            <div className="detail-upper">
                                <p id="progress-label">{(goal.saved_money/goal.target*100).toFixed()}%</p>
                                <p>${formatCurrency((goal.target-goal.saved_money).toString())} remaining</p>
                            </div>
                            <progress aria-labelledby="progress-label" value={(goal.saved_money/goal.target *100).toFixed()} max={100}>You've saved {(goal.saved_money/goal.target).toFixed()}% of your target amnount.</progress>
                            <div className="lower-detail">
                                <div>
                                    <p>${formatCurrency(goal.saved_money.toString())}</p>
                                    <p>Saved so far</p>
                                </div>
                                <div>
                                    <p>of ${formatCurrency(goal.target.toString())}</p>
                                    <p>Target</p>
                                </div>
                            </div>
                        </>)}
                    </div>
                    {goal.saved_money < goal.target && (
                    <form 
                        className="deposit-form"
                        action={submitAction}
                        aria-label="This form's purpose is to add deposits to your goal."
                    >
                        <h2>Add deposit</h2>
                        <label>
                            Amount
                            <div 
                                style={amount === "" || parseFloat(amount) <= 0 ? {color: "var(--neutral-300)"} : undefined}
                                className="amount-preview"
                               
                            >
                                <input
                                    type="number" 
                                    name="deposit-amount"
                                    value={amount}
                                    onChange={handleDepositAmountChange}
                                    min="0"
                                    max={difference < 10000000 ? difference.toString() : "10000000"} 
                                    step="0.01"
                                    aria-required="true"
                                    onKeyDown={(e)=>{
                                        if(e.key === "Backspace" || e.key === "Delete"){ 
                                            setAmount(prevAmount => {
                                                const newAmount = prevAmount.length > 1 ? prevAmount[prevAmount.length-1] === "." || prevAmount[prevAmount.length-1] === "," ? prevAmount.slice(0, -2) :  prevAmount.slice(0, -1) : ""
                                                return newAmount
                                            })
                                        }
                                        if(e.key === "Tab" || e.shiftKey && e.key === "Tab"){
                                            return
                                        }
                                        if(e.key === "." && !(amount.includes("."))){
                                            return
                                        }else if(e.key === "." && amount.includes(".")){
                                            e.preventDefault()
                                            return
                                        }
                                        if(["0","1","2","3","4","5","6","7","8","9"].includes(e.key)){
                                            return
                                        }
                                        e.preventDefault()
                                    }}
                                    aria-invalid={currencyError !== ""}
                                    style={currencyError !== "" ? {borderColor: "var(--red-500)"} : undefined}
                                />
                                <Image src={DollarIcon} alt="Dollar sign" />
                                <span>{formatCurrency(amount)}</span>
                            </div>
                        </label>
                        <label>
                            Note (optional)
                            <input
                                name="note"
                                type="text"
                                maxLength={150}
                                placeholder="e.g Monthly savings"
                            >
                            </input>
                        </label>
                        {error && (
                        <p className="flex items-center gap-[.375rem] leading-[1.5] tracking-[-.3px] text-red-500" role="alert">
                            <Image src={InfoCircle} aria-disabled={true} />
                            {error.message}
                        </p>
                        )}
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-btn add-deposit"
                                aria-busy={isPending}
                                disabled={isPending}
                            >
                                Add funds
                            </button>
                        </div>
                    </form> 
                    )} 
                    </section>
                    <section className="deposit-history">
                        <div>
                            <h2>Deposit history</h2>
                            <p>{depositsList.length} deposit{depositsList.length !== 1 ? "s" : ""} </p>
                        </div>
                        {depositHistoryEls}
                    </section>
                </section>
            </section>
            <GoalModalUpdate
                setIsGoalModalOpen={setUpdateModalOpen}
                goalId={goalId || "a"}
                defaultName={goal?.name}
                defaultAmount={goal?.target.toString()}
                defaultDeadline={goal?.deadline}
            />
            <DeleteModal
                setModalOpen={setDeleteModalOpen}
                goalId={goalId}
                goalName={goal.name}
            />
        </>
    )
}