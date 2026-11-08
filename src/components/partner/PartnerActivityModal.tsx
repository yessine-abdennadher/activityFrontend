import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../services/uploadService';
import { ThemeColors } from '../../theme/theme';
import { ScrollableModal } from '../ui/ScrollableModal';
import { TimeWheelPicker } from '../ui/TimeWheelPicker';
import type { PartnerActivityItem, PartnerActivityInput } from '../../types';

// Villes officielles de Tunisie
export const TUNISIAN_CITIES = [
  { key: 'Sfax', label: 'Sfax (صفاقس)' },
  { key: 'Tunis', label: 'Tunis (تونس العاصمة)' },
  { key: 'Sousse', label: 'Sousse (سوسة)' },
  { key: 'Monastir', label: 'Monastir (المنستير)' },
  { key: 'Bizerte', label: 'Bizerte (بنزرت)' },
  { key: 'Hammamet', label: 'Hammamet (الحمامات)' },
  { key: 'Nabeul', label: 'Nabeul (نابل)' },
  { key: 'Djerba', label: 'Djerba (جربة)' },
  { key: 'Mahdia', label: 'Mahdia (المهدية)' },
  { key: 'Gabès', label: 'Gabès (قابس)' },
  { key: 'Kairouan', label: 'Kairouan (القيروان)' },
  { key: 'Tozeur', label: 'Tozeur (توزر)' },
];

// Catégories partenaires complètes
export interface PartnerCategoryOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selectedIcon?: keyof typeof Ionicons.glyphMap;
}

export const PARTNER_CATEGORIES: PartnerCategoryOption[] = [
  { key: 'food', label: 'Restaurant & Gastronomie', icon: 'restaurant-outline', selectedIcon: 'restaurant' },
  { key: 'relax', label: 'Café & Salon de thé', icon: 'cafe-outline', selectedIcon: 'cafe' },
  { key: 'fun', label: 'Loisirs & Jeux', icon: 'game-controller-outline', selectedIcon: 'game-controller' },
  { key: 'sport', label: 'Sport & Fitness', icon: 'barbell-outline', selectedIcon: 'barbell' },
  { key: 'outdoor', label: 'Plein Air & Mer', icon: 'leaf-outline', selectedIcon: 'leaf' },
  { key: 'creative', label: 'Culture & Créatif', icon: 'color-palette-outline', selectedIcon: 'color-palette' },
  { key: 'music', label: 'Musique & Soirées', icon: 'musical-notes-outline', selectedIcon: 'musical-notes' },
];

// Commodités & Services standards 1-Tap
export interface PartnerAmenityOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selectedIcon: keyof typeof Ionicons.glyphMap;
}

export const PARTNER_AMENITIES: PartnerAmenityOption[] = [
  { key: 'wifi', label: 'Wi-Fi rapide', icon: 'wifi-outline', selectedIcon: 'wifi' },
  { key: 'terrace', label: 'Terrasse / Plein air', icon: 'sunny-outline', selectedIcon: 'sunny' },
  { key: 'parking', label: 'Parking facile', icon: 'car-outline', selectedIcon: 'car' },
  { key: 'card_payment', label: 'Paiement Carte / TPE', icon: 'card-outline', selectedIcon: 'card' },
  { key: 'kids_friendly', label: 'Espace Famille', icon: 'people-outline', selectedIcon: 'people' },
  { key: 'pets_friendly', label: 'Animaux bienvenus', icon: 'paw-outline', selectedIcon: 'paw' },
];

// Raccourcis d'heures fréquentes (1-tap contextuel)
export const OPEN_PRESETS = ['07:00', '08:00', '08:30', '09:00', '10:00', '11:30', '12:00'];
export const CLOSE_PRESETS = ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00'];

export const OPEN_DAYS_OPTIONS = [
  'Tous les jours',
  'Lun - Sam',
  'Lun - Ven',
  'Week-end uniquement',
];

/**
 * Nettoie et supprime systématiquement le préfixe 216 / +216
 * pour n'afficher et ne manipuler que les chiffres locaux
 */
