import React, { useState, useEffect } from 'react'
import { Mail, CheckCircle2, Clock, Eye, RefreshCw, AlertCircle, Check } from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminTable from '../../components/admin/AdminTable'
import AdminModal from '../../components/admin/AdminModal'

const MESSAGE_STATUSES = ['ALL', 'UNREAD', 'READ', 'RESOLVED']

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ type: null, text: '' })
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState(null)

  const loadMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getInquiries()
      setMessages(data || [])
    } catch (err) {
      setError(err.message || 'Failed to retrieve concierge messages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await adminApi.updateInquiryStatus(id, status)
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      )
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => ({ ...prev, status }))
      }
      setFeedback({ type: 'success', text: `Message marked as ${status}.` })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Status update failed.' })
    } finally {
      setUpdatingId(null)
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    }
  }

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg)
    if (msg.status === 'UNREAD') {
      handleUpdateStatus(msg.id, 'READ')
    }
  }

  const filtered = messages.filter(
    (m) => statusFilter === 'ALL' || m.status === statusFilter
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
            CLIENT CONCIERGE & INQUIRIES
          </span>
          <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
            CLIENTELE MESSAGES
          </h2>
        </div>

        <button
          type="button"
          onClick={loadMessages}
          className="px-4 py-2 bg-[#171717] border border-[#2B2B2B] hover:border-[#B8FF00] hover:text-[#B8FF00] text-xs font-mono uppercase tracking-wider text-[#F5F5F5] transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          <span>SYNC MESSAGES</span>
        </button>
      </div>

      {feedback.text && (
        <div
          className={`p-3.5 text-xs font-mono border flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'border-[#B8FF00] bg-[#172405] text-[#B8FF00]'
              : 'border-[#8B0000] bg-[#221010] text-[#FF4D4D]'
          }`}
        >
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {MESSAGE_STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 border uppercase transition-colors cursor-pointer ${
              statusFilter === st
                ? 'border-[#B8FF00] text-[#B8FF00] bg-[#171717]'
                : 'border-[#222222] text-[#A6A6A6] bg-[#111111] hover:border-[#333333]'
            }`}
          >
            {st} ({st === 'ALL' ? messages.length : messages.filter((m) => m.status === st).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <AdminTable
        loading={loading}
        error={error}
        data={filtered}
        emptyMessage="No customer concierge inquiries match this filter."
        onRetry={loadMessages}
        columns={[
          {
            header: 'CLIENT & EMAIL',
            key: 'name',
            render: (m) => (
              <div>
                <span className="font-sans font-semibold text-xs text-[#F5F5F5] block">
                  {m.name}
                </span>
                <span className="text-[10px] text-[#737373] font-mono block">
                  {m.email}
                </span>
              </div>
            ),
          },
          {
            header: 'SUBJECT',
            key: 'subject',
            render: (m) => (
              <span className="font-medium text-[#F5F5F5] line-clamp-1 max-w-[200px]">
                {m.subject || 'Atelier Inquiry'}
              </span>
            ),
          },
          {
            header: 'MESSAGE PREVIEW',
            key: 'message',
            render: (m) => (
              <span className="text-[#A6A6A6] text-xs line-clamp-1 max-w-[280px]">
                {m.message}
              </span>
            ),
          },
          {
            header: 'STATUS',
            key: 'status',
            render: (m) => (
              <span
                className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                  m.status === 'UNREAD'
                    ? 'border-[#FF4D4D] text-[#FF4D4D] bg-[#221010]'
                    : m.status === 'RESOLVED'
                    ? 'border-[#1F2E12] text-[#B8FF00] bg-[#121B0A]'
                    : 'border-[#262626] text-[#A6A6A6] bg-[#161616]'
                }`}
              >
                {m.status || 'UNREAD'}
              </span>
            ),
          },
          {
            header: 'RECEIVED',
            key: 'createdAt',
            render: (m) => (
              <span className="text-[#737373] text-[10px]">
                {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            ),
          },
          {
            header: 'ACTIONS',
            key: 'actions',
            className: 'text-right',
            render: (m) => (
              <button
                type="button"
                onClick={() => handleOpenMessage(m)}
                className="p-1.5 border border-[#262626] hover:border-[#B8FF00] hover:text-[#B8FF00] text-[#A6A6A6] transition-colors cursor-pointer"
                title="Inspect message"
              >
                <Eye size={13} />
              </button>
            ),
          },
        ]}
      />

      {/* Message Modal */}
      <AdminModal
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title="CONCIERGE DISPATCH DOSSIER"
      >
        {selectedMessage && (
          <div className="space-y-5 text-xs font-mono">
            <div className="p-4 bg-[#141414] border border-[#222222] space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-bold text-[#F5F5F5] font-sans block">
                    {selectedMessage.name}
                  </span>
                  <span className="text-xs text-[#B8FF00]">
                    {selectedMessage.email}
                  </span>
                </div>
                <span className="text-[10px] text-[#737373]">
                  {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : ''}
                </span>
              </div>
              <div className="pt-2 border-t border-[#222222]">
                <span className="text-[10px] uppercase text-[#737373] block">SUBJECT</span>
                <span className="text-xs text-[#F5F5F5] font-semibold">
                  {selectedMessage.subject}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#161616] border border-[#222222] space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#A6A6A6] block">
                MESSAGE TRANSMISSION
              </span>
              <p className="text-xs font-sans text-[#E5E5E5] leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>

            <div className="pt-4 border-t border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#737373] uppercase">SET STATUS:</span>
                {['UNREAD', 'READ', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updatingId === selectedMessage.id}
                    onClick={() => handleUpdateStatus(selectedMessage.id, st)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase border transition-colors cursor-pointer ${
                      selectedMessage.status === st
                        ? 'border-[#B8FF00] bg-[#172405] text-[#B8FF00]'
                        : 'border-[#262626] bg-[#141414] text-[#A6A6A6] hover:border-[#333333]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 border border-[#333333] bg-[#141414] hover:bg-[#1F1F1F] text-[#F5F5F5] cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
