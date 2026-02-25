import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  missionId: string;
  missionTitle: string;
  clientId: string;
  clientName: string;
  artisanId: string;
  artisanName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

interface ChatContextValue {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
  getOrCreateConversation: (
    missionId: string,
    missionTitle: string,
    clientId: string,
    clientName: string,
    artisanId: string,
    artisanName: string
  ) => Promise<Conversation>;
  sendMessage: (conversationId: string, senderId: string, senderName: string, text: string) => Promise<void>;
  getConversationsForUser: (userId: string) => Conversation[];
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);
const CONVS_KEY = "@maison_conversations";
const MSGS_KEY = "@maison_messages";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [convStored, msgStored] = await Promise.all([
        AsyncStorage.getItem(CONVS_KEY),
        AsyncStorage.getItem(MSGS_KEY),
      ]);
      if (convStored) setConversations(JSON.parse(convStored));
      if (msgStored) setMessages(JSON.parse(msgStored));
    } catch {}
    setIsLoading(false);
  }

  async function saveConversations(updated: Conversation[]) {
    setConversations(updated);
    await AsyncStorage.setItem(CONVS_KEY, JSON.stringify(updated));
  }

  async function saveMessages(updated: Record<string, Message[]>) {
    setMessages(updated);
    await AsyncStorage.setItem(MSGS_KEY, JSON.stringify(updated));
  }

  async function getOrCreateConversation(
    missionId: string,
    missionTitle: string,
    clientId: string,
    clientName: string,
    artisanId: string,
    artisanName: string
  ): Promise<Conversation> {
    const existing = conversations.find((c) => c.missionId === missionId);
    if (existing) return existing;

    const conv: Conversation = {
      id: Crypto.randomUUID(),
      missionId,
      missionTitle,
      clientId,
      clientName,
      artisanId,
      artisanName,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [conv, ...conversations];
    await saveConversations(updated);
    return conv;
  }

  async function sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    text: string
  ) {
    const msg: Message = {
      id: Crypto.randomUUID(),
      conversationId,
      senderId,
      senderName,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const convMsgs = messages[conversationId] || [];
    const updatedMsgs = { ...messages, [conversationId]: [...convMsgs, msg] };
    await saveMessages(updatedMsgs);

    const updatedConvs = conversations.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            lastMessage: text,
            lastMessageAt: msg.createdAt,
            unreadCount: c.unreadCount + 1,
          }
        : c
    );
    await saveConversations(updatedConvs);
  }

  function getConversationsForUser(userId: string) {
    return conversations.filter(
      (c) => c.clientId === userId || c.artisanId === userId
    );
  }

  async function markAsRead(conversationId: string, userId: string) {
    const convMsgs = (messages[conversationId] || []).map((m) =>
      m.senderId !== userId ? { ...m, read: true } : m
    );
    const updatedMsgs = { ...messages, [conversationId]: convMsgs };
    await saveMessages(updatedMsgs);
    const updatedConvs = conversations.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    );
    await saveConversations(updatedConvs);
  }

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      messages,
      isLoading,
      getOrCreateConversation,
      sendMessage,
      getConversationsForUser,
      markAsRead,
    }),
    [conversations, messages, isLoading]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
