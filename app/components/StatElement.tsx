export default function StatElement({maxStat, savedAmount, name }: 
    {maxStat: number, savedAmount: number, name: string}){
    return(
        <div className="flex flex-col items-center min-w-[2.823125rem] md:w-21 grow">
            <div className="w-full h-36 flex flex-column-reverse">
                <div 
                    className="w-full bg-orange-400 rounded-[max(.5rem, 3%)]"
                    aria-hidden="true"
                    style={{height: `${maxStat !== 0 ? savedAmount/maxStat * 100 : 0}%`}}>
                </div>
            </div>
            <p 
                className="overflow-x-hidden mt-[.625rem] text-[.875rem] text-neutral-300 text-[calc(11rem/16)] 
                font-semibold md:font-medium leading-[1.2] md:leading-[1.4] md:tracking-[-.3px]"
            >
                ${savedAmount.toFixed()}
            </p>
            <p 
                className="mt-4 text-[calc(11rem/16)] font-semibold md:font-medium 
                leading-[1.2] md:leading-[1.5] md:tracking-[-.3px]"
            >
                {name}
            </p>
        </div>
    )
}