import { useContext } from "react";
import { AppContext } from "@/app/context/AppContext";

export function useAppContext(){
    return useContext(AppContext)
}