import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { THEME } from '../constants/theme';
import { DecisionItem } from '../types';
import { GlassCard } from './GlassCard';

interface ShareDecisionModalProps {
  visible: boolean;
  decision: DecisionItem | null;
  onClose: () => void;
}

export const ShareDecisionModal: React.FC<ShareDecisionModalProps> = ({
  visible,
  decision,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!decision) return null;

  const shareText = `🔮 DECIDIO SIMULATION: "${decision.title}"
━━━━━━━━━━━━━━━━━━━━
💰 Cost: ${decision.currency}${Math.round(decision.currentCost).toLocaleString()}
⏱ Weekly Time: ${decision.hoursPerWeek} hrs/week
🧬 Decision Type: ${decision.dna.decisionType} (${decision.dna.confidenceScore}% Confidence)
⚡ Career Upside: ${decision.dna.careerImpactScore}% | Risk: ${decision.dna.riskScore}%

Futures Explored:
1️⃣ ${decision.scenarios.optionA.label} (${decision.scenarios.optionA.actionType})
2️⃣ ${decision.scenarios.optionB.label} (${decision.scenarios.optionB.actionType})
3️⃣ ${decision.scenarios.optionC.label} (${decision.scenarios.optionC.actionType})

⚖️ Core Trade-off: ${decision.tradeOff.keyTradeoff}
Simulated before deciding with DECIDIO #Decidio #Shipathon2026`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert('Copied to Clipboard', 'You can now paste your Decidio card on WhatsApp, X, or Instagram stories!');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.topRow}>
            <Text style={styles.modalTitle}>Share Decision Card</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Render the stylized visual card */}
          <GlassCard highlight glowColor={THEME.colors.primaryGlow} borderColor={THEME.colors.primary} style={styles.visualCard}>
            <View style={styles.cardHeader}>
              <View style={styles.brandRow}>
                <Text style={styles.brandText}>DECIDIO</Text>
                <View style={styles.cardDot} />
                <Text style={styles.simBadge}>3 FUTURES SIMULATED</Text>
              </View>
              <Text style={styles.cardId}>#{decision.id.toUpperCase()}</Text>
            </View>

            <Text style={styles.decisionTitle}>{decision.title}</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricChip}>
                <Text style={styles.chipLabel}>COST</Text>
                <Text style={styles.chipVal}>{decision.currency}{Math.round(decision.currentCost).toLocaleString()}</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.chipLabel}>TIME</Text>
                <Text style={styles.chipVal}>{decision.hoursPerWeek}h/wk</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.chipLabel}>CONFIDENCE</Text>
                <Text style={[styles.chipVal, { color: THEME.colors.accentGreen }]}>{decision.dna.confidenceScore}%</Text>
              </View>
            </View>

            <View style={styles.dnaHighlight}>
              <Text style={styles.dnaTypeLabel}>🧬 PROFILE</Text>
              <Text style={styles.dnaTypeVal}>{decision.dna.decisionType}</Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.tradeOffLabel}>CORE TRADE-OFF:</Text>
              <Text style={styles.tradeOffVal}>{decision.tradeOff.keyTradeoff}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerTagline}>Don't guess your future. Explore it.</Text>
            </View>
          </GlassCard>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Text style={styles.copyBtnText}>
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Shareable Text & Stats'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    gap: THEME.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: THEME.colors.textSecondary,
    fontSize: 18,
  },
  visualCard: {
    padding: THEME.spacing.lg,
    backgroundColor: '#0A0E1A',
    borderColor: 'rgba(124, 77, 255, 0.5)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  cardDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: THEME.colors.textTertiary,
  },
  simBadge: {
    color: THEME.colors.secondary,
    fontSize: 9,
    fontWeight: '800',
  },
  cardId: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  decisionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    marginBottom: THEME.spacing.md,
    lineHeight: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  metricChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 8,
    fontWeight: '700',
  },
  chipVal: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
    marginTop: 2,
  },
  dnaHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    padding: 8,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.sm,
  },
  dnaTypeLabel: {
    color: THEME.colors.primaryLight,
    fontSize: 9,
    fontWeight: '800',
  },
  dnaTypeVal: {
    color: THEME.colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.md,
  },
  tradeOffLabel: {
    color: THEME.colors.accentAmber,
    fontSize: 8,
    fontWeight: '800',
  },
  tradeOffVal: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    alignItems: 'center',
  },
  footerTagline: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 8,
  },
  copyBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
});
