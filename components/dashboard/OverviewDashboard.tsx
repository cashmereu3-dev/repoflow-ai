'use client'

import { motion } from 'framer-motion'
import {
  ClipboardList,
  Users,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
  Shield,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'

interface Stats {
  totalAssignments: number
  activeAssignments: number
  recoveredToday: number
  activeAgents: number
  totalAgents: number
  recoveryRate: number
}

interface StatusCounts {
  new: number
  assigned: number
  in_progress: number
  located: number
  contact_made: number
  recovered: number
  voluntary_surrender: number
  closed: number
}

interface AuditLog {
  id: string
  action: string
  resource_type: string
  created_at: string | null
  user_id: string | null
}

interface Props {
  stats: Stats
  statusCounts: StatusCounts
  recentAuditLogs: AuditLog[]
  orgId: string
}

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
}

// Mock trend data (replaced by real data when connected to Supabase)
const generateTrendData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, i) => ({
    day,
    assignments: Math.floor(Math.random() * 15) + 5,
    recoveries: Math.floor(Math.random() * 8) + 2,
  }))
}

const STATUS_COLORS: Record<string, string> = {
  new: '#60a5fa',
  assigned: '#a78bfa',
  in_progress: '#fbbf24',
  located: '#fb923c',
  contact_made: '#34d399',
  recovered: '#10b981',
  voluntary_surrender: '#2dd4bf',
  closed: '#64748b',
}

export default function OverviewDashboard({ stats, statusCounts, recentAuditLogs }: Props) {
  const trendData = generateTrendData()

  const pieData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      color: STATUS_COLORS[status] || '#64748b',
    }))

  const statCards = [
    {
      label: 'Total Assignments',
      value: stats.totalAssignments.toLocaleString(),
      icon: ClipboardList,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      change: '+12% this month',
      trend: 'up',
    },
    {
      label: 'Active Cases',
      value: stats.activeAssignments.toLocaleString(),
      icon: Activity,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
      change: 'In-field right now',
      trend: 'neutral',
    },
    {
      label: 'Recovered Today',
      value: stats.recoveredToday.toLocaleString(),
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      change: 'Units recovered',
      trend: 'up',
    },
    {
      label: 'Active Agents',
      value: `${stats.activeAgents}/${stats.totalAgents}`,
      icon: Users,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      change: 'Agents in field',
      trend: 'neutral',
    },
    {
      label: 'Recovery Rate',
      value: `${stats.recoveryRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      change: 'Average across agents',
      trend: stats.recoveryRate > 65 ? 'up' : 'down',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Operations Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(215,20%,55%)' }}>
            Real-time visibility across all recovery operations
          </p>
        </div>
        <Link href="/dashboard/assignments/new" className="btn-primary">
          <ClipboardList className="w-4 h-4" />
          New Assignment
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={CARD_VARIANTS as any}
              className="stat-card"
            >
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{card.value}</div>
              <div className="text-xs font-medium mb-1" style={{ color: 'hsl(215,20%,55%)' }}>
                {card.label}
              </div>
              <div className={`text-xs flex items-center gap-1 ${
                card.trend === 'up' ? 'text-emerald-400' :
                card.trend === 'down' ? 'text-red-400' :
                'text-slate-400'
              }`}>
                {card.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                {card.change}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Weekly Activity</h2>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(215,20%,50%)' }}>
                Assignments vs Recoveries
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="assignGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="recovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,20%,16%)" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(215,20%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,20%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(222,20%,10%)',
                  border: '1px solid hsl(215,20%,16%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'white', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="assignments" stroke="#7c3aed" fill="url(#assignGrad)" strokeWidth={2} name="Assignments" />
              <Area type="monotone" dataKey="recoveries" stroke="#10b981" fill="url(#recovGrad)" strokeWidth={2} name="Recoveries" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-white mb-4">Status Breakdown</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(222,20%,10%)',
                      border: '1px solid hsl(215,20%,16%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.slice(0, 4).map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                      <span className="capitalize" style={{ color: 'hsl(215,20%,60%)' }}>{entry.name}</span>
                    </div>
                    <span className="font-semibold text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ClipboardList className="w-8 h-8 mb-2" style={{ color: 'hsl(215,20%,35%)' }} />
              <p className="text-xs" style={{ color: 'hsl(215,20%,45%)' }}>No assignments yet</p>
              <Link href="/dashboard/assignments/new" className="btn-primary mt-3 text-xs py-1.5 px-3">
                Create First Assignment
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Audit Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Audit Activity</h2>
            </div>
            <Link href="/dashboard/compliance" className="text-xs text-violet-400 hover:text-violet-300">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentAuditLogs.length > 0 ? recentAuditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-[hsl(var(--border))] last:border-0">
                <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-3 h-3 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white capitalize">
                    {log.action.toLowerCase()} {log.resource_type.replace('_', ' ')}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'hsl(215,20%,50%)' }}>
                    {formatRelativeTime(log.created_at)}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-xs text-center py-6" style={{ color: 'hsl(215,20%,45%)' }}>
                No audit events yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/dashboard/assignments/new', label: 'New Assignment', icon: ClipboardList, color: 'violet' },
              { href: '/dashboard/agents', label: 'View Agents', icon: Users, color: 'blue' },
              { href: '/dashboard/borrowers', label: 'Borrowers', icon: Users, color: 'emerald' },
              { href: '/dashboard/analytics', label: 'AI Analytics', icon: TrendingUp, color: 'orange' },
              { href: '/dashboard/messages', label: 'Messages', icon: Activity, color: 'cyan' },
              { href: '/dashboard/compliance', label: 'Compliance', icon: Shield, color: 'purple' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--background-subtle))] transition-all group"
                >
                  <Icon className="w-4 h-4 text-[hsl(var(--foreground-muted))] group-hover:text-violet-400 transition-colors" />
                  <span className="text-xs font-medium text-[hsl(var(--foreground-muted))] group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
