import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../../context/AppPreferencesContext';
import { useTranslation } from '../../hooks/useTranslation';
import { APP_PALETTES, type PaletteId, type ColorPalette } from '../../theme/palettes';

interface PalettePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PalettePickerModal: React.FC<PalettePickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, isDark, language, palette: activePaletteId, setPalette } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const getTitle = () => t('colorPaletteTitle');
  const getSubtitle = () => t('colorPaletteSubtitle');
  const getApplyText = () => t('paletteSaveDone');

  const handleSelect = (paletteId: PaletteId) => {
    setPalette(paletteId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {/* Header avec bouton fermer */}
          <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.headerIconBox, { backgroundColor: `${theme.primary}18` }]}>
              <Ionicons name="color-palette" size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text
                style={[
                  styles.title,
                  { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {getTitle()}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' },
                ]}
                numberOfLines={2}
              >
                {getSubtitle()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
            >
              <Ionicons name="close" size={20} color={theme.textMain} />
            </TouchableOpacity>
          </View>

          {/* Liste des Palettes Développées */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {APP_PALETTES.map((item: ColorPalette) => {
              const isSelected = item.id === activePaletteId;
              const name = language === 'ar' ? item.nameAr : language === 'en' ? item.nameEn : item.nameFr;
              const tagline = language === 'ar' ? item.taglineAr : language === 'en' ? item.taglineEn : item.taglineFr;
              const activeGradient = isDark ? item.dark.headerGradient : item.light.headerGradient;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(item.id)}
                  style={[
                    styles.paletteCard,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isSelected ? theme.primary : theme.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  {/* Bande de dégradé en haut de chaque carte */}
                  <LinearGradient
                    colors={activeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientStripe}
                  />

                  <View style={[styles.paletteCardBody, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {/* Indicateur Radio */}
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected ? theme.primary : theme.textSub,
                          backgroundColor: isSelected ? theme.primary : 'transparent',
                        },
                      ]}
                    >
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>

                    {/* Nom & Description */}
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.paletteName, { color: theme.textMain }]}>
                          {name}
                        </Text>
                        {isSelected && (
                          <View style={[styles.activeBadge, { backgroundColor: `${theme.primary}20` }]}>
                            <Text style={[styles.activeBadgeText, { color: theme.primary }]}>
                              {t('paletteActiveBadge')}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.paletteTagline,
                          { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {tagline}
                      </Text>
                    </View>

                    {/* Pastilles de couleurs prévisualisées */}
                    <View style={[styles.previewDotsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      {item.previewColors.map((hex, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.colorDot,
                            {
                              backgroundColor: hex,
                              marginLeft: isRTL ? 0 : -6,
                              marginRight: isRTL ? -6 : 0,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bouton de confirmation en bas */}
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
            activeOpacity={0.88}
          >
            <Text style={styles.applyButtonText}>{getApplyText()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 6,
    gap: 12,
  },
  paletteCard: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientStripe: {
    height: 6,
    width: '100%',
  },
  paletteCardBody: {
    padding: 14,
    alignItems: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteName: {
    fontSize: 15,
    fontWeight: '800',
  },
  activeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  paletteTagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },
  previewDotsContainer: {
    alignItems: 'center',
    paddingLeft: 8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  applyButton: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
