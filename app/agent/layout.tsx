import Link from 'next/link'
import { Home, ListTodo, Upload } from 'lucide-react'

export const metadata = {
  title: 'Agent Dashboard',
  themeColor: '#000000',
}

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white dark">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-zinc-950 border-t border-zinc-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/agent" className="flex flex-col items-center justify-center w-full h-full text-zinc-400 hover:text-white transition-colors">
            <Home className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </Link>
          <Link href="/agent/upload" className="flex flex-col items-center justify-center w-full h-full text-zinc-400 hover:text-white transition-colors relative">
            <div className="absolute -top-5 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full border-4 border-black shadow-lg transition-transform active:scale-95">
              <Upload className="h-6 w-6" />
            </div>
            <span className="text-[10px] mt-7 font-medium">Upload</span>
          </Link>
          <Link href="/agent/assignments" className="flex flex-col items-center justify-center w-full h-full text-zinc-400 hover:text-white transition-colors">
            <ListTodo className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">Assignments</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
