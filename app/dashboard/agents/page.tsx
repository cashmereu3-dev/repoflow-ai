import { createClient } from '@/lib/supabase/server'
import { getStatusColor, getStatusLabel } from '@/lib/utils'
import { MapPin, Navigation, Phone, ShieldCheck, Star } from 'lucide-react'

export default async function AgentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const userProfile = profile as any
  const { data: agents } = await supabase
    .from('agents')
    .select('*, profile:profiles(full_name, email, phone, avatar_url)')
    .eq('organization_id', userProfile?.organization_id ?? '')
    .order('recovery_rate', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Fleet</h1>
          <p className="text-sm mt-1 text-[hsl(var(--foreground-muted))]">
            Manage your recovery agents, track locations, and view performance metrics.
          </p>
        </div>
        <button className="btn-primary">Add Agent</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents?.map((agentItem) => {
          const agent = agentItem as any
          const profile = agent.profile as any
          const location = agent.current_location as { address?: string } | null

          return (
            <div key={agent.id} className="glass-card overflow-hidden group">
              <div className="p-6 relative">
                {/* Status Dot */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[hsl(var(--foreground-muted))]">
                    {agent.is_available ? 'Active' : 'Offline'}
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full ${agent.is_available ? 'bg-emerald-500 animate-pulse-glow' : 'bg-slate-500'}`} />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    {profile?.full_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{profile?.full_name}</h3>
                    <div className="text-sm text-[hsl(var(--foreground-muted))] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                      License: {agent.license_number || 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-[hsl(var(--border))]">
                  <div>
                    <div className="text-xs font-medium text-[hsl(var(--foreground-muted))] mb-1">Recovery Rate</div>
                    <div className="text-xl font-bold text-white">{agent.recovery_rate}%</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[hsl(var(--foreground-muted))] mb-1">Total Recoveries</div>
                    <div className="text-xl font-bold text-white">{agent.total_recoveries}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 text-sm text-[hsl(var(--foreground-muted))]">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{location?.address || 'Location unknown'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[hsl(var(--foreground-muted))]">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{profile?.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[hsl(var(--foreground-muted))]">
                    <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span>Rating: {agent.rating?.toFixed(1) || 'New'} / 5.0</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[hsl(var(--background-elevated))] p-4 border-t border-[hsl(var(--border))] flex justify-between items-center group-hover:bg-[hsl(var(--background-subtle))] transition-colors">
                <button className="text-sm font-semibold text-violet-400 hover:text-violet-300">View Profile</button>
                <button className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300">
                  <Navigation className="w-4 h-4" />
                  Live Track
                </button>
              </div>
            </div>
          )
        })}

        {(!agents || agents.length === 0) && (
          <div className="col-span-full glass-card p-12 text-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--background-elevated))] flex items-center justify-center mx-auto mb-4 border border-[hsl(var(--border))]">
              <Users className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Agents Found</h2>
            <p className="text-[hsl(var(--foreground-muted))] max-w-md mx-auto mb-6">
              You haven't added any recovery agents to your fleet yet. Invite agents to start assigning recoveries.
            </p>
            <button className="btn-primary">Invite First Agent</button>
          </div>
        )}
      </div>
    </div>
  )
}

// Needed to import Users
import { Users } from 'lucide-react'
