import Image from "next/image"
import {useState, useEffect, useRef, useId} from "react"
import SortIcon from "@/public/images/icon-sort.svg"
import { sortCategories } from "@/app/lib/utils"
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
    const sortBy = searchParams.get("sort_by")?.toLowerCase() || "recent"
    
    function setSortBy(e: React.ChangeEvent<HTMLInputElement>){
        const urlSearchParams = new URLSearchParams(searchParams)
        urlSearchParams.set("sort_by", e.target.value)
        push(`${pathname}?${urlSearchParams.toString()}`, {scroll: false})
    }

    useEffect(()=>{
        const allowedSearch = ["recent", "deadline", "progress_desc", "progress_asc", "amount_saved", "alphabetical"]
        if(!allowedSearch.includes(sortBy)){
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

    useEffect(()=>{
        const closeDropdown = (e: PointerEvent)=> {
            if(!(e.target instanceof HTMLElement)){
                return
            }
            if(e.target.dataset.sort || e.target.parentElement?.dataset.sort){
                return
            }
            setOpen (false)
        }
        document.body.addEventListener("click", closeDropdown)

        return () => { document.body.removeEventListener("click", closeDropdown)}
    }, 
    [])

    const sortRadioEls = sortCategories.map((cat)=>{
        return (
            <label 
                data-sort
                key={cat.value}
                className="p-2 peer w-full relative flex items-center gap-3 rounded-[.5rem] hover:bg-neutral-700"
            >
                <div 
                    data-sort
                    aria-hidden
                    className="radio-btn w-2 h-2 rounded-full shadow-radio"
                >
                </div>
                {cat.text}
                <input
                    data-sort
                    type="radio"
                    onChange={setSortBy}
                    aria-label={cat.aria}
                    checked={cat.value === sortBy}
                    value={cat.value}
                    name="sort"
                    className="sr-only"
                />
            </label>
        )
    })

    return (
        <div className="relative text-[1rem] leading-[1.5] tracking-[-.3px] font-medium">
            <button 
                className="w-[163.5px] md:w-[7.25rem] h-12 flex justify-center items-center gap-[.625rem]
                bg-neutral-800 border border-neutral-600 rounded-full"
                ref={buttonRef}
                aria-label="Sort goals"
                onClick={()=> setOpen(prev => !prev)}
                aria-controls={id}
                aria-expanded={open}
            >
                <Image src={SortIcon} alt="" />
                Sort by
            </button>
            {open && (
                <form
                    ref={dropdownRef}
                    data-sort
                    id={id}
                    tabIndex={0}
                    className="absolute z-1 bottom-0 right-0 sm:right-[initial] sm:left-0 md:left-[initial] md:right-0
                    max-xs:w-full translate-y-[calc(100%_+_.5rem)] rounded-[.75rem]
                     w-70 p-4 bg-neutral-800 border border-neutral-700"
                    aria-label="This form is for sorting your goals. Select the criteria by which your goals will be sorted."
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
                        data-sort
                        className="uppercase text-neutral-300 text-[.875rem] leading-[1.4]"
                    >    
                        Sort by
                    </h3>
                    <label
                        data-sort
                        className="peer mt-2 p-2 w-full relative flex flex-row items-center gap-3 rounded-[.5rem] hover:bg-neutral-700"
                    >
                        <div
                            data-sort 
                            className="radio-btn w-2 h-2 rounded-full shadow-radio" aria-hidden
                        >
                        </div>
                        Recently added
                        <input
                            data-sort
                            type="radio"
                            value="recent"
                            name="sort"
                            onChange={() => {
                                const urlSearchParams = new URLSearchParams(searchParams)
                                urlSearchParams.delete("sort_by")
                                push(`${pathname}?${urlSearchParams.toString()}`, {scroll:false})
                            }}
                            aria-label="Sort by most recent."
                            checked={sortBy === "recent"}
                            className="sr-only"
                        />
                    </label>
                    {sortRadioEls}
                </form>
            )}
        </div>
    )
}