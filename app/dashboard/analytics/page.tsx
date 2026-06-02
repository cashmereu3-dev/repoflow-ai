'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  Brain,
  Clock,
  MapPin,
  Car,
  AlertTriangle,
  Zap
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

const MOCK_TIME_DATA = [
  { hour: '12am', success: 15, attempts: 20 },
  { hour: '4am', success: 85, attempts: 90 },
  { hour: '8am', success: 45, attempts: 60 },
  { hour: '12pm', success: 20, attempts: 40 },
  { hour: '4pm', success: 25, attempts: 50 },
  { hour: '8pm', success: 65, attempts: 75 },
]

const MOCK_VEHICLE_DATA = [
  { type: 'Luxury SUV', rate: 78 },
  { type: 'Standard SUV', rate: 65 },
  { type: 'Sedan', rate: 62 },
  { type: 'Truck', rate: 58 },
  { type: 'Sports', rate: 45 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-7 h-7 text-violet-500" />
            AI Analytics Engine
          </h1>
          <p className="text-sm mt-1 text-[hsl(var(--foreground-muted))]">
            Predictive modeling and recovery probability scoring
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 text-violet-400 px-4 py-2 rounded-lg text-sm font-semibold">
          <Zap className="w-4 h-4 text-yellow-400" />
          Model: gpt-4o-mini (Live)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Insights Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recovery Probability Model</h2>
              <select className="bg-[hsl(var(--background-elevated))] border border-[hsl(var(--border))] text-sm rounded-lg px-3 py-1.5 outline-none">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Year to Date</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <div className="text-sm font-medium text-emerald-400 mb-1">Model Accuracy</div>
                <div className="text-3xl font-bold text-white">92.4%</div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mt-1">vs actual recovery outcomes</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
                <div className="text-sm font-medium text-violet-400 mb-1">Avg Probability Score</div>
                <div className="text-3xl font-bold text-white">68<span className="text-xl text-[hsl(var(--foreground-muted))]">/100</span></div>
                <div className="text-xs text-[hsl(var(--foreground-muted))] mt-1">Across all active assignments</div>
              </div>
            </div>

            <h3 className="text-sm font-medium text-[hsl(var(--foreground-muted))] mb-4 uppercase tracking-wider">
              Time-of-Day Optimization
            </h3>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_TIME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,20%,16%)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: 'hsl(215,20%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(215,20%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(222,20%,10%)',
                      border: '1px solid hsl(215,20%,16%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="attempts" stroke="#64748b" strokeWidth={2} name="Total Attempts" />
                  <Line type="monotone" dataKey="success" stroke="#34d399" strokeWidth={3} name="Successful Recoveries" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-start gap-3">
              <Brain className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-emerald-400">AI Recommendation</div>
                <div className="text-xs text-emerald-400/80 mt-0.5">
                  Shift 40% of standard daytime operations to the 3:00 AM - 6:00 AM window. Historical data shows an 85% success rate during this time frame, reducing agent field time by 2.4 hours per recovery.
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Asset Class Performance</h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_VEHICLE_DATA} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,20%,16%)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(215,20%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="type" type="category" tick={{ fill: 'white', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(215,20%,16%)' }}
                    contentStyle={{
                      background: 'hsl(222,20%,10%)',
                      border: '1px solid hsl(215,20%,16%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="rate" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Recovery Rate %" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Factors */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-white mb-4">Probability Factors</h2>
            <p className="text-xs text-[hsl(var(--foreground-muted))] mb-6 leading-relaxed">
              The AI scoring engine uses these weighted vectors to determine the 0-100 recovery probability score for every assignment.
            </p>

            <div className="space-y-5">
              {[
                { name: 'Location Intelligence', weight: '30%', icon: MapPin, color: 'text-blue-400', val: 75 },
                { name: 'Time of Day', weight: '20%', icon: Clock, color: 'text-violet-400', val: 90 },
                { name: 'Agent Performance', weight: '20%', icon: TrendingUp, color: 'text-emerald-400', val: 65 },
                { name: 'Assignment Aging', weight: '20%', icon: AlertTriangle, color: 'text-orange-400', val: 40 },
                { name: 'Asset Type', weight: '10%', icon: Car, color: 'text-slate-400', val: 60 },
              ].map((factor) => {
                const Icon = factor.icon
                return (
                  <div key={factor.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${factor.color}`} />
                        <span className="text-sm font-medium text-white">{factor.name}</span>
                      </div>
                      <span className="text-xs font-mono text-[hsl(var(--foreground-subtle))]">w: {factor.weight}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[hsl(var(--background-elevated))] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500" 
                        style={{ width: `${factor.val}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-card p-6 border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.05)]">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              Automated Workflows
            </h2>
            <p className="text-xs text-[hsl(var(--foreground-muted))] mb-4">
              AI-driven operations automatically executed based on probability scores.
            </p>
            
            <div className="space-y-3">
              <div className="p-3 bg-[hsl(var(--background-elevated))] rounded-lg border border-[hsl(var(--border))]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">Score &lt; 40</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">ACTIVE</span>
                </div>
                <div className="text-xs text-[hsl(var(--foreground-muted))]">
                  Auto-escalate to skip tracing and queue LPR search.
                </div>
              </div>
              <div className="p-3 bg-[hsl(var(--background-elevated))] rounded-lg border border-[hsl(var(--border))]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">Score &gt; 80</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">ACTIVE</span>
                </div>
                <div className="text-xs text-[hsl(var(--foreground-muted))]">
                  Priority dispatch to nearest available Top Tier agent.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
