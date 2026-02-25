import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  userId: string;
  missionId?: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  photos: string[];
  responses: TicketResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketResponse {
  id: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

interface SupportContextValue {
  tickets: SupportTicket[];
  isLoading: boolean;
  createTicket: (data: CreateTicketData) => Promise<SupportTicket>;
  addResponse: (ticketId: string, senderId: string, senderName: string, message: string) => Promise<void>;
  getTicketsForUser: (userId: string) => SupportTicket[];
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
}

export interface CreateTicketData {
  userId: string;
  missionId?: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  category: string;
  photos: string[];
}

const SupportContext = createContext<SupportContextValue | null>(null);
const STORAGE_KEY = "@maison_tickets";

export function SupportProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTickets(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }

  async function save(updated: SupportTicket[]) {
    setTickets(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function createTicket(data: CreateTicketData): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      ...data,
      id: Crypto.randomUUID(),
      status: "open",
      responses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [ticket, ...tickets];
    await save(updated);
    setTimeout(async () => {
      const autoResponse: TicketResponse = {
        id: Crypto.randomUUID(),
        senderId: "admin",
        senderName: "Support Maison",
        isAdmin: true,
        message: "Merci pour votre message. Notre équipe examine votre demande et vous répondra dans les plus brefs délais.",
        createdAt: new Date().toISOString(),
      };
      const withResponse = updated.map((t) =>
        t.id === ticket.id
          ? { ...t, responses: [autoResponse], status: "in_progress" as TicketStatus, updatedAt: new Date().toISOString() }
          : t
      );
      await save(withResponse);
    }, 2000);
    return ticket;
  }

  async function addResponse(ticketId: string, senderId: string, senderName: string, message: string) {
    const response: TicketResponse = {
      id: Crypto.randomUUID(),
      senderId,
      senderName,
      isAdmin: false,
      message,
      createdAt: new Date().toISOString(),
    };
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? { ...t, responses: [...t.responses, response], updatedAt: new Date().toISOString() }
        : t
    );
    await save(updated);
  }

  function getTicketsForUser(userId: string) {
    return tickets.filter((t) => t.userId === userId);
  }

  async function updateTicketStatus(ticketId: string, status: TicketStatus) {
    const updated = tickets.map((t) =>
      t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );
    await save(updated);
  }

  const value = useMemo<SupportContextValue>(
    () => ({ tickets, isLoading, createTicket, addResponse, getTicketsForUser, updateTicketStatus }),
    [tickets, isLoading]
  );

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error("useSupport must be used within SupportProvider");
  return ctx;
}
