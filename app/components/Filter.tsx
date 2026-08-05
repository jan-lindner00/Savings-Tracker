import Image from "next/image"
import {useState, useEffect, useId, useRef} from "react"
import FilterIcon from "@/public/images/icon-filter.svg"
import { filterCategories } from "@/app/lib/utils"
import { usePathname, useSearchParams, useRouter } from "next/navigation"

export default function Filter(){
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const {push, replace} = useRouter()
    const id = useId()
    const [open, setOpen] = useState<boolean>(false)
    const freshLoad = useRef<boolean>(true)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLFormElement>(null)
    const filterBy = searchParams.get("filter_by")?.toLowerCase() || "all"
    
    function setFilterBy(e: React.ChangeEvent<HTMLInputElement>){
        const urlSearchParams = new URLSearchParams(searchParams)
        urlSearchParams.set("filter_by", e.target.value)
        push(`${pathname}?${urlSearchParams.toString()}`, {scroll:false})
    }

    useEffect(()=>{
        const allowedSearch = ["all", "in_progress", "completed", "not_started"]
        if(!allowedSearch.includes(filterBy)){
            const urlSearchParams = new URLSearchParams(searchParams)
            urlSearchParams.delete("filter_by")
            replace(`${pathname}?${urlSearchParams.toString()}`)
        }
    }, [searchParams])

    useEffect(()=>{
        if(freshLoad.current){
            freshLoad.current = false
            return
        }
        if(open){
            dropdownRef.current?.focus()
        }else{
            buttonRef.current?.focus()
        }
    }, [open])

    const filterRadioEls = filterCategories.map((cat)=>{
        return (
        <label 
            data-filter
            key={cat.value}
            className="p-2 peer w-full relative flex items-center gap-3 rounded-[.5rem] hover:bg-neutral-700"
        >
            <div 
                data-filter
                aria-hidden
                className="radio-btn w-2 h-2 rounded-full shadow-radio"
            >
            </div>
            {cat.text}
            <input
                data-filter
                type="radio"
                onChange={setFilterBy}
                aria-label={cat.aria}
                checked={cat.value === filterBy}
                value={cat.value}
                name="filter"
                className="sr-only"
            />
        </label>)
    })

    useEffect(()=>{
        const closeDropdown = (e: PointerEvent)=> {
            if(!(e.target instanceof HTMLElement)){
                return
            }
            if(e.target.dataset.filter){
                return
            }
            setOpen (false)
        }
        document.body.addEventListener("click", closeDropdown)

        return () => { document.body.removeEventListener("click", closeDropdown)}
    }, 
    [])

    return (
        <div className="relative text-[1rem] leading-[1.5] tracking-[-.3px] font-medium">
            <button 
                className="w-[163.5px] md:w-[7.25rem] h-12 flex justify-center items-center gap-[.625rem]
                bg-neutral-800 border border-neutral-600 rounded-full"
                ref={buttonRef}
                aria-label="Filter goals"
                onClick={()=> setOpen(prev => !prev)}
                aria-controls={id}
                aria-expanded={open}
            >
                <Image src={FilterIcon} alt="" />
                Filters
            </button>
            {open && (
                <form
                    ref={dropdownRef}
                    data-filter
                    id={id}
                    tabIndex={0}
                    className="absolute z-1 bottom-0 left-0 md:left-[initial] right-0 max-xs:w-full translate-y-[calc(100%_+_.5rem)] rounded-[.75rem] w-70 p-4 bg-neutral-800 
                    border border-neutral-700"
                    aria-label="This form is for filtering your goals. Select the criteria by which your goals will be filtered."
                    onKeyDown={(e)=>{
                        if(e.key === "Escape"){
                            setOpen(false)
                        }
                    }}
                    onBlur={(e)=>{
                        if(!dropdownRef.current?.contains(e.relatedTarget)){
                            setOpen(false)
                        }
                    }}
                >
                    <h3
                        data-filter
                        className="uppercase text-neutral-300 text-[.875rem] leading-[1.4]"
                    >    
                        Filter by status
                    </h3>
                    <label
                        data-filter
                        className="peer mt-2 p-2 w-full relative flex flex-row items-center gap-3 rounded-[.5rem] hover:bg-neutral-700"
                    >
                        <div
                        data-filter 
                        className="radio-btn w-2 h-2 rounded-full shadow-radio" aria-hidden></div>
                        All goals
                        <input
                            data-filter
                            type="radio"
                            value="all"
                            name="filter"
                            onChange={() => {
                                const urlSearchParams = new URLSearchParams(searchParams)
                                urlSearchParams.delete("filter_by")
                                push(`${pathname}?${urlSearchParams.toString()}`, {scroll:false})
                            }}
                            aria-label="Show all goals. Don't filter."
                            checked={filterBy === "all"}
                            className="sr-only"
                        />
                    </label>
                    {filterRadioEls}
                </form>
            )}
        </div>
    )
}