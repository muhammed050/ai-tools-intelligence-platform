'use client'

import { useEffect } from 'react'

const translations: Record<string, string> = {
  'Welcome back': 'مرحبًا بعودتك',
  'Sign in to save tools, compare options and personalize your AI discovery.': 'سجّل الدخول لحفظ الأدوات ومقارنة الخيارات وتخصيص اكتشافك لأدوات الذكاء الاصطناعي.',
  'Connecting to Google...': 'جارٍ الاتصال بـ Google...',
  'Continue with Google': 'المتابعة باستخدام Google',
  'or continue with email': 'أو المتابعة باستخدام البريد الإلكتروني',
  'Email': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'Forgot password?': 'هل نسيت كلمة المرور؟',
  'Signing in...': 'جارٍ تسجيل الدخول...',
  'Sign In': 'تسجيل الدخول',
  'New here?': 'جديد هنا؟',
  'Create an account': 'إنشاء حساب',
  'Start your AI toolkit': 'ابدأ مجموعة أدوات الذكاء الاصطناعي الخاصة بك',
  'Create your account': 'أنشئ حسابك',
  'Save discoveries, build comparisons and keep your favorite tools in one place.': 'احفظ اكتشافاتك وأنشئ مقارنات واحتفظ بأدواتك المفضلة في مكان واحد.',
  'or use email': 'أو استخدم البريد الإلكتروني',
  'Full name': 'الاسم الكامل',
  'Confirm password': 'تأكيد كلمة المرور',
  'Creating account...': 'جارٍ إنشاء الحساب...',
  'Create account': 'إنشاء الحساب',
  'Already have an account?': 'لديك حساب بالفعل؟',
  'Unable to create your account. Please check your details and try again.': 'تعذر إنشاء حسابك. تحقق من بياناتك وحاول مرة أخرى.',
  'Unable to create your account. Please try again.': 'تعذر إنشاء حسابك. حاول مرة أخرى.',
  'Email already exists. Try signing in.': 'البريد الإلكتروني مستخدم بالفعل. جرّب تسجيل الدخول.',
  'Account created. Check your email to confirm your address.': 'تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد عنوانك.',
  'Google sign-up is unavailable right now. Please try email sign-up.': 'التسجيل باستخدام Google غير متاح حاليًا. جرّب التسجيل بالبريد الإلكتروني.',
  'Google sign-in is unavailable right now. Please try email sign-in.': 'تسجيل الدخول باستخدام Google غير متاح حاليًا. جرّب تسجيل الدخول بالبريد الإلكتروني.',
  'Invalid email or password.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'Please confirm your email before signing in.': 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.',
  'Unable to sign in. Please check your details and try again.': 'تعذر تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.',
  'Google sign-in was cancelled. You can try again or use email sign-in.': 'تم إلغاء تسجيل الدخول باستخدام Google. يمكنك المحاولة مرة أخرى أو استخدام البريد الإلكتروني.',
  'Google sign-in is not configured correctly. Please contact the site administrator.': 'تسجيل الدخول باستخدام Google غير مهيأ بشكل صحيح. تواصل مع مسؤول الموقع.',
  'The sign-in response was incomplete. Please start Google sign-in again.': 'استجابة تسجيل الدخول غير مكتملة. ابدأ تسجيل الدخول باستخدام Google مرة أخرى.',
  'We could not finish Google sign-in. Please try again.': 'تعذر إكمال تسجيل الدخول باستخدام Google. حاول مرة أخرى.',
  'Google sign-in completed without a session. Please try again.': 'اكتمل تسجيل الدخول باستخدام Google دون إنشاء جلسة. حاول مرة أخرى.',
  'Forgot your password?': 'هل نسيت كلمة المرور؟',
  'Account recovery': 'استعادة الحساب',
  'Enter your email and we’ll send you a secure reset link.': 'أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور.',
  'Sending...': 'جارٍ الإرسال...',
  'Send reset link': 'إرسال رابط إعادة التعيين',
  'Back to sign in': 'العودة إلى تسجيل الدخول',
  'Unable to send the reset email. Please try again.': 'تعذر إرسال رسالة إعادة التعيين. حاول مرة أخرى.',
  'If an account exists for this email, a password reset link has been sent.': 'إذا كان هناك حساب مرتبط بهذا البريد، فقد تم إرسال رابط لإعادة تعيين كلمة المرور.',
  'Loading sign in...': 'جارٍ تحميل تسجيل الدخول...',
}

function translate(value: string) {
  const trimmed = value.trim()
  const translated = translations[trimmed]
  if (!translated) return value
  const start = value.indexOf(trimmed)
  return `${value.slice(0, start)}${translated}${value.slice(start + trimmed.length)}`
}

export function AuthArabicTranslator() {
  useEffect(() => {
    const isArabic = document.cookie.split(';').some((item) => item.trim().startsWith('eldevo_locale=ar'))
    if (!isArabic) return

    const run = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const nodes: Text[] = []
      let node: Node | null
      while ((node = walker.nextNode())) nodes.push(node as Text)
      for (const text of nodes) {
        if (!text.nodeValue || text.parentElement?.closest('script,style,noscript')) continue
        const next = translate(text.nodeValue)
        if (next !== text.nodeValue) text.nodeValue = next
      }
      document.querySelectorAll<HTMLInputElement>('input[placeholder], input[aria-label], button[aria-label]').forEach((element) => {
        if (element.placeholder) element.placeholder = translate(element.placeholder)
        if (element.getAttribute('aria-label')) element.setAttribute('aria-label', translate(element.getAttribute('aria-label')!))
      })
    }

    run()
    const observer = new MutationObserver(run)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
