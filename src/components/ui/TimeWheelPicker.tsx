import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';

export const WHEEL_ITEM_HEIGHT = 44;
export const WHEEL_HOURS = Array.from({ length: 24 }, (_, i) => i);
export const WHEEL_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/**
 * Arrondit une minute au palier de 5 minutes le plus proche
 */
export function findClosestMinute(m: number): number {
  return WHEEL_MINUTES.reduce((prev, curr) => {
    return Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev;
  }, 0);
}

/**
 * Décompose une heure "HH:MM" en heures et minutes numériques
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const parts = (timeStr || '09:00').split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return {
    hours: isNaN(h) ? 9 : Math.min(23, Math.max(0, h)),
    minutes: isNaN(m) ? 0 : Math.min(59, Math.max(0, m)),
  };
}

/**
 * Formate heures et minutes au format "HH:MM"
 */
export function formatTime(hours: number, minutes: number): string {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Calcule l'amplitude journalière d'ouverture
 */
export function calculateDailyAmplitude(openTime: string, closeTime: string): string {
  const { hours: oH, minutes: oM } = parseTime(openTime);
  const { hours: cH, minutes: cM } = parseTime(closeTime);

  let totalOpen = oH * 60 + oM;
  let totalClose = cH * 60 + cM;

  if (totalClose <= totalOpen) {
    totalClose += 24 * 60;
  }

  const diff = totalClose - totalOpen;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (mins === 0) return `${hours}h / jour`;
  return `${hours}h${String(mins).padStart(2, '0')} / jour`;
}

interface AnimatedWheelItemProps {
  item: number;
  index: number;
  scrollY: Animated.Value;
  onPress: () => void;
  formatLabel: (val: number) => string;
  theme: ThemeColors;
  isDark: boolean;
}

const AnimatedWheelItem: React.FC<AnimatedWheelItemProps> = ({
  item,
  index,
  scrollY,
  onPress,
  formatLabel,
  theme,
  isDark,
}) => {
  const itemOffset = index * WHEEL_ITEM_HEIGHT;

  const scale = scrollY.interpolate({
    inputRange: [
      itemOffset - WHEEL_ITEM_HEIGHT * 2,
      itemOffset - WHEEL_ITEM_HEIGHT,
      itemOffset,
      itemOffset + WHEEL_ITEM_HEIGHT,
      itemOffset + WHEEL_ITEM_HEIGHT * 2,
    ],
    outputRange: [0.74, 0.86, 1.15, 0.86, 0.74],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [
      itemOffset - WHEEL_ITEM_HEIGHT * 2,
      itemOffset - WHEEL_ITEM_HEIGHT,
      itemOffset,
      itemOffset + WHEEL_ITEM_HEIGHT,
      itemOffset + WHEEL_ITEM_HEIGHT * 2,
    ],
    outputRange: [0.18, 0.35, 1.0, 0.35, 0.18],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity
      style={styles.wheelItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.Text
        style={[
          styles.wheelItemText,
          {
            color: isDark ? '#FFFFFF' : '#0F172A',
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        {formatLabel(item)}
      </Animated.Text>
    </TouchableOpacity>
  );
};

interface WheelColumnProps {
  items: number[];
  selectedValue: number;
  onValueChange: (val: number) => void;
  formatLabel?: (val: number) => string;
  theme: ThemeColors;
  isDark: boolean;
}

const WheelColumn: React.FC<WheelColumnProps> = ({
  items,
  selectedValue,
  onValueChange,
  formatLabel = (v) => String(v).padStart(2, '0'),
  theme,
  isDark,
}) => {
  const scrollRef = useRef<any>(null);
  const isUserDragging = useRef(false);
  const selectedIndex = Math.max(0, items.indexOf(selectedValue));
  const scrollY = useRef(new Animated.Value(selectedIndex * WHEEL_ITEM_HEIGHT)).current;

  // Synchronisation initiale sans animation
  useEffect(() => {
    const idx = items.indexOf(selectedValue);
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: idx * WHEEL_ITEM_HEIGHT,
        animated: false,
      });
      scrollY.setValue(idx * WHEEL_ITEM_HEIGHT);
    }
  }, []);

  // Synchronisation lors de modifications externes (changement d'onglet Ouvre / Ferme)
  useEffect(() => {
    if (isUserDragging.current) return;
    const idx = items.indexOf(selectedValue);
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: idx * WHEEL_ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [selectedValue, items]);

  const handleScrollEnd = (e: any) => {
    isUserDragging.current = false;
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / WHEEL_ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, idx));
    const nextVal = items[clampedIndex];
    if (nextVal !== undefined && nextVal !== selectedValue) {
      onValueChange(nextVal);
    }
  };

  const handleScrollEndDrag = (e: any) => {
    const velocity = Math.abs(e.nativeEvent.velocity?.y || 0);
    if (velocity < 0.1) {
      handleScrollEnd(e);
    }
  };

  return (
    <View style={styles.wheelColContainer}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          isUserDragging.current = true;
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        contentContainerStyle={{
          paddingTop: WHEEL_ITEM_HEIGHT,
          paddingBottom: WHEEL_ITEM_HEIGHT,
        }}
        nestedScrollEnabled={true}
      >
        {items.map((item, idx) => (
          <AnimatedWheelItem
            key={item}
            item={item}
            index={idx}
            scrollY={scrollY}
            formatLabel={formatLabel}
            theme={theme}
            isDark={isDark}
            onPress={() => {
              onValueChange(item);
              scrollRef.current?.scrollTo({
                y: idx * WHEEL_ITEM_HEIGHT,
                animated: true,
              });
            }}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
};

export interface TimeWheelPickerProps {
  openingTime: string;
  closingTime: string;
  onOpeningTimeChange: (time: string) => void;
  onClosingTimeChange: (time: string) => void;
  theme: ThemeColors;
  isDark: boolean;
  activeTarget?: 'open' | 'close';
  onTargetChange?: (target: 'open' | 'close') => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TimeWheelPicker: React.FC<TimeWheelPickerProps> = ({
  openingTime,
  closingTime,
  onOpeningTimeChange,
  onClosingTimeChange,
  theme,
  isDark,
  activeTarget,
  onTargetChange,
  containerStyle,
}) => {
  const [internalTarget, setInternalTarget] = useState<'open' | 'close'>('open');
  const currentTarget = activeTarget ?? internalTarget;

  const handleSelectTarget = (target: 'open' | 'close') => {
    setInternalTarget(target);
    onTargetChange?.(target);
  };

  const isOpening = currentTarget === 'open';
  const currentTime = isOpening ? openingTime : closingTime;
  const { hours, minutes } = parseTime(currentTime);

  const updateTime = (newH: number, newM: number) => {
    const val = formatTime(newH, newM);
    if (isOpening) {
      onOpeningTimeChange(val);
    } else {
      onClosingTimeChange(val);
    }
  };

  const currentMinuteClamped = findClosestMinute(minutes);

  return (
    <View style={[styles.rootContainer, containerStyle]}>
      {/* 1. Sélecteur de créneau style Apple Segmented Cards */}
      <View style={styles.appleSelectorRow}>
        <TouchableOpacity
          style={[
            styles.appleTimeCard,
            {
              backgroundColor: currentTarget === 'open'
                ? (isDark ? 'rgba(99, 102, 241, 0.16)' : '#EFF6FF')
                : (isDark ? '#1E293B' : '#F8FAFC'),
              borderColor: currentTarget === 'open' ? theme.primary : theme.cardBorder,
              borderWidth: currentTarget === 'open' ? 2 : 1,
            },
          ]}
          onPress={() => handleSelectTarget('open')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name={currentTarget === 'open' ? 'sunny' : 'sunny-outline'}
              size={15}
              color={currentTarget === 'open' ? '#F59E0B' : theme.textMuted}
            />
            <Text
              style={[
                styles.appleTimeCardLabel,
                { color: currentTarget === 'open' ? theme.primary : theme.textMuted },
              ]}
            >
              OUVRE À
            </Text>
          </View>
          <Text
            style={[
              styles.appleTimeCardValue,
              { color: currentTarget === 'open' ? theme.primary : theme.textMain },
            ]}
          >
            {openingTime}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.appleTimeCard,
            {
              backgroundColor: currentTarget === 'close'
                ? (isDark ? 'rgba(99, 102, 241, 0.16)' : '#EFF6FF')
                : (isDark ? '#1E293B' : '#F8FAFC'),
              borderColor: currentTarget === 'close' ? theme.primary : theme.cardBorder,
              borderWidth: currentTarget === 'close' ? 2 : 1,
            },
          ]}
          onPress={() => handleSelectTarget('close')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name={currentTarget === 'close' ? 'moon' : 'moon-outline'}
              size={15}
              color={currentTarget === 'close' ? '#6366F1' : theme.textMuted}
            />
            <Text
              style={[
                styles.appleTimeCardLabel,
                { color: currentTarget === 'close' ? theme.primary : theme.textMuted },
              ]}
            >
              FERME À
            </Text>
          </View>
          <Text
            style={[
              styles.appleTimeCardValue,
              { color: currentTarget === 'close' ? theme.primary : theme.textMain },
            ]}
          >
            {closingTime}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Tambour Rotatif Apple (Roulette Animée 60 FPS) */}
      <View
        style={[
          styles.appleWheelCard,
          {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderColor: theme.cardBorder,
          },
        ]}
      >
        {/* Titres discrets des colonnes */}
        <View style={styles.wheelLabelsRow}>
          <Text style={[styles.wheelColHeaderLabel, { color: theme.textMuted }]}>HEURES</Text>
          <Text style={[styles.wheelColHeaderLabel, { color: theme.textMuted }]}>MINUTES</Text>
        </View>

        {/* Cadre du tambour */}
        <View
          style={[
            styles.wheelFrame,
            { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#F8FAFC' },
          ]}
        >
          {/* Lentille centrale translucide Apple */}
          <View
            style={[
              styles.wheelLens,
              {
                borderColor: theme.primary,
                backgroundColor: isDark
                  ? 'rgba(99, 102, 241, 0.12)'
                  : 'rgba(99, 102, 241, 0.07)',
              },
            ]}
            pointerEvents="none"
          />

          {/* Colonne HEURES (00 - 23) */}
          <WheelColumn
            items={WHEEL_HOURS}
            selectedValue={hours}
            onValueChange={(newH) => updateTime(newH, minutes)}
            theme={theme}
            isDark={isDark}
          />

          {/* Séparateur digital deux-points au centre de la lentille */}
          <View style={styles.wheelColonContainer} pointerEvents="none">
            <Text style={[styles.wheelColonText, { color: theme.primary }]}>:</Text>
          </View>

          {/* Colonne MINUTES (00 - 55 par pas de 5 min) */}
          <WheelColumn
            items={WHEEL_MINUTES}
            selectedValue={currentMinuteClamped}
            onValueChange={(newM) => updateTime(hours, newM)}
            theme={theme}
            isDark={isDark}
          />
        </View>

        {/* 3. Synthèse d'amplitude journalière calculée en temps réel */}
        <View
          style={[
            styles.amplitudeBadge,
            {
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Ionicons name="time-outline" size={14} color={theme.primary} />
          <Text style={[styles.amplitudeText, { color: theme.textMuted }]}>
            Durée :{' '}
            <Text style={{ color: theme.textMain, fontWeight: '800' }}>
              {calculateDailyAmplitude(openingTime, closingTime)}
            </Text>{' '}
            ({openingTime} ➔ {closingTime})
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    marginBottom: 4,
  },
  appleSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  appleTimeCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appleTimeCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appleTimeCardValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  appleWheelCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 6,
  },
  wheelLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  wheelColHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  wheelFrame: {
    height: 132,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  wheelColContainer: {
    flex: 1,
    height: 132,
    overflow: 'hidden',
  },
  wheelItem: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  wheelLens: {
    position: 'absolute',
    top: WHEEL_ITEM_HEIGHT,
    left: 8,
    right: 8,
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  wheelColonContainer: {
    width: 24,
    height: WHEEL_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelColonText: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  amplitudeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  amplitudeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

