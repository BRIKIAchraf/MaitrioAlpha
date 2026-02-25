import { MissionCategory, UrgencyLevel } from "../context/mission-context";

export interface EstimationResult {
    minPrice: number;
    maxPrice: number;
    duration: string;
    complexityScore: number;
}

const BASE_RATES: Record<MissionCategory, { base: number; hourly: number; minHours: number }> = {
    debarras: { base: 50, hourly: 40, minHours: 2 },
    nettoyage: { base: 40, hourly: 35, minHours: 2 },
    serrurier: { base: 80, hourly: 60, minHours: 1 },
    plomberie: { base: 70, hourly: 55, minHours: 1 },
    electricite: { base: 70, hourly: 60, minHours: 1 },
    frigoriste: { base: 90, hourly: 65, minHours: 2 },
    peinture: { base: 60, hourly: 45, minHours: 4 },
    menuiserie: { base: 70, hourly: 55, minHours: 3 },
    jardinage: { base: 40, hourly: 40, minHours: 2 },
    climatisation: { base: 80, hourly: 60, minHours: 2 },
    maconnerie: { base: 100, hourly: 70, minHours: 4 },
    autre: { base: 50, hourly: 50, minHours: 2 },
};

const COMPLEXITY_KEYWORDS = {
    high: ["urgent", "inondation", "complet", "entier", "fuite importante", "panne totale", "bloqué"],
    medium: ["plusieurs", "installation", "réparation", "montage"],
    low: ["petit", "réglage", "vérification", "simple"],
};

export function calculateDynamicEstimation(
    category: MissionCategory,
    title: string,
    description: string,
    urgency: UrgencyLevel,
    time: string,
    date: string
): EstimationResult {
    const baseData = BASE_RATES[category] || BASE_RATES.autre;
    const content = (title + " " + description).toLowerCase();

    let multiplier = 1.0;
    let durationBoost = 0;

    // 1. Keyword Analysis
    if (COMPLEXITY_KEYWORDS.high.some(k => content.includes(k))) {
        multiplier += 0.4;
        durationBoost += 1;
    } else if (COMPLEXITY_KEYWORDS.medium.some(k => content.includes(k))) {
        multiplier += 0.2;
        durationBoost += 0.5;
    } else if (COMPLEXITY_KEYWORDS.low.some(k => content.includes(k))) {
        multiplier -= 0.1;
    }

    // 2. Urgency
    if (urgency === "urgent") multiplier += 0.3;
    if (urgency === "tres_urgent") multiplier += 0.7;

    // 3. Timing (Night / Weekend)
    const hour = parseInt(time.split(":")[0], 10);
    if (hour >= 20 || hour <= 7) multiplier += 0.5; // Night rate

    const day = new Date(date).getDay();
    if (day === 0 || day === 6) multiplier += 0.2; // Weekend rate

    // Calculate results
    const complexityScore = Math.min(10, Math.floor(multiplier * 5));
    const estimatedHours = baseData.minHours + durationBoost;

    const basePrice = baseData.base + (baseData.hourly * estimatedHours);
    const finalMin = Math.round(basePrice * multiplier * 0.9);
    const finalMax = Math.round(basePrice * multiplier * 1.3);

    return {
        minPrice: finalMin,
        maxPrice: finalMax,
        duration: `${estimatedHours}-${estimatedHours + 2}h`,
        complexityScore
    };
}
