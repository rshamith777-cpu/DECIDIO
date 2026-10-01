import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DecisionDNA } from '../types';
import { THEME } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface DecisionDNACardProps {
  dna: DecisionDNA;
  compact?: boolean;
}

export const DecisionDNACard: React.FC<DecisionDNACardProps> = ({ dna, compact = false }) => {
  const getScoreColor = (score: number, inverse = false) => {
    const val = inverse ? 100 - score : score;
    if (val >= 70) return THEME.colors.accentGreen;
    if (val >= 40) return THEME.colors.secondary;
    return THEME.colors.accentPink;
  };

  const getTypeBadgeStyle = () => {
    switch (dna.decisionType) {
      case 'Strategic Investment':
        return { bg: 'rgba(124, 77, 255, 0.2)', border: THEME.colors.primary, text: THEME.colors.primaryLight };
      case 'No-Brainer Upside':
        return { bg: 'rgba(0, 230, 118, 0.2)', border: THEME.colors.accentGreen, text: THEME.colors.accentGreen };
      case 'High-Risk Pivot':
        return { bg: 'rgba(255, 42, 133, 0.2)', border: THEME.colors.accentPink, text: THEME.colors.accentPink };
      default:
        return { bg: 'rgba(0, 229, 255, 0.2)', border: THEME.colors.secondary, text: THEME.colors.secondary };
    }
  };

  const badge = getTypeBadgeStyle();

  return (
    <GlassCard highlight glowColor={THEME.colors.primaryGlow}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.dnaEmoji}>🧬</Text>
          <View>
            <Text style={styles.title}>DECISION DNA</Text>
            <Text style={styles.subtitle}>Multi-dimensional AI Profiling</Text>
          </View>
        </View>

        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={styles.confidenceValue}>{dna.confidenceScore}%</Text>
        </View>
      </View>

      <View style={[styles.typeBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
        <Text style={[styles.typeBadgeText, { color: badge.text }]}>
          Decision Type: {dna.decisionType}
        </Text>
      </View>

      <View style={styles.metricsContainer}>
        {/* Risk */}
        <MetricBar
          label="Risk Exposure"
          score={dna.riskScore}
          color={THEME.colors.accentPink}
          description={dna.riskScore > 60 ? 'High downside potential' : 'Calculated & manageable'}
        />

        {/* Cost Commitment */}
        <MetricBar
          label="Capital Commitment"
          score={dna.costScore}
          color={THEME.colors.accentAmber}
          description={dna.costScore > 50 ? 'Significant capital drain' : 'Low financial resistance'}
        />

        {/* Time Intensity */}
        <MetricBar
          label="Time Intensity"
          score={dna.timeScore}
          color={THEME.colors.secondary}
          description={dna.timeScore > 60 ? 'Heavy weekly schedule tax' : 'Fits in existing routine'}
        />

        {/* Career Upside */}
        <MetricBar
          label="Career & Skill Upside"
          score={dna.careerImpactScore}
          color={THEME.colors.accentGreen}
          description={dna.careerImpactScore > 70 ? 'Asymmetric career leverage' : 'Incremental gain'}
        />

        {/* Reversibility */}
        <MetricBar
          label="Reversibility"
          score={dna.reversibilityScore}
          color={THEME.colors.primaryLight}
          description={dna.reversibilityScore > 60 ? 'Easy 2-way door decision' : 'Irreversible sink cost'}
        />
      </View>
    </GlassCard>
  );
};

interface MetricBarProps {
  label: string;
  score: number;
  color: string;
  description: string;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, score, color, description }) => {
  return (
    <View style={styles.metricItem}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricScore, { color }]}>{score}%</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(100, Math.max(8, score))}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.metricDesc}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  dnaEmoji: {
    fontSize: 24,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  subtitle: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
  },
  confidenceBadge: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  confidenceLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  confidenceValue: {
    color: THEME.colors.accentGreen,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: 'bold',
  },
  typeBadge: {
    borderWidth: 1,
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: THEME.spacing.lg,
  },
  typeBadgeText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricsContainer: {
    gap: THEME.spacing.md,
  },
  metricItem: {
    gap: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '600',
  },
  metricScore: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  barTrack: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: THEME.borderRadius.full,
  },
  metricDesc: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    marginTop: 1,
  },
});
