import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from "react";
import { apiRequest } from "@/lib/query-client";

export type MissionStatus =
  | "pending"
  | "accepted"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "validated"
  | "cancelled"
  | "disputed";

export type MissionCategory =
  | "debarras"
  | "nettoyage"
  | "serrurier"
  | "plomberie"
  | "electricite"
  | "frigoriste"
  | "peinture"
  | "menuiserie"
  | "jardinage"
  | "climatisation"
  | "maconnerie"
  | "autre";

export type UrgencyLevel = "normal" | "urgent" | "tres_urgent";

export interface RatingCriteria {
  quality: number;
  punctuality: number;
  communication: number;
  overall: number;
  comment?: string;
}

export interface Quote {
  id: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface PaymentInfo {
  amount: number;
  status: "pending" | "escrowed" | "released" | "refunded";
  paidAt?: string;
  releasedAt?: string;
  method: string;
}

export interface Mission {
  id: string;
  clientId: string;
  clientName?: string;
  artisanId?: string;
  artisanName?: string;
  category: MissionCategory;
  title: string;
  description: string;
  address: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: MissionStatus;
  photos: string[];
  checkInPhotos?: string[];
  checkOutPhotos?: string[];
  budget?: number;
  estimatedPrice?: number | { min: number; max: number };
  finalPrice?: number;
  estimatedDuration?: string;
  urgency: UrgencyLevel;
  rating?: RatingCriteria;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

interface MissionContextValue {
  missions: Mission[];
  isLoading: boolean;
  refreshMissions: (userId?: string, role?: string) => Promise<void>;
  createMission: (data: CreateMissionData) => Promise<Mission>;
  updateMission: (id: string, data: Partial<Mission>) => Promise<void>;
  getMission: (id: string) => Mission | undefined;
  getMissionsByClient: (clientId: string) => Mission[];
  getAvailableMissions: () => Mission[];
  getArtisanMissions: (artisanId: string) => Mission[];
  acceptMission: (missionId: string, artisanId: string, artisanName: string) => Promise<void>;
  completeMission: (missionId: string, report: string, photos: string[]) => Promise<void>;
  validateMission: (missionId: string) => Promise<void>;
  rateMission: (missionId: string, rating: RatingCriteria) => Promise<void>;
  disputeMission: (missionId: string) => Promise<void>;
}

export interface CreateMissionData {
  clientId: string;
  clientName?: string;
  category: MissionCategory;
  title: string;
  description: string;
  address: string;
  scheduledDate?: string;
  scheduledTime?: string;
  photos?: string[];
  budget?: number;
  urgency?: UrgencyLevel;
}

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMissions = useCallback(async (userId?: string, role?: string) => {
    setIsLoading(true);
    try {
      if (userId && role === "artisan") {
        const [artisanRes, pendingRes] = await Promise.all([
          apiRequest("GET", `/api/missions?artisanId=${userId}`),
          apiRequest("GET", "/api/missions?status=pending"),
        ]);
        const artisanMissions = await artisanRes.json();
        const pendingMissions = await pendingRes.json();
        const allIds = new Set(artisanMissions.map((m: any) => m.id));
        const combined = [...artisanMissions, ...pendingMissions.filter((m: any) => !allIds.has(m.id))];
        setMissions(combined);
      } else if (userId && role === "client") {
        const res = await apiRequest("GET", `/api/missions?clientId=${userId}`);
        setMissions(await res.json());
      } else {
        const res = await apiRequest("GET", "/api/missions");
        setMissions(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch missions:", e);
    }
    setIsLoading(false);
  }, []);

  async function createMission(data: CreateMissionData): Promise<Mission> {
    const res = await apiRequest("POST", "/api/missions", {
      clientId: data.clientId,
      title: data.title,
      description: data.description,
      category: data.category,
      address: data.address,
      estimatedPrice: data.budget,
      urgency: data.urgency || "normal",
      photos: JSON.stringify(data.photos || []),
      status: "pending",
    });
    const mission = await res.json();
    setMissions(prev => [mission, ...prev]);
    return mission;
  }

  async function updateMission(id: string, data: Partial<Mission>) {
    const res = await apiRequest("PUT", `/api/missions/${id}`, data);
    const updated = await res.json();
    setMissions(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
  }

  const getMission = useCallback(
    (id: string) => missions.find((m) => m.id === id),
    [missions]
  );

  const getMissionsByClient = useCallback(
    (clientId: string) => missions.filter((m) => m.clientId === clientId),
    [missions]
  );

  const getAvailableMissions = useCallback(
    () => missions.filter((m) => m.status === "pending" && !m.artisanId),
    [missions]
  );

  const getArtisanMissions = useCallback(
    (artisanId: string) => missions.filter((m) => m.artisanId === artisanId),
    [missions]
  );

  async function acceptMission(missionId: string, artisanId: string, artisanName: string) {
    const res = await apiRequest("POST", `/api/missions/${missionId}/accept`, { artisanId });
    const updated = await res.json();
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, ...updated } : m));
  }

  async function completeMission(missionId: string, _report: string, _photos: string[]) {
    const res = await apiRequest("POST", `/api/missions/${missionId}/complete`, {});
    const updated = await res.json();
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, ...updated } : m));
  }

  async function validateMission(missionId: string) {
    await updateMission(missionId, { status: "validated" });
  }

  async function rateMission(missionId: string, rating: RatingCriteria) {
    const mission = missions.find(m => m.id === missionId);
    if (mission && mission.artisanId) {
      await apiRequest("POST", "/api/reviews", {
        missionId,
        fromUserId: mission.clientId,
        toUserId: mission.artisanId,
        rating: rating.overall,
        comment: rating.comment,
      });
    }
  }

  async function disputeMission(missionId: string) {
    await updateMission(missionId, { status: "disputed" });
  }

  const value = useMemo<MissionContextValue>(
    () => ({
      missions,
      isLoading,
      refreshMissions,
      createMission,
      updateMission,
      getMission,
      getMissionsByClient,
      getAvailableMissions,
      getArtisanMissions,
      acceptMission,
      completeMission,
      validateMission,
      rateMission,
      disputeMission,
    }),
    [missions, isLoading, refreshMissions, getMission, getMissionsByClient, getAvailableMissions, getArtisanMissions]
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMissions() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error("useMissions must be used within MissionProvider");
  return ctx;
}
