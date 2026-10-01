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
  const totalCost = decisions.reduce((acc, d) => acc + (d.initialCost || 0), 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const QUICK_PROMPTS = [
    { label: '📚 Buy ML Course', text: 'Should I spend ₹4,999 on this machine learning course?' },
    { label: '💼 Bengaluru Internship', text: 'Got an internship offer in Bangalore for ₹25k/month. Should I take it?' },
    { label: '💻 Buy MacBook M3', text: 'Should I buy a ₹74,999 MacBook Air M3 for coding?' },
    { label: '🏠 Move to New Flat', text: 'Should I move to a 2BHK closer to office for ₹18k/month?' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={THEME.colors.secondary} />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {profile.name} 👋</Text>
            <Text style={styles.headerSubtitle}>Ready to simulate your next fork in the road?</Text>
          </View>

          <TouchableOpacity
            style={[styles.proBadge, isPro && styles.proBadgeActive]}
            onPress={onOpenPaywall}
          >
            <Text style={styles.proBadgeText}>{isPro ? '⚡ PRO ACTIVE' : '👑 UPGRADE'}</Text>
          </TouchableOpacity>
        </View>

        {/* Main "What are you deciding today?" Card */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => onOpenCreate()}>
          <GlassCard highlight glowColor={THEME.colors.primaryGlow} style={styles.mainDecisionCard}>
            <View style={styles.mainCardTop}>
              <View style={styles.plusIconBg}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
              <View style={styles.mainCardText}>
                <Text style={styles.mainCardTitle}>What are you deciding today?</Text>
                <Text style={styles.mainCardDesc}>
                  Describe an opportunity, purchase, or career choice...
                </Text>
              </View>
            </View>

            {/* Quick Inspiration Pills */}
            <View style={styles.quickPrompts}>
              {QUICK_PROMPTS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptPill}
                  onPress={(e) => {
                    e.stopPropagation();
                    onOpenCreate(p.text);
                  }}
                >
                  <Text style={styles.promptPillText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* URL Legitimacy & Review Analyzer Card */}
        <TouchableOpacity activeOpacity={0.85} onPress={onOpenUrlAudit}>
          <GlassCard highlight glowColor={THEME.colors.secondaryGlow} borderColor={THEME.colors.secondary} style={styles.urlAuditCard}>
            <View style={styles.urlCardRow}>
              <View style={styles.urlIconBg}>
                <Text style={styles.urlIcon}>🔗</Text>
              </View>
              <View style={styles.urlCardText}>
                <View style={styles.urlBadgeRow}>
                  <Text style={styles.urlBadgeText}>NEW • DECISION INTEL</Text>
                </View>
                <Text style={styles.urlCardTitle}>Audit URL Legitimacy & Reviews</Text>
                <Text style={styles.urlCardDesc}>
                  Paste any course, gadget, or job offer link to check if it's legit, scam-free, and analyze real reviews before deciding.
                </Text>
              </View>
              <Text style={styles.urlArrow}>→</Text>
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Decision Health Stats */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>DECISION HEALTH & FORESIGHT</Text>

          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNumber}>{decisions.length}</Text>
              <Text style={styles.statLabel}>Total Simulated</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: THEME.colors.accentGreen }]}>
                {resolvedCount}
              </Text>
              <Text style={styles.statLabel}>Resolved & Learned</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: THEME.colors.secondary }]}>
                {activeCount}
              </Text>
              <Text style={styles.statLabel}>Active Dilemmas</Text>
            </GlassCard>
          </View>
        </View>

        {/* Recent Decisions Feed */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>RECENT SIMULATIONS</Text>
            <Text style={styles.historyCount}>{decisions.length} saved</Text>
          </View>

          <View style={styles.decisionsList}>
            {decisions.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => onSelectDecision(item)}
              >
                <GlassCard style={styles.decisionCard}>
                  <View style={styles.decisionCardHeader}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        item.status === 'resolved' ? styles.statusResolved : styles.statusActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item.status === 'resolved' ? { color: THEME.colors.accentGreen } : { color: THEME.colors.secondary },
                        ]}
                      >
                        {item.status === 'resolved' ? 'RESOLVED' : 'IN SIMULATION'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.decisionTitle}>{item.title}</Text>

                  {/* DNA & Cost snapshot */}
                  <View style={styles.decisionMeta}>
                    <Text style={styles.decisionCost}>
                      {item.currency}{Math.round(item.currentCost).toLocaleString()}
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.decisionHours}>{item.hoursPerWeek} hrs/wk</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.decisionDnaType}>{item.dna.decisionType}</Text>
                  </View>

                  {/* Trade-off teaser */}
                  <View style={styles.tradeOffSnippet}>
                    <Text style={styles.tradeOffSnippetText} numberOfLines={2}>
                      ⚡ <Text style={{ color: THEME.colors.textPrimary }}>Trade-off:</Text> {item.tradeOff.keyTradeoff}
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
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
    padding: THEME.spacing.lg,
    paddingBottom: 40,
    gap: THEME.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
    marginTop: 2,
  },
  proBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
  },
  proBadgeActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: THEME.colors.secondary,
  },
  proBadgeText: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainDecisionCard: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(124, 77, 255, 0.08)',
  },
  mainCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  plusIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: -2,
  },
  mainCardText: {
    flex: 1,
  },
  mainCardTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  mainCardDesc: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    marginTop: 2,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: THEME.spacing.md,
  },
  promptPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  promptPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  urlAuditCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
    padding: THEME.spacing.md,
  },
  urlCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urlIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlIcon: {
    fontSize: 20,
  },
  urlCardText: {
    flex: 1,
    gap: 2,
  },
  urlBadgeRow: {
    alignSelf: 'flex-start',
  },
  urlBadgeText: {
    color: THEME.colors.secondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  urlCardTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
  urlCardDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  urlArrow: {
    color: THEME.colors.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  healthSection: {
    gap: THEME.spacing.sm,
  },
  sectionTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: THEME.spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '900',
  },
  statLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  recentSection: {
    gap: THEME.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyCount: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  decisionsList: {
    gap: THEME.spacing.md,
  },
  decisionCard: {
    padding: THEME.spacing.md,
    gap: 8,
  },
  decisionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    color: THEME.colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
  },
  statusActive: {
    borderColor: 'rgba(0, 229, 255, 0.3)',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  statusResolved: {
    borderColor: 'rgba(0, 230, 118, 0.3)',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  decisionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '700',
    lineHeight: 22,
  },
  decisionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  decisionCost: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
  metaDot: {
    color: THEME.colors.textTertiary,
  },
  decisionHours: {
    color: THEME.colors.secondary,
    fontSize: THEME.typography.sizes.xs,
  },
  decisionDnaType: {
    color: THEME.colors.primaryLight,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
  },
  tradeOffSnippet: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: THEME.borderRadius.sm,
    marginTop: 2,
  },
  tradeOffSnippetText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