export function strip216(phoneStr?: string): string {
  if (!phoneStr) return '';
  return phoneStr
    .replace(/^\+?216\s*/, '')
    .replace(/^00216\s*/, '')
    .trim();
}

/**
 * Formate la saisie en supprimant immédiatement '216', '+216' et caractères invalides
 */
function sanitizeLocalPhone(raw: string): string {
  return raw
    .replace(/^\+?216\s*/, '')
    .replace(/^00216\s*/, '')
    .replace(/[^\d\s]/g, '')
    .slice(0, 12);
}

/**
 * Décompose une heure "HH:MM" en nombres d'heures et minutes (SANS SECONDES)
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const parts = (timeStr || '09:00').split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return {
    hours: isNaN(h) ? 9 : Math.min(23, Math.max(0, h)),
    minutes: isNaN(m) ? 0 : Math.min(59, Math.max(0, m)),
  };
}

/**
 * Formate heures et minutes au format "HH:MM" (SANS SECONDES)
 */
function formatTime(hours: number, minutes: number): string {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Calcule l'amplitude journalière d'ouverture
 */
function calculateDailyAmplitude(openTime: string, closeTime: string): string {
  const { hours: oH, minutes: oM } = parseTime(openTime);
  const { hours: cH, minutes: cM } = parseTime(closeTime);

  let totalOpen = oH * 60 + oM;
  let totalClose = cH * 60 + cM;

  if (totalClose <= totalOpen) {
    totalClose += 24 * 60;
  }

  const diff = totalClose - totalOpen;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (mins === 0) return `${hours}h / jour`;
  return `${hours}h${String(mins).padStart(2, '0')} / jour`;
}

interface PartnerActivityModalProps {
  visible: boolean;
  editingActivity: PartnerActivityItem | null;
  currentUserCity?: string;
  electricityAlertActive?: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onClose: () => void;
  onSave: (payload: PartnerActivityInput) => Promise<void>;
}

export const PartnerActivityModal: React.FC<PartnerActivityModalProps> = ({
  visible,
  editingActivity,
  currentUserCity,
  electricityAlertActive = false,
  theme,
  isDark,
  onClose,
  onSave,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMenuImage, setUploadingMenuImage] = useState(false);

  // Formulaire local
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('food');
  const [formCity, setFormCity] = useState('Sfax');
  const [formAddress, setFormAddress] = useState('');
  const [formMapsUrl, setFormMapsUrl] = useState('');
  const [formPrice, setFormPrice] = useState('25');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMenuImageUrl, setFormMenuImageUrl] = useState('');
  const [formMenuUrl, setFormMenuUrl] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formAmenities, setFormAmenities] = useState<string[]>(['wifi', 'terrace']);
  const [formDescription, setFormDescription] = useState('');
  const [formHasAc, setFormHasAc] = useState(true);
  const [formHasPower, setFormHasPower] = useState(false);
  const [formOpeningTime, setFormOpeningTime] = useState('09:00');
  const [formClosingTime, setFormClosingTime] = useState('23:00');
  const [formOpenDays, setFormOpenDays] = useState('Tous les jours');

  // Sélecteurs interactifs INLINE
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  // Synchronisation lors de l'ouverture ou modification
  useEffect(() => {
    if (visible) {
      setCityPickerOpen(false);

      if (editingActivity) {
        setFormName(editingActivity.name || '');
        setFormCategory(editingActivity.category || 'food');
        setFormCity(editingActivity.city || currentUserCity || 'Sfax');
        setFormAddress(editingActivity.address || '');
        setFormMapsUrl(editingActivity.mapsUrl || '');
        setFormPrice(String(editingActivity.price || 0));
        setFormImageUrl(editingActivity.imageUrl || editingActivity.image || '');
        setFormMenuImageUrl(editingActivity.menuImageUrl || '');
        setFormMenuUrl(editingActivity.menuUrl || '');
        setFormPhone(strip216(editingActivity.phone));
        setFormWhatsapp(strip216(editingActivity.whatsapp));
        setFormInstagram(editingActivity.instagram || '');
        setFormAmenities(editingActivity.amenities || ['wifi', 'terrace']);
        setFormDescription(editingActivity.description || '');
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
        setFormCity(currentUserCity || 'Sfax');
        setFormAddress('');
        setFormMapsUrl('');
        setFormPrice('25');
        setFormImageUrl('');
        setFormMenuImageUrl('');
        setFormMenuUrl('');
        setFormPhone('');
        setFormWhatsapp('');
        setFormInstagram('');
        setFormAmenities(['wifi', 'terrace']);
        setFormDescription('Découvrez nos spécialités, cadre convivial et accueil chaleureux.');
        setFormHasAc(true);
        setFormHasPower(false);
        setFormOpeningTime('09:00');
        setFormClosingTime('23:00');
        setFormOpenDays('Tous les jours');
      }
    }
  }, [visible, editingActivity, currentUserCity]);

  const toggleAmenity = (key: string) => {
    setFormAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l’accès à vos photos pour sélectionner une photo de votre établissement.'
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
          Alert.alert('Erreur', 'Impossible de récupérer les données de l’image sélectionnée.');
          return;
        }

        setUploadingImage(true);
        const mimeType = asset.mimeType || 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${asset.base64}`;

        const uploadRes = await uploadImage(base64Data, 'activities');
        if (uploadRes && uploadRes.url) {
          setFormImageUrl(uploadRes.url);
          Alert.alert('Succès', 'Photo principale enregistrée avec succès.');
        }
      }
    } catch (err: any) {
      console.error('[PartnerActivityModal] Erreur upload:', err.message);
      Alert.alert('Échec de l’upload', err.message || 'Une erreur est survenue lors de l’upload de l’image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePickMenuImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l’accès à vos photos pour sélectionner la photo de la carte / menu.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.base64) {
          Alert.alert('Erreur', 'Impossible de récupérer les données de l’image sélectionnée.');
          return;
        }

        setUploadingMenuImage(true);
        const mimeType = asset.mimeType || 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${asset.base64}`;

        const uploadRes = await uploadImage(base64Data, 'activities');
        if (uploadRes && uploadRes.url) {
          setFormMenuImageUrl(uploadRes.url);
          Alert.alert('Succès', 'Carte du menu enregistrée avec succès.');
        }
      }
    } catch (err: any) {
      console.error('[PartnerActivityModal] Erreur upload menu:', err.message);
      Alert.alert('Échec de l’upload', err.message || 'Une erreur est survenue lors de l’upload du menu.');
    } finally {
      setUploadingMenuImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir le nom de votre établissement (ex: Restaurant, Salon de thé...).');
      return;
    }
    if (!formImageUrl.trim()) {
      Alert.alert('Photo requise', 'Veuillez ajouter une photo pour votre établissement depuis votre galerie.');
      return;
    }

    // Téléphone et WhatsApp propres sans aucun code 216
    const cleanPhone = strip216(formPhone);
    const cleanWhatsapp = strip216(formWhatsapp);
    const cleanInstagram = formInstagram.trim().replace(/^@/, '');

    const payload: PartnerActivityInput = {
      name: formName.trim(),
      category: formCategory,
      city: formCity.trim(),
      address: formAddress.trim() || undefined,
      mapsUrl: formMapsUrl.trim() || undefined,
      price: parseFloat(formPrice) || 0,
      imageUrl: formImageUrl.trim(),
      menuImageUrl: formMenuImageUrl.trim() || undefined,
      menuUrl: formMenuUrl.trim() || undefined,
      instagram: cleanInstagram || undefined,
      amenities: formAmenities,
      phone: cleanPhone || undefined,
      whatsapp: cleanWhatsapp || undefined,
      description: formDescription.trim(),
      hasAirConditioning: formHasAc,
      hasPowerBackup: electricityAlertActive ? formHasPower : Boolean(editingActivity?.hasPowerBackup),
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

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      title={editingActivity ? "Modifier l'établissement" : "Ajouter un établissement / lieu"}
      subtitle={editingActivity ? "Mettez à jour les informations de votre fiche" : "Restaurant, Salon de thé, Salle de sport ou Loisirs"}
      height="92%"
      theme={theme}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 34 }}
    >
      {/* 1. Nom de l'établissement */}
      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
        Nom de l'établissement : <Text style={{ color: '#EF4444' }}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
        placeholder="Ex: Restaurant Le Phare, Salon de thé El Hana..."
        placeholderTextColor={theme.textMuted}
        value={formName}
        onChangeText={setFormName}
      />

      {/* 2. Catégorie de l'établissement */}
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
              onPress={() => setFormCategory(c.key)}
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

      {/* 3. Ville (Sélection interactive INLINE au lieu de taper) */}
      <View style={styles.rowTwoCols}>
        <View style={{ flex: 1.2 }}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Ville (Gouvernorat) :
          </Text>
          <TouchableOpacity
            style={[
              styles.selectorBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: cityPickerOpen ? theme.primary : theme.cardBorder,
              }
            ]}
            onPress={() => {
              setCityPickerOpen(!cityPickerOpen);
            }}
          >
            <Ionicons name="location-outline" size={16} color={theme.primary} />
            <Text style={{ flex: 1, color: theme.textMain, fontWeight: '700', fontSize: 13 }}>
              {formCity}
            </Text>
            <Ionicons name={cityPickerOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 0.8 }}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Prix moyen (DT) :
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
            keyboardType="numeric"
            placeholder="Ex: 35"
            placeholderTextColor={theme.textMuted}
            value={formPrice}
            onChangeText={setFormPrice}
          />
        </View>
      </View>

      {/* Panneau INLINE de sélection de Ville (sans modal imbriqué) */}
      {cityPickerOpen && (
        <View
          style={[
            styles.inlinePanel,
            { backgroundColor: isDark ? '#0F172A' : '#EFF6FF', borderColor: theme.primary }
          ]}
        >
          <View style={styles.inlinePanelHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="location" size={15} color={theme.primary} />
              <Text style={[styles.inlinePanelTitle, { color: theme.textMain }]}>
                Choisissez la ville :
              </Text>
            </View>
            <TouchableOpacity onPress={() => setCityPickerOpen(false)}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.citiesGrid}>
            {TUNISIAN_CITIES.map((c) => {
              const isSelected = formCity === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.cityChip,
                    isSelected
                      ? { backgroundColor: theme.primary, borderColor: theme.primary }
                      : { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: theme.cardBorder }
                  ]}
                  onPress={() => {
                    setFormCity(c.key);
                    setCityPickerOpen(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? '#FFFFFF' : theme.textMain,
                    }}
                  >
                    {c.key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* 3b. Adresse précise & Repère */}
      <View style={{ marginTop: 4 }}>
        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
          Adresse précise / Quartier :
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
          placeholder="Ex: Ennasr 2, Route de Gremda km 2.5, Lac 2..."
          placeholderTextColor={theme.textMuted}
          value={formAddress}
          onChangeText={setFormAddress}
        />
      </View>

      {/* 3c. Lien Google Maps (Optionnel) */}
      <View style={{ marginTop: 6 }}>
        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
          Lien Google Maps / Itinéraire (Optionnel) :
        </Text>
        <View style={[styles.cleanPhoneContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder }]}>
          <Ionicons name="map-outline" size={15} color={theme.primary} style={{ marginLeft: 10 }} />
          <TextInput
            style={[styles.cleanPhoneInput, { color: theme.textMain }]}
            placeholder="https://maps.app.goo.gl/..."
            placeholderTextColor={theme.textMuted}
            value={formMapsUrl}
            onChangeText={setFormMapsUrl}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* 4. Téléphone direct et WhatsApp (216 TOTALEMENT SUPPRIMÉ, saisie propre des 8 chiffres) */}
      <View style={styles.rowTwoCols}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Téléphone direct :
          </Text>
          <View style={[styles.cleanPhoneContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder }]}>
            <Ionicons name="call-outline" size={15} color={theme.primary} style={{ marginLeft: 10 }} />
            <TextInput
              style={[styles.cleanPhoneInput, { color: theme.textMain }]}
              keyboardType="phone-pad"
              maxLength={12}
              placeholder="74 123 456"
              placeholderTextColor={theme.textMuted}
              value={formPhone}
              onChangeText={(val) => setFormPhone(sanitizeLocalPhone(val))}
            />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            WhatsApp Réservation :
          </Text>
          <View style={[styles.cleanPhoneContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder }]}>
            <Ionicons name="logo-whatsapp" size={15} color="#10B981" style={{ marginLeft: 10 }} />
            <TextInput
              style={[styles.cleanPhoneInput, { color: theme.textMain }]}
              keyboardType="phone-pad"
              maxLength={12}
              placeholder="98 123 456"
              placeholderTextColor={theme.textMuted}
              value={formWhatsapp}
              onChangeText={(val) => setFormWhatsapp(sanitizeLocalPhone(val))}
            />
          </View>
        </View>
      </View>

      {/* 4b. Compte Instagram officiel */}
      <View style={{ marginTop: 6 }}>
        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
          Compte Instagram (Optionnel) :
        </Text>
        <View style={[styles.cleanPhoneContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder }]}>
          <Ionicons name="logo-instagram" size={16} color="#E1306C" style={{ marginLeft: 10 }} />
          <Text style={{ marginLeft: 6, color: theme.textMuted, fontWeight: '700', fontSize: 13 }}>@</Text>
          <TextInput
            style={[styles.cleanPhoneInput, { color: theme.textMain, paddingLeft: 4 }]}
            placeholder="nom_etablissement"
            placeholderTextColor={theme.textMuted}
            value={formInstagram}
            onChangeText={setFormInstagram}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* 5. Horaires d'activité */}
      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
        Horaires d'activité :
      </Text>
      <TimeWheelPicker
        openingTime={formOpeningTime}
        closingTime={formClosingTime}
        onOpeningTimeChange={setFormOpeningTime}
        onClosingTimeChange={setFormClosingTime}
        theme={theme}
        isDark={isDark}
      />

      {/* Jours d'ouverture */}
      <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 12 }]}>
        Jours d'ouverture :
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {OPEN_DAYS_OPTIONS.map((days) => (
          <TouchableOpacity
            key={days}
            style={[
              styles.daysChip,
              formOpenDays === days
                ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                : { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder }
            ]}
            onPress={() => setFormOpenDays(days)}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: formOpenDays === days ? '#FFFFFF' : theme.textMain }}>
              {days}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 5b. Services & Commodités clés (Sélection 1-Tap) */}
      <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 8 }]}>
        Services & Commodités clés :
      </Text>
      <View style={styles.amenitiesGrid}>
        {PARTNER_AMENITIES.map((a) => {
          const isSelected = formAmenities.includes(a.key);
          const iconName = isSelected ? a.selectedIcon : a.icon;
          return (
            <TouchableOpacity
              key={a.key}
              style={[
                styles.amenityChip,
                isSelected
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
              ]}
              onPress={() => toggleAmenity(a.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName}
                size={15}
                color={isSelected ? '#FFFFFF' : theme.primary}
              />
              <Text
                style={[
                  styles.amenityChipText,
                  { color: isSelected ? '#FFFFFF' : theme.textMain, fontWeight: isSelected ? '800' : '600' },
                ]}
              >
                {a.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 6. Photo de l'établissement (Upload Cloudinary) */}
      <View style={{ marginVertical: 8 }}>
        <Text style={[styles.inputLabel, { color: theme.textMuted, marginBottom: 6 }]}>
          Photo de votre établissement : <Text style={{ color: '#EF4444' }}>*</Text>
        </Text>

        {formImageUrl ? (
          <View style={{ marginBottom: 10, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: theme.cardBorder }}>
            <Image source={{ uri: formImageUrl }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
            <TouchableOpacity
              style={styles.deletePhotoBtn}
              onPress={() => setFormImageUrl('')}
            >
              <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.imagePickerBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
              borderColor: theme.primary,
            }
          ]}
          onPress={handlePickImage}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <>
              <Ionicons name={formImageUrl ? 'images' : 'cloud-upload-outline'} size={18} color={theme.primary} />
              <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 13, marginLeft: 8 }}>
                {formImageUrl ? 'Remplacer la photo de l’établissement' : 'Choisir une photo depuis la galerie'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 6b. Carte & Menu de l'établissement (Photos / Lien digital) */}
      <View style={{ marginVertical: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.cardBorder, backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#F8FAFC' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Ionicons name="book-outline" size={16} color={theme.primary} />
          <Text style={[styles.inputLabel, { color: theme.textMain, marginTop: 0, marginBottom: 0, fontSize: 13 }]}>
            Carte & Menu des prix :
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: theme.textMuted, marginBottom: 10 }}>
          Ajoutez la photo de votre carte/menu pour booster vos réservations
        </Text>

        {formMenuImageUrl ? (
          <View style={{ marginBottom: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.cardBorder }}>
            <Image source={{ uri: formMenuImageUrl }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
            <TouchableOpacity
              style={styles.deletePhotoBtn}
              onPress={() => setFormMenuImageUrl('')}
            >
              <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Supprimer le menu</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.imagePickerBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
              borderColor: theme.primary,
              marginBottom: 8,
            }
          ]}
          onPress={handlePickMenuImage}
          disabled={uploadingMenuImage}
        >
          {uploadingMenuImage ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <>
              <Ionicons name={formMenuImageUrl ? 'images' : 'camera-outline'} size={18} color={theme.primary} />
              <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 13, marginLeft: 8 }}>
                {formMenuImageUrl ? 'Remplacer la photo du menu' : 'Prendre / Choisir la photo du menu'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={[styles.cleanPhoneContainer, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: theme.cardBorder }]}>
          <Ionicons name="link-outline" size={15} color={theme.textMuted} style={{ marginLeft: 10 }} />
          <TextInput
            style={[styles.cleanPhoneInput, { color: theme.textMain }]}
            placeholder="Ou coller un lien menu digital (ex: menu.tn/...)"
            placeholderTextColor={theme.textMuted}
            value={formMenuUrl}
            onChangeText={setFormMenuUrl}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* 7. Description */}
      <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
        Description & Présentation :
      </Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
        multiline
        numberOfLines={3}
        placeholder="Décrivez l'ambiance, les spécialités, l'accueil, les terrasses..."
        placeholderTextColor={theme.textMuted}
        value={formDescription}
        onChangeText={setFormDescription}
      />

      {/* 8. Options de confort */}
      <View style={[styles.switchRow, { borderBottomColor: theme.cardBorder, borderBottomWidth: 1 }]}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="snow-outline" size={18} color="#0EA5E9" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.switchTitle, { color: theme.textMain }]}>Climatisation confirmée</Text>
            <Text style={[styles.switchSub, { color: theme.textMuted }]}>Espace climatisé pour les journées chaudes</Text>
          </View>
        </View>
        <Switch
          value={formHasAc}
          onValueChange={setFormHasAc}
          trackColor={{ false: '#CBD5E1', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* TOGGLE GROUPE ÉLECTROGÈNE : VISIBLE ET MODIFIABLE UNIQUEMENT SI L'ADMIN A ACTIVÉ L'ALERTE ÉLECTRICITÉ */}
      {electricityAlertActive ? (
        <View style={[styles.switchRow, { backgroundColor: isDark ? '#451A03' : '#FEF3C7', padding: 12, borderRadius: 12, marginTop: 8 }]}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 8 }}>
            <Ionicons name="flash-outline" size={18} color="#D97706" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: '#B45309', fontWeight: '800' }]}>Groupe Électrogène (Power Backup)</Text>
              <Text style={[styles.switchSub, { color: '#92400E' }]}>
                Alerte coupure active : afficher le badge doré de disponibilité garantie
              </Text>
            </View>
          </View>
          <Switch
            value={formHasPower}
            onValueChange={setFormHasPower}
            trackColor={{ false: '#CBD5E1', true: '#F59E0B' }}
            thumbColor="#FFFFFF"
          />
        </View>
      ) : null}

      {/* Boutons d'action */}
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
                {editingActivity ? "Enregistrer" : "Créer l'établissement"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollableModal>
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
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  categoryScrollView: {
    marginHorizontal: -16,
    marginBottom: 8,
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
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 6,
  },
  inlinePanel: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 6,
  },
  inlinePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inlinePanelTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cityChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cleanPhoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cleanPhoneInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  daysChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  amenityChipText: {
    fontSize: 12,
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
  deletePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
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
