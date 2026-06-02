import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Car, ShieldCheck, MessageSquare, CreditCard, Menu } from 'lucide-react'
import Link from 'next/link'

export default async function BorrowerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userProfile = profile as any
  if (userProfile?.role !== 'borrower') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-violet-500" />
            <span className="font-bold text-lg text-white tracking-tight">Auto Portal</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/borrower" className="text-sm font-medium text-white">Dashboard</Link>
            <Link href="/borrower/messages" className="text-sm font-medium text-[hsl(var(--foreground-muted))] hover:text-white transition-colors">Messages</Link>
            <Link href="/borrower/surrender" className="text-sm font-medium text-[hsl(var(--foreground-muted))] hover:text-white transition-colors">Voluntary Surrender</Link>
          </div>

          <div className="flex items-center gap-4">
            <form action="/auth/signout" method="post">
              <button className="hidden md:flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground-muted))] hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
            <button className="md:hidden p-2 text-[hsl(var(--foreground-muted))]">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs">Secure Consumer Portal</span>
          </div>
          <div className="text-xs text-[hsl(var(--foreground-subtle))]">
            &copy; {new Date().getFullYear()} Auto Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
