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
    
    const payload: any = {
      borrower_name: formData.borrower_name,
      vehicle_make: formData.vehicle_make,
      vehicle_model: formData.vehicle_model,
      vehicle_year: parseInt(formData.vehicle_year) || null,
      vin: formData.vin,
      loan_balance: parseFloat(formData.loan_balance) || null,
      status: 'pending',
    }
    // @ts-ignore
    const { error } = await supabase.from('assignments').insert([payload])

    setLoading(false)

    if (error) {
      console.error('Error creating assignment:', error)
      setErrorMsg('Failed to create assignment. Please try again.')
    } else {
      router.push('/dashboard/assignments')
      router.refresh()
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
