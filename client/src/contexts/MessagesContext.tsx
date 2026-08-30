import React, { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type ParticipantRole = "farmer" | "vendor" | "provider";

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: ParticipantRole;
  company?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  type: "text" | "order_ref" | "product_ref" | "image";
  metadata?: { orderId?: string; orderNumber?: string; productName?: string; productImage?: string; imageUrl?: string };
}

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  relatedOrderId?: string;
  relatedOrderNumber?: string;
  subject?: string;
  pinned?: boolean;
}

interface MessagesContextValue {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  getMessages: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, text: string, type?: Message["type"], metadata?: Message["metadata"]) => void;
  markAsRead: (conversationId: string) => void;
  totalUnread: number;
  startConversation: (participant: Participant, subject?: string, orderId?: string, orderNumber?: string) => string;
  deleteConversation: (conversationId: string) => void;
  searchConversations: (query: string) => Conversation[];
}

const MessagesContext = createContext<MessagesContextValue | null>(null);
const CURRENT_PARTICIPANT_ID = "current-user";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used inside MessagesProvider");
  return ctx;
}

export function MessagesProvider({ children }: { children: ReactNode; onNewMessage?: (conv: Conversation, msg: Message) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  const getMessages = useCallback((conversationId: string) => messages[conversationId] ?? [], [messages]);
  const sendMessage = useCallback((conversationId: string, text: string, type: Message["type"] = "text", metadata?: Message["metadata"]) => {
    const message: Message = { id: makeId(), conversationId, senderId: CURRENT_PARTICIPANT_ID, text, timestamp: new Date(), read: true, type, metadata };
    setMessages((current) => ({ ...current, [conversationId]: [...(current[conversationId] ?? []), message] }));
    setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, lastMessage: message, updatedAt: message.timestamp } : conversation).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  }, []);
  const markAsRead = useCallback((conversationId: string) => {
    setMessages((current) => ({ ...current, [conversationId]: (current[conversationId] ?? []).map((message) => ({ ...message, read: true })) }));
    setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation));
  }, []);
  const startConversation = useCallback((participant: Participant, subject?: string, orderId?: string, orderNumber?: string) => {
    const existing = conversations.find((conversation) => conversation.participants.some((item) => item.id === participant.id));
    if (existing) return existing.id;
    const now = new Date();
    const conversation: Conversation = { id: `local_${makeId()}`, participants: [{ id: CURRENT_PARTICIPANT_ID, name: "الحساب الحالي", avatar: "", role: "farmer", isOnline: true }, participant], unreadCount: 0, createdAt: now, updatedAt: now, subject, relatedOrderId: orderId, relatedOrderNumber: orderNumber };
    setConversations((current) => [conversation, ...current]);
    setMessages((current) => ({ ...current, [conversation.id]: [] }));
    return conversation.id;
  }, [conversations]);
  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
    setMessages((current) => { const next = { ...current }; delete next[conversationId]; return next; });
  }, []);
  const searchConversations = useCallback((query: string) => {
    if (!query.trim()) return conversations;
    const normalized = query.toLocaleLowerCase("ar-SA");
    return conversations.filter((conversation) => conversation.participants.some((participant) => participant.id !== CURRENT_PARTICIPANT_ID && (participant.name.toLocaleLowerCase("ar-SA").includes(normalized) || participant.company?.toLocaleLowerCase("ar-SA").includes(normalized))) || conversation.subject?.toLocaleLowerCase("ar-SA").includes(normalized) || conversation.lastMessage?.text.toLocaleLowerCase("ar-SA").includes(normalized) || conversation.relatedOrderNumber?.toLocaleLowerCase("ar-SA").includes(normalized));
  }, [conversations]);

  return <MessagesContext.Provider value={{ conversations, activeConversationId, setActiveConversationId, getMessages, sendMessage, markAsRead, totalUnread, startConversation, deleteConversation, searchConversations }}>{children}</MessagesContext.Provider>;
}
