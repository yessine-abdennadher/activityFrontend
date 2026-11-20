import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { uploadImage } from '../../services/uploadService';
import { ThemeColors } from '../../theme/theme';
import { ScrollableModal } from '../ui/ScrollableModal';
import type { PartnerActivityItem, PartnerActivityInput, PartnerTier } from '../../types';
import {
  TUNISIAN_CITIES,
  PARTNER_CATEGORIES,
  PARTNER_AMENITIES,
  OPEN_DAYS_OPTIONS,
  MAX_PHOTOS_BY_TIER,
  strip216,
} from './activity-modal/constants';
import { ActivityIdentitySection } from './activity-modal/ActivityIdentitySection';
import { ActivityLocationSection } from './activity-modal/ActivityLocationSection';
import { ActivityScheduleSection } from './activity-modal/ActivityScheduleSection';

export {
  TUNISIAN_CITIES,
  PARTNER_CATEGORIES,
  PARTNER_AMENITIES,
  OPEN_DAYS_OPTIONS,
  strip216,
};

type ModalSectionTab = 'identity' | 'location' | 'hours';

interface PartnerActivityModalProps {
  visible: boolean;
  editingActivity: PartnerActivityItem | null;
  currentUserCity?: string;
  electricityAlertActive?: boolean;
  partnerTier?: PartnerTier;
  theme: ThemeColors;
  isDark: boolean;
  onClose: () => void;
  onSave: (payload: PartnerActivityInput) => Promise<void>;
  onRequestUpgrade?: (targetTier: 'pro' | 'premium') => void;
}

