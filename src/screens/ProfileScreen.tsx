import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { THEME } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';
import { DecisionProfile } from '../types';
import { StorageService } from '../services/storage';
import { revenueCat } from '../services/revenuecat';

interface ProfileScreenProps {
  profile: DecisionProfile;
  isPro: boolean;
  onProfileUpdated: (updated: DecisionProfile) => void;
  onProToggled: (newProStatus: boolean) => void;
  onOpenPaywall: () => void;
  onResetData: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  isPro,
  onProfileUpdated,
  onProToggled,
  onOpenPaywall,
  onResetData,
}) => {
  const [name, setName] = useState(profile.name);
  const [apiKey, setApiKey] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    StorageService.getGeminiApiKey().then(k => {
      if (k) setApiKey(k);
    });
  }, []);

  const handleSaveName = async () => {
    const updated = { ...profile, name: name.trim() || 'Strategist' };
    await StorageService.saveProfile(updated);
    onProfileUpdated(updated);
    Alert.alert('Saved', 'Your profile name has been updated.');
  };

  const handleSaveApiKey = async () => {
    await StorageService.saveGeminiApiKey(apiKey.trim());
    setIsEditingKey(false);
    Alert.alert('Gemini API Key Saved', 'DECIDIO will prioritize live Gemini 2.5 Flash scenario generation.');
  };

  const handleTogglePro = async (val: boolean) => {
    await revenueCat.setMockProStatus(val);
    onProToggled(val);
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const restored = await revenueCat.restorePurchases();
      if (restored) {
        onProToggled(true);
        Alert.alert('Purchases Restored', 'Your DECIDIO PRO membership is active.');
      } else {
        Alert.alert('No Subscription Found', 'No prior active subscription was found to restore.');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SETTINGS</Text>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>
            Decision preferences, subscription, and data controls.
          </Text>
        </View>

        {/* 1. Your Profile */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'D'}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.sectionLabel}>DISPLAY NAME</Text>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                onBlur={handleSaveName}
                placeholder="Enter your name"
                placeholderTextColor={THEME.colors.textTertiary}
              />
            </View>
          </View>
        </GlassCard>

        {/* 2. Decision Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DECISION PREFERENCES</Text>
          <GlassCard style={styles.prefCard}>
            <Text style={styles.prefSubtitle}>Primary Focus Arenas:</Text>
            <View style={styles.pillsRow}>
              {profile.primaryGoals.map((g, i) => (
                <View key={i} style={styles.goalPill}>
                  <Text style={styles.goalPillText}>{g}</Text>
                </View>
              ))}
            </View>
            <View style={styles.prefItem}>
              <Text style={styles.prefLabel}>Default Simulation Horizon</Text>
              <Text style={styles.prefValue}>90 Days</Text>
            </View>
          </GlassCard>
        </View>

        {/* 3. Subscription (DECIDIO PRO) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
          <GlassCard highlight borderColor={isPro ? THEME.colors.accentGreen : THEME.colors.accentViolet} style={styles.subCard}>
            <View style={styles.subHeader}>
              <View>
                <Text style={styles.subBrand}>DECIDIO PRO</Text>
                <Text style={styles.subTagline}>Go deeper before you decide.</Text>
              </View>
              <View style={[styles.statusBadge, isPro && styles.statusBadgeActive]}>
                <Text style={[styles.statusBadgeText, isPro && { color: THEME.colors.accentGreen }]}>
                  {isPro ? 'PRO ACTIVE' : 'FREE'}
                </Text>
              </View>
            </View>

            {/* Pro Feature Checklist */}
            <View style={styles.featuresList}>
              {[
                'Unlimited simulations',
                'Advanced What-If',
                'Decision DNA',
                'URL Intelligence',
                'Personal Decision Memory',
                'Advanced AI analysis',
              ].map((feat, idx) => (
                <View key={idx} style={styles.featureLine}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryActionBtn} onPress={onOpenPaywall} activeOpacity={0.85}>
              <Text style={styles.primaryActionBtnText}>
                {isPro ? 'Manage Subscription' : 'Upgrade to DECIDIO PRO'}
              </Text>
            </TouchableOpacity>

            {/* Hackathon Judge / Demo Switch */}
            <View style={styles.demoOverrideRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoTitle}>Judge / Demo Pro Override</Text>
                <Text style={styles.demoSub}>Toggle Pro entitlements on/off for evaluation</Text>
              </View>
              <Switch
                value={isPro}
                onValueChange={handleTogglePro}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: THEME.colors.accentViolet }}
                thumbColor={isPro ? '#FFFFFF' : '#858997'}
              />
            </View>
          </GlassCard>
        </View>

        {/* 4. Restore Purchases */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PURCHASES</Text>
          <GlassCard style={styles.actionCard}>
            <View style={styles.actionCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionCardTitle}>Restore Existing Purchases</Text>
                <Text style={styles.actionCardSub}>Re-link prior subscriptions from Apple or Google Play</Text>
              </View>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={handleRestorePurchases}
                disabled={isRestoring}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineBtnText}>{isRestoring ? 'Restoring...' : 'Restore'}</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* 5. Settings & AI Engine */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS & AI ENGINE</Text>
          <GlassCard style={styles.actionCard}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionCardTitle}>Gemini AI Integration</Text>
                <Text style={styles.actionCardSub}>
                  {apiKey ? 'Configured with custom Gemini API key' : 'Built-in intelligent scenario engine'}
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.keyInput}
              secureTextEntry={!isEditingKey}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Paste custom Gemini API key (optional)"
              placeholderTextColor={THEME.colors.textTertiary}
            />

            <View style={styles.keyActions}>
              <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveApiKey}>
                <Text style={styles.saveKeyBtnText}>Save Key</Text>
              </TouchableOpacity>
              {apiKey ? (
                <TouchableOpacity
                  style={styles.clearKeyBtn}
                  onPress={async () => {
                    setApiKey('');
                    await StorageService.saveGeminiApiKey('');
                    Alert.alert('Key Removed', 'Reverted to local simulation engine.');
                  }}
                >
                  <Text style={styles.clearKeyBtnText}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </GlassCard>
        </View>

        {/* 6. Privacy & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY & DATA</Text>
          <GlassCard style={styles.actionCard}>
            <Text style={styles.actionCardSub}>
              All decision simulations are encrypted locally using on-device AsyncStorage. Your life decisions remain completely private to you.
            </Text>
            <TouchableOpacity style={styles.seedBtn} onPress={onResetData} activeOpacity={0.85}>
              <Text style={styles.seedBtnText}>↻ Re-seed Showcase Decisions</Text>
            </TouchableOpacity>
          </GlassCard>
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
    gap: THEME.spacing.xl,
  },
  header: {
    gap: 4,
    marginTop: 4,
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
  profileCard: {
    padding: THEME.spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.elevatedSurface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  profileDetails: {
    flex: 1,
  },
  sectionLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  nameInput: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 4,
  },
  section: {
    gap: THEME.spacing.sm,
  },
  sectionTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  prefCard: {
    padding: THEME.spacing.lg,
    gap: 12,
  },
  prefSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalPill: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  goalPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  prefItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
    marginTop: 4,
  },
  prefLabel: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
  },
  prefValue: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  subCard: {
    padding: THEME.spacing.lg,
    gap: 14,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subBrand: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subTagline: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  statusBadgeActive: {
    borderColor: THEME.colors.accentGreen,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  statusBadgeText: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuresList: {
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheck: {
    color: THEME.colors.accentGreen,
    fontSize: 12,
    fontWeight: '800',
  },
  featureText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '500',
  },
  primaryActionBtn: {
    backgroundColor: THEME.colors.primaryText,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: THEME.colors.background,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
  demoOverrideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  demoTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  demoSub: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    marginTop: 1,
  },
  actionCard: {
    padding: THEME.spacing.lg,
    gap: 12,
  },
  actionCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  actionCardTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  actionCardSub: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
  },
  outlineBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIcon: {
    fontSize: 16,
    color: THEME.colors.accentViolet,
  },
  keyInput: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.sm,
    color: THEME.colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  keyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveKeyBtn: {
    backgroundColor: THEME.colors.elevatedSurface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  saveKeyBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  clearKeyBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
  },
  clearKeyBtnText: {
    color: THEME.colors.accentPink,
    fontSize: 11,
    fontWeight: '700',
  },
  seedBtn: {
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    marginTop: 4,
  },
  seedBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
});
