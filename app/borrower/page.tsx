import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { AlertCircle, Calendar, CreditCard, MessageSquare, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default async function BorrowerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // In a real app, we would query the borrower record linked to this profile
  // For this implementation, we'll fetch assignments directly if they're linked
  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, vehicle:vehicles(*), lender:organizations(name, logo_url)')
    // .eq('borrower_id', borrowerId) - assuming RLS policies handle this
    .limit(1)

  const assignment = assignments?.[0]

  if (!assignment) {
    return (
      <div className="glass-card p-12 text-center max-w-2xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your Account is in Good Standing</h2>
        <p className="text-[hsl(var(--foreground-muted))]">
          We couldn't find any active recovery cases associated with your account.
        </p>
      </div>
    )
  }

  const borrowerAssignment = assignment as any
  const isRecovered = ['recovered', 'voluntary_surrender'].includes(borrowerAssignment.status)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Account Overview</h1>
          <p className="text-sm mt-1 text-[hsl(var(--foreground-muted))]">
            Manage your account and communicate with your lender.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold">
          <AlertCircle className="w-4 h-4" />
          Action Required
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Status Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            <h2 className="text-lg font-semibold text-white mb-4">Vehicle Status</h2>
            
            <div className="bg-[hsl(var(--background-elevated))] rounded-xl p-4 mb-6 flex items-center justify-between border border-[hsl(var(--border))]">
              <div>
                <div className="text-sm font-medium text-[hsl(var(--foreground-muted))] mb-1">Vehicle</div>
                <div className="text-lg font-bold text-white">
                  {borrowerAssignment.vehicle.year} {borrowerAssignment.vehicle.make} {borrowerAssignment.vehicle.model}
                </div>
                <div className="text-sm text-[hsl(var(--foreground-subtle))] mt-1">
                  VIN: {borrowerAssignment.vehicle.vin}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-[hsl(var(--foreground-muted))] mb-1">Status</div>
                <div className={`text-lg font-bold ${isRecovered ? 'text-orange-400' : 'text-red-400'}`}>
                  {isRecovered ? 'Secured' : 'Pending Recovery'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))]">
                <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground-muted))] mb-2">
                  <CreditCard className="w-4 h-4" />
                  Past Due Balance
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(borrowerAssignment.loan_balance)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))]">
                <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground-muted))] mb-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </div>
                <div className="text-2xl font-bold text-white">
                  {isRecovered ? 'Immediately' : 'Past Due'}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button className="flex-1 btn-primary py-3 justify-center text-sm">
                Make a Payment
              </button>
              {!isRecovered && (
                <Link href="/borrower/surrender" className="flex-1 btn-secondary py-3 justify-center text-sm border-violet-500/30 hover:border-violet-500/50">
                  Schedule Surrender
                </Link>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Lender Information</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[hsl(var(--background-elevated))] border border-[hsl(var(--border))] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[hsl(var(--foreground-muted))]" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">{borrowerAssignment.lender?.name || 'Your Lender'}</div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">Loan #{borrowerAssignment.loan_number}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
              <Link href="/borrower/messages" className="flex items-center justify-between text-sm text-violet-400 hover:text-violet-300 font-medium">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contact Lender Representative
                </div>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-white mb-4">Important Notices</h2>
            <div className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                <div className="text-sm font-semibold text-orange-400 mb-1">Account in Default</div>
                <div className="text-xs text-orange-400/80 leading-relaxed">
                  Your account is currently in default. Please make a payment immediately to halt recovery proceedings.
                </div>
              </div>
              
              {!isRecovered && (
                <div className="bg-violet-500/10 border border-violet-500/20 p-3 rounded-lg">
                  <div className="text-sm font-semibold text-violet-400 mb-1">Voluntary Surrender Option</div>
                  <div className="text-xs text-violet-400/80 leading-relaxed">
                    You can schedule a voluntary surrender of your vehicle to avoid additional recovery fees.
                  </div>
                  <Link href="/borrower/surrender" className="inline-block mt-2 text-xs font-semibold text-violet-300 hover:text-white transition-colors">
                    Learn more &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5" />
                <div>
                  <div className="text-sm font-medium text-white">Assignment Created</div>
                  <div className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                    {formatDateTime(borrowerAssignment.created_at)}
                  </div>
                </div>
              </div>
              {isRecovered && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5" />
                  <div>
                    <div className="text-sm font-medium text-white">Vehicle Recovered</div>
                    <div className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                      {formatDateTime(borrowerAssignment.recovered_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
