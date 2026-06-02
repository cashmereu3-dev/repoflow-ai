import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userProfile = profile as any
  if (userProfile?.role === 'repo_agent') {
    redirect('/agent')
  } else if (userProfile?.role === 'borrower') {
    redirect('/borrower')
  } else {
    redirect('/dashboard')
  }
}
