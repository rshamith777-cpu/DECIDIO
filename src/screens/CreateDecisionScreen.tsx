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

const SIMULATION_STEPS = [
  'PARSING NATURAL LANGUAGE INTENT...',
  'EXTRACTING CAPITAL, TIME & HORIZON...',
  'ANALYZING RISK & CONFLICT MATRIX...',
  'BRANCHING 3 PROBABILITY FUTURES (BUY / WAIT / SKIP)...',
  'SYNTHESIZING DECISION DNA & OPPORTUNITY COSTS...',
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
    // preselect first option for each question
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

    // Run stepped visual animation
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < SIMULATION_STEPS.length) {
        setAnalysisStepIndex(currentStep);
      }
    }, 700);

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
      }, 3500);
    } catch (err) {
      clearInterval(interval);
      console.warn('Simulation error:', err);
      setStage('parsed');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>NEW DECISION</Text>
          <View style={{ width: 60 }} />
        </View>

        {stage === 'input' && (
          <View style={styles.contentBlock}>
            <Text style={styles.headline}>What choice is on your mind?</Text>
            <Text style={styles.subheadline}>
              Type naturally. Decidio extracts cost, time commitment, and hidden risks.
            </Text>

            <GlassCard highlight glowColor={THEME.colors.primaryGlow} style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                value={inputText}
                onChangeText={setInputText}
                placeholder="e.g. Should I spend ₹4,999 on this machine learning course? Or accept a 25k internship offer in Bangalore?"
                placeholderTextColor={THEME.colors.textTertiary}
                autoFocus
              />
            </GlassCard>

            <TouchableOpacity
              style={[styles.primaryBtn, !inputText.trim() && styles.disabledBtn]}
              onPress={handleParse}
              disabled={!inputText.trim()}
            >
              <Text style={styles.primaryBtnText}>Analyze & Extract Factors ⚡</Text>
            </TouchableOpacity>

            {/* Examples */}
            <View style={styles.inspirationSection}>
              <Text style={styles.inspirationTitle}>POPULAR TEMPLATES:</Text>
              {[
                'Should I spend ₹4,999 on this machine learning course?',
                'I got an internship offer in Bangalore for ₹25k/month. Should I take it?',
                'Should I buy a ₹74,999 MacBook Air M3 or keep my old Windows laptop?',
                'Should I quit my job to prepare for competitive exams full-time for 6 months?',
              ].map((ex, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.examplePill}
                  onPress={() => setInputText(ex)}
                >
                  <Text style={styles.exampleText}>"{ex}"</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {stage === 'parsed' && parsed && (
          <View style={styles.contentBlock}>
            {/* Extraction Summary */}
            <View style={styles.detectedCard}>
              <View style={styles.detectedHeader}>
                <Text style={styles.detectedTitle}>✦ DECISION FACTORS DETECTED</Text>
                <TouchableOpacity onPress={() => setStage('input')}>
                  <Text style={styles.editBtn}>Edit Prompt</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.parsedTitle}>{parsed.title}</Text>

              <View style={styles.factorsGrid}>
                <View style={styles.factorBox}>
                  <Text style={styles.factorLabel}>Category</Text>
                  <Text style={styles.factorVal}>{parsed.category}</Text>
                </View>
                <View style={styles.factorBox}>
                  <Text style={styles.factorLabel}>Capital</Text>
                  <Text style={[styles.factorVal, { color: THEME.colors.accentAmber }]}>
                    {parsed.currency}{parsed.cost.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.factorBox}>
                  <Text style={styles.factorLabel}>Time Intensity</Text>
                  <Text style={[styles.factorVal, { color: THEME.colors.secondary }]}>
                    ~{parsed.timeCommitmentHours} hrs/wk
                  </Text>
                </View>
                <View style={styles.factorBox}>
                  <Text style={styles.factorLabel}>Horizon</Text>
                  <Text style={styles.factorVal}>{parsed.horizonDays} days</Text>
                </View>
              </View>
            </View>

            {/* Adaptive Questions */}
            <Text style={styles.questionsTitle}>ADAPTIVE CONTEXT CHECK</Text>
            <Text style={styles.questionsSub}>
              Decidio only asks what's essential to model accurate futures.
            </Text>

            <View style={styles.questionsList}>
              {parsed.adaptiveQuestions.map(q => (
                <GlassCard key={q.id} style={styles.questionCard}>
                  <Text style={styles.questionText}>{q.question}</Text>
                  <View style={styles.optionsList}>
                    {q.options.map((opt, i) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                          onPress={() => setAnswers({ ...answers, [q.id]: opt })}
                        >
                          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </GlassCard>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSimulate}>
              <Text style={styles.primaryBtnText}>Simulate 3 Futures Now 🔮</Text>
            </TouchableOpacity>
          </View>
        )}

        {stage === 'analyzing' && (
          <View style={styles.analyzingContainer}>
            <View style={styles.radarCircle}>
              <ActivityIndicator size="large" color={THEME.colors.secondary} />
            </View>

            <Text style={styles.analyzingHeader}>DECIDIO FUTURE SIMULATOR</Text>
            <Text style={styles.analyzingSub}>
              Calculating branching outcomes across 30, 90, and 365 day horizons...
            </Text>

            <View style={styles.stepsBox}>
              {SIMULATION_STEPS.map((stepText, idx) => {
                const isPassed = idx < analysisStepIndex;
                const isCurrent = idx === analysisStepIndex;
                return (
                  <View key={idx} style={styles.stepItem}>
                    <Text style={[
                      styles.stepDot,
                      isPassed && { color: THEME.colors.accentGreen },
                      isCurrent && { color: THEME.colors.secondary },
                    ]}>
                      {isPassed ? '✓' : isCurrent ? '▶' : '○'}
                    </Text>
                    <Text style={[
                      styles.stepLabel,
                      isPassed && styles.stepLabelPassed,
                      isCurrent && styles.stepLabelCurrent,
                    ]}>
                      {stepText}
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
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  cancelBtn: {
    padding: 6,
  },
  cancelText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '600',
  },
  screenTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
    letterSpacing: 1,
  },
  contentBlock: {
    gap: THEME.spacing.lg,
  },
  headline: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '800',
  },
  subheadline: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    lineHeight: 20,
    marginTop: -8,
  },
  inputCard: {
    padding: THEME.spacing.md,
  },
  textInput: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    shadowColor: THEME.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  primaryBtnText: {
    color: '#07090E',
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  inspirationSection: {
    gap: 8,
    marginTop: THEME.spacing.md,
  },
  inspirationTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  examplePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  exampleText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  detectedCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  detectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detectedTitle: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  editBtn: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
  },
  parsedTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  factorsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  factorBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: THEME.borderRadius.sm,
  },
  factorLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '600',
  },
  factorVal: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
    marginTop: 2,
  },
  questionsTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  questionsSub: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    marginTop: -8,
  },
  questionsList: {
    gap: THEME.spacing.md,
  },
  questionCard: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  questionText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  optionsList: {
    gap: 6,
  },
  optionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
  },
  optionBtnSelected: {
    borderColor: THEME.colors.secondary,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  optionText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: THEME.colors.secondary,
    fontWeight: '700',
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl,
    gap: THEME.spacing.md,
  },
  radarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 2,
    borderColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  analyzingHeader: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  analyzingSub: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
    textAlign: 'center',
    maxWidth: 280,
  },
  stepsBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.md,
    gap: 12,
    marginTop: THEME.spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    fontSize: 12,
    color: THEME.colors.textTertiary,
  },
  stepLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  stepLabelPassed: {
    color: THEME.colors.accentGreen,
  },
  stepLabelCurrent: {
    color: THEME.colors.secondary,
    fontWeight: 'bold',
  },
});
