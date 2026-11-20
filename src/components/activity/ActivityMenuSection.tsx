import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { ActivityMenuData } from '../../types';

interface ActivityMenuSectionProps {
  menu?: ActivityMenuData;
  menuImageUrl?: string;
  menuUrl?: string;
  theme: ThemeColors;
  isDark: boolean;
  language?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ActivityMenuSection: React.FC<ActivityMenuSectionProps> = ({
  menu,
  menuImageUrl,
  menuUrl,
  theme,
  isDark,
  language = 'fr',
}) => {
  const sections = menu?.sections || [];
  const hasSections = sections.length > 0;
  const photoUrl = menuImageUrl || (menu?.images && menu.images.length > 0 ? menu.images[0] : null);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    hasSections ? sections[0].id : ''
  );
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);

  // Si aucun menu n'est renseigné (ni sections écrites, ni photo), ne rien afficher
  if (!hasSections && !photoUrl) {
    return null;
  }

  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      {/* En-tête de section */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="restaurant" size={20} color="#4F46E5" />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              {language === 'ar' ? 'قائمة الأسعار والوجبات' : 'Carte & Menu des prix'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              {hasSections
                ? `${sections.reduce((acc, s) => acc + s.items.length, 0)} articles disponibles`
                : 'Consultez la carte officielle'}
            </Text>
          </View>
        </View>

        {photoUrl && (
          <TouchableOpacity
            style={[styles.viewPhotoPill, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}
            onPress={() => setPhotoViewerOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="image-outline" size={14} color="#4F46E5" />
            <Text style={styles.viewPhotoPillText}>
              {language === 'ar' ? 'صورة المنيو' : 'Voir la carte'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Onglets des catégories si le menu est écrit */}
      {hasSections && sections.length > 1 && (
        <View style={styles.categoriesRow}>
          {sections.map((sec) => {
            const isSelected = sec.id === (currentSection?.id || '');
            return (
              <TouchableOpacity
                key={sec.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? '#4F46E5'
                      : isDark
                      ? '#1E293B'
                      : '#F1F5F9',
                    borderColor: isSelected ? '#4F46E5' : theme.cardBorder,
                  },
                ]}
                onPress={() => setSelectedSectionId(sec.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textMain },
                  ]}
                >
                  {sec.title} ({sec.items.length})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Liste des Plats & Prix en 2 Colonnes */}
      {hasSections && currentSection && (
        <View style={[styles.itemsListContainer, { backgroundColor: isDark ? '#0F172A40' : '#F8FAFC' }]}>
          {currentSection.items.length === 0 ? (
            <Text style={[styles.emptySectionText, { color: theme.textMuted }]}>
              Aucun article dans cette rubrique.
            </Text>
          ) : (
            currentSection.items.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[
                  styles.itemRow,
                  {
                    borderBottomColor: theme.cardBorder,
                    borderBottomWidth: idx === currentSection.items.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.textMain }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text style={[styles.itemDesc, { color: theme.textMuted }]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.itemPrice}>
                  {Number(item.price).toFixed(1)} DT
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Si seulement photo disponible (sans sections écrites) */}
      {!hasSections && photoUrl && (
        <TouchableOpacity
          style={styles.photoBannerWrapper}
          onPress={() => setPhotoViewerOpen(true)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: photoUrl }} style={styles.photoBanner} resizeMode="cover" />
          <View style={styles.photoOverlay}>
            <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
            <Text style={styles.photoOverlayText}>
              {language === 'ar' ? 'اضغط لتكبير صورة المنيو' : 'Toucher pour agrandir la carte'}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Modale plein écran pour zoomer sur la photo de la carte */}
      {photoUrl && (
        <Modal
          visible={photoViewerOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPhotoViewerOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPhotoViewerOpen(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={{ uri: photoUrl }}
              style={styles.modalFullImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  viewPhotoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewPhotoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemsListContainer: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },
  emptySectionText: {
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  photoBannerWrapper: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  photoBanner: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  photoOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFullImage: {
    width: SCREEN_WIDTH,
    height: '80%',
  },
});
