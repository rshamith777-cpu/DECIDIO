import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TradeOffAnalysis } from '../types';
import { THEME } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface TradeOffCardProps {
  tradeOff: TradeOffAnalysis;
  cost?: number;
  currency?: string;
  hoursPerWeek?: number;
  horizonDays?: number;
}

export const TradeOffCard: React.FC<TradeOffCardProps> = ({
  tradeOff,
  cost = 4999,
  currency = '₹',
  hoursPerWeek = 8,
  horizonDays = 90,
}) => {
  const totalHours = hoursPerWeek * Math.round(horizonDays / 7);

  const TRADE_OFF_DIMENSIONS = [
    { label: 'Money', status: cost > 20000 ? 'High' : 'Moderate', color: THEME.colors.textPrimary },
    { label: 'Time', status: `${hoursPerWeek}h/wk`, color: THEME.colors.accentCyan },
    { label: 'Career', status: 'High Upside', color: THEME.colors.accentGreen },
    { label: 'Learning', status: 'Compound', color: THEME.colors.accentViolet },
    { label: 'Risk', status: 'Asymmetric', color: THEME.colors.accentAmber },
    { label: 'Flexibility', status: 'Reversible', color: THEME.colors.accentGreen },
    { label: 'Momentum', status: 'Accelerates', color: THEME.colors.accentCyan },
  ];

  return (
    <GlassCard elevated style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CONSTRAINTS & SACRIFICES</Text>
        <Text style={styles.title}>The Trade-Off</Text>
      </View>

      {/* Human translation statement */}
      <Text style={styles.highlightStatement}>
        The {currency}{Math.round(cost).toLocaleString()} price is only part of the commitment.
      </Text>

      {/* 3 Pillars Breakdown */}
      <View style={styles.commitmentGrid}>
        <View style={styles.pillarItem}>
          <Text style={styles.pillarValue}>{currency}{Math.round(cost).toLocaleString()}</Text>
          <Text style={styles.pillarLabel}>Financial commitment</Text>
        </View>

        <View style={styles.pillarDivider} />

        <View style={styles.pillarItem}>
          <Text style={[styles.pillarValue, { color: THEME.colors.accentCyan }]}>~{totalHours} hrs</Text>
          <Text style={styles.pillarLabel}>Estimated time commitment</Text>
        </View>

        <View style={styles.pillarDivider} />

        <View style={styles.pillarItem}>
          <Text style={[styles.pillarValue, { color: THEME.colors.accentViolet }]}>1 Project</Text>
          <Text style={styles.pillarLabel}>Alternative forfeited</Text>
        </View>
      </View>

      {/* Deep Human Explanation */}
      <View style={styles.insightBox}>
        <Text style={styles.insightText}>
          The real decision is not {currency}{Math.round(cost).toLocaleString()}. It's whether the outcome is worth the money + time + alternatives you're giving up.
        </Text>
      </View>

      {/* 7 Restrained Dimension Pills */}
      <View style={styles.dimensionsWrap}>
        <Text style={styles.dimensionSectionLabel}>DIMENSIONS AT STAKE</Text>
        <View style={styles.dimensionPillsGrid}>
          {TRADE_OFF_DIMENSIONS.map((dim, idx) => (
            <View key={idx} style={styles.dimensionPill}>
              <Text style={styles.dimensionLabel}>{dim.label}</Text>
              <Text style={[styles.dimensionStatus, { color: dim.color }]}>{dim.status}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Opportunity cost specifics */}
      <View style={styles.opportunitySection}>
        <Text style={styles.opportunityHeader}>WHAT YOU ARE GIVING UP:</Text>
        <Text style={styles.opportunityBody}>{tradeOff.opportunityCost}</Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  header: {
    gap: 2,
  },
  eyebrow: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  highlightStatement: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    lineHeight: 22,
    fontWeight: '600',
  },
  commitmentGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.md,
    alignItems: 'center',
  },
  pillarItem: {
    flex: 1,
  },
  pillarValue: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  pillarLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    marginTop: 2,
    lineHeight: 12,
  },
  pillarDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: THEME.spacing.xs,
  },
  insightBox: {
    backgroundColor: THEME.colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: THEME.colors.accentViolet,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
  },
  insightText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  dimensionsWrap: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: THEME.spacing.sm,
  },
  dimensionSectionLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dimensionPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dimensionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dimensionLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  dimensionStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  opportunitySection: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: THEME.spacing.sm,
  },
  opportunityHeader: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  opportunityBody: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
