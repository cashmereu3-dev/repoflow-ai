import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AssignmentStatus } from '@/types/index'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString))
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function getStatusColor(status: AssignmentStatus): string {
  const colors: Record<AssignmentStatus, string> = {
    new: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    assigned: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    in_progress: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    located: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    contact_made: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    recovered: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    voluntary_surrender: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    closed: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  }
  return colors[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

export function getStatusLabel(status: AssignmentStatus): string {
  const labels: Record<AssignmentStatus, string> = {
    new: 'New',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    located: 'Located',
    contact_made: 'Contact Made',
    recovered: 'Recovered',
    voluntary_surrender: 'Voluntary Surrender',
    closed: 'Closed',
  }
  return labels[status] || status
}

export function getPriorityLabel(priority: number | null | undefined): string {
  if (!priority) return 'Normal'
  if (priority >= 9) return 'Critical'
  if (priority >= 7) return 'High'
  if (priority >= 5) return 'Normal'
  if (priority >= 3) return 'Low'
  return 'Minimal'
}

export function getPriorityColor(priority: number | null | undefined): string {
  if (!priority) return 'text-slate-400'
  if (priority >= 9) return 'text-red-400'
  if (priority >= 7) return 'text-orange-400'
  if (priority >= 5) return 'text-yellow-400'
  return 'text-slate-400'
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 60) return 'Moderate'
  if (score >= 40) return 'Low'
  return 'Very Low'
}

export function formatVehicle(year?: number | null, make?: string | null, model?: string | null): string {
  return [year, make, model].filter(Boolean).join(' ') || 'Unknown Vehicle'
}

export function formatFullName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown'
}

export function daysSince(dateString: string | null | undefined): number {
  if (!dateString) return 0
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
