import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { THEME } from './src/constants/theme';
import { DecisionItem, DecisionProfile } from './src/types';
import { StorageService } from './src/services/storage';
import { revenueCat } from './src/services/revenuecat';
import { aiEngine } from './src/services/aiEngine';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { DecisionsJournalScreen } from './src/screens/DecisionsJournalScreen';
import { CreateDecisionScreen } from './src/screens/CreateDecisionScreen';
import { SimulationDetailScreen } from './src/screens/SimulationDetailScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { UrlAuditScreen } from './src/screens/UrlAuditScreen';

// Modals
import { PaywallModal } from './src/components/PaywallModal';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<DecisionProfile | null>(null);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'decisions' | 'insights' | 'profile'>('home');
  const [activeDecision, setActiveDecision] = useState<DecisionItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAuditingUrl, setIsAuditingUrl] = useState(false);
  const [createInitialPrompt, setCreateInitialPrompt] = useState<string>('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // App Initialization
  useEffect(() => {
    async function initApp() {
      try {
        await revenueCat.init();
        const proStatus = await revenueCat.isProMember();
        setIsPro(proStatus);

        const savedKey = await StorageService.getGeminiApiKey();
        if (savedKey) {
          aiEngine.setGeminiApiKey(savedKey);
        }

        const userProfile = await StorageService.getProfile();
        setProfile(userProfile);

        const hasOnboarded = await StorageService.hasCompletedOnboarding();
        if (!hasOnboarded) {
          setShowOnboarding(true);
        }

        const userDecisions = await StorageService.getDecisions();
        setDecisions(userDecisions);
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const updatedDecisions = await StorageService.getDecisions();
      setDecisions(updatedDecisions);
      const proStatus = await revenueCat.isProMember();
      setIsPro(proStatus);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDecisionCreated = (newDecision: DecisionItem) => {
    setDecisions(prev => [newDecision, ...prev]);
    setIsCreating(false);
    setActiveDecision(newDecision);
  };

  const handleOpenCreate = (promptText?: string) => {
    setCreateInitialPrompt(promptText || '');
    setIsCreating(true);
  };

  const handleResetData = async () => {
    setIsLoading(true);
    const fresh = await StorageService.seedInitialDecisions();
    await StorageService.saveDecisions(fresh);
    setDecisions(fresh);
    setIsLoading(false);
  };

  if (isLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.secondary} />
        <Text style={styles.loadingText}>DECIDIO</Text>
        <Text style={styles.loadingSub}>Simulating your future...</Text>
      </View>
    );
  }

  // Onboarding View
  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          setShowOnboarding(false);
          refreshData();
        }}
      />
    );
  }

  // Active Decision Simulator View
  if (activeDecision) {
    return (
      <SimulationDetailScreen
        decision={activeDecision}
        isPro={isPro}
        onBack={() => setActiveDecision(null)}
        onUpdate={updated => {
          setActiveDecision(updated);
          setDecisions(prev => prev.map(d => (d.id === updated.id ? updated : d)));
        }}
        onDelete={id => {
          setDecisions(prev => prev.filter(d => d.id !== id));
          StorageService.deleteDecision(id);
        }}
        onOpenPaywall={() => setShowPaywall(true)}
      />
    );
  }

  // URL Audit View
  if (isAuditingUrl) {
    return (
      <UrlAuditScreen
        onBack={() => setIsAuditingUrl(false)}
        onSimulateUrlDecision={(prompt) => {
          setIsAuditingUrl(false);
          handleOpenCreate(prompt);
        }}
      />
    );
  }

  // Create Decision Flow View
  if (isCreating) {
    return (
      <CreateDecisionScreen
        initialPrompt={createInitialPrompt}
        profile={profile}
        isPro={isPro}
        onDecisionCreated={handleDecisionCreated}
        onCancel={() => setIsCreating(false)}
        onOpenPaywall={() => setShowPaywall(true)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

      {/* Screen Router */}
      <View style={styles.contentArea}>
        {currentTab === 'home' && (
          <HomeScreen
            profile={profile}
            decisions={decisions}
            isPro={isPro}
            onSelectDecision={decision => setActiveDecision(decision)}
            onOpenCreate={handleOpenCreate}
            onOpenUrlAudit={() => setIsAuditingUrl(true)}
            onOpenPaywall={() => setShowPaywall(true)}
            onRefresh={refreshData}
            isRefreshing={isRefreshing}
          />
        )}

        {currentTab === 'decisions' && (
          <DecisionsJournalScreen
            decisions={decisions}
            onSelectDecision={decision => setActiveDecision(decision)}
            onOpenCreate={() => handleOpenCreate()}
          />
        )}

        {currentTab === 'insights' && (
          <InsightsScreen
            profile={profile}
            decisions={decisions}
            isPro={isPro}
            onOpenPaywall={() => setShowPaywall(true)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            profile={profile}
            isPro={isPro}
            onProfileUpdated={updated => setProfile(updated)}
            onProToggled={val => setIsPro(val)}
            onOpenPaywall={() => setShowPaywall(true)}
            onResetData={handleResetData}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('home')}
        >
          <Text style={[styles.navIcon, currentTab === 'home' && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, currentTab === 'home' && styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('decisions')}
        >
          <Text style={[styles.navIcon, currentTab === 'decisions' && styles.navIconActive]}>📑</Text>
          <Text style={[styles.navLabel, currentTab === 'decisions' && styles.navLabelActive]}>Decisions</Text>
        </TouchableOpacity>

        {/* Center + Action Button */}
        <TouchableOpacity
          style={styles.centerAddBtn}
          onPress={() => handleOpenCreate()}
          activeOpacity={0.8}
        >
          <Text style={styles.centerAddText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('insights')}
        >
          <Text style={[styles.navIcon, currentTab === 'insights' && styles.navIconActive]}>🧠</Text>
          <Text style={[styles.navLabel, currentTab === 'insights' && styles.navLabelActive]}>Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('profile')}
        >
          <Text style={[styles.navIcon, currentTab === 'profile' && styles.navIconActive]}>⚙️</Text>
          <Text style={[styles.navLabel, currentTab === 'profile' && styles.navLabelActive]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => {
          setIsPro(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 12,
  },
  loadingSub: {
    color: THEME.colors.secondary,
    fontSize: THEME.typography.sizes.xs,
    letterSpacing: 0.5,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 14, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    color: THEME.colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  navLabelActive: {
    color: THEME.colors.secondary,
    fontWeight: '800',
  },
  centerAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    borderWidth: 3,
    borderColor: THEME.colors.background,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  centerAddText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: -3,
  },
});
