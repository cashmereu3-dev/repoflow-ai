import { createClient } from '@/lib/supabase/server'
import { MapPin, ArrowLeft, Target, ShieldCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Agent Assignments',
}

export default async function AgentAssignmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get agent record
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

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen pb-24 text-white">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link 
          href="/agent" 
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">My Assignments</h1>
          <p className="text-xs text-zinc-400">Manage all vehicle cases assigned to you</p>
        </div>
      </header>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const isCompleted = ['recovered', 'voluntary_surrender', 'closed'].includes(assignment.status)
          const vehicleDesc = assignment.vehicle 
            ? `${assignment.vehicle.year} ${assignment.vehicle.make} ${assignment.vehicle.model}`
            : 'Unknown Vehicle'
          
          return (
            <div 
              key={assignment.id} 
              className={`bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3 shadow-md relative overflow-hidden`}
            >
              {/* Top Row with status */}
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isCompleted 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' 
                    : 'bg-red-950 text-red-400 border border-red-800/40'
                }`}>
                  {assignment.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  #{assignment.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Vehicle specs */}
              <div>
                <h3 className="font-bold text-white text-base leading-snug">{vehicleDesc}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] font-semibold font-mono text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded border border-zinc-800">
                    VIN: {assignment.vehicle?.vin || 'N/A'}
                  </span>
                  {assignment.vehicle?.license_plate && (
                    <span className="text-[10px] font-semibold font-mono text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded border border-zinc-800">
                      PLATE: {assignment.vehicle.license_plate}
                    </span>
                  )}
                </div>
              </div>

              {/* Location and Borrower Details */}
              <div className="pt-2 border-t border-zinc-800 text-xs space-y-2 text-zinc-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span className="truncate">{assignment.last_known_address || 'No Location Provided'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Borrower: {assignment.borrower?.first_name} {assignment.borrower?.last_name}</span>
                </div>
              </div>

              {/* Detail buttons */}
              {!isCompleted && (
                <div className="pt-2 flex gap-2">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(assignment.last_known_address || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-md font-semibold transition-colors"
                  >
                    Navigate
                  </a>
                </div>
              )}
            </div>
          )
        })}

        {assignments.length === 0 && (
          <div className="py-12 text-center text-zinc-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
            <p className="text-sm">No cases currently assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  )
}
