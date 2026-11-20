import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';
import type { PartnerTier } from '../../../types';
import { PARTNER_CATEGORIES } from './constants';

interface ActivityIdentitySectionProps {
  formName: string;
  formCategory: string;
  formPrice: string;
  formPhotos: string[];
  formDescription: string;
  partnerTier: PartnerTier;
  maxPhotosAllowed: number;
  uploadingImage: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onChangeName: (val: string) => void;
  onChangeCategory: (val: string) => void;
  onChangePrice: (val: string) => void;
  onChangeDescription: (val: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
  onSetMainPhoto: (index: number) => void;
}

export const ActivityIdentitySection: React.FC<ActivityIdentitySectionProps> = ({
  formName,
  formCategory,
  formPrice,
  formPhotos,
  formDescription,
  partnerTier,
  maxPhotosAllowed,
  uploadingImage,
  theme,
  isDark,
  onChangeName,
  onChangeCategory,
  onChangePrice,
  onChangeDescription,
  onAddPhoto,
  onRemovePhoto,
  onSetMainPhoto,
}) => {
  const isAtQuota = formPhotos.length >= maxPhotosAllowed;

  return (
    <View>
      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
        Nom de l'établissement : <Text style={{ color: '#EF4444' }}>*</Text>
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            color: theme.textMain,
            borderColor: theme.cardBorder,
          },
        ]}
        placeholder="Ex: Restaurant Le Phare, Salon de thé El Hana..."
        placeholderTextColor={theme.textMuted}
        value={formName}
        onChangeText={onChangeName}
      />

      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
        Type & Catégorie :
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
        style={styles.categoryScrollView}
      >
        {PARTNER_CATEGORIES.map((c) => {
          const isSelected = formCategory === c.key;
          const iconName = isSelected && c.selectedIcon ? c.selectedIcon : c.icon;
          return (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.categoryChip,
                isSelected
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
              ]}
              onPress={() => onChangeCategory(c.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName}
                size={16}
                color={isSelected ? '#FFFFFF' : theme.primary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.textMain,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
        Ticket moyen / Prix indicatif (DT) :
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            color: theme.textMain,
            borderColor: theme.cardBorder,
          },
        ]}
        keyboardType="numeric"
        placeholder="Ex: 25"
        placeholderTextColor={theme.textMuted}
        value={formPrice}
        onChangeText={onChangePrice}
      />

      {/* Galerie Multi-Photos avec limite dynamique selon palier */}
      <View style={styles.galleryHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 14, marginBottom: 2 }]}>
            Photos de l'établissement ({formPhotos.length}/{maxPhotosAllowed}) : <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <Text style={{ fontSize: 11, color: theme.textMuted }}>
            {partnerTier === 'standard'
              ? 'Pack Standard : 1 photo de couverture incluse'
              : partnerTier === 'pro'
              ? 'Pack PRO : jusqu’à 5 photos d’ambiance'
              : 'Pack PREMIUM : jusqu’à 10 photos haute qualité'}
          </Text>
        </View>

        <View
          style={[
            styles.tierQuotaBadge,
            {
              backgroundColor:
                partnerTier === 'premium'
                  ? '#F3E8FF'
                  : partnerTier === 'pro'
                  ? '#FFEDD5'
                  : isDark
                  ? '#334155'
                  : '#E2E8F0',
            },
          ]}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '800',
              color:
                partnerTier === 'premium'
                  ? '#9333EA'
                  : partnerTier === 'pro'
                  ? '#EA580C'
                  : theme.textMuted,
            }}
          >
            {partnerTier.toUpperCase()}
          </Text>
        </View>
      </View>

      {formPhotos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosStripContent}
          style={{ marginVertical: 8 }}
        >
          {formPhotos.map((uri, idx) => (
            <View
              key={`${uri}-${idx}`}
              style={[styles.photoThumbCard, { borderColor: idx === 0 ? theme.primary : theme.cardBorder }]}
            >
              <Image source={{ uri }} style={styles.photoThumbImg} resizeMode="cover" />
              {idx === 0 ? (
                <View style={[styles.mainPhotoBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.mainPhotoBadgeText}>Principale</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.promotePhotoBtn}
                  onPress={() => onSetMainPhoto(idx)}
                >
                  <Ionicons name="star-outline" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.removeThumbBtn}
                onPress={() => onRemovePhoto(idx)}
              >
                <Ionicons name="close" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[
          styles.imagePickerBtn,
          {
            backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
            borderColor: isAtQuota ? '#F59E0B' : theme.primary,
            marginTop: 6,
          },
        ]}
        onPress={onAddPhoto}
        disabled={uploadingImage}
        activeOpacity={0.75}
      >
        {uploadingImage ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <>
            <Ionicons
              name={isAtQuota ? 'lock-closed-outline' : 'camera-outline'}
              size={18}
              color={isAtQuota ? '#D97706' : theme.primary}
            />
            <Text
              style={{
                color: isAtQuota ? '#D97706' : theme.primary,
                fontWeight: '800',
                fontSize: 13,
                marginLeft: 8,
              }}
            >
              {formPhotos.length === 0
                ? 'Choisir la photo de couverture'
                : !isAtQuota
                ? `Ajouter une autre photo (${formPhotos.length}/${maxPhotosAllowed})`
                : partnerTier === 'standard'
                ? 'Débloquer jusqu’à 5 photos (Pack PRO)'
                : partnerTier === 'pro'
                ? 'Débloquer jusqu’à 10 photos (PREMIUM)'
                : 'Maximum de 10 photos atteint'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 14 }]}>
        Description & Ambiance :
      </Text>
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
        numberOfLines={3}
        placeholder="Décrivez l'ambiance, les spécialités, l'accueil, les terrasses..."
        placeholderTextColor={theme.textMuted}
        value={formDescription}
        onChangeText={onChangeDescription}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  categoryScrollView: {
    marginHorizontal: -16,
    marginBottom: 6,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  categoryChipText: {
    fontSize: 12,
  },
  galleryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  tierQuotaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photosStripContent: {
    gap: 10,
    paddingVertical: 4,
  },
  photoThumbCard: {
    width: 116,
    height: 84,
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbImg: {
    width: '100%',
    height: '100%',
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  mainPhotoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  promotePhotoBtn: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    padding: 4,
    borderRadius: 6,
  },
  removeThumbBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
