import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { tokens } from '../../design-system/tokens';

export type ButtonVariant = 'solid' | 'primary' | 'outline' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  icon,
  iconPosition = 'left',
  children,
  style,
  textStyle,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Normalize variant aliases
  const normalizedVariant: 'solid' | 'outline' | 'danger' | 'ghost' =
    variant === 'primary' ? 'solid' : variant === 'secondary' ? 'outline' : variant;

  const getContainerStyle = (pressed: boolean) => {
    const active = pressed || isHovered;

    let baseBg: string = tokens.colors.chrome.buttonBg;
    let baseBorder: string = tokens.colors.chrome.border;

    if (normalizedVariant === 'solid') {
      baseBg = active ? (pressed ? tokens.colors.chrome.buttonActive : tokens.colors.chrome.buttonHover) : tokens.colors.chrome.buttonBg;
      baseBorder = active ? tokens.colors.border.active : tokens.colors.chrome.border;
    } else if (normalizedVariant === 'outline') {
      baseBg = active ? tokens.colors.bg.elevated : 'transparent';
      baseBorder = active ? tokens.colors.border.active : tokens.colors.border.subtle;
    } else if (normalizedVariant === 'danger') {
      baseBg = active ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.10)';
      baseBorder = active ? tokens.colors.status.danger : tokens.colors.status.dangerBorder;
    } else if (normalizedVariant === 'ghost') {
      baseBg = active ? tokens.colors.chrome.buttonBg : 'transparent';
      baseBorder = 'transparent';
    }

    if (disabled || loading) {
      baseBg = normalizedVariant === 'ghost' ? 'transparent' : tokens.colors.chrome.disabledBg;
      baseBorder = normalizedVariant === 'ghost' ? 'transparent' : tokens.colors.chrome.disabledBorder;
    }

    return {
      backgroundColor: baseBg,
      borderColor: baseBorder,
    };
  };

  const getTextColor = (pressed: boolean) => {
    const active = pressed || isHovered;

    if (disabled || loading) {
      return tokens.colors.chrome.disabledText;
    }

    if (normalizedVariant === 'solid') {
      return tokens.colors.text.primary;
    } else if (normalizedVariant === 'outline') {
      return active ? tokens.colors.text.primary : tokens.colors.text.secondary;
    } else if (normalizedVariant === 'danger') {
      return tokens.colors.status.danger;
    } else if (normalizedVariant === 'ghost') {
      return active ? tokens.colors.text.primary : tokens.colors.text.secondary;
    }

    return tokens.colors.text.primary;
  };

  const sizeStyle =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
  const textSizeStyle =
    size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;

  return (
    <Pressable
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        getContainerStyle(pressed),
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => {
        const textColor = getTextColor(pressed);

        if (loading) {
          return (
            <ActivityIndicator
              size="small"
              color={textColor}
              style={styles.loader}
            />
          );
        }

        return (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' ? (
              <View style={styles.iconLeft}>{icon}</View>
            ) : null}

            {label ? (
              <Text style={[styles.text, textSizeStyle, { color: textColor }, textStyle]}>
                {label}
              </Text>
            ) : (
              children
            )}

            {icon && iconPosition === 'right' ? (
              <View style={styles.iconRight}>{icon}</View>
            ) : null}
          </View>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      } as any,
    }),
  },
  sizeSm: {
    height: 30,
    paddingHorizontal: tokens.spacing.sm + 2,
    gap: tokens.spacing.xs,
  },
  sizeMd: {
    height: 38,
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  sizeLg: {
    height: 46,
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontWeight: tokens.typography.weights.medium,
    textAlign: 'center',
  },
  textSm: {
    fontSize: tokens.typography.sizes.xs + 1,
    letterSpacing: 0.2,
  },
  textMd: {
    fontSize: tokens.typography.sizes.base,
    letterSpacing: 0.2,
  },
  textLg: {
    fontSize: tokens.typography.sizes.md,
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: tokens.spacing.xs + 2,
  },
  iconRight: {
    marginLeft: tokens.spacing.xs + 2,
  },
  loader: {
    paddingVertical: 2,
  },
  disabled: {
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      } as any,
    }),
  },
});

export default Button;
