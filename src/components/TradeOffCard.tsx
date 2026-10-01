import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TradeOffAnalysis } from '../types';
import { THEME } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface TradeOffCardProps {
  tradeOff: TradeOffAnalysis;
}

export const TradeOffCard: React.FC<TradeOffCardProps> = ({ tradeOff }) => {
  return (
    <GlassCard highlight glowColor="rgba(255, 171, 0, 0.25)" borderColor={THEME.colors.accentAmber}>
      <View style={styles.header}>
        <Text style={styles.icon}>⚖️</Text>
        <View style={styles.titleArea}>
          <Text style={styles.title}>THE TRUE TRADE-OFF</Text>
          <Text style={styles.subtitle}>Uncovering unseen costs and opportunity penalties</Text>
        </View>
      </View>

      {/* Core Conflict */}
      <View style={styles.calloutBox}>
        <Text style={styles.calloutText}>{tradeOff.coreConflict}</Text>
      </View>

      {/* Hidden Costs Formula */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>🔍 THE HIDDEN COST</Text>
        <View style={styles.formulaBox}>
          <Text style={styles.formulaText}>{tradeOff.hiddenCostFormula}</Text>
        </View>
      </View>

      {/* Opportunity Cost */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>⏳ OPPORTUNITY COST (WHAT YOU FORFEIT)</Text>
        <Text style={styles.opportunityText}>{tradeOff.opportunityCost}</Text>
      </View>

      {/* AI Strategic Verdict */}
      <View style={styles.verdictBox}>
        <View style={styles.verdictHeader}>
          <Text style={styles.aiBadge}>AI VERDICT</Text>
          <Text style={styles.tradeOffPill}>{tradeOff.keyTradeoff}</Text>
        </View>
        <Text style={styles.verdictText}>{tradeOff.aiVerdict}</Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    color: THEME.colors.accentAmber,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
  },
  calloutBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.accentAmber,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.md,
  },
  calloutText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  section: {
    marginBottom: THEME.spacing.md,
  },
  sectionLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  formulaBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formulaText: {
    color: THEME.colors.secondary,
    fontSize: THEME.typography.sizes.xs,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  opportunityText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
  },
  verdictBox: {
    backgroundColor: 'rgba(124, 77, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.3)',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    gap: 6,
  },
  verdictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  aiBadge: {
    color: THEME.colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    backgroundColor: 'rgba(124, 77, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tradeOffPill: {
    color: THEME.colors.accentAmber,
    fontSize: 10,
    fontWeight: '700',
  },
  verdictText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
