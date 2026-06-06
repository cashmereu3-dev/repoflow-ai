'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BorrowerMessagesPage() {
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [recipientId, setRecipientId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [assignmentId, setAssignmentId] = useState<string | null>(null)
  const [lenderName, setLenderName] = useState('Lender Representative')
  const [userId, setUserId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      // Get borrower record
      const { data: borrowerData } = await supabase
        .from('borrowers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      const borrower = borrowerData as any

      if (borrower) {
        // Get active case to find recipient (the creator of the assignment)
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*, lender:organizations(name)')
          .eq('borrower_id', borrower.id)
          .limit(1)

        const assignments = (assignmentsData || []) as any[]
        if (assignments.length > 0) {
          const caseData = assignments[0]
          setAssignmentId(caseData.id)
          setRecipientId(caseData.created_by)
          setOrgId(caseData.organization_id)
          if (caseData.lender?.name) {
            setLenderName(caseData.lender.name)
          }

          // Fetch message history
          const { data: msgData, error } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(full_name)')
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${caseData.created_by}),and(sender_id.eq.${caseData.created_by},recipient_id.eq.${user.id})`)
            .order('created_at', { ascending: true })

          if (error) {
            console.error('Error fetching messages:', error)
          } else {
            setMessages(msgData || [])
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [supabase, router])

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !recipientId || !orgId || !userId) return

    setSending(true)
    setErrorMsg('')

    try {
      const payload = {
        organization_id: orgId,
        assignment_id: assignmentId,
        sender_id: userId,
        body: newMessage.trim(),
        recipient_id: recipientId,
        subject: 'Voluntary Surrender / Case Inquiry',
        status: 'sent'
      }

      const { data: sentMsg, error } = await supabase
        .from('messages')
        .insert(payload as any)
        .select('*, sender:profiles!messages_sender_id_fkey(full_name)')
        .single()

      if (error) throw error

      setMessages([...messages, sentMsg])
      setNewMessage('')
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setErrorMsg(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!recipientId) {
    return (
      <div className="glass-card p-12 text-center max-w-2xl mx-auto mt-12 text-white">
        <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Active Representative</h2>
        <p className="text-[hsl(var(--foreground-muted))] mb-6">
          We couldn't find an active recovery case or a lender representative assigned to your account.
        </p>
        <Link href="/borrower" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-white flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link 
          href="/borrower" 
          className="p-2 rounded-lg bg-[hsl(var(--background-elevated))] border border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] hover:text-white hover:border-[hsl(var(--border-strong))] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Message Representative</h1>
          <p className="text-xs text-[hsl(var(--foreground-muted))]">
            Direct secure communication channel with {lenderName}
          </p>
        </div>
      </div>

      {/* Message Chat Container */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--background-card))] border border-[hsl(var(--border))] rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_id === userId
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div 
                  className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-violet-600 text-white rounded-tr-none' 
                      : 'bg-[hsl(var(--background-elevated))] text-zinc-200 border border-[hsl(var(--border))] rounded-tl-none'
                  }`}
                >
                  {msg.body}
                </div>
                <span className="text-[9px] text-[hsl(var(--foreground-muted))] mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--foreground-muted))] py-12">
              <MessageSquare className="w-12 h-12 mb-3 text-zinc-700" />
              <p className="text-sm">No message history. Send a message to start communicating.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-4 mb-2 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-violet-500/50"
              required
            />
            <button 
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
