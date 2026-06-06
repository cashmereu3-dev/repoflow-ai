'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function VoluntarySurrenderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [assignment, setAssignment] = useState<any | null>(null)
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    phone: '',
    notes: '',
  })
  
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch borrower
      const { data: borrowerData } = await supabase
        .from('borrowers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      const borrower = borrowerData as any

      if (borrower) {
        // Fetch assignment
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*, vehicle:vehicles(*)')
          .eq('borrower_id', borrower.id)
          .limit(1)

        const assignments = (assignmentsData || []) as any[]
        if (assignments.length > 0) {
          setAssignment(assignments[0])
        }
      }
      setLoading(false)
    }
    loadData()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignment) return

    setSubmitting(true)
    setErrorMsg('')

    try {
      const notesUpdate = `Voluntary Surrender Scheduled for ${formData.date} at ${formData.time}. Contact Phone: ${formData.phone}. Notes: ${formData.notes}`
      
      const { error } = await (supabase.from('assignments') as any)
        .update({
          status: 'voluntary_surrender',
          special_instructions: assignment.special_instructions 
            ? `${assignment.special_instructions}\n\n${notesUpdate}` 
            : notesUpdate
        })
        .eq('id', assignment.id)

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      console.error('Error scheduling surrender:', err)
      setErrorMsg(err.message || 'Failed to schedule surrender. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="glass-card p-12 text-center max-w-2xl mx-auto mt-12 text-white">
        <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Active Case Found</h2>
        <p className="text-[hsl(var(--foreground-muted))] mb-6">
          We couldn't find an active case for your account to schedule a surrender.
        </p>
        <Link href="/borrower" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-white">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/borrower" 
          className="p-2 rounded-lg bg-[hsl(var(--background-elevated))] border border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] hover:text-white hover:border-[hsl(var(--border-strong))] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule Voluntary Surrender</h1>
          <p className="text-sm mt-1 text-[hsl(var(--foreground-muted))]">
            Arrange a convenient time and place to surrender your vehicle.
          </p>
        </div>
      </div>

      {success ? (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Surrender Scheduled Successfully</h2>
          <p className="text-sm text-[hsl(var(--foreground-muted))] max-w-md mx-auto">
            Your voluntary surrender has been logged. A representative will contact you at <strong>{formData.phone}</strong> to confirm the exact location details.
          </p>
          <div className="pt-4">
            <Link href="/borrower" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Vehicle summary */}
          <div className="glass-card p-4 bg-[hsl(var(--background-elevated))] border border-[hsl(var(--border))] flex items-center justify-between">
            <div>
              <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">Vehicle to Surrender</div>
              <div className="text-base font-bold text-white">
                {assignment.vehicle?.year} {assignment.vehicle?.make} {assignment.vehicle?.model}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[hsl(var(--foreground-muted))] mb-0.5">VIN</div>
              <div className="text-sm font-mono text-zinc-400">{assignment.vehicle?.vin?.substring(13) || 'N/A'}</div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-violet-400" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-violet-400" />
                  Preferred Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Contact Phone Number</label>
              <input
                type="tel"
                required
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Additional Notes / Location Instructions</label>
              <textarea
                placeholder="Where should we pick up the keys? Describe any access codes, details, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] rounded-lg py-2.5 px-4 text-sm text-white resize-none focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 justify-center text-sm font-medium rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--background-elevated))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 justify-center text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scheduling...
                </div>
              ) : (
                'Schedule Surrender'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
