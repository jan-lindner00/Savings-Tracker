import { isSafeNext } from '@/app/lib/utils'
import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { captureException } from '@sentry/nextjs' 

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next')
  const safeNext = isSafeNext(next)
  // Vercel preview deployment fix
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocal = process.env.NODE_ENV === 'development'
 
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      captureException(error, { extra: { code, next } })
    }
    if(safeNext === "/auth/link-account-success"){
      await supabase.auth.signOut({scope: "global"})
    }
    if (!error) {
      if (isLocal) {
        return NextResponse.redirect(`${url.origin}${safeNext}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`)
      } else {
        return NextResponse.redirect(`${url.origin}${safeNext}`)
      }
    }
  }
 
  return NextResponse.redirect(`${url.origin}/auth/error`)
}