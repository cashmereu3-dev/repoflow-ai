'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCircle,
  BarChart3,
  Shield,
  MessageSquare,
  Settings,
  Zap,
  LogOut,
  ChevronLeft,
  Bell,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react'

interface DashboardShellProps {
  children: React.ReactNode
  profile: Record<string, unknown> | null
  user: { email?: string | undefined } | null
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/dashboard/agents', label: 'Agents', icon: Users },
  { href: '/dashboard/borrowers', label: 'Borrowers', icon: UserCircle },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/compliance', label: 'Compliance', icon: Shield },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardShell({ children, profile, user }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const org = profile?.organizations as Record<string, unknown> | null
  const fullName = (profile?.full_name as string) || (user?.email?.split('@')[0] ?? 'User')
  const role = (profile?.role as string) || 'user'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[hsl(var(--border))] ${collapsed ? 'justify-center' : ''}`}>
        {org?.logo_url ? (
          <img src={org.logo_url as string} alt="Organization Logo" className="w-8 h-8 object-contain bg-white rounded-lg p-0.5" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-sm text-white truncate">
              {org?.name ? (org.name as string) : 'RepoFlow AI'}
            </div>
            <div className="text-xs truncate" style={{ color: 'hsl(215,20%,50%)' }}>
              {org?.name ? 'Collateral Recovery' : (org?.name as string)}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Analytics quick link */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-10 bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300">AI Recovery Score</span>
          </div>
          <p className="text-xs" style={{ color: 'hsl(215,20%,50%)' }}>
            Predictive analytics updated in real-time
          </p>
        </div>
      )}

      {/* User */}
      <div className={`border-t border-[hsl(var(--border))] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-[hsl(var(--background-subtle))] text-[hsl(var(--foreground-muted))] hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{fullName}</div>
              <div className="text-xs capitalize" style={{ color: 'hsl(215,20%,50%)' }}>
                {role.replace('_', ' ')}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[hsl(var(--foreground-subtle))] hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] flex-shrink-0 relative overflow-hidden"
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background-card))] flex items-center justify-center hover:border-[hsl(var(--border-strong))] transition-colors z-10"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="w-3 h-3 text-[hsl(var(--foreground-muted))]" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-60 border-r border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))]/80 backdrop-blur-sm flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-[hsl(var(--background-subtle))] text-[hsl(var(--foreground-muted))]"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-[hsl(var(--background-subtle))] text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
