import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import Svg, { Path, Circle, Line, G } from 'react-native-svg';
import { tokens } from '../../design-system/tokens';

export interface DialControlProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  centerZero?: boolean;
  size?: number;
  precision?: number;
  disabled?: boolean;
  warningBelow?: number;
  warningAbove?: number;
  dangerAbove?: number;
  formatValue?: (val: number) => string;
  onChange: (val: number) => void;
  onChangeEnd?: (val: number) => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  readoutStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

// Arc path helper function
const createArcPath = (center: number, startAngleDeg: number, endAngleDeg: number, r: number) => {
  if (Math.abs(endAngleDeg - startAngleDeg) < 0.1) return '';
  const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
  const endRad = ((endAngleDeg - 90) * Math.PI) / 180;

  const x1 = center + r * Math.cos(startRad);
  const y1 = center + r * Math.sin(startRad);
  const x2 = center + r * Math.cos(endRad);
  const y2 = center + r * Math.sin(endRad);

  const angleDiff = endAngleDeg >= startAngleDeg ? endAngleDeg - startAngleDeg : endAngleDeg - startAngleDeg + 360;
  const largeArcFlag = angleDiff > 180 ? 1 : 0;
  const sweepFlag = endAngleDeg >= startAngleDeg ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
};

export const DialControl: React.FC<DialControlProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit = '',
  centerZero = false,
  size = 84,
  precision = 1,
  disabled = false,
  warningBelow,
  warningAbove,
  dangerAbove,
  formatValue,
  onChange,
  onChangeEnd,
  style,
  labelStyle,
  readoutStyle,
  testID,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartValRef = useRef<number>(value);

  // Normalize ratio (0..1)
  const ratio = useMemo(() => {
    const clamped = Math.max(min, Math.min(max, value));
    return (clamped - min) / (max - min || 1);
  }, [value, min, max]);

  // Determine warning/danger states
  const isDanger = dangerAbove !== undefined && value >= dangerAbove;
  const isWarning =
    !isDanger &&
    ((warningBelow !== undefined && value <= warningBelow) ||
      (warningAbove !== undefined && value >= warningAbove));

  const activeColor = isDanger
    ? tokens.colors.status.danger
    : isWarning
    ? tokens.colors.status.warning
    : tokens.colors.text.primary;

  const snapValue = useCallback(
    (rawVal: number): number => {
      const rounded = Math.round(rawVal / step) * step;
      const clamped = Math.max(min, Math.min(max, rounded));
      return Number(clamped.toFixed(precision));
    },
    [step, min, max, precision]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: () => {
          if (disabled) return;
          setIsDragging(true);
          dragStartValRef.current = value;
        },
        onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          if (disabled) return;
          // Standard DAW rotary interaction: dragging up (negative dy) increases value
          const sensitivity = (max - min) / 160;
          const deltaVal = -gestureState.dy * sensitivity;
          const rawVal = dragStartValRef.current + deltaVal;
          const nextVal = snapValue(rawVal);
          onChange(nextVal);
        },
        onPanResponderRelease: () => {
          setIsDragging(false);
          if (onChangeEnd) {
            onChangeEnd(value);
          }
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
        },
      }),
    [disabled, max, min, snapValue, onChange, onChangeEnd, value]
  );

  // SVG Geometry calculations (Sweep from -135 deg to +135 deg relative to 12 o'clock)
  const strokeWidth = 3;
  const padding = strokeWidth + 2;
  const svgSize = size;
  const center = svgSize / 2;
  const radius = center - padding;
  const knobRadius = radius - 6;

  // Angle in degrees from 12 o'clock (-135 to +135)
  const currentAngle = -135 + ratio * 270;

  const bgTrackPath = createArcPath(center, -135, 135, radius);

  const activeTrackPath = useMemo(() => {
    if (centerZero) {
      // Sweeps from 0 deg (12 o'clock) to current angle
      if (currentAngle > 0) {
        return createArcPath(center, 0, currentAngle, radius);
      } else if (currentAngle < 0) {
        return createArcPath(center, currentAngle, 0, radius);
      }
      return '';
    }
    // Sweeps from -135 deg to current angle
    return createArcPath(center, -135, currentAngle, radius);
  }, [centerZero, currentAngle, radius, center]);

  // Pointer indicator coordinates on knob face
  const pointerRad = ((currentAngle - 90) * Math.PI) / 180;
  const pointerInnerX = center + (knobRadius - 10) * Math.cos(pointerRad);
  const pointerInnerY = center + (knobRadius - 10) * Math.sin(pointerRad);
  const pointerOuterX = center + (knobRadius - 2) * Math.cos(pointerRad);
  const pointerOuterY = center + (knobRadius - 2) * Math.sin(pointerRad);

  // Formatted numeric string
  const displayValue = useMemo(() => {
    if (formatValue) return formatValue(value);
    const sign = centerZero && value > 0 ? '+' : '';
    if (step >= 1 && Number.isInteger(value)) {
      return `${sign}${value}`;
    }
    return `${sign}${value.toFixed(precision)}`;
  }, [formatValue, value, centerZero, step, precision]);

  return (
    <View
      testID={testID}
      style={[
        styles.wrapper,
        { width: size + 20 },
        disabled && styles.disabled,
        style,
      ]}
    >
      {/* Control Label */}
      <Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {label}
      </Text>

      {/* Rotary Knob Control Surface */}
      <View
        {...panResponder.panHandlers}
        style={[
          styles.knobSurface,
          { width: size, height: size },
        ]}
      >
        <Svg width={svgSize} height={svgSize} style={styles.svg}>
          {/* Background Arc Track */}
          <Path
            d={bgTrackPath}
            stroke={tokens.colors.border.hairline}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          {activeTrackPath ? (
            <Path
              d={activeTrackPath}
              stroke={activeColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}

          {/* Center Rotary Knob Body */}
          <G>
            {/* Outer Beveled Rim */}
            <Circle
              cx={center}
              cy={center}
              r={knobRadius}
              fill={tokens.colors.chrome.knobBody}
              stroke={isDragging ? tokens.colors.border.active : tokens.colors.chrome.knobRim}
              strokeWidth={1.5}
            />
            {/* Inner Recessed Face */}
            <Circle
              cx={center}
              cy={center}
              r={knobRadius - 4}
              fill={tokens.colors.bg.inset}
              stroke={tokens.colors.border.hairline}
              strokeWidth={1}
            />

            {/* Rotating Indicator Needle */}
            <Line
              x1={pointerInnerX}
              y1={pointerInnerY}
              x2={pointerOuterX}
              y2={pointerOuterY}
              stroke={activeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </G>
        </Svg>
      </View>

      {/* Monospace Numeric Readout */}
      <View
        style={[
          styles.readoutContainer,
          isWarning && styles.warningReadout,
          isDanger && styles.dangerReadout,
          readoutStyle,
        ]}
      >
        <Text
          style={[
            styles.readoutText,
            { color: activeColor },
          ]}
        >
          {displayValue}
        </Text>
        {unit ? (
          <Text
            style={[
              styles.unitText,
              { color: isDanger || isWarning ? activeColor : tokens.colors.text.secondary },
            ]}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    userSelect: 'none',
  } as any,
  label: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 2,
  },
  knobSurface: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        cursor: 'ns-resize',
        touchAction: 'none',
      } as any,
    }),
  },
  svg: {
    overflow: 'visible',
  },
  readoutContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
    minWidth: 54,
  },
  warningReadout: {
    backgroundColor: tokens.colors.status.warningBg,
    borderColor: tokens.colors.status.warningBorder,
  },
  dangerReadout: {
    backgroundColor: tokens.colors.status.dangerBg,
    borderColor: tokens.colors.status.dangerBorder,
  },
  readoutText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.bold,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    fontWeight: tokens.typography.weights.medium,
  },
  disabled: {
    opacity: 0.45,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      } as any,
    }),
  },
});

export default DialControl;
