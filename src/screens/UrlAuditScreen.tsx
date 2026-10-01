import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { THEME } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';
import { urlAnalyzer, UrlAuditResult } from '../services/urlAnalyzer';

interface UrlAuditScreenProps {
  onBack: () => void;
  onSimulateUrlDecision: (title: string, cost: number, currency: string, category: string) => void;
}

const SAMPLE_URLS = [
  { label: '📚 Coursera ML Spec', url: 'https://coursera.org/specializations/machine-learning' },
  { label: '💻 Amazon MacBook M3', url: 'https://amazon.in/dp/B0CX21C8M7' },
  { label: '💼 Bangalore Internship', url: 'https://internshala.com/internship/detail/ai-ml-intern' },
  { label: '⚠️ Unverified Guru Bootcamp', url: 'https://learn-fast-crypto-income.xyz/join' },
];

export const UrlAuditScreen: React.FC<UrlAuditScreenProps> = ({
  onBack,
  onSimulateUrlDecision,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [auditResult, setAuditResult] = useState<UrlAuditResult | null>(null);

  const handleScan = (urlToScan?: string) => {
    const target = (urlToScan || urlInput).trim();
    if (!target) return;

    setUrlInput(target);
    setIsScanning(true);
    setAuditResult(null);

    setTimeout(() => {
      const result = urlAnalyzer.analyzeUrl(target);
      setAuditResult(result);
      setIsScanning(false);
    }, 1200);
  };

  const getTrustBadgeStyle = (level: UrlAuditResult['trustLevel']) => {
    switch (level) {
      case 'Verified Safe':
        return { bg: 'rgba(0, 230, 118, 0.15)', border: THEME.colors.accentGreen, text: THEME.colors.accentGreen };
      case 'Moderate Trust':
        return { bg: 'rgba(0, 229, 255, 0.15)', border: THEME.colors.secondary, text: THEME.colors.secondary };
      case 'High Caution':
        return { bg: 'rgba(255, 171, 0, 0.15)', border: THEME.colors.accentAmber, text: THEME.colors.accentAmber };
      case 'Potential Scam':
        return { bg: 'rgba(244, 63, 94, 0.2)', border: THEME.colors.accentPink, text: THEME.colors.accentPink };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Navbar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>URL LEGITIMACY & REVIEWS</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headline}>Before You Commit, Check the Link.</Text>
          <Text style={styles.subheadline}>
            Paste a course, product, job offer, or website and inspect the detected signals around it.
          </Text>
        </View>

        {/* Input Box */}
        <GlassCard highlight borderColor={THEME.colors.accentCyan}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Paste course, product, or job offer link..."
              placeholderTextColor={THEME.colors.textTertiary}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              keyboardType="url"
            />
            {urlInput.length > 0 && (
              <TouchableOpacity onPress={() => setUrlInput('')} style={styles.clearBtn}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.scanBtn, !urlInput.trim() && styles.disabledBtn]}
            onPress={() => handleScan()}
            disabled={!urlInput.trim() || isScanning}
            activeOpacity={0.85}
          >
            {isScanning ? (
              <ActivityIndicator color={THEME.colors.background} />
            ) : (
              <Text style={styles.scanBtnText}>Audit This URL →</Text>
            )}
          </TouchableOpacity>

          {/* Preset sample links */}
          <View style={styles.sampleSection}>
            <Text style={styles.sampleTitle}>TRY QUICK EXAMPLES:</Text>
            <View style={styles.samplePills}>
              {SAMPLE_URLS.map((s, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.samplePill}
                  onPress={() => handleScan(s.url)}
                >
                  <Text style={styles.samplePillText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Audit Report */}
        {auditResult && (
          <View style={styles.resultsContainer}>
            {/* Main Trust Card */}
            <GlassCard
              highlight
              borderColor={getTrustBadgeStyle(auditResult.trustLevel).border}
              glowColor={getTrustBadgeStyle(auditResult.trustLevel).border}
            >
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.domainText}>{auditResult.domain}</Text>
                  <Text style={styles.offerTitle}>{auditResult.title}</Text>
                </View>

                <View style={[styles.trustPill, { backgroundColor: getTrustBadgeStyle(auditResult.trustLevel).bg, borderColor: getTrustBadgeStyle(auditResult.trustLevel).border }]}>
                  <Text style={[styles.trustPillText, { color: getTrustBadgeStyle(auditResult.trustLevel).text }]}>
                    {auditResult.trustScore}% • {auditResult.trustLevel}
                  </Text>
                </View>
              </View>

              {/* Safety & Signal Badges */}
              <View style={styles.signalsRow}>
                <View style={[styles.signalChip, auditResult.signals.hasSsl ? styles.signalGood : styles.signalBad]}>
                  <Text style={styles.signalText}>{auditResult.signals.hasSsl ? '✓ SSL Encrypted' : '✕ No SSL'}</Text>
                </View>
                <View style={[styles.signalChip, auditResult.signals.hasRefundPolicy ? styles.signalGood : styles.signalBad]}>
                  <Text style={styles.signalText}>{auditResult.signals.hasRefundPolicy ? '✓ Refund Policy' : '✕ No Refund'}</Text>
                </View>
                <View style={[styles.signalChip, auditResult.signals.accreditationVerified ? styles.signalGood : styles.signalNeutral]}>
                  <Text style={styles.signalText}>{auditResult.signals.accreditationVerified ? '✓ Accredited' : '○ Independent'}</Text>
                </View>
              </View>
            </GlassCard>

            {/* Review Sentiment Analysis */}
            <GlassCard>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ REVIEW SENTIMENT & RATINGS</Text>
                <Text style={styles.reviewsCount}>{auditResult.reviewSentiment.totalReviewsAnalyzed.toLocaleString()} reviews verified</Text>
              </View>

              <View style={styles.ratingRow}>
                <Text style={styles.bigRating}>{auditResult.reviewSentiment.averageRating}</Text>
                <View style={styles.ratingDetails}>
                  <Text style={styles.starsRow}>★★★★★</Text>
                  <Text style={styles.sentimentLabel}>
                    <Text style={{ color: THEME.colors.accentGreen, fontWeight: 'bold' }}>{auditResult.reviewSentiment.positivePercent}% Positive</Text> sentiment
                  </Text>
                </View>
              </View>

              <Text style={styles.reviewSummaryText}>{auditResult.reviewSentiment.summary}</Text>

              {/* Sentiment Breakdown Bar */}
              <View style={styles.sentimentTrack}>
                <View style={[styles.sentimentFillPos, { width: `${auditResult.reviewSentiment.positivePercent}%` }]} />
                <View style={[styles.sentimentFillNeu, { width: `${auditResult.reviewSentiment.neutralPercent}%` }]} />
                <View style={[styles.sentimentFillNeg, { width: `${auditResult.reviewSentiment.negativePercent}%` }]} />
              </View>
              <View style={styles.sentimentLegend}>
                <Text style={styles.legendItem}>🟢 {auditResult.reviewSentiment.positivePercent}% Positive</Text>
                <Text style={styles.legendItem}>🟡 {auditResult.reviewSentiment.neutralPercent}% Neutral</Text>
                <Text style={styles.legendItem}>🔴 {auditResult.reviewSentiment.negativePercent}% Critical</Text>
              </View>
            </GlassCard>

            {/* Red Flags Alert if suspicious */}
            {auditResult.redFlags.length > 0 && (
              <GlassCard highlight borderColor={THEME.colors.accentPink} glowColor="rgba(244, 63, 94, 0.3)">
                <Text style={styles.redFlagTitle}>🚨 CAUTION SIGNALS DETECTED</Text>
                {auditResult.redFlags.map((flag, idx) => (
                  <Text key={idx} style={styles.redFlagItem}>• {flag}</Text>
                ))}
              </GlassCard>
            )}

            {/* Pros and Cons from Reviews */}
            <GlassCard>
              <Text style={styles.sectionTitle}>✦ WHAT VERIFIED REVIEWERS SAY</Text>

              <View style={styles.proConGroup}>
                <Text style={styles.prosHeader}>Top Praises:</Text>
                {auditResult.pros.map((p, i) => (
                  <Text key={i} style={styles.proItem}>✓ {p}</Text>
                ))}

                <Text style={[styles.consHeader, { marginTop: 10 }]}>Top Complaints / Considerations:</Text>
                {auditResult.cons.map((c, i) => (
                  <Text key={i} style={styles.conItem}>⚠ {c}</Text>
                ))}
              </View>
            </GlassCard>

            {/* Action: Simulate this decision in Decidio */}
            <GlassCard elevated style={styles.bridgeCard}>
              <Text style={styles.bridgeTitle}>Beyond the Link</Text>
              <Text style={styles.bridgeBody}>
                The question isn't only whether this looks legitimate. The question is what happens if you commit.
              </Text>
              <TouchableOpacity
                style={styles.simulateUrlBtn}
                onPress={() => {
                  const prompt = `Should I get ${auditResult.title} from ${auditResult.domain} for ${auditResult.currency}${auditResult.estimatedCost}?`;
                  onSimulateUrlDecision(
                    prompt,
                    auditResult.estimatedCost,
                    auditResult.currency,
                    auditResult.category === 'Course' ? 'Education' : auditResult.category === 'Product' ? 'Purchases' : 'Career'
                  );
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.simulateUrlBtnText}>
                  Simulate 3 Futures →
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}
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
    gap: THEME.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    padding: 6,
  },
  backBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  screenTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
    letterSpacing: 1,
  },
  header: {
    gap: 4,
  },
  headline: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '900',
  },
  subheadline: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    paddingVertical: 12,
  },
  clearBtn: {
    padding: 6,
  },
  clearText: {
    color: THEME.colors.textTertiary,
    fontSize: 14,
  },
  scanBtn: {
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    shadowColor: THEME.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  scanBtnText: {
    color: '#07090E',
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
  sampleSection: {
    marginTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: THEME.spacing.sm,
    gap: 6,
  },
  sampleTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  samplePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  samplePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  samplePillText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  resultsContainer: {
    gap: THEME.spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  domainText: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  offerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    marginTop: 2,
  },
  trustPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  trustPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  signalsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: THEME.spacing.sm,
  },
  signalChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  signalGood: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  signalBad: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  signalNeutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  signalText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  sectionTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  reviewsCount: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: THEME.spacing.sm,
  },
  bigRating: {
    color: THEME.colors.textPrimary,
    fontSize: 36,
    fontWeight: '900',
  },
  ratingDetails: {
    gap: 2,
  },
  starsRow: {
    color: THEME.colors.accentAmber,
    fontSize: 14,
  },
  sentimentLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
  },
  reviewSummaryText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: THEME.spacing.md,
  },
  sentimentTrack: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  sentimentFillPos: {
    backgroundColor: THEME.colors.accentGreen,
  },
  sentimentFillNeu: {
    backgroundColor: THEME.colors.accentAmber,
  },
  sentimentFillNeg: {
    backgroundColor: THEME.colors.accentPink,
  },
  sentimentLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  redFlagTitle: {
    color: THEME.colors.accentPink,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  redFlagItem: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    lineHeight: 16,
  },
  proConGroup: {
    gap: 4,
    marginTop: 6,
  },
  prosHeader: {
    color: THEME.colors.accentGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  consHeader: {
    color: THEME.colors.accentPink,
    fontSize: 11,
    fontWeight: '700',
  },
  proItem: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    paddingLeft: 4,
  },
  conItem: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    paddingLeft: 4,
  },
  bridgeCard: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.sm,
  },
  bridgeTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  bridgeBody: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    lineHeight: 18,
    marginBottom: 6,
  },
  simulateUrlBtn: {
    backgroundColor: THEME.colors.primaryText,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
  },
  simulateUrlBtnText: {
    color: THEME.colors.background,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
