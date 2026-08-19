import { redirect } from 'next/navigation'

export const metadata = { title: 'Sign In', robots: { index: false, follow: false } }

export default function SignInAlias() {
  redirect('/auth/sign-in')
}