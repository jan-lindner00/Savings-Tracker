"use client"
import {useState, useEffect, createContext} from "react"
import { fetchDeposits, fetchGoals } from "@/app/lib/utils"
import type { Deposit, Goal } from "@/app/lib/types"
import {v4 as uuid} from "uuid"
import supabaseClient from "@/app/lib/supabase/client"

export const GoalsContext = createContext<Goal[]>([])

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    let cancelled = false

    async function getGoals() {
      const data = await fetchGoals()
      if (cancelled) return
      setGoals(data ?? [])
    }

    getGoals()

    const goalChannel = supabaseClient
      .channel(`favorite-changes-${uuid()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals" },
        () => getGoals()
      )
      .subscribe()

    return () => {
      cancelled = true
      supabaseClient.removeChannel(goalChannel)
    }
  }, [])

  return (
    <GoalsContext.Provider value={goals}>
      {children}
    </GoalsContext.Provider>
  )
}

export const DepositsContext = createContext<Deposit[]>([])

export function DepositsProvider({ children }: { children: React.ReactNode }) {
  const [deposits, setDeposits] = useState<Deposit[]>([])

  useEffect(() => {
    let cancelled = false

    async function getDeposits() {
      const data = await fetchDeposits()
      if (cancelled) return
      setDeposits(data ?? [])
    }

    getDeposits()

    const depositChannel = supabaseClient
      .channel(`log-changes-${uuid()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deposits" },
        () => getDeposits()
      )
      .subscribe()

    return () => {
      cancelled = true
      supabaseClient.removeChannel(depositChannel)
    }
  }, [])

  return (
    <DepositsContext.Provider value={deposits}>
      {children}
    </DepositsContext.Provider>
  )
}
