import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';

interface EventPosterUploaderProps {
  image: string;
  uploading: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onPickImage: () => void;
  onRemoveImage: () => void;
}

export const EventPosterUploader: React.FC<EventPosterUploaderProps> = ({
  image,
  uploading,
  theme,
  isDark,
  onPickImage,
  onRemoveImage,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
        Affiche ou Photo de l'événement :
      </Text>

      {image ? (
        <View style={[styles.posterPreviewWrap, { borderColor: theme.cardBorder }]}>
          <Image source={{ uri: image }} style={styles.posterImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.removePosterBtn}
            onPress={onRemoveImage}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
            <Text style={styles.removePosterText}>Retirer</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.uploadBtn,
          {
            backgroundColor: isDark ? '#1E293B' : '#FAF5FF',
            borderColor: '#A855F7',
            borderStyle: image ? 'solid' : 'dashed',
          },
        ]}
        onPress={onPickImage}
        disabled={uploading}
        activeOpacity={0.8}
      >
        {uploading ? (
          <>
            <ActivityIndicator size="small" color="#7C3AED" />
            <Text style={styles.uploadBtnText}>Envoi de l'affiche en cours...</Text>
          </>
        ) : (
          <>
            <Ionicons
              name={image ? 'images-outline' : 'cloud-upload-outline'}
              size={18}
              color="#7C3AED"
            />
            <Text style={styles.uploadBtnText}>
              {image ? "Changer l'affiche" : 'Choisir une affiche depuis la galerie'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  posterPreviewWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: 140,
  },
  removePosterBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  removePosterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadBtnText: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '700',
  },
});
