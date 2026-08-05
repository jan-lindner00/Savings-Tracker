"use server"
import {redirect, RedirectType} from "next/navigation"
import { createClient } from "@/app/lib/supabase/server"

export async function signInWithOAuth(){
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
            scopes: "openid profile email"
        },
    })
    if(error || !data?.url){
        return redirect("/auth/error", RedirectType.replace)
    }
    redirect(data.url, RedirectType.replace)
}

export async function signInWithPassword(email: string, password: string){
    const supabase = await createClient()
    const {error} = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
    if(error){
        return {error: error.message}
    }
    return {success: true}
}

export async function signInAnonymously(){
    const supabase = await createClient()
    const {error} = await supabase.auth.signInAnonymously()
    if(!error){
        redirect("/dashboard", RedirectType.replace)
    }
}

export async function signUpWithPassword(email: string, password: string, name: string){
    const supabase = await createClient()
    const {error} = await supabase.auth.signUp({
        email: email,
        password: password,
        options:{
            data: {
                name: name,
                picture: null
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/confirm-success`
        }
    })
    if(error){
        return {error: "Failed to sign up"}
    }
    else{
        return {success: true}
    }
}

export async function resetPassword(email: string){
    const supabase = await createClient()
    const {error} = await supabase.auth.resetPasswordForEmail(
        email,
        {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/recover-password`
        }
    )
    if(error){
        return { error: error.message}
    }
    return {success: true}
}

export async function resendConfirmationEmail(email: string){
    const supabase = await createClient()
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/confirm-success`
        }
    })
    if(error){
        return {error: error.message}
    }
    return {success: true}
}

export async function updatePassword(currentPassword: string, newPassword: string){
    const supabase = await createClient()
    const {data} = await supabase.auth.getUser()
    
    const {error} = await supabase.auth.signInWithPassword({email: data?.user?.email || "", password: currentPassword})

    if(error){
        return {error: "Current password is incorrect"}
    }

    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (updateError) {
        return { error: updateError.message }
    }

    await supabase.auth.signOut({ scope: 'global' })

    return { success: true }
}

export async function updatePasswordRecovery(password: string){
    const supabase = await createClient()
    const {error} = await supabase.auth.updateUser({password: password})
    if(error){
        return {error: error.message}
    }
    return {success: true}
}

export async function linkIdentity(){
    const supabase = await createClient()
    const {data, error} = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/link-account-success`,
            scopes: "openid profile email"
        },
    })
    if(error || !data?.url){
        return redirect("/auth/error", RedirectType.replace)
    }
    redirect(data.url, RedirectType.replace)
}