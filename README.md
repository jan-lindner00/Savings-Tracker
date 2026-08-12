# Frontend Mentor - Savings Tracker solution

This is a solution to the [Savings Tracker challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/savings-tracker). Frontend Mentor challenges help you improve your coding skills by building realistic projects. 

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)


## Overview

### The challenge

Users should be able to:

#### Goal Management

- Create a new savings goal with a name, target amount, and optional deadline
- Edit an existing goal to update its name, target amount, or deadline
- Delete a goal and see a confirmation modal before it's permanently removed
- See form validation messages if required fields are missing or invalid

#### Deposits

- Add a deposit to a goal with an amount and optional note
- See an error message when trying to add a deposit of $0 or less
- View the full deposit history for a goal, showing the note, date, and amount for each deposit

#### Dashboard

- View a summary showing total savings, number of active goals, and goals completed
- See a monthly deposits bar chart showing saving activity over time
- View all goals in a card grid with each goal's name, progress percentage, amount saved, target, and deadline
- See an empty state with a prompt to create a first goal when no goals exist
- See a completed state for goals that have reached their target

#### Filtering & Sorting

- Filter goals by status: all goals, in progress, completed, or not started
- Sort goals by recently added, deadline, progress, amount saved, or alphabetically

#### Goal Details

- View a goal's detail page showing progress percentage, remaining amount, a visual progress bar, and saved vs. target amounts
- See a different layout when a goal is 100% complete, showing a summary of total deposits and amount saved

#### UI & Accessibility

- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page
- Navigate the entire app using only their keyboard

#### Bonus - Full-Stack (Optional)

- Sign up for an account with full name, email, and password
- Log in to an existing account
- Request a password reset via email
- Set a new password after receiving a reset link

### Screenshot

![](/public/screenshot-login.png)
![](/public/screenshot-dashboard.png)
![](/public/screenshot-goal.png)


### Links

- Live Site URL: [Add shttps://savings-tracker.gruppe-l.me](https://savings-tracker.gruppe-l.me)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- Mobile-first workflow
- [React](https://reactjs.org/) - JS library
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - For styles
- [Supabase](https://supabase.com/) - For backend

### What I learned

This was the second project I built with Next.js. I learned how the App Router works as well as how to customize a proxy.
I practiced linear-gradients and background-images with Tailwind CSS. Moreover custom trigger functions were created for the supabase backend.
In addition I practiced implementing OAuth in my applications. I think I also learned a lot about accessibility. For example how to create a dashboard that is fully navigateable with the keyboard.

I am especially proud of my auth/callback route. Here is a code snippet from it:

```js
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
```

### Continued development

In the future I want to improve the accessibility of my projects. Also there is a bug that occurs when reloading the page.
The not-found page is shown even though the goal exists. I want to fix that.

### Useful resources

- [Supabase Docs](https://supabase.com/docs) - This helped me setting supabase up and helped later with choosing the right helper functions.
- [NextJS Docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - This article helped me understand the purpose of proxys more and I feel like I started to grasp how they work after reading this.

## Author

-  [Github](https://github.com/jan-lindner00)


