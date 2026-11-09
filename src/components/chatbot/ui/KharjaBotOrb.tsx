/**
 * KharjaBotOrb.tsx
 * Orbe 3D cristallin hyper-réaliste 100% vectoriel (Physically-Inspired Glass Shader).
 *
 * Techniques de rendu 3D optique intégrées :
 * 1. Volume sphérique & Effet Fresnel : Réfraction courbée vers les bords pour un galbe 3D parfait.
 * 2. Cœur interne lumineux (Caustic Core) : Point focal interne diffusant la lumière pastel.
 * 3. Double reflet spéculaire bombé (Specular Highlights) : Reflet principal en croissant courbé + micro-éclat pinpoint.
 * 4. Caustique de rebond opposé (Bounce Light) : Rebond de lumière en bas à droite pour la profondeur cristalline.
 * 5. Coquille de verre poli (Glass Shell) : Fine bordure réfractive translucide de 1px.
 * 6. Ombre volumétrique au sol (Ambient Occlusion) : Ancre la sphère en 3D dans l'espace.
 *
 * Palette pastel officielle Tfarhida :
 * ['#FCE3E4', '#C2A9FA', '#8CBBF8', '#DBCDFD']
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

// Palette pastel officielle Tfarhida
const PASTEL_COLORS = {
  roseBlush: '#FCE3E4',
  lilac: '#C2A9FA',
  skyBlue: '#8CBBF8',
  periwinkle: '#DBCDFD',
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
      {/* ── 0. OMBRE VOLUMÉTRIQUE AU SOL (AMBIENT OCCLUSION) ── */}
      <View
        style={[
          styles.groundShadow,
          {
            width: size * 0.7,
            height: size * 0.16,
            borderRadius: size * 0.1,
            bottom: -size * 0.08,
          },
        ]}
      />

      {/* ── 1. HALO EXTÉRIEUR AURORA GLOW PASTEL ── */}
      <View
        style={[
          styles.glow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            shadowColor: state === 'thinking' ? PASTEL_COLORS.lilac : PASTEL_COLORS.skyBlue,
          },
        ]}
      />

      {/* ── 2. CORPS DE LA SPHÈRE DE VERRE 3D ── */}
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
          {/* FOND MULTICOLORE PASTEL DOUX EN PROFONDEUR */}
          <LinearGradient
            colors={[
              PASTEL_COLORS.skyBlue,
              PASTEL_COLORS.lilac,
              PASTEL_COLORS.periwinkle,
              PASTEL_COLORS.roseBlush,
            ]}
            locations={[0, 0.32, 0.65, 1]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />

          {/* CŒUR LUMINEUX INTERNE (CAUSTIC CORE) */}
          <View
            style={[
              styles.causticCore,
              {
                width: size * 0.62,
                height: size * 0.62,
                borderRadius: size * 0.31,
                top: size * 0.08,
                left: size * 0.08,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.65)',
                'rgba(140, 187, 248, 0.45)',
                'rgba(194, 169, 250, 0.15)',
                'transparent',
              ]}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.8, y: 0.8 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* RUBAN 1 : VAGUE LUMINEUSE EN S (ROSE BLUSH PASTEL) */}
          <View
            style={[
              styles.neonRibbon1,
              {
                width: size * 1.15,
                height: size * 0.72,
                borderRadius: size * 0.45,
                top: size * 0.08,
                right: -size * 0.18,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(252, 227, 228, 0.95)',
                'rgba(219, 205, 253, 0.75)',
                'rgba(194, 169, 250, 0.35)',
                'transparent',
              ]}
              start={{ x: 0.8, y: 0.1 }}
              end={{ x: 0.1, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* RUBAN 2 : CONTRE-VAGUE CRISTALLINE (BLEU CIEL DOUX) */}
          <View
            style={[
              styles.neonRibbon2,
              {
                width: size * 1.1,
                height: size * 0.68,
                borderRadius: size * 0.4,
                bottom: -size * 0.06,
                left: -size * 0.16,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(140, 187, 248, 0.95)',
                'rgba(194, 169, 250, 0.7)',
                'rgba(252, 227, 228, 0.3)',
                'transparent',
              ]}
              start={{ x: 0.1, y: 0.9 }}
              end={{ x: 0.9, y: 0.1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* TOURBILLON PERVENCHE / LILAS CENTRAL */}
          <View
            style={[
              styles.centerSwirl,
              {
                width: size * 0.78,
                height: size * 0.78,
                borderRadius: size * 0.5,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(194, 169, 250, 0.65)',
                'rgba(219, 205, 253, 0.45)',
                'transparent',
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </Animated.View>

        {/* ── 3. GRADIENT DE VOLUME SPHÉRIQUE FRESNEL (COURBURE 3D) ── */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.25)',
            'transparent',
            'rgba(140, 187, 248, 0.15)',
            'rgba(194, 169, 250, 0.35)',
          ]}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.95, y: 0.95 }}
          style={StyleSheet.absoluteFill}
        />

        {/* ── 4. CAUSTIQUE DE REBOND OPPOSÉ (BOUNCE LIGHT BAS-DROIT) ── */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(194, 169, 250, 0.45)',
            'rgba(252, 227, 228, 0.85)',
          ]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.9, y: 0.9 }}
          style={[
            styles.bounceLight,
            {
              width: size * 0.72,
              height: size * 0.72,
              borderRadius: size * 0.36,
              bottom: -size * 0.12,
              right: -size * 0.12,
            },
          ]}
        />

        {/* ── 5. REFLETS STATIQUES DE SURFACE EN VERRE CRISTALLIN ── */}

        {/* ARC CAUSTIQUE LUMINEUX CENTRAL BLANC */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.88)',
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

        {/* REFLET SPÉCULAIRE PRINCIPAL BOMBÉ (GLOSS PILLOW) */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.98)',
            'rgba(255, 255, 255, 0.55)',
            'rgba(255, 255, 255, 0.05)',
            'transparent',
          ]}
          locations={[0, 0.3, 0.75, 1]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[
            styles.specularTop,
            {
              width: size * 0.62,
              height: size * 0.32,
              borderRadius: size * 0.3,
              top: size * 0.07,
              left: size * 0.12,
            },
          ]}
        />

        {/* MICRO-ÉCLAT PINPOINT SECONDARY HIGHLIGHT */}
        <View
          style={[
            styles.pinpointHighlight,
            {
              width: size * 0.12,
              height: size * 0.12,
              borderRadius: size * 0.06,
              top: size * 0.15,
              left: size * 0.24,
            },
          ]}
        />

        {/* ── 6. COQUILLE DE VERRE POLI (GLASS SHELL TRANSLUCIDE 1px) ── */}
        <View
          style={[
            styles.glassShell,
            {
              borderRadius: size / 2,
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

  groundShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(140, 187, 248, 0.22)',
    shadowColor: '#8CBBF8',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(140, 187, 248, 0.15)',
    shadowOpacity: 0.7,
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
    shadowColor: '#C2A9FA',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 6,
  },

  causticCore: {
    position: 'absolute',
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
    top: '10%',
    left: '10%',
  },

  bounceLight: {
    position: 'absolute',
  },

  causticArc: {
    position: 'absolute',
    transform: [{ rotate: '-18deg' }],
    opacity: 0.9,
  },

  specularTop: {
    position: 'absolute',
    transform: [{ rotate: '-16deg' }],
    opacity: 0.98,
  },

  pinpointHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },

  glassShell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
});
