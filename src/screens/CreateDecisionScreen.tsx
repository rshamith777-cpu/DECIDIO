import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { THEME } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';
import { aiEngine, ParsedDecisionIntent } from '../services/aiEngine';
import { DecisionItem, DecisionProfile } from '../types';
import { StorageService } from '../services/storage';

interface CreateDecisionScreenProps {
  initialPrompt?: string;
  profile: DecisionProfile;
  isPro: boolean;
  onDecisionCreated: (decision: DecisionItem) => void;
  onCancel: () => void;
  onOpenPaywall: () => void;
}

const REFINED_SIMULATION_STEPS = [
  'UNDERSTANDING DECISION',
  'EXTRACTING CONSTRAINTS',
  'BUILDING POSSIBLE FUTURES',
  'CALCULATING TRADE-OFFS',
  'GENERATING DECISION DNA',
];

const PRESET_CHIPS = [
  { label: 'Buy something', text: 'Should I buy a ₹74,999 MacBook Air M3 or keep using my old laptop?' },
  { label: 'Take an internship', text: 'Got an internship offer in Bangalore for ₹25k/month. Should I take it?' },
  { label: 'Choose a course', text: 'Should I spend ₹4,999 on this machine learning course?' },
  { label: 'Move cities', text: 'Should I move to Bengaluru for a hybrid tech role?' },
  { label: 'Change jobs', text: 'Should I quit my current corporate role to join an early-stage startup?' },
  { label: 'Start a project', text: 'Should I commit 15 hours a week to build my own open source SaaS project?' },
];

