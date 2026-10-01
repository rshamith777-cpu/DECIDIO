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
  const [initialState] = useState<WhatIfAssumptions>({ ...assumptions });

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
          <Text style={styles.eyebrow}>ASSUMPTION ENGINE</Text>
          <Text style={styles.title}>Change the Future</Text>
          <Text style={styles.subtitle}>Change the assumptions. See how the scenarios change.</Text>
        </View>

        {hasChanged && (
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.8}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.controlsList}>
        {/* PRICE CONTROL */}
        <View style={styles.controlRow}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>CAPITAL / BUDGET</Text>
            <Text style={styles.controlValue}>{currency}{Math.round(assumptions.cost).toLocaleString()}</Text>
          </View>
          <View style={styles.stepperGroup}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(-1000)}>
              <Text style={styles.stepBtnText}>− 1k</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(-500)}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(500)}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCost(1000)}>
              <Text style={styles.stepBtnText}>+ 1k</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TIME CONTROL */}
        <View style={styles.controlRow}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>TIME AVAILABLE</Text>
            <Text style={[styles.controlValue, { color: THEME.colors.accentCyan }]}>
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
            <Text style={styles.controlLabel}>DECISION DEADLINE / HORIZON</Text>
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
                activeOpacity={0.8}
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

      {/* Before vs After Comparison Box */}
      {hasChanged && (
        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>SCENARIO RECALCULATED: BEFORE VS AFTER</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.compCol}>
              <Text style={styles.compTag}>ORIGINAL</Text>
              <Text style={styles.compVal}>{currency}{Math.round(initialState.cost).toLocaleString()} · {initialState.hoursPerWeek}h/wk</Text>
            </View>
            <Text style={styles.compArrow}>→</Text>
            <View style={styles.compCol}>
              <Text style={[styles.compTag, { color: THEME.colors.accentGreen }]}>NEW ASSUMPTION</Text>
              <Text style={[styles.compVal, { color: THEME.colors.textPrimary }]}>
                {currency}{Math.round(assumptions.cost).toLocaleString()} · {assumptions.hoursPerWeek}h/wk
              </Text>
            </View>
          </View>
          <Text style={styles.comparisonNote}>
            All 3 future branches and trade-offs adjust based on these new constraints.
          </Text>
        </View>
      )}

      {/* Recalculation Status Footer */}
      <View style={styles.statusFooter}>
        <View style={[styles.statusDot, hasChanged && styles.statusDotRecalculated]} />
        <Text style={styles.statusText}>
          {hasChanged ? 'Recalculated live from revised inputs' : 'Adjust values above to simulate alternative assumptions'}
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
    alignItems: 'flex-start',
  },
  titleWrap: {
    gap: 2,
    flex: 1,
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
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  resetBtn: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 12,
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
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
    minWidth: 34,
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
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
  },
  horizonPillActive: {
    backgroundColor: THEME.colors.elevatedSurface,
    borderColor: THEME.colors.textPrimary,
  },
  horizonPillText: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  horizonPillTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '800',
  },
  comparisonBox: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderRadius: THEME.borderRadius.sm,
    padding: THEME.spacing.md,
    gap: 6,
  },
  comparisonTitle: {
    color: THEME.colors.accentGreen,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compCol: {
    flex: 1,
    gap: 2,
  },
  compTag: {
    color: THEME.colors.textTertiary,
    fontSize: 8,
    fontWeight: '700',
  },
  compVal: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  compArrow: {
    color: THEME.colors.textTertiary,
    fontSize: 14,
  },
  comparisonNote: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontStyle: 'italic',
    lineHeight: 14,
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
  },
});
