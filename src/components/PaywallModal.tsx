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
        Alert.alert('⚡ Welcome to DECIDIO PRO', 'Your complete personal decision intelligence suite is active!');
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
        Alert.alert('Purchases Restored', 'Your DECIDIO PRO membership is active.');
        onSuccess();
        onClose();
      } else {
        Alert.alert('No Subscription Found', 'No prior active subscription was found to restore.');
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
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Editorial Header */}
            <View style={styles.header}>
              <Text style={styles.eyebrow}>REVENUECAT MEMBERSHIP</Text>
              <Text style={styles.title}>DECIDIO PRO</Text>
              <Text style={styles.subtitle}>
                Go deeper before you decide.
              </Text>
            </View>

            {/* Feature Perks as specified in requirements */}
            <View style={styles.featuresContainer}>
              <FeatureItem title="Unlimited simulations" desc="Model as many dilemmas as needed without monthly caps" />
              <FeatureItem title="Advanced What-If" desc="Dynamic assumption testing with real-time recalculation" />
              <FeatureItem title="Decision DNA" desc="Deep 6-dimension factor analysis and archetype classification" />
              <FeatureItem title="URL Intelligence" desc="Audit courses, job offers, and purchases directly from link signals" />
              <FeatureItem title="Personal Decision Memory" desc="Track cognitive blindspots and past outcome accuracy" />
              <FeatureItem title="Advanced AI analysis" desc="Deep constraint decomposition and hidden trade-off synthesis" />
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
                    activeOpacity={0.85}
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
            <TouchableOpacity style={styles.ctaButton} onPress={handlePurchase} disabled={isLoading} activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator color={THEME.colors.background} />
              ) : (
                <Text style={styles.ctaText}>
                  {selectedPackage.includes('annual') ? 'Start 3-Day Free Trial & Subscribe' : 'Unlock DECIDIO PRO'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Restore and Legal Links */}
            <View style={styles.footerRow}>
              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.footerLink}>Restore Purchases</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => Alert.alert('Privacy & Terms', 'DECIDIO respects your personal decision privacy.')}>
                <Text style={styles.footerLink}>Privacy & Terms</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const FeatureItem: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureCheck}>✓</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 9, 9, 0.88)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    borderTopWidth: 1,
    borderColor: THEME.colors.cardBorder,
    maxHeight: '92%',
    paddingBottom: 32,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 18,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.elevatedSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  closeBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
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
    fontSize: THEME.typography.sizes.sm,
    textAlign: 'center',
    marginTop: 2,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: THEME.spacing.lg,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  featureCheck: {
    color: THEME.colors.accentGreen,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
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
    lineHeight: 14,
  },
  packagesContainer: {
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  packageCard: {
    backgroundColor: THEME.colors.elevatedSurface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: THEME.colors.primaryText,
    backgroundColor: THEME.colors.surface,
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
    color: '#080909',
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
    color: THEME.colors.textPrimary,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: THEME.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: THEME.colors.primaryText,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primaryText,
  },
  ctaButton: {
    backgroundColor: THEME.colors.primaryText,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  ctaText: {
    color: THEME.colors.background,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  footerLink: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
  footerDot: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
  },
});
