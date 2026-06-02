import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime } from '@/lib/utils'
import { MessageSquare, Search, Send, User } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const userProfile = profile as any
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(full_name, role), recipient:profiles!messages_recipient_id_fkey(full_name, role)')
    .eq('organization_id', userProfile?.organization_id ?? '')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[hsl(var(--background-card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden shadow-2xl">
      {/* Sidebar / Conversation List */}
      <div className="w-80 border-r border-[hsl(var(--border))] flex flex-col bg-[hsl(var(--background-elevated))]">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-muted))]" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {messages?.map((item) => {
            const msg = item as any
            const sender = msg.sender as any
            const isUnread = !msg.read_at && msg.recipient_id === user!.id

            return (
              <div 
                key={msg.id} 
                className={`p-4 border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--background-subtle))] cursor-pointer transition-colors relative ${isUnread ? 'bg-violet-500/5' : ''}`}
              >
                {isUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
                )}
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-white text-sm truncate pr-2">
                    {sender?.full_name || 'Unknown User'}
                  </div>
                  <div className="text-[10px] text-[hsl(var(--foreground-muted))] whitespace-nowrap">
                    {formatRelativeTime(msg.created_at)}
                  </div>
                </div>
                <div className="text-xs text-violet-400 mb-1 capitalize">
                  {sender?.role?.replace('_', ' ')}
                </div>
                <div className="text-sm text-[hsl(var(--foreground-muted))] truncate">
                  {msg.subject || msg.body}
                </div>
              </div>
            )
          })}

          {(!messages || messages.length === 0) && (
            <div className="p-8 text-center text-[hsl(var(--foreground-muted))]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col bg-[hsl(var(--background))]">
        {/* Header */}
        <div className="h-16 border-b border-[hsl(var(--border))] flex items-center px-6 bg-[hsl(var(--background-elevated))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] flex items-center justify-center">
              <User className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Select a conversation</div>
              <div className="text-xs text-[hsl(var(--foreground-muted))]">To view messages</div>
            </div>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-[hsl(var(--foreground-muted))]">
          <MessageSquare className="w-12 h-12 mb-4 text-[hsl(var(--border-strong))]" />
          <p>Select a conversation from the left to start messaging.</p>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))]">
          <div className="relative">
            <textarea 
              placeholder="Type a message..." 
              className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl py-3 pl-4 pr-12 text-sm text-white resize-none focus:outline-none focus:border-violet-500/50"
              rows={2}
              disabled
            />
            <button className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
