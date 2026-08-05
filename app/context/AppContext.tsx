"use client"
import {createContext, useState, useMemo} from "react"

export const AppContext = createContext({showGoalModal: false, setShowGoalModal: (val: boolean) => {}})

export default function AppContextProvider({children}: {children: React.ReactNode}){
    const [showGoalModal, setShowModal] = useState<boolean>(false)
    
    function setShowGoalModal(val: boolean){
        setShowModal(val)
    }

    const context = useMemo(()=>{
        return {
            showGoalModal,
            setShowGoalModal
        }
    }, [showGoalModal, setShowGoalModal])

    return (
        <AppContext.Provider value={context}>
            {children}
        </AppContext.Provider>
    )
}