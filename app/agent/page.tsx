import { createClient } from '@/lib/supabase/server'
import { MapPin, Target, TrendingUp, Upload, AlertCircle, LogOut } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Agent Dashboard',
}

export default async function AgentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Resolve agent record
  const { data: agentData } = await supabase
    .from('agents')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  const agent = agentData as any

  let assignments: any[] = []
  if (agent) {
    const { data } = await supabase
      .from('assignments')
      .select('*, vehicle:vehicles(*), borrower:borrowers(*)')
      .eq('assigned_agent_id', agent.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
    assignments = data || []
  }

  // 2. Calculate dynamic stats
  const total = assignments.length
  const activeCount = assignments.filter((a) => !['recovered', 'voluntary_surrender', 'closed'].includes(a.status)).length
  const recoveredCount = assignments.filter((a) => ['recovered', 'voluntary_surrender'].includes(a.status)).length
  const recoveryRate = total > 0 ? `${Math.round((recoveredCount / total) * 100)}%` : '0%'

  // Get active targets (non-recovered/closed)
  const activeAssignments = assignments.filter((a) => !['recovered', 'voluntary_surrender', 'closed'].includes(a.status))

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen pb-24">
      {/* Header */}
      <header className="py-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Agent Hub</h1>
          <p className="text-sm text-zinc-400">Stay safe out there.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sign Out Button for Agent */}
          <form action="/auth/signout" method="post">
            <button 
              type="submit" 
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-zinc-400 mb-3">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeCount}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-zinc-400 mb-3">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Success</span>
          </div>
          <p className="text-3xl font-bold text-white">{recoveryRate}</p>
        </div>
      </div>

      {/* Quick Upload Action */}
      <div className="bg-gradient-to-br from-blue-900/60 to-zinc-900 rounded-xl p-6 border border-blue-800/40 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-24 w-24 bg-blue-600/20 rounded-full blur-2xl"></div>
        <div className="absolute -left-6 -bottom-6 h-24 w-24 bg-indigo-600/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 space-y-3">
          <h2 className="text-lg font-bold text-white">Target Spotted?</h2>
          <p className="text-sm text-zinc-300 px-4">
            Scan a license plate or vehicle photo for instant AI verification.
          </p>
          <Link 
            href="/agent/upload"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 font-medium transition-colors w-full shadow-lg shadow-blue-900/50"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Photo
          </Link>
        </div>
      </div>

      {/* Nearby/Active Assignments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Cases</h2>
          <span className="text-xs font-medium bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">
            {activeAssignments.length} Active
          </span>
        </div>
        
        <div className="space-y-3">
          {activeAssignments.map((assignment) => {
            const vehicleDesc = assignment.vehicle 
              ? `${assignment.vehicle.year} ${assignment.vehicle.make} ${assignment.vehicle.model}`
              : 'Unknown Vehicle'
            
            return (
              <div key={assignment.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-start space-x-4 shadow-sm">
                <div className="bg-red-500/10 rounded-lg p-2 mt-0.5">
                  <MapPin className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white truncate">{vehicleDesc}</h3>
                  </div>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                      VIN {assignment.vehicle?.vin?.substring(13) || 'N/A'}
                    </span>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                      {assignment.vehicle?.license_plate || 'No Plate'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-2 truncate">
                    {assignment.last_known_address || 'No location specified'}
                  </p>
                  
                  <div className="mt-3 flex gap-2">
                    <Link 
                      href={`/agent/assignments`}
                      className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-2.5 rounded-md transition-colors font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}

          {activeAssignments.length === 0 && (
            <div className="py-8 text-center bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm">No active assignments assigned to you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
