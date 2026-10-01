import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { THEME } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
  glowColor?: string;
  borderColor?: string;
  elevated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  highlight = false,
  glowColor,
  borderColor,
  elevated = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        highlight && styles.highlight,
        borderColor ? { borderColor } : null,
        glowColor ? { shadowColor: glowColor, shadowOpacity: 0.18, shadowRadius: 14 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.lg,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: THEME.colors.elevatedSurface,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  highlight: {
    borderColor: THEME.colors.cardBorderHighlight,
  },
});
