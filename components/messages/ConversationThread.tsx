import { useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import type { Conversation, Message } from '@/types';
import { fullName, timeAgo } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import { getOtherParticipant } from './message-utils';

interface ConversationThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  currentUserId?: string | null;
  messageText: string;
  onMessageTextChange: (value: string) => void;
  onSend: () => void;
}

export default function ConversationThread({
  conversation,
  messages,
  isLoading,
  isSending,
  currentUserId,
  messageText,
  onMessageTextChange,
  onSend,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?._id, messages.length]);

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <MessageSquare className="h-12 w-12 text-ink-faint" />
        <h3 className="text-base font-medium text-ink-dim">اختر محادثة</h3>
        <p className="text-sm text-ink-faint">اختر محادثة من القائمة لبدء المراسلة</p>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant(conversation, currentUserId);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-stroke px-5 py-4">
        <Avatar name={otherParticipant?.name} src={otherParticipant?.avatar} size="md" />
        <div>
          <p className="font-semibold text-ink">
            {otherParticipant ? fullName(otherParticipant.name) : 'Unknown'}
          </p>
          <p className="text-xs capitalize text-ink-dim">{otherParticipant?.role?.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="h-8 w-8 text-ink-faint" />
            <p className="mt-2 text-sm text-ink-dim">لا توجد رسائل بعد. ابدأ المحادثة!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId._id === currentUserId;

            return (
              <div
                key={message._id}
                className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                {!isCurrentUser && <Avatar name={message.senderId.name} src={message.senderId.avatar} size="sm" />}
                <div
                  className={`max-w-sm rounded-2xl px-4 py-2.5 ${
                    isCurrentUser
                      ? 'rounded-br-sm bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950'
                      : 'rounded-bl-sm border border-stroke bg-glaze/[0.08] text-ink'
                  }`}
                >
                  {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
                  <p className={`mt-1 text-right text-xs ${isCurrentUser ? 'text-navy-900/60' : 'text-ink-faint'}`}>
                    {timeAgo(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stroke p-4">
        <div className="flex items-center gap-3 rounded-xl border border-stroke bg-glaze/[0.04] px-4 py-2 backdrop-blur-sm transition-all duration-300 focus-within:border-gold-500/60 focus-within:ring-1 focus-within:ring-gold-500/20">
          <input
            type="text"
            placeholder="اكتب رسالة…"
            value={messageText}
            onChange={(event) => onMessageTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!messageText.trim() || isSending}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(200,162,77,0.4)] disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}