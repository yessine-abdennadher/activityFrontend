import React, { useEffect, useRef, useState } from 'react';
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
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { usePreferences } from '../../context/AppPreferencesContext';
import type { ThemeColors } from '../../theme/theme';

export interface ScrollableModalProps {
  /** Contrôle la visibilité du modal */
  visible: boolean;
  /** Callback de fermeture (déclenché par swipe bas, tap backdrop ou bouton retour) */
  onClose: () => void;
  /** Contenu du modal */
  children: React.ReactNode;
  /** Titre optionnel en haut du modal */
  title?: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Hauteur maximale du modal (par ex: 500, '80%', etc.) */
  height?: number | `${number}%`;
  /** Permet de fermer en touchant le fond sombre à l'extérieur (défaut: true) */
  dismissOnBackdropPress?: boolean;
  /** Thème optionnel surchargé */
  theme?: ThemeColors;
  /** Style personnalisé pour le conteneur du contenu */
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_DRAG_THRESHOLD = 110; // Distance de glissement vers le bas pour fermer
const VELOCITY_THRESHOLD = 0.55; // Vitesse de glissement vers le bas pour fermer

/**
 * Modal BottomSheet tactile scrollable vers le haut et vers le bas, SANS bouton fermer.
 * Se ferme par glissement vers le bas (swipe down), toucher à l'extérieur ou retour matériel Android.
 */
export const ScrollableModal: React.FC<ScrollableModalProps> = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  height = '82%',
  dismissOnBackdropPress = true,
  theme: customTheme,
  contentContainerStyle,
}) => {
  const { theme: ctxTheme, isDark } = usePreferences();
  const theme = customTheme || ctxTheme;

  // Animation de translation verticale (glissement)
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // Animation du fondu sombre en arrière-plan
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // État local pour gérer l'affichage avant la fin de l'animation de sortie
  const [modalVisible, setModalVisible] = useState(visible);
  // Empêche les déclenchements multiples de fermeture
  const isClosingRef = useRef(false);

  // Synchronisation avec la prop visible
  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setModalVisible(true);
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
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
  }, [visible]);

  // Gestion du bouton physique retour Android
  useEffect(() => {
    if (!modalVisible) return;

    const onBackPress = () => {
      handleRequestClose();
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, [modalVisible]);

  /**
   * Anime la sortie fluide vers le bas puis déclenche onClose
   */
  const animateClose = (callback?: () => void) => {
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
      if (callback) {
        callback();
      } else {
        onClose();
      }
    });
  };

  const handleRequestClose = () => {
    animateClose(onClose);
  };

  /**
   * PanResponder pour intercepter le glissement (swipe vers le bas) sur la poignée
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Détecter un déplacement vertical
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Ne permettre que le déplacement vers le bas (dy > 0), avec résistance si vers le haut
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        } else {
          // Résistance élastique subtile vers le haut
          translateY.setValue(gestureState.dy * 0.15);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Si le glissement dépasse le seuil ou avec une vitesse suffisante vers le bas
        if (
          gestureState.dy > DISMISS_DRAG_THRESHOLD ||
          (gestureState.dy > 30 && gestureState.vy > VELOCITY_THRESHOLD)
        ) {
          animateClose(onClose);
        } else {
          // Retour élastique fluide à la position ouverte
          Animated.spring(translateY, {
            toValue: 0,
            damping: 22,
            stiffness: 240,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!modalVisible) return null;

  // Calcul dynamique de la hauteur du conteneur
  const containerHeightStyle =
    typeof height === 'string'
      ? { maxHeight: height }
      : { maxHeight: Math.min(height, SCREEN_HEIGHT * 0.92) };

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={handleRequestClose}
      statusBarTranslucent
    >
      <View style={styles.backdropWrapper}>
        {/* Fond sombre cliquable pour fermer sans bouton */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (dismissOnBackdropPress) {
              handleRequestClose();
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
            containerHeightStyle,
            {
              backgroundColor: theme.cardBg || (isDark ? '#0F172A' : '#FFFFFF'),
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Zone de poignée tactile (Drag Handle) - Intercepte les gestes tactiles vers le bas */}
          <View style={styles.dragZone} {...panResponder.panHandlers}>
            {/* Barre indicatrice de glissement (Pill) */}
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

            {/* En-tête optionnel (Titre + sous-titre) */}
            {Boolean(title) && (
              <View style={styles.headerTextBlock}>
                <Text
                  style={[
                    styles.sheetTitle,
                    { color: theme.textMain || (isDark ? '#FFFFFF' : '#0F172A') },
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
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
            )}
          </View>

          {/* Contenu Déroulant (Scrollable vers le haut et vers le bas) */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={true}
            overScrollMode="always"
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1.2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 20,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
  },
  dragZone: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    marginBottom: 8,
  },
  headerTextBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sheetSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  scrollArea: {
    flexGrow: 0,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
});

export default ScrollableModal;
