import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { THEME } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';
import { DecisionItem, DecisionProfile } from '../types';
import { StorageService } from '../services/storage';

interface InsightsScreenProps {
  profile: DecisionProfile;
  decisions: DecisionItem[];
  isPro: boolean;
  onOpenPaywall: () => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  profile,
  decisions,
  isPro,
  onOpenPaywall,
}) => {
  const insights = StorageService.calculateInsights(decisions);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PERSONAL DECISION MEMORY</Text>
          <Text style={styles.subtitle}>
            AI learning engine detecting your subconscious decision biases
          </Text>
        </View>

        {/* Primary Bias Spotlight */}
        <GlassCard highlight glowColor={THEME.colors.primaryGlow} borderColor={THEME.colors.primary}>
          <View style={styles.biasHeader}>
            <Text style={styles.biasEmoji}>🧠</Text>
            <View>
              <Text style={styles.biasTag}>DOMINANT PROFILE ARCHETYPE</Text>
              <Text style={styles.biasName}>{insights.primaryBias}</Text>
            </View>
          </View>
          <Text style={styles.biasSummary}>
            Based on your simulated and resolved decisions, you consistently lean toward asymmetric career acceleration while under-budgeting the weekly cognitive load.
          </Text>
        </GlassCard>

        {/* Memory Patterns & Blind Spots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETECTED PATTERNS & BEHAVIORAL BLIND SPOTS</Text>

          <View style={styles.patternsList}>
            {insights.patterns.map((pat, idx) => (
              <GlassCard key={idx} style={styles.patternCard}>
                <View style={styles.patternIconBox}>
                  <Text style={styles.patternIcon}>✦</Text>
                </View>
                <Text style={styles.patternText}>{pat}</Text>
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Strategic Foresight Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MACRO FORESIGHT STATS</Text>

          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNumber}>₹{(insights.totalCapitalSimulated / 1000).toFixed(0)}k</Text>
              <Text style={styles.statLabel}>Capital Modeled</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: THEME.colors.secondary }]}>
                {insights.avgConfidence}%
              </Text>
              <Text style={styles.statLabel}>Avg Confidence</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: THEME.colors.accentGreen }]}>
                {insights.underestimatedTimeFreq}
              </Text>
              <Text style={styles.statLabel}>Time Drag Alert</Text>
            </GlassCard>
          </View>
        </View>

        {/* Pro Teaser / Lock for Advanced Retrospective Analytics */}
        {!isPro && (
          <TouchableOpacity onPress={onOpenPaywall} activeOpacity={0.85}>
            <GlassCard highlight glowColor={THEME.colors.secondaryGlow} borderColor={THEME.colors.secondary} style={styles.proCard}>
              <View style={styles.proHeader}>
                <Text style={styles.proBadge}>DECIDIO PRO FEATURE</Text>
                <Text style={styles.proTitle}>Deep Psychological Decision Auditing</Text>
              </View>
              <Text style={styles.proDesc}>
                Unlock 1-year longitudinal tracking, prediction accuracy scores, and AI cognitive bias countermeasures powered by RevenueCat.
              </Text>
              <View style={styles.upgradeBtn}>
                <Text style={styles.upgradeBtnText}>Unlock Deep Memory with Pro →</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
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
    gap: THEME.spacing.xl,
  },
  header: {
    gap: 4,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  subtitle: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
  },
  biasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: THEME.spacing.sm,
  },
  biasEmoji: {
    fontSize: 28,
  },
  biasTag: {
    color: THEME.colors.primaryLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  biasName: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  biasSummary: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
  },
  section: {
    gap: THEME.spacing.sm,
  },
  sectionTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  patternsList: {
    gap: 8,
  },
  patternCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: THEME.spacing.md,
  },
  patternIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternIcon: {
    color: THEME.colors.secondary,
    fontSize: 12,
  },
  patternText: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: THEME.spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '900',
  },
  statLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  proCard: {
    padding: THEME.spacing.lg,
    gap: 8,
  },
  proHeader: {
    gap: 4,
  },
  proBadge: {
    color: THEME.colors.secondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  proTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  proDesc: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 17,
  },
  upgradeBtn: {
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    marginTop: 6,
  },
  upgradeBtnText: {
    color: '#07090E',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
});
