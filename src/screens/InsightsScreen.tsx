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

  const totalDecisions = decisions.length;
  const resolvedDecisions = decisions.filter(d => d.status === 'resolved').length;
  const activeDecisions = decisions.filter(d => d.status === 'active').length;

  // Real data-driven behavioral observations
  const memoryLearnings: string[] = [];

  if (totalDecisions > 0) {
    if (insights.underestimatedTimeFreq && insights.underestimatedTimeFreq !== '0%') {
      memoryLearnings.push(
        'You underestimated time commitment in several recent decisions. Consider buffering weekly time estimates by 20%.'
      );
    }
    const reversibleCount = decisions.filter(d => (d.dna?.reversibilityScore || 0) >= 60).length;
    if (reversibleCount > 0) {
      memoryLearnings.push(
        'You tend to follow through more strongly on reversible decisions where the cost of changing course is low.'
      );
    }
    if (insights.avgConfidence >= 75) {
      memoryLearnings.push(
        `High initial conviction: Your average confidence across scenarios is ${insights.avgConfidence}%.`
      );
    } else {
      memoryLearnings.push(
        `Thoughtful deliberation: Your average confidence across scenarios is ${insights.avgConfidence}%, reflecting measured risk assessment.`
      );
    }
    if (insights.patterns && insights.patterns.length > 0) {
      insights.patterns.forEach(p => {
        if (!memoryLearnings.includes(p)) {
          memoryLearnings.push(p);
        }
      });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>AI MEMORY</Text>
          <Text style={styles.title}>Decision Memory</Text>
          <Text style={styles.subtitle}>
            DECIDIO gets more useful as you make more decisions.
          </Text>
        </View>

        {/* 3 Macro Metrics */}
        <View style={styles.macroRow}>
          <GlassCard style={styles.macroCard}>
            <Text style={styles.macroNumber}>{totalDecisions}</Text>
            <Text style={styles.macroLabel}>Decisions</Text>
          </GlassCard>

          <GlassCard style={styles.macroCard}>
            <Text style={[styles.macroNumber, { color: THEME.colors.accentGreen }]}>
              {resolvedDecisions}
            </Text>
            <Text style={styles.macroLabel}>Resolved</Text>
          </GlassCard>

          <GlassCard style={styles.macroCard}>
            <Text style={[styles.macroNumber, { color: THEME.colors.accentCyan }]}>
              {activeDecisions}
            </Text>
            <Text style={styles.macroLabel}>Active</Text>
          </GlassCard>
        </View>

        {/* Primary Archetype Spotlight */}
        <GlassCard style={styles.archetypeCard}>
          <View style={styles.archetypeTop}>
            <Text style={styles.archetypeTag}>DOMINANT PROFILE ARCHETYPE</Text>
            <Text style={styles.archetypeTitle}>{insights.primaryBias}</Text>
          </View>
          <Text style={styles.archetypeDescription}>
            Based on your simulated and resolved decisions, you consistently lean toward strategic growth while under-budgeting the cumulative weekly cognitive load.
          </Text>
        </GlassCard>

        {/* What DECIDIO Has Learned */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>WHAT DECIDIO HAS LEARNED</Text>

          {memoryLearnings.length === 0 ? (
            <GlassCard style={styles.emptyMemoryCard}>
              <Text style={styles.emptyMemoryTitle}>No decisions recorded yet.</Text>
              <Text style={styles.emptyMemoryText}>
                Simulate your first decision from the Home tab to begin building your personal decision intelligence profile.
              </Text>
            </GlassCard>
          ) : (
            <View style={styles.learningList}>
              {memoryLearnings.map((learning, idx) => (
                <GlassCard key={idx} style={styles.learningCard}>
                  <View style={styles.dotIndicator} />
                  <Text style={styles.learningText}>{learning}</Text>
                </GlassCard>
              ))}
            </View>
          )}
        </View>

        {/* Capital & Confidence Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>CAPITAL & COMMITMENT TOTALS</Text>
          <View style={styles.totalsGrid}>
            <GlassCard style={styles.totalCard}>
              <Text style={styles.totalValue}>
                ₹{Math.round(insights.totalCapitalSimulated).toLocaleString()}
              </Text>
              <Text style={styles.totalLabel}>Total Capital Modeled</Text>
            </GlassCard>

            <GlassCard style={styles.totalCard}>
              <Text style={[styles.totalValue, { color: THEME.colors.accentViolet }]}>
                {insights.avgConfidence}%
              </Text>
              <Text style={styles.totalLabel}>Average Conviction</Text>
            </GlassCard>
          </View>
        </View>

        {/* Pro Teaser */}
        {!isPro && (
          <TouchableOpacity onPress={onOpenPaywall} activeOpacity={0.85}>
            <GlassCard highlight borderColor={THEME.colors.accentViolet} style={styles.proCard}>
              <View style={styles.proHeader}>
                <Text style={styles.proTag}>DECIDIO PRO</Text>
                <Text style={styles.proTitle}>Deep Longitudinal Intelligence</Text>
              </View>
              <Text style={styles.proDesc}>
                Unlock longitudinal outcome audits, cognitive blindspot countermeasures, and multi-year trajectory mapping.
              </Text>
              <View style={styles.upgradeBtn}>
                <Text style={styles.upgradeBtnText}>Explore DECIDIO Pro →</Text>
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
    paddingBottom: 60,
    gap: THEME.spacing.xl,
  },
  header: {
    gap: 4,
    marginTop: 4,
  },
  eyebrow: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroCard: {
    flex: 1,
    padding: THEME.spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  macroNumber: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '900',
  },
  macroLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  archetypeCard: {
    padding: THEME.spacing.lg,
    gap: 8,
  },
  archetypeTop: {
    gap: 2,
  },
  archetypeTag: {
    color: THEME.colors.accentViolet,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  archetypeTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  archetypeDescription: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
  },
  section: {
    gap: THEME.spacing.sm,
  },
  sectionHeading: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  learningList: {
    gap: 8,
  },
  learningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: THEME.spacing.md,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accentViolet,
    marginTop: 6,
  },
  learningText: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 19,
    fontWeight: '500',
  },
  emptyMemoryCard: {
    padding: THEME.spacing.lg,
    gap: 6,
  },
  emptyMemoryTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  emptyMemoryText: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
  },
  totalsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  totalCard: {
    flex: 1,
    padding: THEME.spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  totalValue: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  totalLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  proCard: {
    padding: THEME.spacing.lg,
    gap: 10,
  },
  proHeader: {
    gap: 2,
  },
  proTag: {
    color: THEME.colors.accentViolet,
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
    lineHeight: 18,
  },
  upgradeBtn: {
    backgroundColor: THEME.colors.primaryText,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  upgradeBtnText: {
    color: THEME.colors.background,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
});
