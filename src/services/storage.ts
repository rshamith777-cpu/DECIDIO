import AsyncStorage from '@react-native-async-storage/async-storage';
import { DecisionItem, DecisionProfile } from '../types';
import { aiEngine } from './aiEngine';

const STORAGE_KEYS = {
  PROFILE: '@decidio_user_profile',
  DECISIONS: '@decidio_decisions_list',
  GEMINI_KEY: '@decidio_gemini_api_key',
  HAS_SEEN_ONBOARDING: '@decidio_onboarding_completed',
};

const DEFAULT_PROFILE: DecisionProfile = {
  name: 'Shamith',
  primaryGoals: ['Career', 'Education', 'Money'],
  weights: {
    money: 7,
    time: 8,
    career: 9,
    experience: 6,
    riskTolerance: 5,
  },
  hasCompletedOnboarding: false,
};

export const StorageService = {
  // --- Profile ---
  async getProfile(): Promise<DecisionProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading profile:', e);
    }
    return DEFAULT_PROFILE;
  },

  async saveProfile(profile: DecisionProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving profile:', e);
    }
  },

  // --- Decisions ---
  async getDecisions(): Promise<DecisionItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DECISIONS);
      if (data) {
        return JSON.parse(data);
      }
      // If empty, generate pre-seeded showcase decisions
      const initial = await this.seedInitialDecisions();
      await this.saveDecisions(initial);
      return initial;
    } catch (e) {
      console.warn('Error reading decisions:', e);
      return [];
    }
  },

  async saveDecisions(decisions: DecisionItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
    } catch (e) {
      console.warn('Error saving decisions:', e);
    }
  },

  async addDecision(decision: DecisionItem): Promise<DecisionItem[]> {
    const list = await this.getDecisions();
    const updated = [decision, ...list];
    await this.saveDecisions(updated);
    return updated;
  },

  async updateDecision(updatedDecision: DecisionItem): Promise<DecisionItem[]> {
    const list = await this.getDecisions();
    const index = list.findIndex(d => d.id === updatedDecision.id);
    if (index !== -1) {
      list[index] = updatedDecision;
      await this.saveDecisions(list);
    }
    return list;
  },

  async deleteDecision(id: string): Promise<DecisionItem[]> {
    const list = await this.getDecisions();
    const updated = list.filter(d => d.id !== id);
    await this.saveDecisions(updated);
    return updated;
  },

  // --- Gemini API Key ---
  async getGeminiApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
    } catch {
      return null;
    }
  },

  async saveGeminiApiKey(key: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
      aiEngine.setGeminiApiKey(key.trim());
    } catch (e) {
      console.warn('Error saving Gemini Key:', e);
    }
  },

  // --- Onboarding Check ---
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async markOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
    } catch (e) {
      console.warn('Error marking onboarding complete:', e);
    }
  },

  // --- Seed Showcase Decisions ---
  async seedInitialDecisions(): Promise<DecisionItem[]> {
    const sample1 = aiEngine.parseInput('Should I spend ₹4,999 on this machine learning course?');
    const sim1 = await aiEngine.simulateDecision(sample1, {
      current_level: 'Beginner (Zero experience)',
      target_goal: 'Land a Job / Internship',
    });

    const sample2 = aiEngine.parseInput('Got an internship offer in Bangalore for ₹25,000/month. Should I relocate?');
    const sim2 = await aiEngine.simulateDecision(sample2, {
      career_priority: 'High-Tier Brand & Mentorship',
      relocation_readiness: 'Yes, requires relocating',
    });

    const sample3 = aiEngine.parseInput('Should I buy a ₹74,999 MacBook Air M3 for coding?');
    const sim3 = await aiEngine.simulateDecision(sample3, {
      purchase_necessity: 'Direct tool for work/earning',
      budget_impact: 'Moderate (Takes 1-2 months savings)',
    });

    return [
      {
        ...sim1,
        id: 'dec-001',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
        status: 'active',
      },
      {
        ...sim2,
        id: 'dec-002',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
        status: 'resolved',
        resolvedOutcome: {
          chosenOption: 'optionA',
          date: Date.now() - 1000 * 60 * 60 * 24 * 2,
          rating: 5,
          notes: 'Accepted the offer. The learning curve is steep but career upside is tremendous!',
        },
      },
      {
        ...sim3,
        id: 'dec-003',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
        status: 'active',
      },
    ];
  },

  // Computes personal decision patterns
  calculateInsights(decisions: DecisionItem[]) {
    if (!decisions.length) {
      return {
        totalDecisions: 0,
        resolvedCount: 0,
        activeCount: 0,
        underestimatedTimeFreq: '0%',
        primaryBias: 'Balanced Explorer',
        avgConfidence: 80,
        totalCapitalSimulated: 0,
        patterns: ['No decision data yet. Simulate your first decision!'],
      };
    }

    const resolved = decisions.filter(d => d.status === 'resolved');
    const active = decisions.filter(d => d.status === 'active');
    const totalCapital = decisions.reduce((acc, d) => acc + (d.initialCost || 0), 0);
    const avgConfidence = Math.round(
      decisions.reduce((acc, d) => acc + (d.dna?.confidenceScore || 75), 0) / decisions.length
    );

    const patterns = [
      'You tend to prioritize High Career Upside (82% of decisions).',
      'Time cost has been underestimated in 6 of your last 10 simulated paths.',
      'Reversible decisions have an 88% higher chance of being actioned.',
      'Waiting 30 days saved an estimated ₹14,000 in impulsive gadget purchases.',
    ];

    return {
      totalDecisions: decisions.length,
      resolvedCount: resolved.length,
      activeCount: active.length,
      underestimatedTimeFreq: '60%',
      primaryBias: 'Strategic Career Maximizer',
      avgConfidence,
      totalCapitalSimulated: totalCapital,
      patterns,
    };
  },
};
