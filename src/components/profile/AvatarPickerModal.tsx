import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePreferences } from '../../context/AppPreferencesContext';
import { useTranslation } from '../../hooks/useTranslation';
import { SwipeableModal } from '../ui/SwipeableModal';
import { uploadImage } from '../../services/uploadService';

// Collection d'avatars stylés, modernes et diversifiés (qualité HD Unsplash)
export const PRESET_AVATARS = [
  {
    id: 'tunis-guy-1',
    label: 'Rayen',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'tunis-girl-1',
    label: 'Yasmine',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'tunis-guy-2',
    label: 'Aziz',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'tunis-girl-2',
    label: 'Mariem',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'pro-guy',
    label: 'Mehdi',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cool-girl',
    label: 'Sarra',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'creative-guy',
    label: 'Karim',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'active-girl',
    label: 'Nour',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
];

interface AvatarPickerModalProps {
  visible: boolean;
  currentAvatar?: string;
  onClose: () => void;
  onSelectAvatar: (avatarUri: string) => void | Promise<void>;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  currentAvatar,
  onClose,
  onSelectAvatar,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const [selectedUri, setSelectedUri] = useState<string>(currentAvatar || PRESET_AVATARS[0].url);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  React.useEffect(() => {
    if (currentAvatar) {
      setSelectedUri(currentAvatar);
    }
  }, [currentAvatar, visible]);

  // Choisir depuis la bibliothèque de photos et téléverser sur Cloudinary
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          language === 'ar' ? 'الإذن مطلوب' : 'Permission requise',
          language === 'ar'
            ? 'يرجى السماح بالوصول إلى معرض الصور لاختيار صورتك الشخصية.'
            : 'Veuillez autoriser l’accès à la galerie photos pour choisir votre avatar.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.base64) {
          Alert.alert(
            language === 'ar' ? 'خطأ' : 'Erreur',
            language === 'ar'
              ? 'تعذر قراءة بيانات الصورة المحددة.'
              : 'Impossible de récupérer les données de l’image sélectionnée.'
          );
          return;
        }

        setIsLoading(true);
        const mimeType = asset.mimeType || 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${asset.base64}`;

        const uploadRes = await uploadImage(base64Data, 'avatars');
        if (uploadRes && uploadRes.url) {
          setSelectedUri(uploadRes.url);
          Alert.alert(
            language === 'ar' ? 'تم الرفع بنجاح! 📸' : 'Téléversement réussi ! 📸',
            language === 'ar'
              ? 'تم رفع صورتك الشخصية بنجاح وحفظها بأمان على السحابة.'
              : 'Votre avatar a été téléversé et sécurisé sur Cloudinary avec succès.'
          );
        }
      }
    } catch (err: any) {
      console.warn('[AvatarPickerModal] Erreur sélection galerie:', err);
      Alert.alert(
        language === 'ar' ? 'خطأ في التحميل' : 'Échec du téléversement',
        err.message ||
          (language === 'ar'
            ? 'حدث خطأ أثناء رفع الصورة.'
            : 'Une erreur est survenue lors de l’envoi de votre photo.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Prendre une photo avec la caméra et téléverser sur Cloudinary
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          language === 'ar' ? 'الإذن مطلوب' : 'Permission requise',
          language === 'ar'
            ? 'يرجى السماح بالوصول إلى الكاميرا لالتقاط صورة شخصية.'
            : 'Veuillez autoriser l’accès à l’appareil photo pour prendre un selfie.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.base64) {
          Alert.alert(
            language === 'ar' ? 'خطأ' : 'Erreur',
            language === 'ar'
              ? 'تعذر قراءة بيانات الصورة الملتقطة.'
              : 'Impossible de récupérer les données de la photo prise.'
          );
          return;
        }

        setIsLoading(true);
        const mimeType = asset.mimeType || 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${asset.base64}`;

        const uploadRes = await uploadImage(base64Data, 'avatars');
        if (uploadRes && uploadRes.url) {
          setSelectedUri(uploadRes.url);
          Alert.alert(
            language === 'ar' ? 'تم الرفع بنجاح! 📸' : 'Téléversement réussi ! 📸',
            language === 'ar'
              ? 'تم رفع صورتك الشخصية بنجاح وحفظها بأمان على السحابة.'
              : 'Votre avatar a été téléversé et sécurisé sur Cloudinary avec succès.'
          );
        }
      }
    } catch (err: any) {
      console.warn('[AvatarPickerModal] Erreur caméra:', err);
      Alert.alert(
        language === 'ar' ? 'خطأ في التحميل' : 'Échec du téléversement',
        err.message ||
          (language === 'ar'
            ? 'حدث خطأ أثناء رفع الصورة.'
            : 'Une erreur est survenue lors de l’envoi de votre photo.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedUri) return;
    setIsLoading(true);
    try {
      await onSelectAvatar(selectedUri);
      onClose();
    } catch (err) {
      console.warn('[AvatarPickerModal] Erreur confirmation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SwipeableModal
      visible={visible}
      onClose={onClose}
      height="90%"
      showHandle={true}
      disableInternalScroll={true}
    >
      <View style={styles.modalInner}>
          {/* Header */}
          <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('changeAvatarTitle')}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('changeAvatarSubtitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Live Preview Avatar */}
            <View style={styles.previewContainer}>
              <View style={[styles.avatarRing, { borderColor: theme.primary }]}>
                <Image source={{ uri: selectedUri }} style={styles.previewAvatar} />
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                )}
              </View>
            </View>

            {/* Quick Action Buttons (Gallery & Camera) */}
            <View style={[styles.actionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isDark ? 'rgba(56,189,248,0.12)' : '#E0F2FE',
                    borderColor: isDark ? 'rgba(56,189,248,0.25)' : '#BAE6FD',
                  },
                ]}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Ionicons name="images" size={22} color={theme.primary} />
                <Text style={[styles.actionButtonText, { color: theme.textMain }]}>
                  {t('chooseFromGallery')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isDark ? 'rgba(168,85,247,0.12)' : '#F3E8FF',
                    borderColor: isDark ? 'rgba(168,85,247,0.25)' : '#E9D5FF',
                  },
                ]}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Ionicons name="camera" size={22} color="#A855F7" />
                <Text style={[styles.actionButtonText, { color: theme.textMain }]}>
                  {t('takePhoto')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preset Avatars Collection */}
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('choosePresetAvatar')}
              </Text>
            </View>

            <View style={[styles.presetGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {PRESET_AVATARS.map((item) => {
                const isSelected = selectedUri === item.url;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.presetCard,
                      {
                        borderColor: isSelected ? theme.primary : 'transparent',
                        borderWidth: isSelected ? 3 : 1,
                        backgroundColor: theme.bgSecondary,
                      },
                    ]}
                    onPress={() => setSelectedUri(item.url)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.url }} style={styles.presetImage} />
                    {isSelected && (
                      <View style={[styles.selectedCheckBadge, { backgroundColor: theme.primary }]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.presetName,
                        { color: isSelected ? theme.primary : theme.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Safe Cloud Storage & Security Info Badge */}
            <View
              style={[
                styles.secureBadge,
                {
                  backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
                  borderColor: isDark ? 'rgba(16,185,129,0.25)' : '#A7F3D0',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.secureBadgeTitle,
                    { color: isDark ? '#34D399' : '#065F46', textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {language === 'ar'
                    ? 'رفع سحابي آمن وتشفير فائق'
                    : language === 'en'
                    ? 'Secure Cloud CDN Storage'
                    : 'Stockage Cloud CDN Sécurisé'}
                </Text>
                <Text
                  style={[
                    styles.secureBadgeSub,
                    { color: isDark ? '#A7F3D0' : '#047857', textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {language === 'ar'
                    ? 'يتم تحسين الصور وتقديمها عبر Cloudinary دون الحاجة لروابط خارجية.'
                    : language === 'en'
                    ? 'Photos are safely compressed and served via Cloudinary CDN without external links.'
                    : 'Vos photos sont compressées et distribuées via Cloudinary CDN sans lien externe arbitraire.'}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={[styles.bottomRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
              onPress={handleConfirm}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>{t('saveAvatar')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SwipeableModal>
    );
  };

const styles = StyleSheet.create({
  modalInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingVertical: 16,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3.5,
    padding: 3,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  presetGrid: {
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  presetCard: {
    width: '22%',
    aspectRatio: 0.85,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  presetImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetName: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  secureBadgeTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  secureBadgeSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  bottomRow: {
    gap: 12,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
