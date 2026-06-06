import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateRecoveryProbability } from '@/lib/ai/score'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicle, loan_balance } = body

    const result = await calculateRecoveryProbability({
      assignment: {
        vehicle,
        loan_balance
      },
      hasLocationData: false
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error calculating recovery score:', error)
    return NextResponse.json(
      { error: 'Failed to calculate recovery probability score' },
      { status: 500 }
    )
  }
}
