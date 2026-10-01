import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DecisionDNA } from '../types';
import { THEME } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface DecisionDNACardProps {
  dna: DecisionDNA;
  compact?: boolean;
}

export const DecisionDNACard: React.FC<DecisionDNACardProps> = ({ dna }) => {
  const getPatternDescription = () => {
    switch (dna.decisionType) {
      case 'Strategic Investment':
        return 'High potential upside with meaningful time and financial commitment.';
      case 'No-Brainer Upside':
        return 'Asymmetric upside with low capital downside and manageable reversibility.';
      case 'High-Risk Pivot':
        return 'Significant commitment with low reversibility; requires strict milestones.';
      case 'Low-Stakes Trial':
        return 'Highly reversible experiment; low downside if results underperform.';
      case 'Capital Preserver':
        return 'Focuses on capital protection and optionality over rapid speculative gains.';
      default:
        return 'Balanced profile with calculated risk and measurable milestones.';
    }
  };

  return (
    <GlassCard elevated style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Your Decision DNA</Text>
          <Text style={styles.subtitle}>How this decision behaves across the factors that matter.</Text>
        </View>

        <View style={styles.confidencePill}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={styles.confidenceVal}>{dna.confidenceScore}%</Text>
        </View>
      </View>

      {/* Decision Pattern Box */}
      <View style={styles.patternBox}>
        <View style={styles.patternHeader}>
          <Text style={styles.patternBadge}>DECISION PATTERN</Text>
          <Text style={styles.patternName}>{dna.decisionType}</Text>
        </View>
        <Text style={styles.patternExplanation}>{getPatternDescription()}</Text>
      </View>

      {/* 6 Dimensions Bars */}
      <View style={styles.dimensionsList}>
        <DimensionBar label="Risk Exposure" score={dna.riskScore} color={THEME.colors.accentRose} />
        <DimensionBar label="Capital Required" score={dna.costScore} color={THEME.colors.accentAmber} />
        <DimensionBar label="Time Intensity" score={dna.timeScore} color={THEME.colors.secondary} />
        <DimensionBar label="Career Upside" score={dna.careerImpactScore} color={THEME.colors.accentGreen} />
        <DimensionBar label="Reversibility" score={dna.reversibilityScore} color={THEME.colors.primaryLight} />
        <DimensionBar label="Confidence Level" score={dna.confidenceScore} color={THEME.colors.textPrimary} />
      </View>
    </GlassCard>
  );
};

const DimensionBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <View style={styles.dimRow}>
    <View style={styles.dimHeader}>
      <Text style={styles.dimLabel}>{label}</Text>
      <Text style={[styles.dimScore, { color }]}>{score}%</Text>
    </View>
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.min(100, Math.max(8, score))}%`, backgroundColor: color }]} />
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
  titleWrap: {
    gap: 2,
    flex: 1,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  confidencePill: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  confidenceLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  confidenceVal: {
    color: THEME.colors.accentGreen,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: 'bold',
  },
  patternBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.md,
    gap: 6,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patternBadge: {
    color: THEME.colors.primaryLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  patternName: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
  patternExplanation: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  dimensionsList: {
    gap: 12,
  },
  dimRow: {
    gap: 4,
  },
  dimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dimLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  dimScore: {
    fontSize: 11,
    fontWeight: '700',
  },
  barTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: THEME.borderRadius.full,
  },
});
