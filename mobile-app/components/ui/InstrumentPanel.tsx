import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { tokens } from '../../design-system/tokens';

export type InstrumentPanelVariant = 'flat' | 'elevated' | 'inset';
export type InstrumentPanelStatus = 'ok' | 'warning' | 'danger' | 'info' | 'neutral';

export interface InstrumentPanelProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  status?: InstrumentPanelStatus;
  badgeColor?: string;
  action?: React.ReactNode;
  variant?: InstrumentPanelVariant;
  noPadding?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const InstrumentPanel: React.FC<InstrumentPanelProps> = ({
  title,
  subtitle,
  badge,
  status,
  badgeColor,
  action,
  variant = 'flat',
  noPadding = false,
  children,
  style,
  headerStyle,
  contentStyle,
  titleStyle,
  testID,
}) => {
  const hasHeader = Boolean(title || subtitle || badge || action);

  const getStatusColor = (st?: InstrumentPanelStatus): string => {
    switch (st) {
      case 'ok':
        return tokens.colors.status.ok;
      case 'warning':
        return tokens.colors.status.warning;
      case 'danger':
        return tokens.colors.status.danger;
      case 'info':
        return tokens.colors.status.info;
      case 'neutral':
      default:
        return tokens.colors.text.secondary;
    }
  };

  const resolvedBadgeColor = badgeColor || (status ? getStatusColor(status) : tokens.colors.text.secondary);

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        variant === 'flat' && styles.variantFlat,
        variant === 'elevated' && styles.variantElevated,
        variant === 'inset' && styles.variantInset,
        style,
      ]}
    >
      {hasHeader && (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerTitleGroup}>
            {title ? (
              <View style={styles.titleRow}>
                <Text style={[styles.title, titleStyle]}>{title}</Text>
                {badge ? (
                  <View
                    style={[
                      styles.badgeContainer,
                      { borderColor: `${resolvedBadgeColor}40`, backgroundColor: `${resolvedBadgeColor}15` },
                    ]}
                  >
                    <View style={[styles.badgeDot, { backgroundColor: resolvedBadgeColor }]} />
                    <Text style={[styles.badgeText, { color: resolvedBadgeColor }]}>
                      {badge}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          {action ? <View style={styles.actionSlot}>{action}</View> : null}
        </View>
      )}

      <View
        style={[
          styles.content,
          noPadding && styles.contentNoPadding,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  variantFlat: {
    backgroundColor: tokens.colors.bg.panel,
    borderColor: tokens.colors.border.hairline,
  },
  variantElevated: {
    backgroundColor: tokens.colors.bg.elevated,
    borderColor: tokens.colors.border.subtle,
  },
  variantInset: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.hairline,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  title: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: tokens.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: tokens.radius.full,
  },
  badgeText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs - 1,
    fontWeight: tokens.typography.weights.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  actionSlot: {
    marginLeft: tokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: tokens.spacing.lg,
  },
  contentNoPadding: {
    padding: 0,
  },
});

export default InstrumentPanel;
