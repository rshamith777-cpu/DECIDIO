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

  return (
    <GlassCard elevated style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>The True Trade-Off</Text>
        <Text style={styles.subtitle}>Beyond the direct price tag</Text>
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
          <Text style={[styles.pillarValue, { color: THEME.colors.secondary }]}>~{totalHours} hrs</Text>
          <Text style={styles.pillarLabel}>Estimated time commitment</Text>
        </View>

        <View style={styles.pillarDivider} />

        <View style={styles.pillarItem}>
          <Text style={[styles.pillarValue, { color: THEME.colors.primaryLight }]}>1 Major</Text>
          <Text style={styles.pillarLabel}>Alternative forfeited</Text>
        </View>
      </View>

      {/* Deep Human Explanation */}
      <View style={styles.insightBox}>
        <Text style={styles.insightText}>
          The real decision is not {currency}{Math.round(cost).toLocaleString()}. It's whether the outcome is worth the money + time + alternatives you're giving up.
        </Text>
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
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
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
    backgroundColor: 'rgba(124, 77, 255, 0.08)',
    borderLeftWidth: 2,
    borderLeftColor: THEME.colors.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
  },
  insightText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
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
