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

export type ReadoutSize = 'sm' | 'md' | 'lg' | 'xl';
export type ReadoutStatus = 'normal' | 'warning' | 'danger' | 'ok';
export type ReadoutOrientation = 'vertical' | 'horizontal';

export interface ReadoutProps {
  label?: string;
  value: string | number;
  unit?: string;
  warning?: boolean;
  danger?: boolean;
  status?: ReadoutStatus;
  size?: ReadoutSize;
  precision?: number;
  orientation?: ReadoutOrientation;
  framed?: boolean;
  secondaryValue?: string | number;
  secondaryUnit?: string;
  style?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  unitStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Readout: React.FC<ReadoutProps> = ({
  label,
  value,
  unit,
  warning = false,
  danger = false,
  status,
  size = 'md',
  precision,
  orientation = 'vertical',
  framed = true,
  secondaryValue,
  secondaryUnit,
  style,
  valueStyle,
  labelStyle,
  unitStyle,
  testID,
}) => {
  // Resolve status priority: explicit status -> danger prop -> warning prop -> normal
  const resolvedStatus: ReadoutStatus =
    status || (danger ? 'danger' : warning ? 'warning' : 'normal');

  const getStatusColor = (): string => {
    switch (resolvedStatus) {
      case 'danger':
        return tokens.colors.status.danger;
      case 'warning':
        return tokens.colors.status.warning;
      case 'ok':
        return tokens.colors.status.ok;
      case 'normal':
      default:
        return tokens.colors.text.primary;
    }
  };

  const getStatusBg = (): string => {
    switch (resolvedStatus) {
      case 'danger':
        return tokens.colors.status.dangerBg;
      case 'warning':
        return tokens.colors.status.warningBg;
      case 'ok':
        return tokens.colors.status.okBg;
      case 'normal':
      default:
        return tokens.colors.bg.inset;
    }
  };

  const getStatusBorder = (): string => {
    switch (resolvedStatus) {
      case 'danger':
        return tokens.colors.status.dangerBorder;
      case 'warning':
        return tokens.colors.status.warningBorder;
      case 'ok':
        return tokens.colors.status.okBorder;
      case 'normal':
      default:
        return tokens.colors.border.hairline;
    }
  };

  // Format value with precision if numeric
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'number' && precision !== undefined) {
      return value.toFixed(precision);
    }
    return String(value);
  }, [value, precision]);

  const valueColor = getStatusColor();

  const sizeStyles = {
    sm: {
      value: styles.valueSm,
      unit: styles.unitSm,
      label: styles.labelSm,
      padding: styles.frameSm,
    },
    md: {
      value: styles.valueMd,
      unit: styles.unitMd,
      label: styles.labelMd,
      padding: styles.frameMd,
    },
    lg: {
      value: styles.valueLg,
      unit: styles.unitLg,
      label: styles.labelLg,
      padding: styles.frameLg,
    },
    xl: {
      value: styles.valueXl,
      unit: styles.unitXl,
      label: styles.labelXl,
      padding: styles.frameXl,
    },
  }[size];

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        orientation === 'horizontal' ? styles.containerHorizontal : styles.containerVertical,
        framed && [
          styles.framed,
          { backgroundColor: getStatusBg(), borderColor: getStatusBorder() },
          sizeStyles.padding,
        ],
        style,
      ]}
    >
      {label ? (
        <Text style={[styles.label, sizeStyles.label, labelStyle]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}

      <View style={styles.dataGroup}>
        <View style={styles.primaryDataRow}>
          <Text
            style={[
              styles.valueText,
              sizeStyles.value,
              { color: valueColor },
              valueStyle,
            ]}
          >
            {formattedValue}
          </Text>

          {unit ? (
            <Text
              style={[
                styles.unitText,
                sizeStyles.unit,
                { color: resolvedStatus === 'normal' ? tokens.colors.text.secondary : valueColor },
                unitStyle,
              ]}
            >
              {unit}
            </Text>
          ) : null}
        </View>

        {secondaryValue !== undefined ? (
          <View style={styles.secondaryDataRow}>
            <Text style={styles.secondaryValueText}>
              {String(secondaryValue)}
            </Text>
            {secondaryUnit ? (
              <Text style={styles.secondaryUnitText}>{secondaryUnit}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  containerVertical: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  framed: {
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  frameSm: {
    paddingHorizontal: tokens.spacing.xs + 2,
    paddingVertical: 3,
  },
  frameMd: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs + 2,
  },
  frameLg: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  frameXl: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  label: {
    fontFamily: tokens.typography.fontFamily.sans,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelSm: {
    fontSize: 9,
    fontWeight: tokens.typography.weights.semibold,
  },
  labelMd: {
    fontSize: 10,
    fontWeight: tokens.typography.weights.semibold,
  },
  labelLg: {
    fontSize: 11,
    fontWeight: tokens.typography.weights.semibold,
  },
  labelXl: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
  },
  dataGroup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  primaryDataRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 4,
  },
  valueText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontWeight: tokens.typography.weights.bold,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  valueSm: {
    fontSize: tokens.typography.sizes.sm,
  },
  valueMd: {
    fontSize: tokens.typography.sizes.md,
  },
  valueLg: {
    fontSize: tokens.typography.sizes['2xl'],
  },
  valueXl: {
    fontSize: tokens.typography.sizes['4xl'],
  },
  unitText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontWeight: tokens.typography.weights.medium,
    textTransform: 'none',
  },
  unitSm: {
    fontSize: 10,
  },
  unitMd: {
    fontSize: 11,
  },
  unitLg: {
    fontSize: tokens.typography.sizes.sm,
  },
  unitXl: {
    fontSize: tokens.typography.sizes.md,
  },
  secondaryDataRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 1,
  },
  secondaryValueText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 10,
    color: tokens.colors.text.muted,
  },
  secondaryUnitText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    color: tokens.colors.text.muted,
  },
});

export default Readout;
