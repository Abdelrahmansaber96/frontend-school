'use client';

import { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingApi } from '@/lib/api';
import { getEntityPayload, type ListPayload } from '@/lib/api-contracts';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';
import type { Message } from '@/types';
import { usePaginatedListQuery } from './usePaginatedListQuery';

const buildEmptyMessageList = (): ListPayload<Message> => ({
  items: [],
  meta: null,
});

const appendUniqueMessage = (
  current: ListPayload<Message> | undefined,
  nextMessage: Message,
): ListPayload<Message> => {
  const payload = current ?? buildEmptyMessageList();

  if (payload.items.some((message) => message._id === nextMessage._id)) {
    return payload;
  }

  return {
    ...payload,
    items: [...payload.items, nextMessage],
  };
};

export const useConversationMessages = (
  conversationId: string | null,
  currentUserId?: string | null,
) => {
  const queryClient = useQueryClient();

  const messagesQuery = usePaginatedListQuery<Message>({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => messagingApi.getMessages(conversationId!, { page: 1, limit: 50 }),
    enabled: Boolean(conversationId),
    staleTime: 10_000,
  });

  const appendMessageToCache = useCallback((nextMessage: Message) => {
    queryClient.setQueryData<ListPayload<Message>>(
      ['conversation-messages', nextMessage.conversationId],
      (current) => appendUniqueMessage(current, nextMessage),
    );
  }, [queryClient]);

  const syncConversationRead = useCallback(async (targetConversationId: string, shouldRequest = true) => {
    try {
      if (shouldRequest) {
        await messagingApi.markRead(targetConversationId);
      }

      getSocket().emit(SOCKET_EVENTS.CONVERSATION_READ, { conversationId: targetConversationId });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      return;
    }
  }, [queryClient]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const socket = getSocket();
    const joinConversation = () => {
      socket.emit(SOCKET_EVENTS.CONVERSATION_JOIN, conversationId);
    };

    joinConversation();
    socket.on('connect', joinConversation);

    return () => {
      socket.off('connect', joinConversation);
      socket.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (nextMessage: Message) => {
      if (nextMessage.conversationId === conversationId) {
        appendMessageToCache(nextMessage);

        if (nextMessage.senderId._id !== currentUserId) {
          void syncConversationRead(nextMessage.conversationId);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleConversationUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on(SOCKET_EVENTS.MESSAGE_CREATED, handleNewMessage);
    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_CREATED, handleNewMessage);
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
    };
  }, [appendMessageToCache, conversationId, currentUserId, queryClient, syncConversationRead]);

  useEffect(() => {
    if (!conversationId || !messagesQuery.data) {
      return;
    }

    void syncConversationRead(conversationId, false);
  }, [conversationId, messagesQuery.data, messagesQuery.dataUpdatedAt, syncConversationRead]);

  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => messagingApi.sendMessage(conversationId!, { text }).then(getEntityPayload<Message>),
    onSuccess: (message) => {
      appendMessageToCache(message);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    messages: messagesQuery.data?.items ?? [],
    isLoading: messagesQuery.isLoading,
    isSending: sendMessageMutation.isPending,
    sendMessage: sendMessageMutation.mutateAsync,
  };
};