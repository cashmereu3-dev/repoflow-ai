import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  const userProfile = profile as any
  if (userProfile?.role === 'repo_agent') redirect('/agent')
  if (userProfile?.role === 'borrower') redirect('/borrower')

  return (
    <DashboardShell profile={profile} user={user}>
      {children}
    </DashboardShell>
  )
}
