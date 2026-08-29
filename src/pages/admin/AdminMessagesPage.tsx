import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { MessageSquare, Mail, MailOpen, Archive, Reply } from 'lucide-react';
import { getContactMessages, updateContactMessageStatus } from '../../services/contactService';
import type { ContactMessage, ContactStatus } from '../../types/database';
import { cn } from '../../lib/utils';

const STATUS_STYLES: Record<ContactStatus, string> = {
  unread:   'bg-blue-100 text-blue-700',
  read:     'bg-charcoal-100 text-charcoal-600',
  replied:  'bg-green-100 text-green-700',
  archived: 'bg-charcoal-50 text-charcoal-400',
};

const STATUS_NEXT: Partial<Record<ContactStatus, ContactStatus>> = {
  unread:  'read',
  read:    'replied',
  replied: 'archived',
};

const STATUS_ICON: Record<ContactStatus, React.ElementType> = {
  unread:   Mail,
  read:     MailOpen,
  replied:  Reply,
  archived: Archive,
};

export function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter,   setFilter]   = useState<ContactStatus | 'all'>('all');

  useEffect(() => {
    getContactMessages()
      .then(setMessages)
      .finally(() => setLoading(false));
  }, []);

  async function advance(id: string, status: ContactStatus) {
    await updateContactMessageStatus(id, { status });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
  }

  const displayed = filter === 'all' ? messages : messages.filter((m) => m.status === filter);
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal-800">Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-blue-600 font-medium mt-0.5">{unreadCount} unread</p>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'unread', 'read', 'replied', 'archived'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
              filter === f ? 'bg-primary-700 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-primary-300',
            )}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading messages…" />
      ) : displayed.length === 0 ? (
        <EmptyState icon={<MessageSquare className="w-10 h-10" />} title="No messages" description="No messages match the selected filter." />
      ) : (
        <div className="space-y-3">
          {displayed.map((msg) => {
            const Icon = STATUS_ICON[msg.status];
            const isOpen = expanded === msg.id;
            return (
              <div key={msg.id} className={cn('bg-white rounded-xl border transition-all duration-200', isOpen ? 'border-primary-200 shadow-sm' : 'border-charcoal-100')}>
                {/* Row */}
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(isOpen ? null : msg.id);
                    if (msg.status === 'unread') advance(msg.id, 'read');
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  <Icon className={cn('w-4 h-4 shrink-0', msg.status === 'unread' ? 'text-blue-500' : 'text-charcoal-300')} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn('text-sm font-semibold text-charcoal-800 truncate', msg.status === 'unread' && 'font-bold')}>
                        {msg.name}
                      </p>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize shrink-0', STATUS_STYLES[msg.status])}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 truncate mt-0.5">{msg.subject}</p>
                  </div>
                  <p className="text-xs text-charcoal-400 shrink-0 hidden sm:block">
                    {new Date(msg.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </p>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-charcoal-50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 mb-3 text-sm">
                      <div><span className="text-xs text-charcoal-400 block">From</span>{msg.name}</div>
                      <div><span className="text-xs text-charcoal-400 block">Email</span>
                        <a href={`mailto:${msg.email}`} className="text-primary-600 hover:underline">{msg.email}</a>
                      </div>
                      {msg.phone && <div><span className="text-xs text-charcoal-400 block">Phone</span>{msg.phone}</div>}
                    </div>
                    <div className="bg-cream-50 rounded-lg px-4 py-3 text-sm text-charcoal-700 leading-relaxed mb-4">
                      {msg.message}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-700 text-white text-xs font-medium hover:bg-primary-800 transition-colors">
                        <Reply className="w-3.5 h-3.5" aria-hidden="true" />
                        Reply by Email
                      </a>
                      {STATUS_NEXT[msg.status] && (
                        <button type="button"
                          onClick={() => advance(msg.id, STATUS_NEXT[msg.status]!)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-charcoal-200 text-charcoal-600 text-xs font-medium hover:bg-charcoal-50 capitalize transition-colors">
                          Mark as {STATUS_NEXT[msg.status]}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
