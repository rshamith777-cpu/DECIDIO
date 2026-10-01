import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScenarioOption } from '../types';
import { THEME } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface FutureCardProps {
  scenario: ScenarioOption;
  isActive?: boolean;
}

export const FutureCard: React.FC<FutureCardProps> = ({ scenario, isActive = true }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'metrics' | 'proscons'>('timeline');

  const getOptionColor = () => {
    switch (scenario.id) {
      case 'optionA':
        return {
          primary: THEME.colors.scenarioA,
          glow: 'rgba(56, 189, 248, 0.25)',
          tag: 'OPTION A — COMMIT',
          emoji: '🔵',
        };
      case 'optionB':
        return {
          primary: THEME.colors.scenarioB,
          glow: 'rgba(168, 85, 247, 0.25)',
          tag: 'OPTION B — WAIT & AUDIT',
          emoji: '🟣',
        };
      case 'optionC':
        return {
          primary: THEME.colors.scenarioC,
          glow: 'rgba(244, 63, 94, 0.25)',
          tag: 'OPTION C — PIVOT & SKIP',
          emoji: '🔴',
        };
    }
  };

  const colors = getOptionColor();

  return (
    <GlassCard highlight={isActive} borderColor={isActive ? colors.primary : undefined} glowColor={colors.glow}>
      {/* Header Tag */}
      <View style={styles.headerRow}>
        <View style={[styles.tagBadge, { borderColor: colors.primary, backgroundColor: 'rgba(255, 255, 255, 0.04)' }]}>
          <Text style={[styles.tagText, { color: colors.primary }]}>
            {colors.emoji} {colors.tag}
          </Text>
        </View>

        <View style={styles.actionPill}>
          <Text style={styles.actionText}>{scenario.actionType}</Text>
        </View>
      </View>

      {/* Main Action Title */}
      <Text style={styles.label}>{scenario.label}</Text>
      <Text style={styles.subtitle}>{scenario.subtitle}</Text>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Money Delta</Text>
          <Text style={[styles.statValue, { color: scenario.financialDelta.startsWith('-') ? THEME.colors.accentPink : THEME.colors.accentGreen }]}>
            {scenario.financialDelta}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time Cost</Text>
          <Text style={[styles.statValue, { color: THEME.colors.secondary }]}>
            {scenario.timeCommitment}
          </Text>
        </View>
      </View>

      {/* Probability Box */}
      <View style={styles.probabilityBox}>
        <Text style={styles.probTitle}>⚡ PROBABILITY-WEIGHTED FUTURE</Text>
        <Text style={styles.probText}>{scenario.probabilityWeightedOutcome}</Text>
      </View>

      {/* Sub Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'timeline' && styles.tabActive]}
          onPress={() => setActiveTab('timeline')}
        >
          <Text style={[styles.tabText, activeTab === 'timeline' && styles.tabTextActive]}>
            Timeline
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'metrics' && styles.tabActive]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text style={[styles.tabText, activeTab === 'metrics' && styles.tabTextActive]}>
            Impact Metrics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'proscons' && styles.tabActive]}
          onPress={() => setActiveTab('proscons')}
        >
          <Text style={[styles.tabText, activeTab === 'proscons' && styles.tabTextActive]}>
            Pros & Cons
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <View style={styles.timelineList}>
          {scenario.milestones.map((m, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineDayBubble}>
                <Text style={styles.timelineDayText}>DAY {m.day}</Text>
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineTitleRow}>
                  <Text style={styles.timelineTitle}>{m.title}</Text>
                  <Text style={[styles.metricImpact, { color: colors.primary }]}>{m.metricImpact}</Text>
                </View>
                <Text style={styles.timelineDesc}>{m.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'metrics' && (
        <View style={styles.metricsContainer}>
          <MiniMeter label="Skill & Knowledge Gain" score={scenario.skillGrowth} color={THEME.colors.accentGreen} />
          <MiniMeter label="Portfolio Leverage" score={scenario.portfolioImpact} color={THEME.colors.secondary} />
          <MiniMeter label="Capital Preservation" score={scenario.financialImpact} color={THEME.colors.accentAmber} />
          <MiniMeter label="Peace of Mind & Focus" score={scenario.peaceOfMind} color={THEME.colors.primaryLight} />
        </View>
      )}

      {activeTab === 'proscons' && (
        <View style={styles.prosConsContainer}>
          <View style={styles.sectionBlock}>
            <Text style={styles.prosHeader}>✦ Strategic Advantages</Text>
            {scenario.pros.map((pro, i) => (
              <Text key={i} style={styles.bulletItem}>
                • {pro}
              </Text>
            ))}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.consHeader}>⚠ Potential Pitfalls</Text>
            {scenario.cons.map((con, i) => (
              <Text key={i} style={styles.bulletItem}>
                • {con}
              </Text>
            ))}
          </View>
        </View>
      )}
    </GlassCard>
  );
};

const MiniMeter: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <View style={styles.miniMeter}>
    <View style={styles.miniMeterHeader}>
      <Text style={styles.miniMeterLabel}>{label}</Text>
      <Text style={[styles.miniMeterScore, { color }]}>{score}%</Text>
    </View>
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  tagBadge: {
    borderWidth: 1,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  tagText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  actionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
  actionText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  label: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    marginBottom: THEME.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  statLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
    marginTop: 2,
  },
  probabilityBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.secondary,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.md,
  },
  probTitle: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  probText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: THEME.borderRadius.md,
    padding: 3,
    marginBottom: THEME.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: THEME.spacing.xs,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabText: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
  },
  tabTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: 'bold',
  },
  timelineList: {
    gap: THEME.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
  },
  timelineDayBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  timelineDayText: {
    color: THEME.colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  metricImpact: {
    fontSize: 10,
    fontWeight: '700',
  },
  timelineDesc: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    lineHeight: 15,
  },
  metricsContainer: {
    gap: THEME.spacing.sm,
  },
  miniMeter: {
    gap: 3,
  },
  miniMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniMeterLabel: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
  },
  miniMeterScore: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: THEME.borderRadius.full,
  },
  prosConsContainer: {
    gap: THEME.spacing.sm,
  },
  sectionBlock: {
    gap: 3,
  },
  prosHeader: {
    color: THEME.colors.accentGreen,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  consHeader: {
    color: THEME.colors.accentPink,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  bulletItem: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    paddingLeft: 4,
  },
});
