import type { Conversation } from '@/types';

export const getOtherParticipant = (
  conversation: Conversation,
  currentUserId?: string | null,
) => conversation.participants.find((participant) => participant._id !== currentUserId) ?? null;

export const getUnreadCount = (
  conversation: Conversation,
  currentUserId?: string | null,
) => (currentUserId ? conversation.unreadCount[currentUserId] ?? 0 : 0);