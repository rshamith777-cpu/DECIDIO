import React, { useState } from 'react';
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
  const [hasChanged, setHasChanged] = useState(false);

  const updateCost = (delta: number) => {
    const newCost = Math.max(0, assumptions.cost + delta);
    setHasChanged(true);
    onChange({ ...assumptions, cost: newCost });
  };

  const updateHours = (delta: number) => {
    const newHours = Math.max(1, Math.min(60, assumptions.hoursPerWeek + delta));
    setHasChanged(true);
    onChange({ ...assumptions, hoursPerWeek: newHours });
  };

  const updateHorizon = (days: number) => {
    setHasChanged(true);
    onChange({ ...assumptions, horizonDays: days });
  };

  const handleReset = () => {
    setHasChanged(false);
    onReset();
  };

  return (
    <GlassCard elevated highlight style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Change the Future</Text>
          <Text style={styles.subtitle}>Change the assumptions. See how the scenarios change.</Text>
        </View>

        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlsList}>
        {/* PRICE CONTROL */}
        <View style={styles.controlRow}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>CAPITAL / PRICE</Text>
            <Text style={styles.controlValue}>{currency}{Math.round(assumptions.cost).toLocaleString()}</Text>
          </View>
          <View style={styles.stepperGroup}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(-1000)}>
              <Text style={styles.stepBtnText}>− ₹1k</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(-500)}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(500)}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(1000)}>
              <Text style={styles.stepBtnText}>+ ₹1k</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TIME CONTROL */}
        <View style={styles.controlRow}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>WEEKLY TIME</Text>
            <Text style={[styles.controlValue, { color: THEME.colors.secondary }]}>
              {assumptions.hoursPerWeek}h / week
            </Text>
          </View>
          <View style={styles.stepperGroup}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHours(-4)}>
              <Text style={styles.stepBtnText}>− 4h</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHours(-2)}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHours(2)}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateHours(4)}>
              <Text style={styles.stepBtnText}>+ 4h</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HORIZON CONTROL */}
        <View style={styles.horizonBlock}>
          <View style={styles.horizonHeader}>
            <Text style={styles.controlLabel}>EVALUATION HORIZON</Text>
            <Text style={styles.horizonValueText}>{assumptions.horizonDays} days</Text>
          </View>
          <View style={styles.pillsRow}>
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

      {/* Recalculation Live Status */}
      <View style={styles.statusFooter}>
        <View style={[styles.statusDot, hasChanged && styles.statusDotRecalculated]} />
        <Text style={styles.statusText}>
          {hasChanged ? 'Scenario recalculated — Impact & DNA updated' : 'Drag or adjust values to test alternatives'}
        </Text>
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
  resetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.sm,
  },
  resetText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  controlsList: {
    gap: THEME.spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  controlInfo: {
    gap: 2,
  },
  controlLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  controlValue: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  stepperGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
    minWidth: 32,
    alignItems: 'center',
  },
  stepBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  horizonBlock: {
    gap: 6,
  },
  horizonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizonValueText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  horizonPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
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
    color: '#080909',
    fontWeight: 'bold',
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: THEME.spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.textTertiary,
  },
  statusDotRecalculated: {
    backgroundColor: THEME.colors.accentGreen,
  },
  statusText: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontStyle: 'italic',
  },
});
