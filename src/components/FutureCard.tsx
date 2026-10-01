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
  const [activeTab, setActiveTab] = useState<'timeline' | 'impact' | 'tradeoffs'>('timeline');

  const getOptionMeta = () => {
    switch (scenario.id) {
      case 'optionA':
        return {
          code: 'OPTION A',
          name: 'COMMIT',
          tagline: 'Take action now under current roadmap',
          accent: THEME.colors.scenarioA,
        };
      case 'optionB':
        return {
          code: 'OPTION B',
          name: 'WAIT',
          tagline: 'Gather more evidence before committing capital',
          accent: THEME.colors.scenarioB,
        };
      case 'optionC':
        return {
          code: 'OPTION C',
          name: 'SKIP',
          tagline: 'Redirect time, capital, and energy elsewhere',
          accent: THEME.colors.scenarioC,
        };
    }
  };

  const meta = getOptionMeta();

  return (
    <GlassCard elevated highlight={isActive} borderColor={isActive ? meta.accent : undefined} style={styles.card}>
      {/* Option Banner */}
      <View style={styles.header}>
        <View style={styles.tagWrap}>
          <Text style={[styles.optionCode, { color: meta.accent }]}>{meta.code}</Text>
          <Text style={styles.optionName}>{meta.name}</Text>
        </View>
        <Text style={styles.pathSub}>Possible 90-day scenario</Text>
      </View>

      <Text style={styles.scenarioLabel}>{scenario.label}</Text>
      <Text style={styles.scenarioDesc}>{scenario.summary}</Text>

      {/* Primary Key Commitments */}
      <View style={styles.commitmentsRow}>
        <View style={styles.commitmentItem}>
          <Text style={styles.commitmentLabel}>ESTIMATED CAPITAL</Text>
          <Text
            style={[
              styles.commitmentVal,
              { color: scenario.financialDelta.startsWith('-') ? THEME.colors.textPrimary : THEME.colors.accentGreen },
            ]}
          >
            {scenario.financialDelta}
          </Text>
        </View>

        <View style={styles.commitmentDivider} />

        <View style={styles.commitmentItem}>
          <Text style={styles.commitmentLabel}>WEEKLY TIME</Text>
          <Text style={[styles.commitmentVal, { color: THEME.colors.secondary }]}>
            {scenario.timeCommitment}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'timeline' && styles.tabBtnActive]}
          onPress={() => setActiveTab('timeline')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'timeline' && styles.tabBtnTextActive]}>
            What Could Happen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'impact' && styles.tabBtnActive]}
          onPress={() => setActiveTab('impact')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'impact' && styles.tabBtnTextActive]}>
            Impact Factors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tradeoffs' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tradeoffs')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'tradeoffs' && styles.tabBtnTextActive]}>
            Upside & Trade-off
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <View style={styles.timelineList}>
          {scenario.milestones.map((m, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>DAY {m.day}</Text>
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineTitleRow}>
                  <Text style={styles.milestoneTitle}>{m.title}</Text>
                  <Text style={[styles.milestoneImpact, { color: meta.accent }]}>{m.metricImpact}</Text>
                </View>
                <Text style={styles.milestoneDesc}>{m.description}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.assumptionFootnote}>
            Based on current assumptions · Estimated outcome rather than a guaranteed forecast.
          </Text>
        </View>
      )}

      {activeTab === 'impact' && (
        <View style={styles.impactContainer}>
          <ImpactMeter label="Career & Skill Leverage" score={scenario.skillGrowth} color={THEME.colors.accentGreen} />
          <ImpactMeter label="Time Intensity Tax" score={scenario.id === 'optionA' ? 75 : 20} color={THEME.colors.secondary} />
          <ImpactMeter label="Capital Preservation" score={scenario.financialImpact} color={THEME.colors.accentAmber} />
          <ImpactMeter label="Peace of Mind & Focus" score={scenario.peaceOfMind} color={THEME.colors.primaryLight} />
        </View>
      )}

      {activeTab === 'tradeoffs' && (
        <View style={styles.tradeoffBox}>
          <View style={styles.tradeoffSection}>
            <Text style={styles.tradeoffTitle}>✦ Potential Upside</Text>
            {scenario.pros.map((p, i) => (
              <Text key={i} style={styles.bulletPoint}>
                • {p}
              </Text>
            ))}
          </View>

          <View style={styles.tradeoffSection}>
            <Text style={[styles.tradeoffTitle, { color: THEME.colors.accentRose }]}>⚠ Trade-off & Cost</Text>
            {scenario.cons.map((c, i) => (
              <Text key={i} style={styles.bulletPoint}>
                • {c}
              </Text>
            ))}
          </View>
        </View>
      )}
    </GlassCard>
  );
};

const ImpactMeter: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <View style={styles.meterBlock}>
    <View style={styles.meterHeader}>
      <Text style={styles.meterLabel}>{label}</Text>
      <Text style={[styles.meterVal, { color }]}>{score}%</Text>
    </View>
    <View style={styles.meterTrack}>
      <View style={[styles.meterFill, { width: `${Math.min(100, Math.max(10, score))}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionCode: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  optionName: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pathSub: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  scenarioLabel: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
  },
  scenarioDesc: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
  },
  commitmentsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.md,
    alignItems: 'center',
  },
  commitmentItem: {
    flex: 1,
  },
  commitmentLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  commitmentVal: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
    marginTop: 2,
  },
  commitmentDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: THEME.spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 4,
    gap: 12,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.primary,
  },
  tabBtnText: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '800',
  },
  timelineList: {
    gap: 10,
    paddingTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
  },
  dayBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  dayText: {
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
  milestoneTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  milestoneImpact: {
    fontSize: 10,
    fontWeight: '700',
  },
  milestoneDesc: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    lineHeight: 15,
  },
  assumptionFootnote: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: 4,
  },
  impactContainer: {
    gap: 12,
    paddingTop: 4,
  },
  meterBlock: {
    gap: 4,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
  },
  meterVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  meterTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: THEME.borderRadius.full,
  },
  tradeoffBox: {
    gap: 10,
    paddingTop: 4,
  },
  tradeoffSection: {
    gap: 3,
  },
  tradeoffTitle: {
    color: THEME.colors.accentGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  bulletPoint: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    paddingLeft: 4,
  },
});
