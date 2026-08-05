import { createClient } from "@/app/lib/supabase/server"
import {redirect} from "next/navigation"

export default async function RootRedirect(){
  const supabase = await createClient()
  const {data} = await supabase.auth.getClaims()
  const claims = data?.claims

  if(!claims?.sub){
    return redirect("/login")
  }
  
  redirect("/dashboard")
}