export const PartnerActivityModal: React.FC<PartnerActivityModalProps> = ({
  visible,
  editingActivity,
  currentUserCity,
  electricityAlertActive = false,
  partnerTier = 'standard',
  theme,
  isDark,
  onClose,
  onSave,
  onRequestUpgrade,
}) => {
  const [activeSection, setActiveSection] = useState<ModalSectionTab>('identity');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Onglet 1 : Identité & Galerie Photos
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('food');
  const [formPrice, setFormPrice] = useState('25');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState('');

  // Onglet 2 : Localisation GPS & Contact
  const [formCity, setFormCity] = useState('Sfax');
  const [formAddress, setFormAddress] = useState('');
  const [formMapsUrl, setFormMapsUrl] = useState('');
  const [formCoordinates, setFormCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formFacebook, setFormFacebook] = useState('');

  // Onglet 3 : Horaires & Confort
  const [formOpeningTime, setFormOpeningTime] = useState('09:00');
  const [formClosingTime, setFormClosingTime] = useState('23:00');
  const [formOpenDays, setFormOpenDays] = useState('Tous les jours');
  const [formAmenities, setFormAmenities] = useState<string[]>(['wifi', 'terrace']);
  const [formHasAc, setFormHasAc] = useState(true);
  const [formHasPower, setFormHasPower] = useState(false);

  const maxPhotosAllowed = MAX_PHOTOS_BY_TIER[partnerTier] || 1;

  useEffect(() => {
    if (!visible) return;
    setActiveSection('identity');

    if (editingActivity) {
      setFormName(editingActivity.name || '');
      setFormCategory(editingActivity.category || 'food');
      setFormPrice(String(editingActivity.price || 0));

      const initialPhotos: string[] = [];
      if (Array.isArray(editingActivity.photos) && editingActivity.photos.length > 0) {
        initialPhotos.push(...editingActivity.photos.filter(Boolean));
      } else {
        const cover = editingActivity.imageUrl || editingActivity.image;
        if (cover) initialPhotos.push(cover);
      }
      setFormPhotos(initialPhotos);

      setFormDescription(editingActivity.description || '');
      setFormCity(editingActivity.city || currentUserCity || 'Sfax');
      setFormAddress(editingActivity.address || '');
      setFormMapsUrl(editingActivity.mapsUrl || '');
      setFormCoordinates(
        editingActivity.coordinates &&
          typeof editingActivity.coordinates.latitude === 'number' &&
          typeof editingActivity.coordinates.longitude === 'number'
          ? {
              latitude: editingActivity.coordinates.latitude,
              longitude: editingActivity.coordinates.longitude,
            }
          : null
      );
      setFormPhone(strip216(editingActivity.phone));
      setFormWhatsapp(strip216(editingActivity.whatsapp));
      setFormInstagram(editingActivity.instagram || '');
      setFormFacebook(editingActivity.facebook || '');
      setFormAmenities(editingActivity.amenities || ['wifi', 'terrace']);
      setFormHasAc(Boolean(editingActivity.hasAirConditioning));
      setFormHasPower(Boolean(editingActivity.hasPowerBackup));
      setFormOpeningTime(editingActivity.openingTime || '09:00');
      setFormClosingTime(editingActivity.closingTime || '23:00');
      setFormOpenDays(
        editingActivity.openDays && editingActivity.openDays.length > 0
          ? editingActivity.openDays[0]
          : 'Tous les jours'
      );
    } else {
      setFormName('');
      setFormCategory('food');
      setFormPrice('25');
      setFormPhotos([]);
      setFormDescription('Découvrez nos spécialités, cadre convivial et accueil chaleureux.');
      setFormCity(currentUserCity || 'Sfax');
      setFormAddress('');
      setFormMapsUrl('');
      setFormCoordinates(null);
      setFormPhone('');
      setFormWhatsapp('');
      setFormInstagram('');
      setFormFacebook('');
      setFormAmenities(['wifi', 'terrace']);
      setFormHasAc(true);
      setFormHasPower(false);
      setFormOpeningTime('09:00');
      setFormClosingTime('23:00');
      setFormOpenDays('Tous les jours');
    }
  }, [visible, editingActivity, currentUserCity]);

  const toggleAmenity = (key: string) => {
    setFormAmenities((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleAddPhoto = async () => {
    if (formPhotos.length >= maxPhotosAllowed) {
      if (partnerTier === 'standard') {
        Alert.alert(
          'Galerie Multi-Photos (PRO)',
          'Le Pack Standard inclut 1 photo de couverture. Passez au Pack PRO pour ajouter jusqu’à 5 photos de votre établissement.',
          [
            { text: 'Plus tard', style: 'cancel' },
            ...(onRequestUpgrade
              ? [{ text: 'Découvrir PRO', onPress: () => onRequestUpgrade('pro') }]
              : []),
          ]
        );
      } else if (partnerTier === 'pro') {
        Alert.alert(
          'Limite Pack PRO atteinte (5/5)',
          'Passez au Pack PREMIUM pour publier jusqu’à 10 photos haute résolution.',
          [
            { text: 'Fermer', style: 'cancel' },
            ...(onRequestUpgrade
              ? [{ text: 'Découvrir PREMIUM', onPress: () => onRequestUpgrade('premium') }]
              : []),
          ]
        );
      } else {
        Alert.alert('Limite atteinte', 'Vous avez atteint le maximum de 10 photos pour cet établissement.');
      }
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l’accès à votre galerie pour sélectionner des photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        const uploadRes = await uploadImage(result.assets[0].uri);
        if (uploadRes?.url) {
          setFormPhotos((prev) => [...prev, uploadRes.url].slice(0, maxPhotosAllowed));
        }
      }
    } catch (err: any) {
      Alert.alert('Échec de l’upload', err.message || 'Une erreur est survenue lors de l’upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetMainPhoto = (index: number) => {
    if (index === 0) return;
    setFormPhotos((prev) => {
      const selected = prev[index];
      const others = prev.filter((_, i) => i !== index);
      return [selected, ...others];
    });
  };

  const handleDetectCurrentLocation = async () => {
    try {
      setDetectingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission GPS refusée',
          'Activez la localisation dans les réglages pour détecter automatiquement la position de votre établissement.'
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      setFormCoordinates({ latitude, longitude });
      setFormMapsUrl((prev) => prev.trim() || `https://www.google.com/maps?q=${latitude},${longitude}`);

      let detectedStreetAndDistrict = '';
      let matchedCityName = '';

      try {
        const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocoded && geocoded.length > 0) {
          const place = geocoded[0];
          const addressParts = [
            place.streetNumber,
            place.street,
            place.district || place.subregion,
          ].filter(Boolean);

          detectedStreetAndDistrict = addressParts.join(', ').trim();
          if (detectedStreetAndDistrict) {
            setFormAddress(detectedStreetAndDistrict);
          }

          const rawCity = `${place.city || ''} ${place.region || ''} ${place.subregion || ''}`.toLowerCase();
          const matchedCity = TUNISIAN_CITIES.find((c) =>
            rawCity.includes(c.key.toLowerCase()) || rawCity.includes(c.label.toLowerCase())
          );
          if (matchedCity) {
            matchedCityName = matchedCity.key;
            setFormCity(matchedCity.key);
          }
        }
      } catch {
        // Reverse geocoding optionnel hors-ligne : les coordonnées restent enregistrées
      }

      const alertMsg = detectedStreetAndDistrict
        ? `Position et adresse détectées :\n"${detectedStreetAndDistrict}"${matchedCityName ? ` (${matchedCityName})` : ''}.`
        : 'Coordonnées GPS capturées et enregistrées avec succès.';

      Alert.alert('Position GPS Détectée', alertMsg);
    } catch (err: any) {
      Alert.alert(
        'Erreur GPS',
        err.message || 'Impossible de récupérer votre position actuelle. Vérifiez que le GPS est activé.'
      );
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      setActiveSection('identity');
      Alert.alert('Champ requis', 'Veuillez saisir le nom de votre établissement.');
      return;
    }
    if (formPhotos.length === 0) {
      setActiveSection('identity');
      Alert.alert('Photo requise', 'Veuillez ajouter au moins une photo de couverture pour votre établissement.');
      return;
    }

    const cleanPhone = strip216(formPhone);
    const cleanWhatsapp = strip216(formWhatsapp);
    const cleanInstagram = formInstagram.trim().replace(/^@/, '');
    const cleanFacebook = formFacebook
      .trim()
      .replace(/^@/, '')
      .replace(/^https?:\/\/(www\.)?facebook\.com\//, '');

    const payload: PartnerActivityInput = {
      name: formName.trim(),
      category: formCategory,
      city: formCity.trim(),
      address: formAddress.trim() || undefined,
      mapsUrl: formMapsUrl.trim() || undefined,
      coordinates: formCoordinates || undefined,
      price: parseFloat(formPrice) || 0,
      imageUrl: formPhotos[0],
      photos: formPhotos,
      instagram: cleanInstagram || undefined,
      facebook: cleanFacebook || undefined,
      amenities: formAmenities,
      phone: cleanPhone || undefined,
      whatsapp: cleanWhatsapp || undefined,
      description: formDescription.trim(),
      hasAirConditioning: formHasAc,
      hasPowerBackup: formHasPower,
      openingTime: formOpeningTime,
      closingTime: formClosingTime,
      openDays: [formOpenDays],
    };

    setSubmitting(true);
    try {
      await onSave(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const { width: screenWidth } = useWindowDimensions();

  // Adaptation responsive dynamique selon la taille de l'appareil
  const isSmallScreen = screenWidth < 375;  // Petits smartphones (< 375px)
  const isWideScreen = screenWidth >= 520;   // Tablettes / Grands écrans (>= 520px)

  const tabs: {
    key: ModalSectionTab;
    label: string;
    shortLabel: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: 'identity', label: '1. Identité', shortLabel: '1. Identité', icon: 'images-outline' },
    { key: 'location', label: '2. GPS & Contact', shortLabel: '2. Contact', icon: 'location-outline' },
    { key: 'hours', label: '3. Horaires & Confort', shortLabel: '3. Confort', icon: 'options-outline' },
  ];

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      title={editingActivity ? "Modifier l'établissement" : 'Ajouter un établissement'}
      subtitle={
        editingActivity
          ? `${editingActivity.name} · Pack ${partnerTier.toUpperCase()}`
          : 'Complétez les 3 étapes simples pour publier votre lieu'
      }
      height="92%"
      theme={theme}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 34 }}
    >
      {/* Barre de navigation en 3 étapes responsive */}
      <View
        style={[
          styles.sectionTabsBar,
          isWideScreen && styles.sectionTabsBarWide,
          { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeSection === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.sectionTabBtn,
                isWideScreen && styles.sectionTabBtnWide,
                isSmallScreen && styles.sectionTabBtnSmall,
                isActive && [styles.sectionTabBtnActive, { backgroundColor: theme.cardBg }],
              ]}
              onPress={() => setActiveSection(tab.key)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={tab.icon}
                size={isSmallScreen ? 16 : isWideScreen ? 19 : 18}
                color={isActive ? theme.primary : theme.textMuted}
              />
              <Text
                style={[
                  styles.sectionTabText,
                  isSmallScreen && styles.sectionTabTextSmall,
                  isWideScreen && styles.sectionTabTextWide,
                  { color: isActive ? theme.textMain : theme.textMuted },
                  isActive && styles.sectionTabTextActive,
                ]}
                numberOfLines={isWideScreen ? 1 : 2}
              >
                {isSmallScreen ? tab.shortLabel : tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeSection === 'identity' && (
        <ActivityIdentitySection
          formName={formName}
          formCategory={formCategory}
          formPrice={formPrice}
          formPhotos={formPhotos}
          formDescription={formDescription}
          partnerTier={partnerTier}
          maxPhotosAllowed={maxPhotosAllowed}
          uploadingImage={uploadingImage}
          theme={theme}
          isDark={isDark}
          onChangeName={setFormName}
          onChangeCategory={setFormCategory}
          onChangePrice={setFormPrice}
          onChangeDescription={setFormDescription}
          onAddPhoto={handleAddPhoto}
          onRemovePhoto={handleRemovePhoto}
          onSetMainPhoto={handleSetMainPhoto}
        />
      )}

      {activeSection === 'location' && (
        <ActivityLocationSection
          formCity={formCity}
          formAddress={formAddress}
          formMapsUrl={formMapsUrl}
          formCoordinates={formCoordinates}
          formPhone={formPhone}
          formWhatsapp={formWhatsapp}
          formInstagram={formInstagram}
          formFacebook={formFacebook}
          detectingLocation={detectingLocation}
          theme={theme}
          isDark={isDark}
          onChangeCity={setFormCity}
          onChangeAddress={setFormAddress}
          onChangeMapsUrl={setFormMapsUrl}
          onChangePhone={setFormPhone}
          onChangeWhatsapp={setFormWhatsapp}
          onChangeInstagram={setFormInstagram}
          onChangeFacebook={setFormFacebook}
          onDetectCurrentLocation={handleDetectCurrentLocation}
        />
      )}

      {activeSection === 'hours' && (
        <ActivityScheduleSection
          formOpeningTime={formOpeningTime}
          formClosingTime={formClosingTime}
          formOpenDays={formOpenDays}
          formAmenities={formAmenities}
          formHasAc={formHasAc}
          formHasPower={formHasPower}
          electricityAlertActive={electricityAlertActive}
          theme={theme}
          isDark={isDark}
          onChangeOpeningTime={setFormOpeningTime}
          onChangeClosingTime={setFormClosingTime}
          onChangeOpenDays={setFormOpenDays}
          onToggleAmenity={toggleAmenity}
          onChangeHasAc={setFormHasAc}
          onChangeHasPower={setFormHasPower}
        />
      )}

      {/* Boutons d'action globaux */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: theme.cardBorder, borderWidth: 1 }]}
          onPress={onClose}
          disabled={submitting}
        >
          <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={submitting || uploadingImage}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {editingActivity ? 'Enregistrer' : "Créer l'établissement"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  sectionTabsBar: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 14,
    marginBottom: 16,
    gap: 6,
  },
  sectionTabsBarWide: {
    padding: 8,
    gap: 10,
    borderRadius: 16,
  },
  sectionTabBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    minHeight: 56,
  },
  sectionTabBtnSmall: {
    paddingVertical: 8,
    minHeight: 50,
    borderRadius: 9,
  },
  sectionTabBtnWide: {
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sectionTabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTabText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  sectionTabTextSmall: {
    fontSize: 10,
    lineHeight: 13,
  },
  sectionTabTextWide: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTabTextActive: {
    fontWeight: '800',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
