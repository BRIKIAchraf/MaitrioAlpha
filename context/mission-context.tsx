import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";

export type MissionStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type MissionCategory =
  | "plomberie"
  | "electricite"
  | "peinture"
  | "menuiserie"
  | "jardinage"
  | "nettoyage"
  | "climatisation"
  | "maconnerie"
  | "serrurier"
  | "autre";

export type UrgencyLevel = "normal" | "urgent" | "tres_urgent";

export interface Mission {
  id: string;
  clientId: string;
  clientName: string;
  artisanId?: string;
  artisanName?: string;
  category: MissionCategory;
  title: string;
  description: string;
  address: string;
  scheduledDate: string;
  status: MissionStatus;
  urgency: UrgencyLevel;
  budget?: number;
  finalPrice?: number;
  rating?: number;
  createdAt: string;
}

interface MissionContextValue {
  missions: Mission[];
  addMission: (m: Omit<Mission, "id" | "createdAt">) => void;
  updateMission: (id: string, data: Partial<Mission>) => void;
  getMissionsByClient: (clientId: string) => Mission[];
  getMissionsByArtisan: (artisanId: string) => Mission[];
}

const MissionContext = createContext<MissionContextValue | null>(null);

const SAMPLE_MISSIONS: Mission[] = [
  {
    id: "m1",
    clientId: "c1",
    clientName: "Sophie Martin",
    artisanId: "a1",
    artisanName: "Mohamed Benali",
    category: "plomberie",
    title: "Réparation fuite robinet cuisine",
    description: "Fuite au niveau du robinet de la cuisine, urgent car perte d'eau importante.",
    address: "12 Rue de la Paix, Paris 75001",
    scheduledDate: "2026-03-15",
    status: "in_progress",
    urgency: "urgent",
    budget: 150,
    createdAt: "2026-03-10T08:00:00.000Z",
  },
  {
    id: "m2",
    clientId: "c1",
    clientName: "Sophie Martin",
    category: "electricite",
    title: "Installation prise électrique",
    description: "Besoin d'installer 3 prises électriques dans le salon.",
    address: "12 Rue de la Paix, Paris 75001",
    scheduledDate: "2026-03-20",
    status: "pending",
    urgency: "normal",
    budget: 200,
    createdAt: "2026-03-09T10:00:00.000Z",
  },
  {
    id: "m3",
    clientId: "c1",
    clientName: "Sophie Martin",
    artisanId: "a1",
    artisanName: "Mohamed Benali",
    category: "peinture",
    title: "Peinture chambre principale",
    description: "Refaire la peinture de la chambre principale (20m²).",
    address: "12 Rue de la Paix, Paris 75001",
    scheduledDate: "2026-02-28",
    status: "completed",
    urgency: "normal",
    budget: 800,
    finalPrice: 750,
    rating: 5,
    createdAt: "2026-02-20T09:00:00.000Z",
  },
];

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(SAMPLE_MISSIONS);

  function addMission(data: Omit<Mission, "id" | "createdAt">) {
    const newMission: Mission = {
      ...data,
      id: "m_" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setMissions((prev) => [newMission, ...prev]);
  }

  function updateMission(id: string, data: Partial<Mission>) {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }

  function getMissionsByClient(clientId: string) {
    return missions.filter((m) => m.clientId === clientId);
  }

  function getMissionsByArtisan(artisanId: string) {
    return missions.filter((m) => m.artisanId === artisanId);
  }

  const value = useMemo<MissionContextValue>(
    () => ({ missions, addMission, updateMission, getMissionsByClient, getMissionsByArtisan }),
    [missions]
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMissions() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error("useMissions must be used within MissionProvider");
  return ctx;
}
