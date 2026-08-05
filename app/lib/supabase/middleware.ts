import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // WICHTIG: getUser() aufrufen, bevor irgendeine Logik läuft.
  // Das refresht den Auth-Token bei Bedarf.
  
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
 
  // Beispiel: geschützte Routen umleiten, falls nicht eingeloggt
  if (
    !claims?.sub &&
    (request.nextUrl.pathname.startsWith('/dashboard') || 
     request.nextUrl.pathname.startsWith("settings") || request.nextUrl.pathname.startsWith("recover-password")
    )
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  if(claims?.sub){
      if(claims?.is_anonymous && request.nextUrl.pathname.startsWith("/settings/password")){
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
      if(!claims?.is_anonymous && request.nextUrl.pathname.startsWith("/settings/link-profile")){
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
  }

  return supabaseResponse
}