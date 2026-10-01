import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { THEME } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';
import { DecisionItem, DecisionProfile } from '../types';
import { StorageService } from '../services/storage';

interface HomeScreenProps {
  profile: DecisionProfile;
  decisions: DecisionItem[];
  isPro: boolean;
  onSelectDecision: (decision: DecisionItem) => void;
  onOpenCreate: (initialText?: string) => void;
  onOpenUrlAudit: () => void;
  onOpenPaywall: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  decisions,
  isPro,
  onSelectDecision,
  onOpenCreate,
  onOpenUrlAudit,
  onOpenPaywall,
  onRefresh,
  isRefreshing,
}) => {
  const activeCount = decisions.filter(d => d.status === 'active').length;
  const resolvedCount = decisions.filter(d => d.status === 'resolved').length;
  const insights = StorageService.calculateInsights(decisions);

  const QUICK_EXAMPLES = [
    { label: 'Choose a course', text: 'Should I spend ₹4,999 on this machine learning course?' },
    { label: 'Take an internship', text: 'Got an internship offer in Bangalore for ₹25k/month. Should I take it?' },
    { label: 'Buy a laptop', text: 'Should I buy a ₹74,999 MacBook Air M3 for coding?' },
    { label: 'Move cities', text: 'Should I move to Bengaluru for a hybrid tech role?' },
    { label: 'Change jobs', text: 'Should I leave my corporate role for an early-stage AI startup?' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={THEME.colors.secondary} />
        }
      >
        {/* Brand & Top Status */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>DECIDIO</Text>
            <View style={styles.brandDot} />
            <Text style={styles.brandSub}>DECISION INTELLIGENCE</Text>
          </View>

          <TouchableOpacity
            style={[styles.proPill, isPro && styles.proPillActive]}
            onPress={onOpenPaywall}
            activeOpacity={0.8}
          >
            <Text style={[styles.proPillText, isPro && styles.proPillTextActive]}>
              {isPro ? '⚡ PRO ACTIVE' : 'UPGRADE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your Life.{'\n'}Simulated Before{'\n'}You Decide.</Text>
          <Text style={styles.heroSubtitle}>
            Explore the trade-offs behind difficult decisions before you commit your money, time, or momentum.
          </Text>
        </View>

        {/* Primary Action Card: Create Decision */}
        <View style={styles.actionSection}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => onOpenCreate()}>
            <GlassCard elevated highlight style={styles.createCard}>
              <View style={styles.createCardHeader}>
                <View style={styles.createBadge}>
                  <Text style={styles.createBadgeText}>PRIMARY ACTION</Text>
                </View>
                <Text style={styles.createShortcutHint}>Tap to begin</Text>
              </View>

              <Text style={styles.createPromptTitle}>What are you deciding?</Text>
              <Text style={styles.createPromptSub}>
                “Should I spend ₹4,999 on this machine learning course?”
              </Text>

              {/* Inspiration Chips */}
              <View style={styles.chipsRow}>
                {QUICK_EXAMPLES.map((ex, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={(e) => {
                      e.stopPropagation();
                      onOpenCreate(ex.text);
                    }}
                  >
                    <Text style={styles.chipText}>{ex.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>+ New Decision</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>

          {/* Secondary Action: Audit a URL */}
          <TouchableOpacity activeOpacity={0.85} onPress={onOpenUrlAudit}>
            <GlassCard style={styles.urlCard}>
              <View style={styles.urlCardContent}>
                <View style={styles.urlIconBadge}>
                  <Text style={styles.urlIcon}>🔗</Text>
                </View>
                <View style={styles.urlTextWrap}>
                  <Text style={styles.urlCardTitle}>Audit a URL</Text>
                  <Text style={styles.urlCardSub}>
                    Check a course, product, job offer, or website before you decide.
                  </Text>
                </View>
                <Text style={styles.urlArrow}>→</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* Recent Decisions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Recent Decisions</Text>
            <Text style={styles.sectionCount}>{decisions.length} stored</Text>
          </View>

          {decisions.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No decisions yet.</Text>
              <Text style={styles.emptySub}>Your first simulated future is only a sentence away.</Text>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={() => onOpenCreate()}>
                <Text style={styles.emptyActionText}>+ Create Your First Decision</Text>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <View style={styles.decisionsFeed}>
              {decisions.map((item, index) => {
                const decisionNumber = String(decisions.length - index).padStart(3, '0');
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => onSelectDecision(item)}
                  >
                    <GlassCard style={styles.editorialCard}>
                      <View style={styles.cardTopMeta}>
                        <Text style={styles.decisionNumber}>DECISION #{decisionNumber}</Text>
                        <View
                          style={[
                            styles.statusTag,
                            item.status === 'resolved' ? styles.statusResolved : styles.statusActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              item.status === 'resolved' ? { color: THEME.colors.accentGreen } : { color: THEME.colors.secondary },
                            ]}
                          >
                            {item.status === 'resolved'
                              ? `COMMITTED: ${item.scenarios[item.resolvedOutcome?.chosenOption || 'optionA']?.actionType || 'CHOSEN'}`
                              : 'ACTIVE SCENARIO'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.editorialTitle}>{item.title}</Text>

                      <View style={styles.editorialMetaRow}>
                        <Text style={styles.metaItem}>{item.category}</Text>
                        <Text style={styles.metaSep}>·</Text>
                        <Text style={styles.metaItem}>
                          {item.currency}{Math.round(item.currentCost).toLocaleString()}
                        </Text>
                        <Text style={styles.metaSep}>·</Text>
                        <Text style={styles.metaItem}>{item.hoursPerWeek}h / week</Text>
                        <Text style={styles.metaSep}>·</Text>
                        <Text style={styles.metaHighlight}>{item.dna.decisionType}</Text>
                      </View>

                      <View style={styles.editorialFooter}>
                        <Text style={styles.footerTradeoffText} numberOfLines={1}>
                          <Text style={{ color: THEME.colors.textSecondary }}>Trade-off: </Text>
                          {item.tradeOff.keyTradeoff}
                        </Text>
                        <Text style={styles.footerConf}>
                          {item.dna.confidenceScore}% conf
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Decision Memory & What DECIDIO Has Learned */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Decision Memory</Text>
          <Text style={styles.sectionSub}>What DECIDIO has learned from your choices</Text>

          {/* Macro Stats */}
          <View style={styles.memoryStatsRow}>
            <View style={styles.memoryStatCol}>
              <Text style={styles.memoryStatNum}>{decisions.length}</Text>
              <Text style={styles.memoryStatLabel}>Simulated</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.memoryStatCol}>
              <Text style={[styles.memoryStatNum, { color: THEME.colors.accentGreen }]}>
                {resolvedCount}
              </Text>
              <Text style={styles.memoryStatLabel}>Resolved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.memoryStatCol}>
              <Text style={[styles.memoryStatNum, { color: THEME.colors.secondary }]}>
                {activeCount}
              </Text>
              <Text style={styles.memoryStatLabel}>Active</Text>
            </View>
          </View>

          {/* Detected Tendencies */}
          <GlassCard style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>DETECTED TENDENCIES</Text>
            <View style={styles.insightsList}>
              {insights.patterns.slice(0, 3).map((pat, idx) => (
                <View key={idx} style={styles.patternRow}>
                  <Text style={styles.patternBullet}>—</Text>
                  <Text style={styles.patternText}>{pat}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* Calm Footer Quote */}
        <View style={styles.closingSection}>
          <Text style={styles.closingTagline}>Don't guess your future. Explore it.</Text>
        </View>
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
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.hero,
    gap: THEME.spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: THEME.spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  brandText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: THEME.colors.textTertiary,
  },
  brandSub: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  proPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  proPillActive: {
    borderColor: THEME.colors.secondary,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  proPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  proPillTextActive: {
    color: THEME.colors.secondary,
  },
  heroSection: {
    gap: THEME.spacing.sm,
    paddingTop: THEME.spacing.xs,
  },
  heroTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.display,
    fontWeight: '900',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.base,
    lineHeight: 22,
    maxWidth: '96%',
  },
  actionSection: {
    gap: THEME.spacing.md,
  },
  createCard: {
    padding: THEME.spacing.xl,
    gap: THEME.spacing.md,
    borderColor: 'rgba(124, 77, 255, 0.35)',
  },
  createCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createBadge: {
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.3)',
  },
  createBadgeText: {
    color: THEME.colors.primaryLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  createShortcutHint: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  createPromptTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
  },
  createPromptSub: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: THEME.spacing.xs,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  chipText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: THEME.spacing.xs,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  urlCard: {
    padding: THEME.spacing.md,
  },
  urlCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  urlIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlIcon: {
    fontSize: 18,
  },
  urlTextWrap: {
    flex: 1,
    gap: 2,
  },
  urlCardTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  urlCardSub: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    lineHeight: 15,
  },
  urlArrow: {
    color: THEME.colors.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    gap: THEME.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionHeading: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSub: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    marginTop: -8,
  },
  sectionCount: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  decisionsFeed: {
    gap: THEME.spacing.md,
  },
  editorialCard: {
    padding: THEME.spacing.md,
    gap: 8,
  },
  cardTopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decisionNumber: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
  },
  statusActive: {
    borderColor: 'rgba(0, 229, 255, 0.3)',
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
  },
  statusResolved: {
    borderColor: 'rgba(0, 230, 118, 0.3)',
    backgroundColor: 'rgba(0, 230, 118, 0.06)',
  },
  statusTagText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editorialTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '700',
    lineHeight: 22,
  },
  editorialMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  metaSep: {
    color: THEME.colors.textMuted,
    fontSize: 10,
  },
  metaHighlight: {
    color: THEME.colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  editorialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 6,
    marginTop: 2,
  },
  footerTradeoffText: {
    flex: 1,
    color: THEME.colors.textTertiary,
    fontSize: 11,
    marginRight: 8,
  },
  footerConf: {
    color: THEME.colors.accentGreen,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyCard: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  emptySub: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  emptyActionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
  memoryStatsRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
  },
  memoryStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  memoryStatNum: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '900',
  },
  memoryStatLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  insightsCard: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  insightsTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  insightsList: {
    gap: 6,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  patternBullet: {
    color: THEME.colors.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  patternText: {
    flex: 1,
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  closingSection: {
    alignItems: 'center',
    paddingTop: THEME.spacing.sm,
  },
  closingTagline: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
});
