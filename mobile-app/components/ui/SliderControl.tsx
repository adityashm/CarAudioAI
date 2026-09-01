import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { tokens } from '../../design-system/tokens';

export interface SliderTick {
  value: number;
  label?: string;
}

export interface SliderControlProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  orientation?: 'vertical' | 'horizontal';
  centerDetent?: boolean;
  detentValue?: number;
  detentThreshold?: number;
  showTicks?: boolean;
  ticks?: (number | SliderTick)[];
  precision?: number;
  disabled?: boolean;
  height?: number;
  width?: number;
  onChange: (val: number) => void;
  onChangeEnd?: (val: number) => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  readoutStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  value,
  min,
  max,
  step = 0.5,
  label,
  unit = 'dB',
  orientation = 'vertical',
  centerDetent,
  detentValue = 0,
  detentThreshold,
  showTicks = true,
  ticks,
  precision = 1,
  disabled = false,
  height = 180,
  width = 64,
  onChange,
  onChangeEnd,
  style,
  labelStyle,
  readoutStyle,
  testID,
}) => {
  const isVertical = orientation === 'vertical';
  const trackLength = isVertical ? height - 60 : (width || 200) - 20;
  const isDetentActive = centerDetent ?? (min < 0 && max > 0);
  const snapThreshold = detentThreshold ?? Math.abs(max - min) * 0.03;

  const [trackLayout, setTrackLayout] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: isVertical ? 32 : trackLength,
    height: isVertical ? trackLength : 32,
  });

  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<View>(null);
  const dragStartValRef = useRef<number>(value);

  // Normalize value to 0..1 ratio
  const ratio = useMemo(() => {
    const clamped = Math.max(min, Math.min(max, value));
    return (clamped - min) / (max - min || 1);
  }, [value, min, max]);

  // Default tick generation if not provided
  const resolvedTicks: SliderTick[] = useMemo(() => {
    if (ticks && ticks.length > 0) {
      return ticks.map((t) => (typeof t === 'number' ? { value: t, label: `${t > 0 ? '+' : ''}${t}` } : t));
    }
    if (isDetentActive && min < 0 && max > 0) {
      return [
        { value: max, label: `+${max}` },
        { value: max / 2, label: `+${max / 2}` },
        { value: 0, label: '0' },
        { value: min / 2, label: `${min / 2}` },
        { value: min, label: `${min}` },
      ];
    }
    return [
      { value: max, label: `${max}` },
      { value: (max + min) / 2, label: `${((max + min) / 2).toFixed(0)}` },
      { value: min, label: `${min}` },
    ];
  }, [ticks, isDetentActive, min, max]);

  const snapValue = useCallback(
    (rawVal: number): number => {
      let rounded = Math.round(rawVal / step) * step;
      if (isDetentActive && Math.abs(rounded - detentValue) <= snapThreshold) {
        rounded = detentValue;
      }
      return Math.max(min, Math.min(max, Number(rounded.toFixed(precision))));
    },
    [step, isDetentActive, detentValue, snapThreshold, min, max, precision]
  );

  const calculateValueFromPosition = useCallback(
    (positionPx: number, totalPx: number): number => {
      if (totalPx <= 0) return value;
      let computedRatio: number;
      if (isVertical) {
        // In vertical fader: top is max (ratio 1), bottom is min (ratio 0)
        computedRatio = 1 - Math.max(0, Math.min(1, positionPx / totalPx));
      } else {
        // Horizontal: left is min (ratio 0), right is max (ratio 1)
        computedRatio = Math.max(0, Math.min(1, positionPx / totalPx));
      }
      const rawVal = min + computedRatio * (max - min);
      return snapValue(rawVal);
    },
    [isVertical, min, max, snapValue, value]
  );

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    const { x, y, width: w, height: h } = e.nativeEvent.layout;
    setTrackLayout({ x, y, width: w, height: h });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          if (disabled) return;
          setIsDragging(true);
          dragStartValRef.current = value;
          const locY = evt.nativeEvent.locationY;
          const locX = evt.nativeEvent.locationX;
          const pos = isVertical ? locY : locX;
          const total = isVertical ? trackLayout.height : trackLayout.width;
          const nextVal = calculateValueFromPosition(pos, total);
          onChange(nextVal);
        },
        onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          if (disabled) return;
          const total = isVertical ? trackLayout.height : trackLayout.width;
          if (total <= 0) return;

          // Compute delta change based on gesture dy/dx
          const deltaPx = isVertical ? -gestureState.dy : gestureState.dx;
          const deltaRatio = deltaPx / total;
          const deltaVal = deltaRatio * (max - min);
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
    [disabled, isVertical, trackLayout, calculateValueFromPosition, max, min, snapValue, onChange, onChangeEnd, value]
  );

  // Position thumb along track
  // For vertical: thumb top = (1 - ratio) * (height - thumbHeight)
  const thumbSize = isVertical ? { width: 34, height: 20 } : { width: 20, height: 34 };
  const availableTravel = isVertical ? trackLayout.height - thumbSize.height : trackLayout.width - thumbSize.width;
  const thumbOffset = Math.max(0, Math.min(availableTravel, isVertical ? (1 - ratio) * availableTravel : ratio * availableTravel));

  // Formatted string readout
  const formattedReadout = useMemo(() => {
    const sign = value > 0 && unit === 'dB' ? '+' : '';
    return `${sign}${value.toFixed(precision)}`;
  }, [value, precision, unit]);

  return (
    <View
      testID={testID}
      style={[
        styles.wrapper,
        isVertical ? { height, width } : { width: width || 240, height: 68 },
        disabled && styles.disabled,
        style,
      ]}
    >
      {/* Label & Monospace Readout Header */}
      <View style={[styles.header, readoutStyle]}>
        <Text style={[styles.label, labelStyle]} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.readoutBox}>
          <Text style={styles.readoutValue}>{formattedReadout}</Text>
          {unit ? <Text style={styles.readoutUnit}>{unit}</Text> : null}
        </View>
      </View>

      {/* Main Fader Track & Thumb Area */}
      <View style={[styles.faderBody, isVertical ? styles.faderBodyVertical : styles.faderBodyHorizontal]}>
        {/* Tick labels column/row (if vertical, placed on left or right) */}
        {showTicks && isVertical && (
          <View style={[styles.ticksContainerVertical, { height: trackLayout.height }]}>
            {resolvedTicks.map((t, idx) => {
              const tickRatio = (t.value - min) / (max - min || 1);
              const topPos = (1 - tickRatio) * (trackLayout.height - 10);
              return (
                <View key={idx} style={[styles.tickItemVertical, { top: topPos }]}>
                  <View style={[styles.tickMark, t.value === 0 && styles.detentTickMark]} />
                  {t.label ? <Text style={styles.tickText}>{t.label}</Text> : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Fader Track Well */}
        <View
          ref={trackRef}
          onLayout={handleTrackLayout}
          {...panResponder.panHandlers}
          style={[
            styles.trackWell,
            isVertical ? { height: trackLength, width: 36 } : { width: trackLength, height: 36 },
          ]}
        >
          {/* Internal Track Slot */}
          <View
            style={[
              styles.trackGroove,
              isVertical ? styles.trackGrooveVertical : styles.trackGrooveHorizontal,
            ]}
          />

          {/* Center Detent Marker */}
          {isDetentActive && (
            <View
              style={[
                styles.detentLine,
                isVertical
                  ? { top: (1 - (detentValue - min) / (max - min || 1)) * (trackLayout.height - 2) }
                  : { left: ((detentValue - min) / (max - min || 1)) * (trackLayout.width - 2) },
              ]}
            />
          )}

          {/* Movable Fader Cap / Thumb */}
          <View
            style={[
              styles.faderThumb,
              isVertical
                ? { top: thumbOffset, width: thumbSize.width, height: thumbSize.height }
                : { left: thumbOffset, width: thumbSize.width, height: thumbSize.height },
              isDragging && styles.faderThumbActive,
            ]}
          >
            {/* Metallic Grip Ridges on Fader Thumb */}
            <View style={styles.thumbGripContainer}>
              <View style={styles.thumbGripLine} />
              <View style={styles.thumbCenterIndicator} />
              <View style={styles.thumbGripLine} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none',
  } as any,
  header: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
    width: '100%',
  },
  label: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  readoutBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  readoutValue: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  readoutUnit: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    color: tokens.colors.text.secondary,
  },
  faderBody: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faderBodyVertical: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faderBodyHorizontal: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  ticksContainerVertical: {
    position: 'absolute',
    left: -24,
    width: 20,
  },
  tickItemVertical: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    right: 0,
  },
  tickMark: {
    width: 4,
    height: 1,
    backgroundColor: tokens.colors.border.subtle,
  },
  detentTickMark: {
    width: 6,
    height: 1.5,
    backgroundColor: tokens.colors.text.secondary,
  },
  tickText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 8,
    color: tokens.colors.text.muted,
  },
  trackWell: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    ...Platform.select({
      web: {
        cursor: 'ns-resize',
        touchAction: 'none',
      } as any,
    }),
  },
  trackGroove: {
    backgroundColor: '#050608',
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: 2,
  },
  trackGrooveVertical: {
    width: 6,
    height: '92%',
  },
  trackGrooveHorizontal: {
    height: 6,
    width: '92%',
  },
  detentLine: {
    position: 'absolute',
    backgroundColor: tokens.colors.border.active,
    width: '80%',
    height: 1.5,
  },
  faderThumb: {
    position: 'absolute',
    backgroundColor: tokens.colors.chrome.faderCap,
    borderColor: tokens.colors.chrome.border,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  faderThumbActive: {
    backgroundColor: tokens.colors.chrome.faderCapHover,
    borderColor: tokens.colors.border.active,
  },
  thumbGripContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
  },
  thumbGripLine: {
    width: '60%',
    height: 1,
    backgroundColor: tokens.colors.border.hairline,
  },
  thumbCenterIndicator: {
    width: '75%',
    height: 2,
    backgroundColor: tokens.colors.text.primary,
    borderRadius: 0.5,
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

export default SliderControl;