export const CreateDecisionScreen: React.FC<CreateDecisionScreenProps> = ({
  initialPrompt = '',
  profile,
  isPro,
  onDecisionCreated,
  onCancel,
  onOpenPaywall,
}) => {
  const [inputText, setInputText] = useState(initialPrompt);
  const [stage, setStage] = useState<'input' | 'parsed' | 'analyzing'>('input');
  const [parsed, setParsed] = useState<ParsedDecisionIntent | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  useEffect(() => {
    if (initialPrompt) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt]);

  const handleParse = () => {
    if (!inputText.trim()) return;
    const result = aiEngine.parseInput(inputText.trim());
    setParsed(result);
    const defaultAnswers: Record<string, string> = {};
    result.adaptiveQuestions.forEach(q => {
      defaultAnswers[q.id] = q.options[0];
    });
    setAnswers(defaultAnswers);
    setStage('parsed');
  };

  const handleSimulate = async () => {
    if (!parsed) return;
    setStage('analyzing');
    setAnalysisStepIndex(0);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < REFINED_SIMULATION_STEPS.length) {
        setAnalysisStepIndex(currentStep);
      }
    }, 600);

    try {
      const simulated = await aiEngine.simulateDecision(parsed, answers, profile.weights);
      const newDecision: DecisionItem = {
        ...simulated,
        id: `dec-${Date.now()}`,
        createdAt: Date.now(),
        status: 'active',
      };

      setTimeout(async () => {
        clearInterval(interval);
        await StorageService.addDecision(newDecision);
        onDecisionCreated(newDecision);
      }, 3000);
    } catch (err) {
      clearInterval(interval);
      console.warn('Simulation error:', err);
      setStage('parsed');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>NEW DECISION</Text>
          <View style={{ width: 48 }} />
        </View>

        {stage === 'input' && (
          <View style={styles.flowSection}>
            <View style={styles.titleWrap}>
              <Text style={styles.headline}>What are you deciding?</Text>
              <Text style={styles.subheadline}>
                Describe your choice naturally. DECIDIO extracts capital, weekly time commitment, and hidden opportunity costs.
              </Text>
            </View>

            {/* Input Box */}
            <GlassCard elevated highlight style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Describe it naturally..."
                placeholderTextColor={THEME.colors.textTertiary}
                autoFocus
              />
            </GlassCard>

            <TouchableOpacity
              style={[styles.primaryActionBtn, !inputText.trim() && styles.disabledBtn]}
              onPress={handleParse}
              disabled={!inputText.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionText}>Understand Decision →</Text>
            </TouchableOpacity>

            {/* Preset Inspiration Chips */}
            <View style={styles.chipsSection}>
              <Text style={styles.chipsSectionTitle}>COMMON DECISIONS TO EXPLORE:</Text>
              <View style={styles.chipsContainer}>
                {PRESET_CHIPS.map((chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => setInputText(chip.text)}
                  >
                    <Text style={styles.presetChipText}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {stage === 'parsed' && parsed && (
          <View style={styles.flowSection}>
            <View style={styles.titleWrap}>
              <Text style={styles.headline}>AI Understands</Text>
              <Text style={styles.subheadline}>
                Key parameters extracted from your dilemma. Tap Edit to adjust wording.
              </Text>
            </View>

            {/* AI Understands Grid */}
            <GlassCard elevated style={styles.understandingCard}>
              <View style={styles.understandingHeader}>
                <Text style={styles.understoodDecisionTitle}>{parsed.title}</Text>
                <TouchableOpacity onPress={() => setStage('input')}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricBlockLabel}>CATEGORY</Text>
                  <Text style={styles.metricBlockVal}>{parsed.category}</Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricBlockLabel}>CAPITAL</Text>
                  <Text style={[styles.metricBlockVal, { color: THEME.colors.textPrimary }]}>
                    {parsed.currency}{parsed.cost.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricBlockLabel}>TIME</Text>
                  <Text style={[styles.metricBlockVal, { color: THEME.colors.secondary }]}>
                    {parsed.timeCommitmentHours}h / week
                  </Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricBlockLabel}>HORIZON</Text>
                  <Text style={styles.metricBlockVal}>{parsed.horizonDays} days</Text>
                </View>
              </View>
            </GlassCard>

            {/* Adaptive Context Questioning */}
            <View style={styles.questionsHeaderWrap}>
              <Text style={styles.questionsSectionTitle}>A few things will help me simulate this properly.</Text>
              <Text style={styles.questionsSectionSub}>
                Tailored checks to calculate realistic 30-day and 90-day scenarios.
              </Text>
            </View>

            <View style={styles.questionsList}>
              {parsed.adaptiveQuestions.map(q => (
                <GlassCard key={q.id} style={styles.questionCard}>
                  <Text style={styles.questionPrompt}>{q.question}</Text>
                  <View style={styles.optionsWrap}>
                    {q.options.map((opt, i) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[styles.optionPill, isSelected && styles.optionPillSelected]}
                          onPress={() => setAnswers({ ...answers, [q.id]: opt })}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.optionPillText, isSelected && styles.optionPillTextSelected]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </GlassCard>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryActionBtn} onPress={handleSimulate} activeOpacity={0.85}>
              <Text style={styles.primaryActionText}>Simulate Futures →</Text>
            </TouchableOpacity>
          </View>
        )}

        {stage === 'analyzing' && (
          <View style={styles.analyzingWrap}>
            <View style={styles.radarHalo}>
              <ActivityIndicator size="large" color={THEME.colors.secondary} />
            </View>

            <Text style={styles.analyzingTitle}>Building Scenarios</Text>
            <Text style={styles.analyzingSub}>
              Simulating probability-weighted branches and calculating opportunity costs...
            </Text>

            <View style={styles.stepsContainer}>
              {REFINED_SIMULATION_STEPS.map((stepLabel, idx) => {
                const isPassed = idx < analysisStepIndex;
                const isCurrent = idx === analysisStepIndex;
                return (
                  <View key={idx} style={styles.stepRow}>
                    <Text
                      style={[
                        styles.stepIndicatorIcon,
                        isPassed && { color: THEME.colors.accentGreen },
                        isCurrent && { color: THEME.colors.secondary },
                      ]}
                    >
                      {isPassed ? '✓' : isCurrent ? '●' : '○'}
                    </Text>
                    <Text
                      style={[
                        styles.stepText,
                        isPassed && styles.stepTextPassed,
                        isCurrent && styles.stepTextCurrent,
                      ]}
                    >
                      {stepLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.hero,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  backBtn: {
    paddingVertical: 6,
  },
  backBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  navTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  flowSection: {
    gap: THEME.spacing.lg,
  },
  titleWrap: {
    gap: THEME.spacing.xs,
  },
  headline: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subheadline: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    lineHeight: 20,
  },
  inputCard: {
    padding: THEME.spacing.lg,
  },
  textInput: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    minHeight: 110,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  primaryActionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chipsSection: {
    gap: THEME.spacing.sm,
    marginTop: THEME.spacing.sm,
  },
  chipsSectionTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
  },
  presetChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  understandingCard: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  understandingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  understoodDecisionTitle: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    marginRight: 12,
  },
  editBtnText: {
    color: THEME.colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricBlockLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricBlockVal: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
    marginTop: 4,
  },
  questionsHeaderWrap: {
    gap: 4,
    marginTop: THEME.spacing.xs,
  },
  questionsSectionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  questionsSectionSub: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  questionsList: {
    gap: THEME.spacing.md,
  },
  questionCard: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  questionPrompt: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  optionsWrap: {
    gap: 6,
  },
  optionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
  },
  optionPillSelected: {
    borderColor: THEME.colors.secondary,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  optionPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  optionPillTextSelected: {
    color: THEME.colors.secondary,
    fontWeight: '700',
  },
  analyzingWrap: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.hero,
    gap: THEME.spacing.md,
  },
  radarHalo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  analyzingTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  analyzingSub: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    textAlign: 'center',
    maxWidth: 290,
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.lg,
    gap: 14,
    marginTop: THEME.spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepIndicatorIcon: {
    fontSize: 12,
    color: THEME.colors.textTertiary,
  },
  stepText: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  stepTextPassed: {
    color: THEME.colors.accentGreen,
  },
  stepTextCurrent: {
    color: THEME.colors.secondary,
  },
});
