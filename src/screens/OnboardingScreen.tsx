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
  { id: 'Career', label: 'Career & Jobs', desc: 'Job offers, promotions, startup pivots' },
  { id: 'Education', label: 'Education & Courses', desc: 'Certifications, bootcamps, master degrees' },
  { id: 'Purchases', label: 'Purchases & Tech', desc: 'Hardware, software, capital investments' },
  { id: 'Money', label: 'Money & Capital', desc: 'Budgeting, risk allocation, personal finance' },
  { id: 'Relocation', label: 'Move & Relocation', desc: 'New cities, rent vs buying, lifestyle' },
  { id: 'Fitness', label: 'Health & Energy', desc: 'Routines, health commitments, fitness' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('Strategist');
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
      name: name.trim() || 'Strategist',
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
          <Text style={styles.tagline}>Your Life. Simulated Before You Decide.</Text>
          <Text style={styles.positioning}>
            Explore the trade-offs behind difficult decisions before you commit your money, time, or momentum.
          </Text>
        </View>

        {step === 1 ? (
          <View style={styles.stepBlock}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>STEP 1 OF 2 · DECISION PROFILE</Text>
            </View>

            <Text style={styles.questionTitle}>What are you trying to accomplish?</Text>
            <Text style={styles.questionSubtitle}>
              Select the primary life arenas where you face the biggest dilemmas.
            </Text>

            <View style={styles.nameInputContainer}>
              <Text style={styles.inputLabel}>YOUR NAME</Text>
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
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.catLabel, isSelected && styles.catLabelSelected]}>
                      {cat.label}
                    </Text>
                    <Text style={styles.catDesc}>{cat.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>Continue to Priorities →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stepBlock}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>STEP 2 OF 2 · VALUES & WEIGHTS</Text>
            </View>

            <Text style={styles.questionTitle}>What matters most right now?</Text>
            <Text style={styles.questionSubtitle}>
              DECIDIO tailors scenario impact meters and trade-offs to your personal criteria.
            </Text>

            <GlassCard style={styles.weightsCard}>
              <WeightRow
                label="Career Leverage"
                value={weights.career}
                sub="Long-term professional trajectory"
                onDec={() => adjustWeight('career', -1)}
                onInc={() => adjustWeight('career', 1)}
                color={THEME.colors.accentGreen}
              />

              <WeightRow
                label="Time Protection"
                value={weights.time}
                sub="Guard sleep, focus, and calendar sanity"
                onDec={() => adjustWeight('time', -1)}
                onInc={() => adjustWeight('time', 1)}
                color={THEME.colors.accentCyan}
              />

              <WeightRow
                label="Capital Preservation"
                value={weights.money}
                sub="Minimize cash burn and protect reserves"
                onDec={() => adjustWeight('money', -1)}
                onInc={() => adjustWeight('money', 1)}
                color={THEME.colors.accentViolet}
              />

              <WeightRow
                label="Experience & Learning"
                value={weights.experience}
                sub="Novelty, skill accumulation, growth"
                onDec={() => adjustWeight('experience', -1)}
                onInc={() => adjustWeight('experience', 1)}
                color={THEME.colors.primaryText}
              />

              <WeightRow
                label="Risk Tolerance"
                value={weights.riskTolerance}
                sub="Comfort with asymmetric outcome variance"
                onDec={() => adjustWeight('riskTolerance', -1)}
                onInc={() => adjustWeight('riskTolerance', 1)}
                color={THEME.colors.scenarioC}
              />
            </GlassCard>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)} activeOpacity={0.85}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} activeOpacity={0.85}>
                <Text style={styles.finishBtnText}>Launch Future Simulator →</Text>
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
    paddingTop: THEME.spacing.xl,
    paddingBottom: 48,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
    gap: 6,
  },
  logo: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.display,
    fontWeight: '900',
    letterSpacing: 3,
  },
  tagline: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  positioning: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
    marginTop: 2,
  },
  stepBlock: {
    gap: THEME.spacing.md,
  },
  stepIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  stepIndicatorText: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  questionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  questionSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    lineHeight: 20,
  },
  nameInputContainer: {
    marginBottom: THEME.spacing.xs,
    gap: 4,
  },
  inputLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nameInput: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.sm,
    color: THEME.colors.textPrimary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    fontSize: THEME.typography.sizes.base,
  },
  grid: {
    gap: 8,
    marginVertical: THEME.spacing.xs,
  },
  catCard: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
  },
  catCardSelected: {
    borderColor: THEME.colors.textPrimary,
    backgroundColor: THEME.colors.elevatedSurface,
  },
  catLabel: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '700',
  },
  catLabelSelected: {
    color: THEME.colors.textPrimary,
  },
  catDesc: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
    marginTop: 2,
  },
  nextBtn: {
    backgroundColor: THEME.colors.primaryText,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  nextBtnText: {
    color: THEME.colors.background,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
  weightsCard: {
    gap: THEME.spacing.md,
    padding: THEME.spacing.lg,
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
    height: 6,
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
    backgroundColor: THEME.colors.elevatedSurface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
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
    marginTop: THEME.spacing.sm,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    alignItems: 'center',
  },
  backBtnText: {
    color: THEME.colors.textSecondary,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.sm,
  },
  finishBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primaryText,
    alignItems: 'center',
  },
  finishBtnText: {
    color: THEME.colors.background,
    fontWeight: '800',
    fontSize: THEME.typography.sizes.sm,
  },
});
