/**
 * KharjaBotOrb.tsx
 * Orbe 3D cristallin 100% vectoriel, sans image raster.
 *
 * Caractéristiques :
 * - Couleurs vives et non foncées (Cyan électrique #00F0FF, Magenta #FF1493, Azur #0090FF, Lilas #C084FC).
 * - Rubans de lumière tourbillonnants inspirés de l'orbe de référence.
 * - Système d'animations multi-états réactif :
 *   * 'thinking' : tourbillon 360° en boucle fluide et pulsation d'énergie.
 *   * 'idle'     : flottement vertical doux (translateY) et respiration vivante quand l'utilisateur n'écrit pas.
 *   * 'default'  : pulsation douce continue.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type KharjaBotOrbState = 'default' | 'thinking' | 'idle';

export interface KharjaBotOrbProps {
  size?: number;
  animated?: boolean;
  state?: KharjaBotOrbState;
  style?: StyleProp<ViewStyle>;
}

// Palette lumineuse éclatante (aucune teinte sombre)
const BRIGHT_COLORS = {
  cyan: '#00F0FF',
  cyanGlow: '#38BDF8',
  azure: '#0090FF',
  royal: '#2563EB',
  magenta: '#FF1493',
  pink: '#F43F5E',
  coral: '#FDA4AF',
  lilac: '#C084FC',
  violetLight: '#E879F9',
  white: '#FFFFFF',
};

export const KharjaBotOrb: React.FC<KharjaBotOrbProps> = ({
  size = 44,
  animated = true,
  state = 'default',
  style,
}) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const currentAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!animated) {
      pulse.setValue(1);
      rotateAnim.setValue(0);
      translateY.setValue(0);
      return;
    }

    if (currentAnim.current) {
      currentAnim.current.stop();
    }

    if (state === 'thinking') {
      // ── ÉTAT THINKING : Tourbillon 360° rapide + pulsation rythmée ──
      translateY.setValue(0);
      const thinkingAnimation = Animated.parallel([
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1.09,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse, {
              toValue: 1,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
      ]);

      currentAnim.current = thinkingAnimation;
      thinkingAnimation.start();
    } else if (state === 'idle') {
      // ── ÉTAT IDLE : Flottement vertical doux + respiration vivante ──
      rotateAnim.setValue(0);
      const idleAnimation = Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -3.5,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1.05,
              duration: 1400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse, {
              toValue: 1,
              duration: 1400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
      ]);

      currentAnim.current = idleAnimation;
      idleAnimation.start();
    } else {
      // ── ÉTAT DEFAULT : Respiration douce apaisante ──
      translateY.setValue(0);
      rotateAnim.setValue(0);
      const defaultAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.035,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      currentAnim.current = defaultAnimation;
      defaultAnimation.start();
    }

    return () => {
      if (currentAnim.current) {
        currentAnim.current.stop();
      }
    };
  }, [animated, state]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          transform: [{ scale: pulse }, { translateY }],
        },
        style,
      ]}
    >
      {/* ── 1. HALO EXTÉRIEUR AURORA GLOW VIBRANT ── */}
      <View
        style={[
          styles.glow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            shadowColor: state === 'thinking' ? BRIGHT_COLORS.magenta : BRIGHT_COLORS.cyan,
          },
        ]}
      />

      {/* ── 2. CORPS DE LA SPHÈRE DE VERRE CRISTALLINE ── */}
      <View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {/* CALQUE TOURNANT INTERNE LORS DU THINKING */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          {/* FOND MULTICOLORE CLAIR & LUMINEUX */}
          <LinearGradient
            colors={[
              BRIGHT_COLORS.cyan,
              BRIGHT_COLORS.azure,
              BRIGHT_COLORS.royal,
              BRIGHT_COLORS.magenta,
              BRIGHT_COLORS.pink,
            ]}
            locations={[0, 0.25, 0.55, 0.8, 1]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />

          {/* RUBAN 1 : VAGUE LUMINEUSE EN S (MAGENTA & ROSE NÉON) */}
          <View
            style={[
              styles.neonRibbon1,
              {
                width: size * 1.1,
                height: size * 0.7,
                borderRadius: size * 0.45,
                top: size * 0.1,
                right: -size * 0.15,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(255, 20, 147, 0.85)',
                'rgba(244, 63, 94, 0.75)',
                'rgba(251, 113, 133, 0.35)',
                'transparent',
              ]}
              start={{ x: 0.8, y: 0.1 }}
              end={{ x: 0.1, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* RUBAN 2 : CONTRE-VAGUE ÉLECTRIQUE (CYAN & AZUR ÉCLATANT) */}
          <View
            style={[
              styles.neonRibbon2,
              {
                width: size * 1.05,
                height: size * 0.65,
                borderRadius: size * 0.4,
                bottom: -size * 0.05,
                left: -size * 0.15,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(0, 240, 255, 0.9)',
                'rgba(56, 189, 248, 0.7)',
                'rgba(0, 144, 255, 0.25)',
                'transparent',
              ]}
              start={{ x: 0.1, y: 0.9 }}
              end={{ x: 0.9, y: 0.1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* TOURBILLON LILAS CENTRAL */}
          <View
            style={[
              styles.centerSwirl,
              {
                width: size * 0.75,
                height: size * 0.75,
                borderRadius: size * 0.5,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(232, 121, 249, 0.5)',
                'rgba(192, 132, 252, 0.3)',
                'transparent',
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </Animated.View>

        {/* ── 3. REFLETS STATIQUES DE SURFACE EN VERRE (RESTE EN PLACE) ── */}

        {/* ARC CAUSTIQUE LUMINEUX CENTRAL BLANC */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.85)',
            'rgba(255, 255, 255, 0.25)',
            'transparent',
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.2, y: 0.4 }}
          end={{ x: 0.8, y: 0.7 }}
          style={[
            styles.causticArc,
            {
              width: size * 0.75,
              height: size * 0.15,
              borderRadius: size,
              top: size * 0.48,
              left: size * 0.12,
            },
          ]}
        />

        {/* REFLET SPÉCULAIRE SUPÉRIEUR EN CROISSANT */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.95)',
            'rgba(255, 255, 255, 0.45)',
            'transparent',
          ]}
          locations={[0, 0.4, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[
            styles.specularTop,
            {
              width: size * 0.65,
              height: size * 0.34,
              borderRadius: size,
              top: size * 0.07,
              left: size * 0.12,
            },
          ]}
        />

        {/* POINT D'ÉCLAT INTENSE */}
        <View
          style={[
            styles.intenseHighlight,
            {
              width: size * 0.14,
              height: size * 0.14,
              borderRadius: size,
              top: size * 0.14,
              left: size * 0.22,
            },
          ]}
        />

        {/* LUEUR CRISTALLINE INFÉRIEURE */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0, 240, 255, 0.4)',
            'rgba(255, 20, 147, 0.45)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bottomRim,
            {
              width: size * 0.88,
              height: size * 0.32,
              borderRadius: size,
              bottom: -size * 0.08,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

export default KharjaBotOrb;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    shadowOpacity: 0.75,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 8,
  },

  orb: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowColor: '#FF1493',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  neonRibbon1: {
    position: 'absolute',
    transform: [{ rotate: '-28deg' }],
  },

  neonRibbon2: {
    position: 'absolute',
    transform: [{ rotate: '32deg' }],
  },

  centerSwirl: {
    position: 'absolute',
    top: '12%',
    left: '12%',
  },

  causticArc: {
    position: 'absolute',
    transform: [{ rotate: '-18deg' }],
    opacity: 0.9,
  },

  specularTop: {
    position: 'absolute',
    transform: [{ rotate: '-12deg' }],
    opacity: 0.95,
  },

  intenseHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },

  bottomRim: {
    position: 'absolute',
    opacity: 0.85,
  },
});
