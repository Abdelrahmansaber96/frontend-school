'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { messagingApi } from '@/lib/api';
import { Conversation } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { fullName } from '@/lib/utils';
import ConversationSidebar from '@/components/messages/ConversationSidebar';
import ConversationThread from '@/components/messages/ConversationThread';
import { usePaginatedListQuery } from '@/hooks/usePaginatedListQuery';
import { useConversationMessages } from '@/hooks/useConversationMessages';

const EMPTY_CONVERSATIONS: Conversation[] = [];

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [msgText, setMsgText] = useState('');
  const [convSearch, setConvSearch] = useState('');
  const deferredConvSearch = useDeferredValue(convSearch);

  const conversationsQuery = usePaginatedListQuery<Conversation>({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.listConversations({ page: 1, limit: 100 }),
    staleTime: 10_000,
  });

  const conversations = conversationsQuery.data?.items ?? EMPTY_CONVERSATIONS;
  const activeConversation = conversations.find((conversation) => conversation._id === activeConvId) ?? null;
  const { messages, isLoading: loadingMessages, isSending, sendMessage } = useConversationMessages(activeConvId, user?._id);

  const filteredConversations = conversations.filter((conversation) => {
    if (!deferredConvSearch) return true;

    return conversation.participants.some((participant) =>
      fullName(participant.name).toLowerCase().includes(deferredConvSearch.toLowerCase()),
    );
  });

  useEffect(() => {
    if (conversations.length === 0) {
      if (activeConvId) {
        setActiveConvId(null);
      }
      return;
    }

    const hasActiveConversation = conversations.some((conversation) => conversation._id === activeConvId);
    if (!activeConvId || !hasActiveConversation) {
      setActiveConvId(conversations[0]._id);
    }
  }, [activeConvId, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConvId(conversation._id);
    setMsgText('');
  };

  const handleSendMessage = async () => {
    if (!msgText.trim() || !activeConvId) {
      return;
    }

    const nextText = msgText.trim();
    setMsgText('');

    try {
      await sendMessage(nextText);
    } catch {
      setMsgText(nextText);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-stroke bg-glaze/[0.02] backdrop-blur-xl shadow-lg">
      <ConversationSidebar
        conversations={filteredConversations}
        isLoading={conversationsQuery.isLoading}
        activeConversationId={activeConvId}
        currentUserId={user?._id}
        search={convSearch}
        onSearchChange={setConvSearch}
        onSelect={handleSelectConversation}
      />

      <div className="flex flex-1 flex-col">
        <ConversationThread
          conversation={activeConversation}
          messages={messages}
          isLoading={loadingMessages}
          isSending={isSending}
          currentUserId={user?._id}
          messageText={msgText}
          onMessageTextChange={setMsgText}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}
