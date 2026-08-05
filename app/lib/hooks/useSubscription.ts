"use client"
import { useContext } from "react"
import { DepositsContext, GoalsContext } from "@/app/context/SubscribeContext"

export function useSubscribeGoals() {
  return useContext(GoalsContext)
}

export function useSubscribeDeposits() {
  return useContext(DepositsContext)
}