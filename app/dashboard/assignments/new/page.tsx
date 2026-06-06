"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewAssignmentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [formData, setFormData] = useState({
    borrower_name: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vin: '',
    loan_balance: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      // 1. Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required. Please log in again.')
      }

      // 2. Fetch user's profile to resolve organization_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
      
      const profile = profileData as any
      if (profileError || !profile?.organization_id) {
        throw new Error('Could not resolve your organization. Please contact support.')
      }

      const orgId = profile.organization_id
      const userId = user.id

      // 3. Check/Insert Vehicle
      let vehicleId = ''
      const { data: existingVehicleData } = await supabase
        .from('vehicles')
        .select('id')
        .eq('vin', formData.vin)
        .eq('organization_id', orgId)
        .maybeSingle()

      const existingVehicle = existingVehicleData as any

      if (existingVehicle) {
        vehicleId = existingVehicle.id
      } else {
        const { data: newVehicleData, error: vehicleErr } = await (supabase.from('vehicles') as any)
          .insert({
            organization_id: orgId,
            vin: formData.vin,
            year: parseInt(formData.vehicle_year) || null,
            make: formData.vehicle_make,
            model: formData.vehicle_model
          })
          .select('id')
          .single()

        const newVehicle = newVehicleData as any
        if (vehicleErr) {
          throw new Error(`Vehicle error: ${vehicleErr.message}`)
        }
        vehicleId = newVehicle.id
      }

      // 4. Insert Borrower
      const nameParts = formData.borrower_name.trim().split(/\s+/)
      const firstName = nameParts[0] || 'Unknown'
      const lastName = nameParts.slice(1).join(' ') || 'Borrower'

      const { data: newBorrowerData, error: borrowerErr } = await (supabase.from('borrowers') as any)
        .insert({
          organization_id: orgId,
          first_name: firstName,
          last_name: lastName
        })
        .select('id')
        .single()

      const newBorrower = newBorrowerData as any
      if (borrowerErr) {
        throw new Error(`Borrower error: ${borrowerErr.message}`)
      }
      const borrowerId = newBorrower.id

      // 5. Fetch AI Recovery Probability Score
      let score = 50
      let factors = {}
      try {
        const scoreRes = await fetch('/api/ai/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle: {
              make: formData.vehicle_make,
              model: formData.vehicle_model,
              year: parseInt(formData.vehicle_year) || null
            },
            loan_balance: parseFloat(formData.loan_balance) || null
          })
        })
        if (scoreRes.ok) {
          const scoreData = await scoreRes.json()
          if (scoreData.data) {
            score = scoreData.data.score || 50
            factors = scoreData.data.factors || {}
          }
        }
      } catch (scoreErr) {
        console.warn('Failed to fetch AI score, defaulting to 50:', scoreErr)
      }

      // 6. Create Assignment with status 'new'
      const { error: assignmentError } = await (supabase.from('assignments') as any)
        .insert({
          organization_id: orgId,
          borrower_id: borrowerId,
          vehicle_id: vehicleId,
          created_by: userId,
          status: 'new',
          loan_balance: parseFloat(formData.loan_balance) || null,
          recovery_probability: score,
          recovery_probability_factors: factors,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days default
        })

      if (assignmentError) {
        throw new Error(`Assignment error: ${assignmentError.message}`)
      }

      router.push('/dashboard/assignments')
      router.refresh()
    } catch (err: any) {
      console.error('Error creating assignment workflow:', err)
      setErrorMsg(err.message || 'Failed to create assignment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Assignment</h2>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 rounded-md border p-6 bg-card text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Borrower Information</h3>
          <div className="space-y-2">
            <label htmlFor="borrower_name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Borrower Name</label>
            <input
              type="text"
              id="borrower_name"
              name="borrower_name"
              required
              value={formData.borrower_name}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Jane Doe"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-md border p-6 bg-card text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="vehicle_make" className="text-sm font-medium leading-none">Make</label>
              <input
                type="text"
                id="vehicle_make"
                name="vehicle_make"
                required
                value={formData.vehicle_make}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. Toyota"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="vehicle_model" className="text-sm font-medium leading-none">Model</label>
              <input
                type="text"
                id="vehicle_model"
                name="vehicle_model"
                required
                value={formData.vehicle_model}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. Camry"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="vehicle_year" className="text-sm font-medium leading-none">Year</label>
              <input
                type="number"
                id="vehicle_year"
                name="vehicle_year"
                required
                min="1900"
                max="2099"
                value={formData.vehicle_year}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. 2021"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="vin" className="text-sm font-medium leading-none">VIN</label>
              <input
                type="text"
                id="vin"
                name="vin"
                required
                value={formData.vin}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="17-character VIN"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-md border p-6 bg-card text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Loan Details</h3>
          <div className="space-y-2">
            <label htmlFor="loan_balance" className="text-sm font-medium leading-none">Loan Balance ($)</label>
            <input
              type="number"
              id="loan_balance"
              name="loan_balance"
              step="0.01"
              required
              value={formData.loan_balance}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  )
}
