import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { THEME } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';
import { DecisionItem } from '../types';

interface DecisionsJournalScreenProps {
  decisions: DecisionItem[];
  onSelectDecision: (decision: DecisionItem) => void;
  onOpenCreate: () => void;
}

const CATEGORIES = ['All', 'Education', 'Career', 'Purchases', 'Relocation', 'Finance'];

export const DecisionsJournalScreen: React.FC<DecisionsJournalScreenProps> = ({
  decisions,
  onSelectDecision,
  onOpenCreate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'resolved'>('all');

  const filtered = decisions.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Editorial Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.eyebrow}>ARCHIVE</Text>
            <Text style={styles.title}>Decision Journal</Text>
            <Text style={styles.subtitle}>Explore past simulations and track how reality unfolded.</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={onOpenCreate} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ New Decision</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search decisions, offers, or courses..."
            placeholderTextColor={THEME.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.catPillText, selectedCategory === cat && styles.catPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filter Tabs */}
        <View style={styles.statusTabs}>
          {(['all', 'active', 'resolved'] as const).map(st => (
            <TouchableOpacity
              key={st}
              style={[styles.statusTab, selectedStatus === st && styles.statusTabActive]}
              onPress={() => setSelectedStatus(st)}
              activeOpacity={0.8}
            >
              <Text style={[styles.statusTabText, selectedStatus === st && styles.statusTabTextActive]}>
                {st === 'all' ? 'ALL SCENARIOS' : st === 'active' ? 'ACTIVE' : 'RESOLVED'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Editorial Decisions List */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nothing decided yet.</Text>
              <Text style={styles.emptyDesc}>Your decision story starts here. Start with one decision and DECIDIO will map the possibilities.</Text>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={onOpenCreate} activeOpacity={0.85}>
                <Text style={styles.emptyActionBtnText}>+ Create Your First Decision</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((item, index) => {
              const itemNumber = `DECISION ${(filtered.length - index).toString().padStart(3, '0')}`;
              const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
              });

              // Branch determination
              let branchLabel = 'ACTIVE SIMULATION';
              let branchColor = THEME.colors.accentCyan;
              if (item.status === 'resolved' && item.resolvedOutcome) {
                if (item.resolvedOutcome.chosenOption === 'optionA') {
                  branchLabel = 'COMMIT';
                  branchColor = THEME.colors.scenarioA;
                } else if (item.resolvedOutcome.chosenOption === 'optionB') {
                  branchLabel = 'WAIT';
                  branchColor = THEME.colors.scenarioB;
                } else {
                  branchLabel = 'SKIP';
                  branchColor = THEME.colors.scenarioC;
                }
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => onSelectDecision(item)}
                  activeOpacity={0.85}
                >
                  <GlassCard style={styles.editorialCard}>
                    {/* Top Row: DECISION 027 + Date */}
                    <View style={styles.cardTopRow}>
                      <Text style={styles.itemNumberText}>{itemNumber}</Text>
                      <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>

                    {/* Decision Title */}
                    <Text style={styles.cardTitle}>{item.title}</Text>

                    {/* Category · Cost */}
                    <Text style={styles.metaLine}>
                      {item.category} · {item.currency}{Math.round(item.currentCost).toLocaleString()}
                    </Text>

                    {/* Original reasoning / trade-off */}
                    <Text style={styles.reasoningText} numberOfLines={2}>
                      Trade-off: {item.tradeOff.keyTradeoff}
                    </Text>

                    {/* Reflection & Rating if resolved */}
                    {item.status === 'resolved' && item.resolvedOutcome && (
                      <View style={styles.reflectionSnippet}>
                        <View style={styles.reflectionHeaderRow}>
                          <Text style={styles.reflectionTag}>REFLECTION</Text>
                          {item.resolvedOutcome.rating > 0 && (
                            <Text style={styles.ratingStars}>
                              {'★'.repeat(item.resolvedOutcome.rating)}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.reflectionBody} numberOfLines={2}>
                          "{item.resolvedOutcome.notes}"
                        </Text>
                      </View>
                    )}

                    {/* Bottom Row: Branch pill & Confidence */}
                    <View style={styles.cardBottomRow}>
                      <View style={[styles.branchBadge, { borderColor: branchColor }]}>
                        <Text style={[styles.branchBadgeText, { color: branchColor }]}>
                          {branchLabel}
                        </Text>
                      </View>

                      <View style={styles.confidenceRow}>
                        <Text style={styles.confidenceText}>Confidence {item.dna.confidenceScore}%</Text>
                        <Text style={styles.chevron}>→</Text>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}
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
    paddingBottom: 60,
    gap: THEME.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: THEME.spacing.md,
    marginTop: 4,
  },
  headerTextGroup: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
  },
  addBtn: {
    backgroundColor: THEME.colors.primaryText,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
  },
  addBtnText: {
    color: THEME.colors.background,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
  searchBox: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
  },
  searchInput: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 2,
  },
  catPill: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.full,
  },
  catPillActive: {
    backgroundColor: THEME.colors.elevatedSurface,
    borderColor: THEME.colors.textPrimary,
  },
  catPillText: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  catPillTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '800',
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 4,
  },
  statusTabActive: {
    backgroundColor: THEME.colors.elevatedSurface,
  },
  statusTabText: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTabTextActive: {
    color: THEME.colors.textPrimary,
  },
  list: {
    gap: THEME.spacing.md,
    marginTop: 6,
  },
  editorialCard: {
    padding: THEME.spacing.lg,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNumberText: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  dateText: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  cardTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    lineHeight: 24,
  },
  metaLine: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
  },
  reasoningText: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    lineHeight: 16,
  },
  reflectionSnippet: {
    backgroundColor: THEME.colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: THEME.colors.accentGreen,
    padding: 8,
    borderRadius: THEME.borderRadius.xs,
    gap: 3,
  },
  reflectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reflectionTag: {
    color: THEME.colors.accentGreen,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  ratingStars: {
    color: THEME.colors.accentAmber,
    fontSize: 10,
    letterSpacing: 1,
  },
  reflectionBody: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
    marginTop: 2,
  },
  branchBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  branchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confidenceText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    color: THEME.colors.textTertiary,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 56,
    gap: 10,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  emptyDesc: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  emptyActionBtn: {
    backgroundColor: THEME.colors.primaryText,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.full,
    marginTop: 8,
  },
  emptyActionBtnText: {
    color: THEME.colors.background,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
});
