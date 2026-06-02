import OpenAI from 'openai'
import { RecoveryProbabilityScore } from '@/types/index'
import { AssignmentWithDetails } from '@/types/index'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
})

interface ScoringInput {
  assignment: Partial<AssignmentWithDetails>
  agentRecoveryRate?: number
  hourOfDay?: number
  dayOfWeek?: number
  daysInField?: number
  previousAttempts?: number
  hasLocationData?: boolean
}

export async function calculateRecoveryProbability(
  input: ScoringInput
): Promise<RecoveryProbabilityScore> {
  const {
    assignment,
    agentRecoveryRate = 0.65,
    hourOfDay = new Date().getHours(),
    dayOfWeek = new Date().getDay(),
    daysInField = 0,
    previousAttempts = 0,
    hasLocationData = false,
  } = input

  // Deterministic scoring factors (no AI needed for base score)
  const factors = {
    timeOfDay: scoreTimeOfDay(hourOfDay),
    locationActivity: hasLocationData ? 75 : 35,
    assignmentHistory: scoreAssignmentHistory(daysInField, previousAttempts),
    agentPerformance: Math.round(agentRecoveryRate * 100),
    vehicleType: scoreVehicleType(assignment.vehicle?.make),
  }

  const baseScore = Math.round(
    factors.timeOfDay * 0.2 +
    factors.locationActivity * 0.3 +
    factors.assignmentHistory * 0.2 +
    factors.agentPerformance * 0.2 +
    factors.vehicleType * 0.1
  )

  // Use AI for explanation and recommendation
  let explanation = generateBaseExplanation(factors, baseScore)
  let recommendation = generateBaseRecommendation(baseScore, hourOfDay)

  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a vehicle repossession analytics AI. Provide concise, actionable insights for repo agents. Keep explanations to 1-2 sentences.',
          },
          {
            role: 'user',
            content: `Recovery probability score: ${baseScore}/100.
Factors: Time of Day Score: ${factors.timeOfDay}, Location Activity: ${factors.locationActivity}, Agent Performance: ${factors.agentPerformance}%.
Vehicle: ${assignment.vehicle?.year} ${assignment.vehicle?.make} ${assignment.vehicle?.model}.
Days in field: ${daysInField}. Previous attempts: ${previousAttempts}.
Provide a 1-sentence explanation and 1-sentence recommendation. Return JSON: {"explanation": "...", "recommendation": "..."}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      })

      const content = response.choices[0]?.message?.content
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          explanation = parsed.explanation || explanation
          recommendation = parsed.recommendation || recommendation
        }
      }
    }
  } catch {
    // Use base explanation if AI fails
  }

  return {
    score: baseScore,
    factors,
    explanation,
    recommendation,
  }
}

function scoreTimeOfDay(hour: number): number {
  // Best times: early morning (4-7am), late evening (8-11pm)
  if (hour >= 4 && hour <= 7) return 90
  if (hour >= 20 && hour <= 23) return 85
  if (hour >= 8 && hour <= 10) return 70
  if (hour >= 18 && hour <= 20) return 75
  if (hour >= 11 && hour <= 17) return 50
  return 30 // Late night
}

function scoreAssignmentHistory(daysInField: number, attempts: number): number {
  let score = 60
  // Fresh assignments have higher probability
  if (daysInField < 7) score += 20
  else if (daysInField < 14) score += 10
  else if (daysInField > 30) score -= 20
  else if (daysInField > 60) score -= 30

  // More attempts indicate harder cases
  score -= attempts * 5

  return Math.max(0, Math.min(100, score))
}

function scoreVehicleType(make?: string | null): number {
  // Higher value vehicles are more likely to be found/recovered
  const highValueBrands = ['BMW', 'Mercedes', 'Audi', 'Lexus', 'Tesla', 'Porsche', 'Cadillac', 'Lincoln']
  const standardBrands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Nissan']

  if (!make) return 50
  if (highValueBrands.some(b => make.toLowerCase().includes(b.toLowerCase()))) return 80
  if (standardBrands.some(b => make.toLowerCase().includes(b.toLowerCase()))) return 60
  return 50
}

function generateBaseExplanation(factors: RecoveryProbabilityScore['factors'], score: number): string {
  if (score >= 80) return 'High recovery probability based on favorable timing, known location, and strong agent performance history.'
  if (score >= 60) return 'Moderate recovery probability. Location data and timing factors are partially favorable.'
  if (score >= 40) return 'Below average probability. Consider reassigning or gathering more location intelligence.'
  return 'Low recovery probability. This assignment may require escalated tactics or skip tracing.'
}

function generateBaseRecommendation(score: number, hourOfDay: number): string {
  if (hourOfDay >= 11 && hourOfDay <= 17) {
    return 'Consider dispatching in early morning (4-7am) for optimal recovery conditions.'
  }
  if (score >= 70) return 'Proceed with standard recovery protocol. Conditions are favorable.'
  if (score >= 50) return 'Gather additional location intelligence before dispatch.'
  return 'Escalate to skip tracing services and request borrower employer verification.'
}
