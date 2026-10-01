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
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>DECISION JOURNAL</Text>
            <Text style={styles.subtitle}>Your living archive of simulated realities</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={onOpenCreate}>
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search decisions, offers, courses..."
            placeholderTextColor={THEME.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}
              onPress={() => setSelectedCategory(cat)}
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
            >
              <Text style={[styles.statusTabText, selectedStatus === st && styles.statusTabTextActive]}>
                {st.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Decisions List */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>No matching decisions found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your search or simulate a new decision now.</Text>
            </View>
          ) : (
            filtered.map(item => (
              <TouchableOpacity key={item.id} onPress={() => onSelectDecision(item)} activeOpacity={0.8}>
                <GlassCard style={styles.journalCard}>
                  <View style={styles.journalCardHeader}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{item.category.toUpperCase()}</Text>
                    </View>
                    <View style={styles.dateAndStatus}>
                      <Text style={styles.dateText}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Text>
                      <View style={[styles.statusDot, item.status === 'resolved' ? styles.statusDotResolved : styles.statusDotActive]} />
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>

                  <View style={styles.statsRow}>
                    <Text style={styles.statVal}>
                      {item.currency}{Math.round(item.currentCost).toLocaleString()}
                    </Text>
                    <Text style={styles.sep}>|</Text>
                    <Text style={styles.statVal}>{item.hoursPerWeek}h / wk</Text>
                    <Text style={styles.sep}>|</Text>
                    <Text style={[styles.statVal, { color: THEME.colors.primaryLight }]}>
                      {item.dna.decisionType}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerTradeoff} numberOfLines={1}>
                      ⚡ {item.tradeOff.keyTradeoff}
                    </Text>
                    <Text style={styles.confidenceText}>{item.dna.confidenceScore}% conf</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
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
    paddingBottom: 40,
    gap: THEME.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  subtitle: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
  },
  addBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: 'bold',
  },
  searchBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
  },
  searchInput: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
  },
  catPillActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  catPillText: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  catPillTextActive: {
    color: '#07090E',
    fontWeight: 'bold',
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: THEME.borderRadius.md,
    padding: 3,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  statusTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusTabText: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTabTextActive: {
    color: THEME.colors.textPrimary,
  },
  list: {
    gap: THEME.spacing.md,
    marginTop: 4,
  },
  journalCard: {
    padding: THEME.spacing.md,
    gap: 8,
  },
  journalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    color: THEME.colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
  },
  dateAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: THEME.colors.secondary,
  },
  statusDotResolved: {
    backgroundColor: THEME.colors.accentGreen,
  },
  cardTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '700',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statVal: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  sep: {
    color: THEME.colors.textTertiary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 6,
    marginTop: 2,
  },
  footerTradeoff: {
    flex: 1,
    color: THEME.colors.textTertiary,
    fontSize: 10,
    marginRight: 8,
  },
  confidenceText: {
    color: THEME.colors.accentGreen,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '700',
  },
  emptyDesc: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.typography.sizes.xs,
    textAlign: 'center',
  },
});
