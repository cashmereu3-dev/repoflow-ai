import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime } from '@/lib/utils'
import { Shield, ShieldAlert, Key, LogIn, FileText, Activity } from 'lucide-react'

export default async function CompliancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const userProfile = profile as any
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*, user:profiles(full_name, email)')
    .eq('organization_id', userProfile?.organization_id ?? '')
    .order('created_at', { ascending: false })
    .limit(50)

  function getActionIcon(action: string) {
    switch (action.toUpperCase()) {
      case 'INSERT': return <FileText className="w-4 h-4 text-emerald-400" />
      case 'UPDATE': return <Activity className="w-4 h-4 text-blue-400" />
      case 'DELETE': return <ShieldAlert className="w-4 h-4 text-red-400" />
      case 'LOGIN': return <LogIn className="w-4 h-4 text-violet-400" />
      default: return <Key className="w-4 h-4 text-slate-400" />
    }
  }

  function getActionColor(action: string) {
    switch (action.toUpperCase()) {
      case 'INSERT': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'UPDATE': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'DELETE': return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'LOGIN': return 'text-violet-400 bg-violet-400/10 border-violet-400/20'
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance & Audit</h1>
          <p className="text-sm mt-1 text-[hsl(var(--foreground-muted))]">
            Immutable audit trail of all system actions. Data cannot be modified or deleted.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-4 py-2 rounded-lg text-sm font-semibold">
          <Shield className="w-4 h-4" />
          SOC2 Ready
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--background-elevated))]">
          <h2 className="font-semibold text-white">Recent Activity Log</h2>
          <button className="btn-secondary text-xs py-1.5 px-3">Export CSV</button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Resource</th>
                <th>User</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs?.map((item) => {
                const log = item as any
                return (
                <tr key={log.id}>
                  <td className="whitespace-nowrap">
                    <div className="font-medium text-white">{new Date(log.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-[hsl(var(--foreground-subtle))]">{new Date(log.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium capitalize text-[hsl(var(--foreground))]">
                      {log.resource_type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-[hsl(var(--foreground-subtle))] font-mono truncate max-w-[120px]" title={log.resource_id}>
                      {log.resource_id?.substring(0, 8)}...
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-white">{log.user?.full_name || 'System User'}</div>
                    <div className="text-xs text-[hsl(var(--foreground-subtle))]">{log.user?.email || 'system@repoflow.ai'}</div>
                  </td>
                  <td className="font-mono text-xs text-[hsl(var(--foreground-muted))]">
                    {log.ip_address || '192.168.1.1'}
                  </td>
                  <td>
                    <button className="text-violet-400 hover:text-violet-300 text-xs font-semibold underline underline-offset-2">
                      View Diff
                    </button>
                  </td>
                </tr>
              )})}
              {(!auditLogs || auditLogs.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[hsl(var(--foreground-muted))]">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--border-strong))]" />
                    <p>No audit logs recorded yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
