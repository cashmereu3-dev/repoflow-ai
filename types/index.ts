import { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type UserRole = Enums<'user_role'>
export type AssignmentStatus = Enums<'assignment_status'>
export type UploadType = Enums<'upload_type'>
export type MessageStatus = Enums<'message_status'>
export type PaymentStatus = Enums<'payment_status'>

export type Profile = Tables<'profiles'>
export type Organization = Tables<'organizations'>
export type Borrower = Tables<'borrowers'>
export type Vehicle = Tables<'vehicles'>
export type Agent = Tables<'agents'>
export type Assignment = Tables<'assignments'>
export type Upload = Tables<'uploads'>
export type Recovery = Tables<'recoveries'>
export type AuditLog = Tables<'audit_logs'>
export type Message = Tables<'messages'>
export type Notification = Tables<'notifications'>
export type Payment = Tables<'payments'>
export type GpsEvent = Tables<'gps_events'>

export interface AssignmentWithDetails extends Assignment {
  borrower: Borrower
  vehicle: Vehicle
  agent?: Agent & { profile: Profile }
  uploads?: Upload[]
  recovery?: Recovery
}

export interface DashboardStats {
  totalAssignments: number
  activeAssignments: number
  recoveredToday: number
  activeAgents: number
  recoveryRate: number
  avgDaysToRecover: number
}

export interface RecoveryProbabilityScore {
  score: number
  factors: {
    timeOfDay: number
    locationActivity: number
    assignmentHistory: number
    agentPerformance: number
    vehicleType: number
  }
  explanation: string
  recommendation: string
}

export interface AIExtractionResult {
  vehicleMake?: string
  vehicleModel?: string
  vehicleColor?: string
  vin?: string
  licensePlate?: string
  address?: string
  damageNotes?: string
  confidence: number
  rawResponse?: string
}
