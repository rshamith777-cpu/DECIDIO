import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// RevenueCat package import
let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  console.log('[RevenueCat] react-native-purchases native module not found in this environment. Falling back to simulation mode.');
}

const REVENUECAT_STORAGE_KEY = '@decidio_revenuecat_pro';
const REVENUECAT_USAGE_KEY = '@decidio_usage_count';

// Default mock API keys (User can override in settings)
export const REVENUECAT_CONFIG = {
  apiKeyIOS: 'appl_mock_decidio_shipathon_ios',
  apiKeyAndroid: 'goog_mock_decidio_shipathon_android',
  entitlementId: 'pro_access',
  offeringId: 'default',
  packages: [
    {
      identifier: 'decidio_pro_monthly',
      title: 'Decidio Pro Monthly',
      description: 'Unlimited futures, Decision DNA, What-If mode & timeline tracking',
      priceString: '₹199 / mo',
      price: 199,
      currency: 'INR',
      period: 'Monthly',
      badge: null,
    },
    {
      identifier: 'decidio_pro_annual',
      title: 'Decidio Pro Annual',
      description: 'Full strategic foresight suite with 3-day trial and 37% savings',
      priceString: '₹1,499 / yr',
      price: 1499,
      currency: 'INR',
      period: 'Annual',
      badge: 'SAVE 37% + FREE TRIAL',
    },
  ],
};

class RevenueCatService {
  private isInitialized = false;
  private isMockMode = false;

  async init(customApiKey?: string) {
    if (this.isInitialized) return;

    const apiKey = customApiKey || (Platform.OS === 'ios' ? REVENUECAT_CONFIG.apiKeyIOS : REVENUECAT_CONFIG.apiKeyAndroid);

    if (Purchases && Platform.OS !== 'web' && !apiKey.includes('mock')) {
      try {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        await Purchases.configure({ apiKey });
        this.isInitialized = true;
        this.isMockMode = false;
        console.log('[RevenueCat] Initialized with live Purchases SDK');
        return;
      } catch (err) {
        console.warn('[RevenueCat] Live init error, using sandbox/mock mode:', err);
      }
    }

    // Default to sandbox / simulated mode for web and test keys
    this.isMockMode = true;
    this.isInitialized = true;
    console.log('[RevenueCat] Running in Shipathon Sandbox mode.');
  }

  async isProMember(): Promise<boolean> {
    try {
      // Check stored sandbox / local override first
      const stored = await AsyncStorage.getItem(REVENUECAT_STORAGE_KEY);
      if (stored === 'true') {
        return true;
      }

      if (Purchases && !this.isMockMode) {
        const customerInfo = await Purchases.getCustomerInfo();
        const proActive = typeof customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId] !== 'undefined';
        return proActive;
      }
    } catch (e) {
      console.log('[RevenueCat] Error checking entitlements:', e);
    }
    return false;
  }

  async purchasePackage(packageIdentifier: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (Purchases && !this.isMockMode) {
        // Live purchase via RevenueCat
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
          const pkg = offerings.current.availablePackages.find(
            (p: any) => p.identifier === packageIdentifier
          );
          if (pkg) {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            if (typeof customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId] !== 'undefined') {
              await AsyncStorage.setItem(REVENUECAT_STORAGE_KEY, 'true');
              return { success: true };
            }
          }
        }
      }

      // Sandbox / Simulated purchase for Shipathon Demo
      await AsyncStorage.setItem(REVENUECAT_STORAGE_KEY, 'true');
      return { success: true };
    } catch (err: any) {
      if (err.userCancelled) {
        return { success: false, error: 'Purchase cancelled by user' };
      }
      // If error occurs in demo, let user still test
      await AsyncStorage.setItem(REVENUECAT_STORAGE_KEY, 'true');
      return { success: true };
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      if (Purchases && !this.isMockMode) {
        const customerInfo = await Purchases.restorePurchases();
        const proActive = typeof customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId] !== 'undefined';
        if (proActive) {
          await AsyncStorage.setItem(REVENUECAT_STORAGE_KEY, 'true');
          return true;
        }
      }
      const stored = await AsyncStorage.getItem(REVENUECAT_STORAGE_KEY);
      return stored === 'true';
    } catch (e) {
      console.warn('[RevenueCat] Restore failed:', e);
      return false;
    }
  }

  async setMockProStatus(isPro: boolean): Promise<void> {
    await AsyncStorage.setItem(REVENUECAT_STORAGE_KEY, isPro ? 'true' : 'false');
  }

  async getDecisionUsageCount(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(REVENUECAT_USAGE_KEY);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  async incrementDecisionUsage(): Promise<number> {
    try {
      const current = await this.getDecisionUsageCount();
      const updated = current + 1;
      await AsyncStorage.setItem(REVENUECAT_USAGE_KEY, updated.toString());
      return updated;
    } catch {
      return 1;
    }
  }
}

export const revenueCat = new RevenueCatService();
