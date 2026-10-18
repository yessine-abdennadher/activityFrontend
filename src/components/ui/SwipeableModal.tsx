/**
 * SwipeableModal.tsx
 * Composant Modal / BottomSheet universel pour l'ensemble de l'application ActivityTN.
 *
 * Fonctionnalités clés :
 * - Fermeture naturelle par geste de glissement vers le bas (Swipe-down to dismiss)
 * - Poignée tactile ergonomique (Drag handle pill)
 * - Synchronisation dynamique avec le ScrollView (détecte le défilement haut/bas sans conflit de geste)
 * - Support complet Thème Clair / Thème Sombre & Palettes
 * - Rétroaction élastique fluide (Spring physics) & fermeture sur seuil de vélocité
 * - Gestion du bouton retour physique Android (Hardware BackHandler)
 * - Tap sur le fond sombre (Backdrop) pour fermer
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  BackHandler,
  NativeSyntheticEvent,
  NativeScrollEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { usePreferences } from '../../context/AppPreferencesContext';
import type { ThemeColors } from '../../theme/theme';

export interface SwipeableModalProps {
  /** Contrôle la visibilité du modal */
  visible: boolean;
  /** Callback de fermeture (déclenché par swipe bas, tap backdrop ou bouton retour) */
  onClose: () => void;
  /** Contenu affiché dans le modal */
  children: React.ReactNode;
  /** Titre optionnel dans l'en-tête */
  title?: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Élément optionnel à droite de l'en-tête (ex: bouton de fermeture, icône d'action) */
  headerRight?: React.ReactNode;
  /** Hauteur du modal (ex: '85%', '92%', '100%' ou un nombre de pixels) */
  height?: number | `${number}%`;
  /** Afficher la poignée tactile supérieure (pilule de glissement) - Défaut: true */
  showHandle?: boolean;
  /** Permet de fermer en touchant l'arrière-plan sombre - Défaut: true */
  dismissOnBackdropPress?: boolean;
  /** Si true, désactive le ScrollView interne pour laisser le composant enfant gérer son propre scroll */
  disableInternalScroll?: boolean;
  /** Thème optionnel pour surcharger le thème du contexte */
  theme?: ThemeColors;
  /** Style personnalisé pour le conteneur du contenu */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Style personnalisé pour la feuille (sheet) */
  sheetStyle?: StyleProp<ViewStyle>;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_DRAG_THRESHOLD = 115; // Distance en pixels pour déclencher la fermeture
const VELOCITY_THRESHOLD = 0.5; // Vitesse de balayage pour fermeture instantanée

export const SwipeableModal: React.FC<SwipeableModalProps> = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  headerRight,
  height = '85%',
  showHandle = true,
  dismissOnBackdropPress = true,
  disableInternalScroll = false,
  theme: customTheme,
  contentContainerStyle,
  sheetStyle,
}) => {
  const { theme: ctxTheme, isDark } = usePreferences();
  const theme = customTheme || ctxTheme;

  // Animation de translation verticale (glissement haut/bas)
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // Animation d'opacité du fond assombri
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Gestion de la visibilité pour laisser l'animation de sortie se terminer
  const [modalVisible, setModalVisible] = useState(visible);
  const isClosingRef = useRef(false);

  // Position du scroll interne pour éviter le conflit geste/défilement
  const scrollOffsetRef = useRef(0);
  const isAtTopRef = useRef(true);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollOffsetRef.current = offsetY;
    isAtTopRef.current = offsetY <= 2;
  }, []);

  /**
   * Animation de fermeture fluide
   */
  const animateClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      isClosingRef.current = false;
      onClose();
    });
  }, [backdropOpacity, translateY, onClose]);

  // Synchronisation avec la prop `visible`
  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setModalVisible(true);
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 24,
          mass: 0.9,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible && !isClosingRef.current) {
      animateClose();
    }
  }, [visible, modalVisible, animateClose, backdropOpacity, translateY]);

  // Gestion de la touche retour matérielle (Android)
  useEffect(() => {
    if (!modalVisible) return;

    const onBackPress = () => {
      animateClose();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [modalVisible, animateClose]);

  /**
   * PanResponder pour la zone de poignée et d'en-tête (interception garantie du swipe bas)
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Intercepte si mouvement vertical significatif
        return Math.abs(gestureState.dy) > 4;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Glissement vers le bas : suit fidèlement le doigt
          translateY.setValue(gestureState.dy);
        } else {
          // Résistance élastique vers le haut
          translateY.setValue(gestureState.dy * 0.15);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (
          gestureState.dy > DISMISS_DRAG_THRESHOLD ||
          (gestureState.dy > 25 && gestureState.vy > VELOCITY_THRESHOLD)
        ) {
          animateClose();
        } else {
          // Retour élastique dynamique à la position d'origine
          Animated.spring(translateY, {
            toValue: 0,
            damping: 22,
            stiffness: 250,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!modalVisible) return null;

  // Calcul dynamique de la hauteur de la feuille
  const sheetHeightStyle =
    typeof height === 'string'
      ? { height, maxHeight: height }
      : { height, maxHeight: Math.min(height, SCREEN_HEIGHT * 0.96) };

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={animateClose}
      statusBarTranslucent
    >
      <View style={styles.backdropWrapper}>
        {/* Fond assombri avec détection du toucher pour fermer */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (dismissOnBackdropPress) {
              animateClose();
            }
          }}
        >
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.65],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Feuille Bottom Sheet animée */}
        <Animated.View
          style={[
            styles.sheetContainer,
            sheetHeightStyle,
            {
              backgroundColor: theme.cardBg || (isDark ? '#0F172A' : '#FFFFFF'),
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              transform: [{ translateY }],
            },
            sheetStyle,
          ]}
        >
          {/* Zone de poignée tactile (Drag Handle Zone) */}
          <View style={styles.dragZone} {...panResponder.panHandlers}>
            {showHandle && (
              <View
                style={[
                  styles.handleBar,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'rgba(0, 0, 0, 0.22)',
                  },
                ]}
              />
            )}

            {/* En-tête optionnel (Titre, sous-titre, action droite) */}
            {(Boolean(title) || Boolean(headerRight)) && (
              <View style={styles.headerRow}>
                <View style={styles.headerTextCol}>
                  {Boolean(title) && (
                    <Text
                      style={[
                        styles.sheetTitle,
                        { color: theme.textMain || (isDark ? '#FFFFFF' : '#0F172A') },
                      ]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                  )}
                  {Boolean(subtitle) && (
                    <Text
                      style={[
                        styles.sheetSubtitle,
                        { color: theme.textMuted || (isDark ? '#94A3B8' : '#64748B') },
                      ]}
                      numberOfLines={1}
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>

                {headerRight && <View style={styles.headerRightBox}>{headerRight}</View>}
              </View>
            )}
          </View>

          {/* Corps de la modale */}
          {disableInternalScroll ? (
            <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
          ) : (
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
              showsVerticalScrollIndicator={false}
              bounces={true}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 24,
  },
  dragZone: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    marginBottom: 8,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 6,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  staticContent: {
    flex: 1,
  },
});

export default SwipeableModal;
