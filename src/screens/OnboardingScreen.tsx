import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { THEME } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';
import { StorageService } from '../services/storage';
import { DecisionProfile } from '../types';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const CATEGORIES = [
  { id: 'Career', label: '🎓 Career & Jobs', desc: 'Job offers, promotions, pivots' },
  { id: 'Education', label: '📚 Education & Courses', desc: 'Bootcamps, degrees, skill paths' },
  { id: 'Purchases', label: '🛒 Tech & Purchases', desc: 'Laptops, gear, major items' },
  { id: 'Money', label: '💰 Money & Investing', desc: 'Budgeting, risks, capital allocation' },
  { id: 'Relocation', label: '🏠 Move & Relocation', desc: 'New cities, rent vs home' },
  { id: 'Fitness', label: '🏃 Fitness & Health', desc: 'Routines, gym memberships, diet' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('Shamith');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Career', 'Education']);
  const [weights, setWeights] = useState({
    money: 7,
    time: 8,
    career: 9,
    experience: 7,
    riskTolerance: 5,
  });

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter(g => g !== id));
      }
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const adjustWeight = (key: keyof typeof weights, delta: number) => {
    const val = Math.max(1, Math.min(10, weights[key] + delta));
    setWeights({ ...weights, [key]: val });
  };

  const handleFinish = async () => {
    const profile: DecisionProfile = {
      name: name.trim() || 'Explorer',
      primaryGoals: selectedGoals,
      weights,
      hasCompletedOnboarding: true,
    };
    await StorageService.saveProfile(profile);
    await StorageService.markOnboardingComplete();
    onComplete();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Text style={styles.logo}>DECIDIO</Text>
          <Text style={styles.tagline}>Your life. Simulated before you decide.</Text>
        </View>

        {step === 1 ? (
          <View style={styles.stepBlock}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>STEP 1 OF 2 • DECISION PROFILE</Text>
            </View>

            <Text style={styles.questionTitle}>What are you trying to accomplish?</Text>
            <Text style={styles.questionSubtitle}>
              Select the primary life arenas where you face the biggest dilemmas.
            </Text>

            <View style={styles.nameInputContainer}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={THEME.colors.textTertiary}
              />
            </View>

            <View style={styles.grid}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedGoals.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catCard, isSelected && styles.catCardSelected]}
                    onPress={() => toggleGoal(cat.id)}
                  >
                    <Text style={[styles.catLabel, isSelected && styles.catLabelSelected]}>
                      {cat.label}
                    </Text>
                    <Text style={styles.catDesc}>{cat.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>Continue to Priorities →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stepBlock}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>STEP 2 OF 2 • VALUES & WEIGHTS</Text>
            </View>

            <Text style={styles.questionTitle}>What matters most to you right now?</Text>
            <Text style={styles.questionSubtitle}>
              Decidio tailors the 3 future branches and trade-offs to your personal decision matrix.
            </Text>

            <GlassCard highlight glowColor={THEME.colors.primaryGlow} style={styles.weightsCard}>
              <WeightRow
                label="Career Leverage"
                value={weights.career}
                sub="Prioritize long term professional upside"
                onDec={() => adjustWeight('career', -1)}
                onInc={() => adjustWeight('career', 1)}
                color={THEME.colors.accentGreen}
              />

              <WeightRow
                label="Time Protection"
                value={weights.time}
                sub="Guard sleep, weekends, and calendar sanity"
                onDec={() => adjustWeight('time', -1)}
                onInc={() => adjustWeight('time', 1)}
                color={THEME.colors.secondary}
              />

              <WeightRow
                label="Capital Preservation"
                value={weights.money}
                sub="Minimize cash burn and protect savings"
                onDec={() => adjustWeight('money', -1)}
                onInc={() => adjustWeight('money', 1)}
                color={THEME.colors.accentAmber}
              />

              <WeightRow
                label="Experience & Learning"
                value={weights.experience}
                sub="Value novelty, fun, and new environments"
                onDec={() => adjustWeight('experience', -1)}
                onInc={() => adjustWeight('experience', 1)}
                color={THEME.colors.primaryLight}
              />

              <WeightRow
                label="Risk Tolerance"
                value={weights.riskTolerance}
                sub="Willingness to take asymmetric bets"
                onDec={() => adjustWeight('riskTolerance', -1)}
                onInc={() => adjustWeight('riskTolerance', 1)}
                color={THEME.colors.accentPink}
              />
            </GlassCard>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
                <Text style={styles.finishBtnText}>Launch Future Simulator ⚡</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const WeightRow: React.FC<{
  label: string;
  value: number;
  sub: string;
  color: string;
  onDec: () => void;
  onInc: () => void;
}> = ({ label, value, sub, color, onDec, onInc }) => {
  return (
    <View style={styles.weightItem}>
      <View style={styles.weightHeader}>
        <View>
          <Text style={styles.weightLabel}>{label}</Text>
          <Text style={styles.weightSub}>{sub}</Text>
        </View>
        <Text style={[styles.weightValue, { color }]}>{value} / 10</Text>
      </View>

      <View style={styles.stepperRow}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${value * 10}%`, backgroundColor: color }]} />
        </View>
        <TouchableOpacity style={styles.stepBtn} onPress={onDec}>
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stepBtn} onPress={onInc}>
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xxl,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  logo: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.display,
    fontWeight: '900',
    letterSpacing: 3,
  },
  tagline: {
    color: THEME.colors.secondary,
    fontSize: THEME.typography.sizes.sm,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  stepBlock: {
    gap: THEME.spacing.md,
  },
  stepIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  stepIndicatorText: {
    color: THEME.colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  questionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
  },
  questionSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    lineHeight: 20,
  },
  nameInputContainer: {
    marginBottom: THEME.spacing.sm,
  },
  inputLabel: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    marginBottom: 4,
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    color: THEME.colors.textPrimary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    fontSize: THEME.typography.sizes.base,
  },
  grid: {
    gap: THEME.spacing.sm,
    marginVertical: THEME.spacing.sm,
  },
  catCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
  },
  catCardSelected: {
    borderColor: THEME.colors.secondary,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  catLabel: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '700',
  },
  catLabelSelected: {
    color: THEME.colors.secondary,
  },
  catDesc: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
    marginTop: 2,
  },
  nextBtn: {
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: THEME.spacing.md,
  },
  nextBtnText: {
    color: '#07090E',
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  weightsCard: {
    gap: THEME.spacing.md,
    marginVertical: THEME.spacing.sm,
  },
  weightItem: {
    gap: 6,
  },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightLabel: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  weightSub: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  weightValue: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: THEME.borderRadius.full,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.md,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  backBtnText: {
    color: THEME.colors.textSecondary,
    fontWeight: '700',
  },
  finishBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: THEME.typography.sizes.base,
  },
});
