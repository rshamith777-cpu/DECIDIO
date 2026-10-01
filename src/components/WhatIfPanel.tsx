import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WhatIfAssumptions } from '../types';
import { THEME } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface WhatIfPanelProps {
  currency: string;
  assumptions: WhatIfAssumptions;
  onChange: (updated: WhatIfAssumptions) => void;
  onReset: () => void;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  currency,
  assumptions,
  onChange,
  onReset,
}) => {
  const updateCost = (delta: number) => {
    const newCost = Math.max(0, assumptions.cost + delta);
    onChange({ ...assumptions, cost: newCost });
  };

  const updateHours = (delta: number) => {
    const newHours = Math.max(1, Math.min(60, assumptions.hoursPerWeek + delta));
    onChange({ ...assumptions, hoursPerWeek: newHours });
  };

  const updateHorizon = (days: number) => {
    onChange({ ...assumptions, horizonDays: days });
  };

  return (
    <GlassCard highlight glowColor={THEME.colors.secondaryGlow} borderColor={THEME.colors.secondary}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>🔄</Text>
          <View>
            <Text style={styles.title}>WHAT-IF ENGINE</Text>
            <Text style={styles.subtitle}>Modify assumptions to recalculate the future in real-time</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlsList}>
        {/* Cost Assumption */}
        <View style={styles.controlRow}>
          <View>
            <Text style={styles.controlLabel}>Capital Required</Text>
            <Text style={styles.controlSub}>{currency}{Math.round(assumptions.cost).toLocaleString()}</Text>
          </View>
          <View style={styles.stepperContainer}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(-1000)}>
              <Text style={styles.stepBtnText}>-1k</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(-500)}>
              <Text style={styles.stepBtnText}>-500</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(500)}>
              <Text style={styles.stepBtnText}>+500</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(1000)}>
              <Text style={styles.stepBtnText}>+1k</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Commitment Assumption */}
        <View style={styles.controlRow}>
          <View>
            <Text style={styles.controlLabel}>Available Weekly Time</Text>
            <Text style={styles.controlSub}>{assumptions.hoursPerWeek} hrs / week</Text>
          </View>
          <View style={styles.stepperContainer}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHours(-4)}>
              <Text style={styles.stepBtnText}>-4h</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHours(-2)}>
              <Text style={styles.stepBtnText}>-2h</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHours(2)}>
              <Text style={styles.stepBtnText}>+2h</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHours(4)}>
              <Text style={styles.stepBtnText}>+4h</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizon Assumption */}
        <View style={styles.controlRowVertical}>
          <View style={styles.horizonHeader}>
            <Text style={styles.controlLabel}>Decision Evaluation Horizon</Text>
            <Text style={styles.controlSub}>{assumptions.horizonDays} Days</Text>
          </View>
          <View style={styles.horizonPills}>
            {[30, 60, 90, 180, 365].map(days => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.horizonPill,
                  assumptions.horizonDays === days && styles.horizonPillActive,
                ]}
                onPress={() => updateHorizon(days)}
              >
                <Text
                  style={[
                    styles.horizonPillText,
                    assumptions.horizonDays === days && styles.horizonPillTextActive,
                  ]}
                >
                  {days < 365 ? `${days}d` : '1yr'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>Simulations updating dynamically across all 3 futures</Text>
      </View>
    </GlassCard>
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
    flex: 1,
  },
  icon: {
    fontSize: 22,
  },
  title: {
    color: THEME.colors.secondary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  resetButton: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
  },
  controlsList: {
    gap: THEME.spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  controlRowVertical: {
    gap: THEME.spacing.xs,
  },
  horizonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  controlSub: {
    color: THEME.colors.secondary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
  stepperContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.sm,
  },
  stepBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  horizonPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  horizonPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  horizonPillActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  horizonPillText: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  horizonPillTextActive: {
    color: '#07090E',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accentGreen,
  },
  liveText: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontStyle: 'italic',
  },
});
