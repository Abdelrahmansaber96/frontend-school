import type { Conversation } from '@/types';
import { fullName, timeAgo } from '@/lib/utils';
import SearchField from '@/components/ui/SearchField';
import Avatar from '@/components/ui/Avatar';
import { MessageSquare } from 'lucide-react';
import { PageSpinner } from '@/components/ui/Spinner';
import { getOtherParticipant, getUnreadCount } from './message-utils';

interface ConversationSidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeConversationId: string | null;
  currentUserId?: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (conversation: Conversation) => void;
}

export default function ConversationSidebar({
  conversations,
  isLoading,
  activeConversationId,
  currentUserId,
  search,
  onSearchChange,
  onSelect,
}: ConversationSidebarProps) {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col border-e border-stroke">
      <div className="border-b border-stroke p-4">
        <h2 className="mb-3 text-base font-semibold text-ink">الرسائل</h2>
        <SearchField
          placeholder="بحث في المحادثات…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <PageSpinner />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-ink-faint" />
            <p className="mt-2 text-sm text-ink-dim">لا توجد محادثات حتى الآن</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation, currentUserId);
            const unreadCount = getUnreadCount(conversation, currentUserId);

            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => onSelect(conversation)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-start transition-all duration-200 hover:bg-glaze/[0.05] ${
                  activeConversationId === conversation._id ? 'border-s-2 border-gold-500 bg-glaze/[0.08]' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar name={otherParticipant?.name} src={otherParticipant?.avatar} size="md" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {otherParticipant ? fullName(otherParticipant.name) : 'Unknown'}
                  </p>
                  {conversation.lastMessage && (
                    <p className="truncate text-xs text-ink-dim">{conversation.lastMessage.text}</p>
                  )}
                </div>

                {conversation.updatedAt && (
                  <span className="flex-shrink-0 text-xs text-ink-faint">
                    {timeAgo(conversation.updatedAt)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}