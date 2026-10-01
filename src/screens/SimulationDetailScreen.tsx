import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { THEME } from '../constants/theme';
import { DecisionItem, WhatIfAssumptions } from '../types';
import { GlassCard } from '../components/GlassCard';
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
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<'optionA' | 'optionB' | 'optionC'>('optionA');
  const [satisfactionRating, setSatisfactionRating] = useState(5);
  const [commitmentNotes, setCommitmentNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    showToast(!currentDecision.timeline.find(c => c.id === checkpointId)?.isCompleted ? '✓ Checkpoint marked complete' : 'Checkpoint reverted');
  };

  // Start Commitment Flow
  const handleInitiateCommit = (chosen: 'optionA' | 'optionB' | 'optionC') => {
    setPendingChoice(chosen);
    setCommitmentNotes(`Committed to ${currentDecision.scenarios[chosen].label}. Executing plan.`);
    setShowCommitModal(true);
  };

  // Finalize Resolve
  const handleFinalizeCommit = () => {
    const updated: DecisionItem = {
      ...currentDecision,
      status: 'resolved',
      resolvedOutcome: {
        chosenOption: pendingChoice,
        date: Date.now(),
        rating: satisfactionRating,
        notes: commitmentNotes.trim() || `Committed to ${currentDecision.scenarios[pendingChoice].label}`,
      },
    };
    setCurrentDecision(updated);
    onUpdate(updated);
    StorageService.updateDecision(updated);
    setShowCommitModal(false);
    showToast(`🎯 Committed to ${currentDecision.scenarios[pendingChoice].label}! Saved to Decision Memory.`);
  };

  const handleUndoCommit = () => {
    const updated: DecisionItem = {
      ...currentDecision,
      status: 'active',
      resolvedOutcome: undefined,
    };
    setCurrentDecision(updated);
    onUpdate(updated);
    StorageService.updateDecision(updated);
    showToast('Decision status reverted to Active Simulation');
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

        {/* Header: Explore Your Futures */}
        <View style={styles.titleSection}>
          <View style={styles.metaRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{currentDecision.category.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, currentDecision.status === 'resolved' ? styles.statusBadgeResolved : null]}>
              <Text style={[styles.statusBadgeText, currentDecision.status === 'resolved' ? { color: THEME.colors.accentGreen } : null]}>
                {currentDecision.status === 'resolved' ? '✓ COMMITTED & RESOLVED' : 'ACTIVE SCENARIOS'}
              </Text>
            </View>
          </View>

          <Text style={styles.screenMainHeading}>Explore Your Futures</Text>
          <Text style={styles.screenMainSub}>
            See how different choices could unfold under your current assumptions.
          </Text>

          {/* Decision Target Summary Box */}
          <GlassCard style={styles.targetDilemmaBox}>
            <Text style={styles.targetDilemmaTitle}>{currentDecision.title}</Text>
            <View style={styles.topStatsRow}>
              <Text style={styles.topStatItem}>
                Capital: <Text style={styles.boldText}>{currentDecision.currency}{Math.round(currentDecision.currentCost).toLocaleString()}</Text>
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.topStatItem}>
                Time: <Text style={styles.boldText}>{currentDecision.hoursPerWeek}h / week</Text>
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.topStatItem}>
                Horizon: <Text style={styles.boldText}>{currentDecision.horizonDays} days</Text>
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* 3 Future Branches Switcher */}
        <View style={styles.futuresSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>3 BRANCHING SCENARIOS</Text>
            <Text style={styles.switchHint}>Select a branch to explore</Text>
          </View>

          <View style={styles.futureTabs}>
            <TouchableOpacity
              style={[
                styles.futureTabItem,
                activeFutureTab === 'optionA' && styles.futureTabAActive,
              ]}
              onPress={() => setActiveFutureTab('optionA')}
              activeOpacity={0.85}
            >
              <Text style={[styles.futureTabCode, { color: THEME.colors.scenarioA }]}>A · COMMIT</Text>
              <Text style={[styles.futureTabText, activeFutureTab === 'optionA' && styles.futureTabTextActive]}>
                Take action now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.futureTabItem,
                activeFutureTab === 'optionB' && styles.futureTabBActive,
              ]}
              onPress={() => setActiveFutureTab('optionB')}
              activeOpacity={0.85}
            >
              <Text style={[styles.futureTabCode, { color: THEME.colors.scenarioB }]}>B · WAIT</Text>
              <Text style={[styles.futureTabText, activeFutureTab === 'optionB' && styles.futureTabTextActive]}>
                Gather evidence
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.futureTabItem,
                activeFutureTab === 'optionC' && styles.futureTabCActive,
              ]}
              onPress={() => setActiveFutureTab('optionC')}
              activeOpacity={0.85}
            >
              <Text style={[styles.futureTabCode, { color: THEME.colors.scenarioC }]}>C · SKIP</Text>
              <Text style={[styles.futureTabText, activeFutureTab === 'optionC' && styles.futureTabTextActive]}>
                Redirect energy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Future Scenario Card */}
          <FutureCard scenario={activeScenario} isActive={true} />
        </View>

        {/* Trade-off Card */}
        <TradeOffCard
          tradeOff={currentDecision.tradeOff}
          cost={currentDecision.currentCost}
          currency={currentDecision.currency}
          hoursPerWeek={currentDecision.hoursPerWeek}
          horizonDays={currentDecision.horizonDays}
        />

        {/* Decision DNA Scorecard */}
        <DecisionDNACard dna={currentDecision.dna} />

        {/* What-If Assumption Engine */}
        <WhatIfPanel
          currency={currentDecision.currency}
          assumptions={currentDecision.whatIf}
          onChange={handleWhatIfChange}
          onReset={handleWhatIfReset}
        />

        {/* Retention Timeline Checkpoints / Reality Check */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>REALITY CHECK & TIMELINE</Text>
          <Text style={styles.timelineSub}>Check in as time passes to compare the expected scenario against what actually happened.</Text>

          <View style={styles.timelineChecklist}>
            {currentDecision.timeline.map(chk => (
              <TouchableOpacity
                key={chk.id}
                style={[styles.checkpointRow, chk.isCompleted && styles.checkpointRowCompleted]}
                onPress={() => handleToggleCheckpoint(chk.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, chk.isCompleted && styles.checkboxChecked]}>
                  {chk.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <View style={styles.chkContent}>
                  <View style={styles.chkHeader}>
                    <Text style={styles.chkLabel}>DAY {chk.day}: {chk.label}</Text>
                    {chk.isCompleted && <Text style={styles.chkDoneBadge}>CHECKED IN</Text>}
                  </View>
                  <Text style={styles.chkDesc}>{chk.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Commitment Flow / Committed Status Card */}
        {currentDecision.status === 'resolved' && currentDecision.resolvedOutcome ? (
          <GlassCard highlight borderColor={THEME.colors.accentGreen} style={styles.resolvedCard}>
            <View style={styles.resolvedHeader}>
              <View style={styles.resolvedBadge}>
                <Text style={styles.resolvedBadgeText}>🎯 COMMITTED & RESOLVED</Text>
              </View>
              <Text style={styles.resolvedDate}>
                {new Date(currentDecision.resolvedOutcome.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>

            <Text style={styles.resolvedChoiceLabel}>
              Chosen Path:
            </Text>
            <View style={styles.resolvedBranchPill}>
              <Text style={styles.resolvedBranchText}>
                {currentDecision.scenarios[currentDecision.resolvedOutcome.chosenOption]?.label || 'Committed Branch'}
              </Text>
            </View>

            {/* Confidence / Satisfaction */}
            <View style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>Confidence Rating:</Text>
              <Text style={styles.stars}>
                {'★'.repeat(currentDecision.resolvedOutcome.rating)}
                {'☆'.repeat(Math.max(0, 5 - currentDecision.resolvedOutcome.rating))}
              </Text>
            </View>

            {/* Reflection Notes */}
            {currentDecision.resolvedOutcome.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>"{currentDecision.resolvedOutcome.notes}"</Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={styles.resolvedActions}>
              <TouchableOpacity
                style={styles.editCommitBtn}
                onPress={() => handleInitiateCommit(currentDecision.resolvedOutcome?.chosenOption || 'optionA')}
              >
                <Text style={styles.editCommitText}>Update Reflection</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.undoCommitBtn} onPress={handleUndoCommit}>
                <Text style={styles.undoCommitText}>Reopen Simulation</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ) : (
          <View style={styles.resolveSection}>
            <View style={styles.resolveHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>READY TO COMMIT?</Text>
                <Text style={styles.resolveSub}>You've explored the alternatives. Which path are you choosing?</Text>
              </View>
              <View style={styles.liveIndicatorDot} />
            </View>

            <View style={styles.resolveBtnGroup}>
              <TouchableOpacity
                style={[styles.resolveBtn, { borderColor: THEME.colors.scenarioA }]}
                onPress={() => handleInitiateCommit('optionA')}
                activeOpacity={0.8}
              >
                <Text style={[styles.resolveBtnText, { color: THEME.colors.scenarioA }]}>
                  A · COMMIT ({currentDecision.scenarios.optionA.label})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resolveBtn, { borderColor: THEME.colors.scenarioB }]}
                onPress={() => handleInitiateCommit('optionB')}
                activeOpacity={0.8}
              >
                <Text style={[styles.resolveBtnText, { color: THEME.colors.scenarioB }]}>
                  B · WAIT ({currentDecision.scenarios.optionB.label})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resolveBtn, { borderColor: THEME.colors.scenarioC }]}
                onPress={() => handleInitiateCommit('optionC')}
                activeOpacity={0.8}
              >
                <Text style={[styles.resolveBtnText, { color: THEME.colors.scenarioC }]}>
                  C · SKIP ({currentDecision.scenarios.optionC.label})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Commitment Confirmation Modal */}
        {showCommitModal && (
          <View style={styles.modalOverlay}>
            <GlassCard highlight borderColor={THEME.colors.accentGreen} glowColor="rgba(0, 230, 118, 0.3)" style={styles.commitModalCard}>
              <Text style={styles.commitModalTitle}>Lock in Your Decision 🎯</Text>
              <Text style={styles.commitModalSub}>
                Committing to: <Text style={{ color: THEME.colors.textPrimary, fontWeight: 'bold' }}>{currentDecision.scenarios[pendingChoice].label}</Text>
              </Text>

              {/* Star Rating Selector */}
              <View style={styles.ratingSelectorRow}>
                <Text style={styles.ratingPrompt}>Rate Confidence / Satisfaction:</Text>
                <View style={styles.starButtons}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setSatisfactionRating(star)}>
                      <Text style={[styles.starBtnText, star <= satisfactionRating && styles.starBtnActive]}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes Input */}
              <TextInput
                style={styles.commitNotesInput}
                multiline
                numberOfLines={3}
                placeholder="Add reflection or execution notes..."
                placeholderTextColor={THEME.colors.textTertiary}
                value={commitmentNotes}
                onChangeText={setCommitmentNotes}
              />

              {/* Action Buttons */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowCommitModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleFinalizeCommit}>
                  <Text style={styles.modalConfirmText}>Confirm Commitment ⚡</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Floating Toast Message */}
        {toastMessage && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

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
  screenMainHeading: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  screenMainSub: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: 8,
  },
  targetDilemmaBox: {
    padding: THEME.spacing.md,
    gap: 6,
  },
  targetDilemmaTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.md,
    fontWeight: '700',
    lineHeight: 22,
  },
  futureTabCode: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  resolveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.secondary,
  },
  resolvedCard: {
    gap: THEME.spacing.sm,
    padding: THEME.spacing.md,
  },
  resolvedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resolvedBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.accentGreen,
  },
  resolvedBadgeText: {
    color: THEME.colors.accentGreen,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resolvedDate: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  resolvedChoiceLabel: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    marginTop: 4,
  },
  resolvedBranchPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  resolvedBranchText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ratingLabel: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
  },
  stars: {
    color: THEME.colors.accentAmber,
    fontSize: 14,
    letterSpacing: 2,
  },
  notesBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    borderLeftWidth: 2,
    borderLeftColor: THEME.colors.accentGreen,
    marginTop: 4,
  },
  notesText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
  resolvedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editCommitBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.sm,
  },
  editCommitText: {
    color: THEME.colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  undoCommitBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.sm,
  },
  undoCommitText: {
    color: THEME.colors.accentPink,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: THEME.spacing.lg,
  },
  commitModalCard: {
    width: '100%',
    maxWidth: 360,
    gap: THEME.spacing.md,
    padding: THEME.spacing.lg,
  },
  commitModalTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '900',
  },
  commitModalSub: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
  },
  ratingSelectorRow: {
    gap: 4,
  },
  ratingPrompt: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  starButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  starBtnText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.2)',
  },
  starBtnActive: {
    color: THEME.colors.accentAmber,
  },
  commitNotesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    color: THEME.colors.textPrimary,
    padding: 10,
    fontSize: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.accentGreen,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#07090E',
    fontSize: 11,
    fontWeight: '900',
  },
  toastContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 230, 118, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.md,
    zIndex: 1000,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toastText: {
    color: '#07090E',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
