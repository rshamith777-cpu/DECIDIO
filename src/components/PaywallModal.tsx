import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { THEME } from '../constants/theme';
import { revenueCat, REVENUECAT_CONFIG } from '../services/revenuecat';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ visible, onClose, onSuccess }) => {
  const [selectedPackage, setSelectedPackage] = useState<string>('decidio_pro_annual');
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const res = await revenueCat.purchasePackage(selectedPackage);
      if (res.success) {
        Alert.alert('⚡ Welcome to Decidio Pro', 'Your full strategic foresight suite has been activated!');
        onSuccess();
        onClose();
      } else {
        Alert.alert('Notice', res.error || 'Purchase could not be completed');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Transaction error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const restored = await revenueCat.restorePurchases();
      if (restored) {
        Alert.alert('Purchases Restored', 'Your Pro membership is active.');
        onSuccess();
        onClose();
      } else {
        Alert.alert('No Subscription Found', 'No active subscription was found to restore.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>POWERED BY REVENUECAT</Text>
              </View>
              <Text style={styles.title}>DECIDIO <Text style={styles.titleHighlight}>PRO</Text></Text>
              <Text style={styles.subtitle}>
                Simulate unlimited futures. Never make a blind life decision again.
              </Text>
            </View>

            {/* Feature Perks */}
            <View style={styles.featuresContainer}>
              <FeatureRow
                icon="🔮"
                title="Unlimited AI Decision Simulations"
                desc="Simulate unlimited dilemmas with zero monthly caps"
              />
              <FeatureRow
                icon="🧬"
                title="Full Decision DNA Scorecards"
                desc="Uncover Risk, Reversibility, Time intensity & Career Upside"
              />
              <FeatureRow
                icon="🔄"
                title="Interactive What-If Engine"
                desc="Tweak cost, hours, and timeline to watch simulations recalculate live"
              />
              <FeatureRow
                icon="🧠"
                title="Personal Decision Memory"
                desc="Track your blind spots (underestimating time, bias towards high risk)"
              />
              <FeatureRow
                icon="📱"
                title="Viral Decision Cards Export"
                desc="Share beautiful anonymized future cards on social media"
              />
            </View>

            {/* Packages */}
            <View style={styles.packagesContainer}>
              {REVENUECAT_CONFIG.packages.map(pkg => {
                const isSelected = selectedPackage === pkg.identifier;
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                    onPress={() => setSelectedPackage(pkg.identifier)}
                  >
                    {pkg.badge && (
                      <View style={styles.packageBadge}>
                        <Text style={styles.packageBadgeText}>{pkg.badge}</Text>
                      </View>
                    )}

                    <View style={styles.packageContent}>
                      <View style={styles.packageLeft}>
                        <Text style={styles.packageTitle}>{pkg.title}</Text>
                        <Text style={styles.packageDesc}>{pkg.description}</Text>
                      </View>

                      <View style={styles.packageRight}>
                        <Text style={[styles.packagePrice, isSelected && styles.packagePriceSelected]}>
                          {pkg.priceString}
                        </Text>
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Purchase CTA */}
            <TouchableOpacity style={styles.ctaButton} onPress={handlePurchase} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#07090E" />
              ) : (
                <Text style={styles.ctaText}>
                  {selectedPackage.includes('annual') ? 'Start 3-Day Free Trial & Subscribe' : 'Upgrade to Decidio Pro'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Restore and Legal Links */}
            <View style={styles.footerRow}>
              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.footerLink}>Restore Purchases</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => Alert.alert('Demo Notice', 'RevenueCat Shipathon 2026 Submission')}>
                <Text style={styles.footerLink}>Terms & Privacy</Text>
              </TouchableOpacity>
            </View>

            {/* Sandbox Notice */}
            <View style={styles.sandboxBox}>
              <Text style={styles.sandboxTitle}>💡 HACKATHON EVALUATION MODE</Text>
              <Text style={styles.sandboxText}>
                RevenueCat StoreKit & Google Play billing seamlessly configured. In test builds, tap Upgrade to instantly verify Pro entitlements!
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const FeatureRow: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: THEME.colors.backgroundSecondary,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    borderTopWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.4)',
    maxHeight: '92%',
    paddingBottom: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 18,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  proPill: {
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    marginBottom: 8,
  },
  proPillText: {
    color: THEME.colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '900',
    letterSpacing: 1,
  },
  titleHighlight: {
    color: THEME.colors.secondary,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },
  featuresContainer: {
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  featureItem: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  featureDesc: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    marginTop: 1,
  },
  packagesContainer: {
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  packageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: THEME.colors.secondary,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  packageBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: THEME.colors.accentGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  packageBadgeText: {
    color: '#07090E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  packageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageLeft: {
    flex: 1,
    marginRight: 10,
  },
  packageTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  packageDesc: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
  },
  packageRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  packagePrice: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '800',
  },
  packagePriceSelected: {
    color: THEME.colors.secondary,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: THEME.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: THEME.colors.secondary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.secondary,
  },
  ctaButton: {
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    shadowColor: THEME.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  ctaText: {
    color: '#07090E',
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  footerLink: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  footerDot: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  sandboxBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: THEME.borderRadius.sm,
    padding: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sandboxTitle: {
    color: THEME.colors.accentAmber,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sandboxText: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    lineHeight: 14,
  },
});
