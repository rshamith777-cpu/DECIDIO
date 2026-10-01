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

  useEffect(() => {
    StorageService.getGeminiApiKey().then(k => {
      if (k) setApiKey(k);
    });
  }, []);

  const handleSaveName = async () => {
    const updated = { ...profile, name };
    await StorageService.saveProfile(updated);
    onProfileUpdated(updated);
    Alert.alert('Saved', 'Your profile name has been updated.');
  };

  const handleSaveApiKey = async () => {
    await StorageService.saveGeminiApiKey(apiKey.trim());
    setIsEditingKey(false);
    Alert.alert('Gemini API Key Saved', 'Decidio will now prioritize live Gemini AI generation!');
  };

  const handleTogglePro = async (val: boolean) => {
    await revenueCat.setMockProStatus(val);
    onProToggled(val);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PROFILE & SETTINGS</Text>
          <Text style={styles.subtitle}>Manage your decision engine parameters and subscriptions</Text>
        </View>

        {/* Profile Card */}
        <GlassCard highlight glowColor={THEME.colors.primaryGlow}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileLabel}>USER PROFILE</Text>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                onBlur={handleSaveName}
                placeholder="Enter name"
                placeholderTextColor={THEME.colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.goalsWrap}>
            <Text style={styles.goalsTitle}>Core Life Focus Arenas:</Text>
            <View style={styles.pillsRow}>
              {profile.primaryGoals.map((g, i) => (
                <View key={i} style={styles.goalPill}>
                  <Text style={styles.goalPillText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* RevenueCat Monetization Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REVENUECAT SUBSCRIPTION</Text>

          <GlassCard style={styles.subscriptionCard}>
            <View style={styles.subHeader}>
              <View>
                <Text style={styles.subBadge}>{isPro ? 'DECIDIO PRO' : 'FREE EXPLORER'}</Text>
                <Text style={styles.subStatus}>
                  {isPro ? 'All strategic simulations unlocked' : '3 decisions / month cap'}
                </Text>
              </View>
              <View style={[styles.statusIndicator, isPro && styles.statusIndicatorActive]}>
                <Text style={styles.statusIndicatorText}>{isPro ? 'ACTIVE' : 'FREE'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.upgradeBtn} onPress={onOpenPaywall}>
              <Text style={styles.upgradeBtnText}>
                {isPro ? 'Manage RevenueCat Subscription' : 'Upgrade to Pro with RevenueCat ⚡'}
              </Text>
            </TouchableOpacity>

            {/* Quick Demo Switcher for Hackathon Judges */}
            <View style={styles.demoSwitchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoSwitchTitle}>Judge / Demo Pro Override</Text>
                <Text style={styles.demoSwitchSub}>Toggle Pro entitlements on/off for evaluation</Text>
              </View>
              <Switch
                value={isPro}
                onValueChange={handleTogglePro}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: THEME.colors.secondary }}
                thumbColor={isPro ? '#07090E' : '#FFFFFF'}
              />
            </View>
          </GlassCard>
        </View>

        {/* AI Engine Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI SIMULATION ENGINE</Text>

          <GlassCard style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>Gemini AI Integration</Text>
                <Text style={styles.aiSub}>
                  {apiKey ? 'Configured with live Gemini API' : 'Using built-in intelligent scenario engine'}
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
                <Text style={styles.saveKeyBtnText}>Save API Key</Text>
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

        {/* Reset / Demo Data */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetBtn} onPress={onResetData}>
            <Text style={styles.resetBtnText}>↻ Re-seed Showcase Decisions</Text>
          </TouchableOpacity>
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
  header: {
    gap: 4,
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: THEME.spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  profileDetails: {
    flex: 1,
  },
  profileLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nameInput: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 2,
  },
  goalsWrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: THEME.spacing.sm,
    gap: 6,
  },
  goalsTitle: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  goalPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  goalPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
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
  subscriptionCard: {
    gap: THEME.spacing.md,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subBadge: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: '800',
  },
  subStatus: {
    color: THEME.colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  statusIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  statusIndicatorActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: THEME.colors.secondary,
  },
  statusIndicatorText: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
  },
  upgradeBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '800',
  },
  demoSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: THEME.spacing.sm,
  },
  demoSwitchTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  demoSwitchSub: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  aiCard: {
    gap: THEME.spacing.md,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIcon: {
    fontSize: 22,
  },
  aiTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
  },
  aiSub: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
  },
  keyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
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
  resetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  resetBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
});
