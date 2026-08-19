import { redirect } from 'next/navigation'

export const metadata = { title: 'Sign Up', robots: { index: false, follow: false } }

export default function SignUpAlias() {
  redirect('/auth/sign-up')
}