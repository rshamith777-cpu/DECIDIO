export type DecisionCategory =
  | 'Education'
  | 'Career'
  | 'Finance'
  | 'Purchases'
  | 'Work'
  | 'Fitness'
  | 'Lifestyle'
  | 'Relocation'
  | 'General';

export interface DecisionProfile {
  name: string;
  primaryGoals: string[];
  weights: {
    money: number;       // 1 - 10
    time: number;        // 1 - 10
    career: number;      // 1 - 10
    experience: number;  // 1 - 10
    riskTolerance: number; // 1 - 10
  };
  hasCompletedOnboarding: boolean;
}

export interface DecisionDNA {
  riskScore: number;          // 0 - 100
  costScore: number;          // 0 - 100
  timeScore: number;          // 0 - 100
  careerImpactScore: number;  // 0 - 100
  reversibilityScore: number; // 0 - 100
  confidenceScore: number;    // 0 - 100
  decisionType:
    | 'Strategic Investment'
    | 'High-Risk Pivot'
    | 'Comfort Trap'
    | 'No-Brainer Upside'
    | 'Low-Stakes Trial'
    | 'Capital Preserver';
}

export interface SimulationMilestone {
  day: number;
  title: string;
  description: string;
  metricImpact: string;
}

export interface ScenarioOption {
  id: 'optionA' | 'optionB' | 'optionC';
  label: string; // e.g. "BUY NOW", "WAIT 30 DAYS", "SKIP & ALTERNATIVE"
  actionType: string;
  subtitle: string;
  financialDelta: string;
  timeCommitment: string;
  skillGrowth: number;       // 0 - 100
  portfolioImpact: number;   // 0 - 100
  financialImpact: number;   // 0 - 100 (100 = best saving/financial outcome)
  peaceOfMind: number;       // 0 - 100
  summary: string;
  milestones: SimulationMilestone[];
  pros: string[];
  cons: string[];
  probabilityWeightedOutcome: string;
}

export interface TradeOffAnalysis {
  coreConflict: string;
  hiddenCostFormula: string;
  opportunityCost: string;
  aiVerdict: string;
  keyTradeoff: string;
}

export interface WhatIfAssumptions {
  cost: number;
  hoursPerWeek: number;
  horizonDays: number;
  discountOrScholarship: number; // percentage
  alternativePlan: string;
}

export interface TimelineCheckpoint {
  id: string;
  day: number;
  label: string;
  description: string;
  isCompleted: boolean;
  userReflection?: string;
  completedAt?: number;
}

export interface DecisionItem {
  id: string;
  title: string;
  rawInput: string;
  category: DecisionCategory;
  createdAt: number;
  currency: string;
  initialCost: number;
  currentCost: number;
  hoursPerWeek: number;
  horizonDays: number;
  status: 'active' | 'resolved' | 'pending';
  resolvedOutcome?: {
    chosenOption: 'optionA' | 'optionB' | 'optionC';
    date: number;
    rating: number; // 1 - 5
    notes: string;
  };
  adaptiveAnswers?: Record<string, string>;
  dna: DecisionDNA;
  scenarios: {
    optionA: ScenarioOption;
    optionB: ScenarioOption;
    optionC: ScenarioOption;
  };
  tradeOff: TradeOffAnalysis;
  whatIf: WhatIfAssumptions;
  timeline: TimelineCheckpoint[];
  userNotes?: string;
}

export interface UserSubscription {
  isPro: boolean;
  tier: 'free' | 'pro';
  decisionsUsedThisMonth: number;
  maxFreeDecisions: number;
  expirationDate?: string;
  revenueCatUserId?: string;
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  options: string[];
}
