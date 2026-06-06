import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { 
  ArrowLeft, 
  Calendar, 
  Car, 
  ChevronRight, 
  CreditCard, 
  MapPin, 
  ShieldAlert, 
  TrendingUp, 
  User, 
  Activity,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Assignment Details',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch assignment with joined borrower, vehicle, and agent profiles
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select(`
      *,
      borrower:borrowers(*),
      vehicle:vehicles(*),
      agent:agents(
        id,
        profile:profiles(full_name, email)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !assignment) {
    notFound()
  }

  const data = assignment as any
  const borrower = data.borrower
  const vehicle = data.vehicle
  const agentProfile = data.agent?.profile

  // Format enums for user friendly display
  const displayStatus = data.status 
    ? data.status.charAt(0).toUpperCase() + data.status.slice(1).replace('_', ' ') 
    : 'New'

  const scoreColor = data.recovery_probability >= 80 
    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
    : data.recovery_probability >= 50
    ? 'text-orange-400 border-orange-500/20 bg-orange-500/10'
    : 'text-red-400 border-red-500/20 bg-red-500/10'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link & Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/assignments" 
          className="p-2 rounded-lg bg-[hsl(var(--background-elevated))] border border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] hover:text-white hover:border-[hsl(var(--border-strong))] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground-muted))] font-medium uppercase tracking-wider">
            <span>Assignments</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-400">Details</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Case #{data.id.substring(0, 8).toUpperCase()}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status & Priority Overview */}
          <div className="glass-card p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground-muted))] uppercase tracking-wider mb-1">Status</div>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                data.status === 'recovered' 
                  ? 'border-transparent bg-green-900/30 text-green-400'
                  : data.status === 'in_progress'
                  ? 'border-transparent bg-blue-900/30 text-blue-400'
                  : 'border-transparent bg-secondary text-secondary-foreground'
              }`}>
                {displayStatus}
              </span>
            </div>
            <div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground-muted))] uppercase tracking-wider mb-1">Priority</div>
              <div className="text-sm font-bold text-white">{data.priority || '5'}/10</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground-muted))] uppercase tracking-wider mb-1">Loan Balance</div>
              <div className="text-sm font-bold text-white">{formatCurrency(data.loan_balance)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground-muted))] uppercase tracking-wider mb-1">Due Date</div>
              <div className="text-sm font-bold text-white">{data.due_date ? formatDateTime(data.due_date).split(',')[0] : 'N/A'}</div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-[hsl(var(--border))] pb-3">
              <Car className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">Vehicle Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Year / Make / Model</div>
                <div className="text-sm font-semibold text-white">
                  {vehicle?.year || 'N/A'} {vehicle?.make || 'N/A'} {vehicle?.model || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">VIN</div>
                <div className="text-sm font-semibold text-white font-mono">{vehicle?.vin || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Color</div>
                <div className="text-sm font-semibold text-white">{vehicle?.color || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">License Plate</div>
                <div className="text-sm font-semibold text-white">
                  {vehicle?.license_plate || 'N/A'} ({vehicle?.license_state || 'N/A'})
                </div>
              </div>
            </div>
          </div>

          {/* Borrower Information */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-[hsl(var(--border))] pb-3">
              <User className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">Borrower Profile</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Full Name</div>
                <div className="text-sm font-semibold text-white">
                  {borrower?.first_name} {borrower?.last_name}
                </div>
              </div>
              <div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Contact Phone</div>
                <div className="text-sm font-semibold text-white">{borrower?.phone || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Email</div>
                <div className="text-sm font-semibold text-white">{borrower?.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Current Address</div>
                <div className="text-sm font-semibold text-white leading-relaxed">{borrower?.current_address || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {data.special_instructions && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-bold text-white">Special Instructions</h2>
              </div>
              <p className="text-sm text-[hsl(var(--foreground-muted))] leading-relaxed bg-[hsl(var(--background-elevated))] p-4 rounded-xl border border-[hsl(var(--border))]">
                {data.special_instructions}
              </p>
            </div>
          )}
        </div>

        {/* Right Column — AI Analytics & Agent Info */}
        <div className="space-y-6">
          
          {/* AI Score Card */}
          <div className="glass-card p-6 border-violet-500/20 bg-gradient-to-br from-violet-950/10 to-zinc-950">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">AI Recovery Odds</h2>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${scoreColor}`}>
                {data.recovery_probability}% Match
              </span>
            </div>
            
            <div className="flex items-center justify-center py-4">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-violet-950/40"></div>
                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-pulse"></div>
                <span className="text-3xl font-extrabold text-white">{data.recovery_probability}%</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 pt-4 border-t border-[hsl(var(--border))]">
              <div>
                <div className="text-xs font-semibold text-violet-400 mb-0.5">AI Explanation</div>
                <p className="text-xs text-[hsl(var(--foreground-muted))] leading-relaxed">
                  {data.recovery_probability_factors?.explanation || 'High confidence recovery case. Model suggests timing and location metrics are highly optimal.'}
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold text-violet-400 mb-0.5">AI Recommendation</div>
                <p className="text-xs text-[hsl(var(--foreground-muted))] leading-relaxed">
                  {data.recovery_probability_factors?.recommendation || 'Dispatch agent in early morning (4-7am) hours for highest recovery probability.'}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Agent Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[hsl(var(--border))]">
              <MapPin className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">Assigned Agent</h2>
            </div>
            {agentProfile ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Agent Name</div>
                  <div className="text-sm font-bold text-white">{agentProfile.full_name}</div>
                </div>
                <div>
                  <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Email</div>
                  <div className="text-sm font-semibold text-zinc-400">{agentProfile.email}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[hsl(var(--foreground-muted))] mb-4">No agent currently assigned.</p>
                <button className="btn-secondary w-full justify-center text-xs py-2">
                  Assign Agent Case
                </button>
              </div>
            )}
          </div>

          {/* Activity / Audit Log Brief */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[hsl(var(--border))]">
              <Activity className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">Activity Timeline</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5"></div>
                <div>
                  <div className="text-xs font-semibold text-white">Assignment Created</div>
                  <div className="text-[10px] text-[hsl(var(--foreground-muted))] mt-0.5">
                    {formatDateTime(data.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
