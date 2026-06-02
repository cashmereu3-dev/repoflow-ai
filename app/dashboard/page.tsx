import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import OverviewDashboard from '@/components/dashboard/OverviewDashboard'

export const metadata = {
  title: 'Operations Dashboard | RepoFlow AI',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user!.id)
    .single()

  const userProfile = profile as any
  const orgId = userProfile?.organization_id

  // Fetch dashboard data in parallel
  const [
    { data: assignments },
    { data: agents },
    { data: recentRecoveries },
    { data: recentAuditLogs },
  ] = await Promise.all([
    supabase
      .from('assignments')
      .select('id, status, priority, created_at, recovery_probability')
      .eq('organization_id', orgId ?? '')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('agents')
      .select('id, is_available, total_recoveries, recovery_rate, profile:profiles(full_name)')
      .eq('organization_id', orgId ?? ''),
    supabase
      .from('recoveries')
      .select('id, recovered_at, recovery_type')
      .eq('organization_id', orgId ?? '')
      .order('recovered_at', { ascending: false })
      .limit(20),
    supabase
      .from('audit_logs')
      .select('id, action, resource_type, created_at, user_id')
      .eq('organization_id', orgId ?? '')
      .order('created_at', { ascending: false })
      .limit(10),
  ])
  
  const allAssignments = assignments as any[]
  const allAgents = agents as any[]
  const allRecoveries = recentRecoveries as any[]

  const stats = {
    totalAssignments: allAssignments?.length ?? 0,
    activeAssignments: allAssignments?.filter(a => !['closed', 'recovered', 'voluntary_surrender'].includes(a.status)).length ?? 0,
    recoveredToday: allRecoveries?.filter(r => {
      const today = new Date()
      const recDate = new Date(r.recovered_at)
      return recDate.toDateString() === today.toDateString()
    }).length ?? 0,
    activeAgents: allAgents?.filter(a => a.is_available).length ?? 0,
    totalAgents: allAgents?.length ?? 0,
    recoveryRate: allAgents && allAgents.length > 0
      ? Math.round(allAgents.reduce((acc, a) => acc + (a.recovery_rate ?? 0), 0) / allAgents.length)
      : 0,
  }

  const statusCounts = {
    new: allAssignments?.filter(a => a.status === 'new').length ?? 0,
    assigned: allAssignments?.filter(a => a.status === 'assigned').length ?? 0,
    in_progress: allAssignments?.filter(a => a.status === 'in_progress').length ?? 0,
    located: allAssignments?.filter(a => a.status === 'located').length ?? 0,
    contact_made: allAssignments?.filter(a => a.status === 'contact_made').length ?? 0,
    recovered: allAssignments?.filter(a => a.status === 'recovered').length ?? 0,
    voluntary_surrender: allAssignments?.filter(a => a.status === 'voluntary_surrender').length ?? 0,
    closed: allAssignments?.filter(a => a.status === 'closed').length ?? 0,
  }

  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <OverviewDashboard
        stats={stats}
        statusCounts={statusCounts}
        recentAuditLogs={(recentAuditLogs as any[]) ?? []}
        orgId={orgId ?? ''}
      />
    </Suspense>
  )
}
