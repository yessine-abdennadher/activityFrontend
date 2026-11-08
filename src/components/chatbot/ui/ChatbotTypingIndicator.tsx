/**
 * ChatbotTypingIndicator.tsx
 * Indicateur de frappe réaliste avec 3 points animés en boucle native.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../../context/AppPreferencesContext';

export const ChatbotTypingIndicator: React.FC = () => {
  const { theme, language } = usePreferences();
  const isRTL = language === 'ar';

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -5,
            duration: 320,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const a1 = animateDot(dot1, 0);
    const a2 = animateDot(dot2, 160);
    const a3 = animateDot(dot3, 320);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [dot1, dot2, dot3]);

  return (
    <View
      style={[
        styles.row,
        {
          justifyContent: isRTL ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View style={[styles.avatar, { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }]}>
        <Ionicons name="sparkles" size={12} color="#818CF8" />
      </View>

      <View style={[styles.bubble, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Animated.View style={[styles.dot, { backgroundColor: theme.primary, transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { backgroundColor: theme.primary, transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { backgroundColor: theme.primary, transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

