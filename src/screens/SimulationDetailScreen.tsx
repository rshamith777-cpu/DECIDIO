import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { THEME } from '../constants/theme';
import { DecisionItem, WhatIfAssumptions } from '../types';
import { FutureCard } from '../components/FutureCard';
import { DecisionDNACard } from '../components/DecisionDNACard';
import { TradeOffCard } from '../components/TradeOffCard';
import { WhatIfPanel } from '../components/WhatIfPanel';
import { ShareDecisionModal } from '../components/ShareDecisionModal';
import { aiEngine } from '../services/aiEngine';
import { StorageService } from '../services/storage';

interface SimulationDetailScreenProps {
  decision: DecisionItem;
  isPro: boolean;
  onBack: () => void;
  onUpdate: (updated: DecisionItem) => void;
  onDelete: (id: string) => void;
  onOpenPaywall: () => void;
}

export const SimulationDetailScreen: React.FC<SimulationDetailScreenProps> = ({
  decision,
  isPro,
  onBack,
  onUpdate,
  onDelete,
  onOpenPaywall,
}) => {
  const [currentDecision, setCurrentDecision] = useState<DecisionItem>(decision);
  const [activeFutureTab, setActiveFutureTab] = useState<'optionA' | 'optionB' | 'optionC'>('optionA');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // What-If Assumption change
  const handleWhatIfChange = (newAssumptions: WhatIfAssumptions) => {
    const recalculated = aiEngine.recalculateWhatIf(currentDecision, newAssumptions);
    setCurrentDecision(recalculated);
    onUpdate(recalculated);
    StorageService.updateDecision(recalculated);
  };

  const handleWhatIfReset = () => {
    const resetAssumptions: WhatIfAssumptions = {
      cost: currentDecision.initialCost,
      hoursPerWeek: 8,
      horizonDays: 90,
      discountOrScholarship: 0,
      alternativePlan: 'Baseline roadmap',
    };
    handleWhatIfChange(resetAssumptions);
  };

  // Toggle timeline checkpoint
  const handleToggleCheckpoint = (checkpointId: string) => {
    const updatedTimeline = currentDecision.timeline.map(chk => {
      if (chk.id === checkpointId) {
        return {
          ...chk,
          isCompleted: !chk.isCompleted,
          completedAt: !chk.isCompleted ? Date.now() : undefined,
        };
      }
      return chk;
    });

    const updated = { ...currentDecision, timeline: updatedTimeline };
    setCurrentDecision(updated);
    onUpdate(updated);
    StorageService.updateDecision(updated);
  };

  // Resolve Decision
  const handleResolve = (chosen: 'optionA' | 'optionB' | 'optionC') => {
    const updated: DecisionItem = {
      ...currentDecision,
      status: 'resolved',
      resolvedOutcome: {
        chosenOption: chosen,
        date: Date.now(),
        rating: 5,
        notes: `Executed ${currentDecision.scenarios[chosen].label}. Tracking outcome.`,
      },
    };
    setCurrentDecision(updated);
    onUpdate(updated);
    StorageService.updateDecision(updated);
    Alert.alert('Decision Resolved 🎯', `Marked as resolved with ${currentDecision.scenarios[chosen].label}. This trains your Decision Memory!`);
  };

  const handleDelete = () => {
    Alert.alert('Delete Decision', 'Are you sure you want to remove this simulated decision?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(currentDecision.id);
          onBack();
        },
      },
    ]);
  };

  const activeScenario = currentDecision.scenarios[activeFutureTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← All Decisions</Text>
          </TouchableOpacity>

          <View style={styles.navRight}>
            <TouchableOpacity onPress={() => setShowShareModal(true)} style={styles.actionIconBtn}>
              <Text style={styles.actionIconText}>📤 Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Header */}
        <View style={styles.titleSection}>
          <View style={styles.metaRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{currentDecision.category.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, currentDecision.status === 'resolved' ? styles.statusBadgeResolved : null]}>
              <Text style={[styles.statusBadgeText, currentDecision.status === 'resolved' ? { color: THEME.colors.accentGreen } : null]}>
                {currentDecision.status === 'resolved' ? '✓ RESOLVED' : '● SIMULATING'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{currentDecision.title}</Text>

          <View style={styles.topStatsRow}>
            <Text style={styles.topStatItem}>
              💰 <Text style={styles.boldText}>{currentDecision.currency}{Math.round(currentDecision.currentCost).toLocaleString()}</Text>
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.topStatItem}>
              ⏱ <Text style={styles.boldText}>{currentDecision.hoursPerWeek} hrs/wk</Text>
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.topStatItem}>
              📅 <Text style={styles.boldText}>{currentDecision.horizonDays} days</Text>
            </Text>
          </View>
        </View>

        {/* 3 Future Branches Switcher */}
        <View style={styles.futuresSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>3 BRANCHING FUTURES</Text>
            <Text style={styles.switchHint}>Tap to switch reality</Text>
          </View>

          <View style={styles.futureTabs}>
            <TouchableOpacity
              style={[
                styles.futureTabItem,
                activeFutureTab === 'optionA' && styles.futureTabAActive,
              ]}
              onPress={() => setActiveFutureTab('optionA')}
            >
              <Text style={styles.futureTabEmoji}>🔵</Text>
              <Text style={[styles.futureTabText, activeFutureTab === 'optionA' && styles.futureTabTextActive]}>
                {currentDecision.scenarios.optionA.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.futureTabItem,
                activeFutureTab === 'optionB' && styles.futureTabBActive,
              ]}
              onPress={() => setActiveFutureTab('optionB')}
            >
              <Text style={styles.futureTabEmoji}>🟣</Text>
              <Text style={[styles.futureTabText, activeFutureTab === 'optionB' && styles.futureTabTextActive]}>
                {currentDecision.scenarios.optionB.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.futureTabItem,
                activeFutureTab === 'optionC' && styles.futureTabCActive,
              ]}
              onPress={() => setActiveFutureTab('optionC')}
            >
              <Text style={styles.futureTabEmoji}>🔴</Text>
              <Text style={[styles.futureTabText, activeFutureTab === 'optionC' && styles.futureTabTextActive]}>
                {currentDecision.scenarios.optionC.label}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Future Scenario Card */}
          <FutureCard scenario={activeScenario} isActive={true} />
        </View>

        {/* Trade-off Card */}
        <TradeOffCard tradeOff={currentDecision.tradeOff} />

        {/* Decision DNA Scorecard */}
        <DecisionDNACard dna={currentDecision.dna} />

        {/* What-If Assumption Engine */}
        <WhatIfPanel
          currency={currentDecision.currency}
          assumptions={currentDecision.whatIf}
          onChange={handleWhatIfChange}
          onReset={handleWhatIfReset}
        />

        {/* Retention Timeline Checkpoints */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>DECISION TIMELINE & ACCOUNTABILITY</Text>
          <Text style={styles.timelineSub}>Check in as time passes to verify if reality matches the AI simulation.</Text>

          <View style={styles.timelineChecklist}>
            {currentDecision.timeline.map(chk => (
              <TouchableOpacity
                key={chk.id}
                style={[styles.checkpointRow, chk.isCompleted && styles.checkpointRowCompleted]}
                onPress={() => handleToggleCheckpoint(chk.id)}
              >
                <View style={[styles.checkbox, chk.isCompleted && styles.checkboxChecked]}>
                  {chk.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <View style={styles.chkContent}>
                  <View style={styles.chkHeader}>
                    <Text style={styles.chkLabel}>DAY {chk.day}: {chk.label}</Text>
                    {chk.isCompleted && <Text style={styles.chkDoneBadge}>COMPLETED</Text>}
                  </View>
                  <Text style={styles.chkDesc}>{chk.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resolve Choice Action */}
        <View style={styles.resolveSection}>
          <Text style={styles.sectionTitle}>READY TO COMMIT?</Text>
          <Text style={styles.resolveSub}>Select which branch you have chosen in real life:</Text>

          <View style={styles.resolveBtnGroup}>
            <TouchableOpacity
              style={[styles.resolveBtn, { borderColor: THEME.colors.scenarioA }]}
              onPress={() => handleResolve('optionA')}
            >
              <Text style={[styles.resolveBtnText, { color: THEME.colors.scenarioA }]}>
                {currentDecision.scenarios.optionA.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resolveBtn, { borderColor: THEME.colors.scenarioB }]}
              onPress={() => handleResolve('optionB')}
            >
              <Text style={[styles.resolveBtnText, { color: THEME.colors.scenarioB }]}>
                {currentDecision.scenarios.optionB.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resolveBtn, { borderColor: THEME.colors.scenarioC }]}
              onPress={() => handleResolve('optionC')}
            >
              <Text style={[styles.resolveBtnText, { color: THEME.colors.scenarioC }]}>
                {currentDecision.scenarios.optionC.label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Modal */}
        <ShareDecisionModal
          visible={showShareModal}
          decision={currentDecision}
          onClose={() => setShowShareModal(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    padding: THEME.spacing.lg,
    paddingBottom: 60,
    gap: THEME.spacing.xl,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 6,
  },
  backBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  navRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionIconBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
  },
  actionIconText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
  },
  deleteBtnText: {
    fontSize: 14,
  },
  titleSection: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    color: THEME.colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  statusBadgeResolved: {
    borderColor: 'rgba(0, 230, 118, 0.4)',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
  },
  statusBadgeText: {
    color: THEME.colors.secondary,
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '900',
    lineHeight: 34,
  },
  topStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  topStatItem: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
  },
  boldText: {
    color: THEME.colors.textPrimary,
    fontWeight: 'bold',
  },
  dot: {
    color: THEME.colors.textTertiary,
  },
  futuresSection: {
    gap: THEME.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  switchHint: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: '600',
  },
  futureTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  futureTabItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    gap: 4,
  },
  futureTabAActive: {
    borderColor: THEME.colors.scenarioA,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  futureTabBActive: {
    borderColor: THEME.colors.scenarioB,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
  },
  futureTabCActive: {
    borderColor: THEME.colors.scenarioC,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  futureTabEmoji: {
    fontSize: 14,
  },
  futureTabText: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  futureTabTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '800',
  },
  timelineSection: {
    gap: THEME.spacing.sm,
  },
  timelineSub: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    marginTop: -4,
  },
  timelineChecklist: {
    gap: 8,
    marginTop: 6,
  },
  checkpointRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  checkpointRowCompleted: {
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: THEME.colors.accentGreen,
    backgroundColor: THEME.colors.accentGreen,
  },
  checkmark: {
    color: '#07090E',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chkContent: {
    flex: 1,
    gap: 2,
  },
  chkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chkLabel: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  chkDoneBadge: {
    color: THEME.colors.accentGreen,
    fontSize: 9,
    fontWeight: '800',
  },
  chkDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  resolveSection: {
    gap: THEME.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  resolveSub: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
  },
  resolveBtnGroup: {
    gap: 8,
    marginTop: 6,
  },
  resolveBtn: {
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
  },
  resolveBtnText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
});
