import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { THEME } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
  glowColor?: string;
  borderColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  highlight = false,
  glowColor,
  borderColor,
}) => {
  return (
    <View
      style={[
        styles.card,
        highlight && styles.highlight,
        glowColor ? { shadowColor: glowColor, shadowOpacity: 0.35, shadowRadius: 16 } : null,
        borderColor ? { borderColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  highlight: {
    borderColor: THEME.colors.cardBorderHighlight,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});
