import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../services/uploadService';
import { ThemeColors } from '../../theme/theme';
import { PartnerActivityItem } from '../../types';
import { SwipeableModal } from '../ui/SwipeableModal';

interface PartnerProEventModalProps {
  visible: boolean;
  targetActivity: PartnerActivityItem | null;
  title: string;
  image?: string;
  date: string;
  time: string;
  price?: string;
  desc: string;
  theme: ThemeColors;
  isDark: boolean;
  onTitleChange: (val: string) => void;
  onImageChange?: (val: string) => void;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  onPriceChange?: (val: string) => void;
  onDescChange: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const PartnerProEventModal: React.FC<PartnerProEventModalProps> = ({
  visible,
  targetActivity,
  title,
  image = '',
  date,
  time,
  price = '',
  desc,
  theme,
  isDark,
  onTitleChange,
  onImageChange,
  onDateChange,
  onTimeChange,
  onPriceChange,
  onDescChange,
  onClose,
  onSave,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handlePickEventImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l’accès à vos photos pour uploader l’affiche de la soirée.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.base64) {
          Alert.alert('Erreur', 'Impossible de récupérer les données de l’affiche.');
          return;
        }

        setUploadingImage(true);
        const mimeType = asset.mimeType || 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${asset.base64}`;

        const uploadRes = await uploadImage(base64Data, 'activities');
        if (uploadRes && uploadRes.url && onImageChange) {
          onImageChange(uploadRes.url);
          Alert.alert('Affiche uploadée ! 📸', 'L’affiche de la soirée a été téléversée sur Cloudinary.');
        }
      }
    } catch (err: any) {
      console.error('[PartnerProEventModal] Erreur upload:', err.message);
      Alert.alert('Échec de l’upload', err.message || 'Une erreur est survenue lors de l’upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <SwipeableModal
      visible={visible}
      onClose={onClose}
      height="85%"
      showHandle={true}
      disableInternalScroll={true}
    >
      <View style={styles.modalInner}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Text style={{ fontSize: 18 }}>🎵</Text>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                Organiser un Événement / Soirée (Pro ⭐)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={[styles.modalHelpText, { color: theme.textMuted }]}>
              Annoncez une soirée musicale, dégustation avec DJ ou animation pour {targetActivity?.name}.
            </Text>

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Nom de l'événement :</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="Ex: Soirée Acoustique & Guitare Live"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={onTitleChange}
            />

            {/* Affiche de l'événement (Upload sécurisé Cloudinary) */}
            <View style={{ marginTop: 4, marginBottom: 12 }}>
              <Text style={[styles.inputLabel, { color: theme.textMuted, marginBottom: 6 }]}>
                Affiche de l'événement (Hébergée sur Cloudinary CDN) :
              </Text>

              {image ? (
                <View style={{ marginBottom: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.cardBorder }}>
                  <Image source={{ uri: image }} style={{ width: '100%', height: 140 }} resizeMode="cover" />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                    onPress={() => onImageChange && onImageChange('')}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                  borderColor: theme.primary,
                  borderWidth: 1.5,
                  borderStyle: image ? 'solid' : 'dashed',
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
                onPress={handlePickEventImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>
                      Téléversement vers Cloudinary...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name={image ? 'images' : 'cloud-upload'} size={18} color={theme.primary} />
                    <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>
                      {image ? 'Changer l\'affiche' : '📷 Choisir l\'affiche (Galerie)'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Date :</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: theme.textMain,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                  placeholder="Ex: Samedi 18 Octobre"
                  placeholderTextColor={theme.textMuted}
                  value={date}
                  onChangeText={onDateChange}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Heure :</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: theme.textMain,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                  placeholder="21:00"
                  placeholderTextColor={theme.textMuted}
                  value={time}
                  onChangeText={onTimeChange}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Prix d'entrée (DT) :</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="Ex: 20 (ou 0 pour Entrée libre)"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={onPriceChange}
            />

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Description de la soirée :</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              multiline
              numberOfLines={2}
              placeholder="Détails de l'ambiance, artistes présents..."
              placeholderTextColor={theme.textMuted}
              value={desc}
              onChangeText={onDescChange}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={onSave}>
              <Text style={styles.submitBtnText}>Publier la Soirée Live 🎶</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
    </SwipeableModal>
  );
};

const styles = StyleSheet.create({
  modalInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalHelpText: {
    fontSize: 12,
    marginBottom: 12,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  submitBtn: {
    height: 50,
    backgroundColor: '#DB2777',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
