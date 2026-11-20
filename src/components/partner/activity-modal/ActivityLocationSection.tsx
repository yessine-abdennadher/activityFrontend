import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';
import { TUNISIAN_CITIES, sanitizeLocalPhone } from './constants';

interface ActivityLocationSectionProps {
  formCity: string;
  formAddress: string;
  formMapsUrl: string;
  formCoordinates: { latitude: number; longitude: number } | null;
  formPhone: string;
  formWhatsapp: string;
  formInstagram: string;
  formFacebook: string;
  detectingLocation: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onChangeCity: (val: string) => void;
  onChangeAddress: (val: string) => void;
  onChangeMapsUrl: (val: string) => void;
  onChangePhone: (val: string) => void;
  onChangeWhatsapp: (val: string) => void;
  onChangeInstagram: (val: string) => void;
  onChangeFacebook: (val: string) => void;
  onDetectCurrentLocation: () => void;
}

export const ActivityLocationSection: React.FC<ActivityLocationSectionProps> = ({
  formCity,
  formAddress,
  formMapsUrl,
  formCoordinates,
  formPhone,
  formWhatsapp,
  formInstagram,
  formFacebook,
  detectingLocation,
  theme,
  isDark,
  onChangeCity,
  onChangeAddress,
  onChangeMapsUrl,
  onChangePhone,
  onChangeWhatsapp,
  onChangeInstagram,
  onChangeFacebook,
  onDetectCurrentLocation,
}) => {
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showManualMaps, setShowManualMaps] = useState(Boolean(formMapsUrl && !formCoordinates));

  // Filtrer les 24 gouvernorats tunisiens avec la barre de recherche
  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return TUNISIAN_CITIES;
    const q = citySearchQuery.toLowerCase().trim();
    return TUNISIAN_CITIES.filter(
      (c) => c.key.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)
    );
  }, [citySearchQuery]);

  // Copier le numéro direct vers WhatsApp en 1 clic
  const handleCopyPhoneToWhatsapp = () => {
    if (formPhone.trim()) {
      onChangeWhatsapp(formPhone.trim());
    }
  };

  return (
    <View style={styles.container}>
      {/* ── 1. CARTE GPS 1-CLIC (RECOMMANDÉ SUR PLACE) ── */}
      <View
        style={[
          styles.gpsCard,
          {
            backgroundColor: isDark ? '#0F172A' : '#EEF2FF',
            borderColor: formCoordinates ? '#10B981' : '#818CF8',
          },
        ]}
      >
        <View style={styles.gpsHeaderRow}>
          <View
            style={[
              styles.gpsIconCircle,
              { backgroundColor: formCoordinates ? '#10B981' : '#4F46E5' },
            ]}
          >
            <Ionicons
              name={formCoordinates ? 'checkmark' : 'navigate'}
              size={18}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.gpsTitle, { color: theme.textMain }]}>
              {formCoordinates ? 'Position GPS enregistrée' : 'Localisation GPS précise'}
            </Text>
            <Text style={[styles.gpsSubtitle, { color: theme.textMuted }]}>
              {formCoordinates
                ? `Lat: ${formCoordinates.latitude.toFixed(4)}, Long: ${formCoordinates.longitude.toFixed(4)}`
                : 'Vous êtes sur place ? Remplissez votre adresse et position en 1 seconde.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.gpsBtn,
            { backgroundColor: formCoordinates ? '#10B981' : '#4F46E5' },
          ]}
          onPress={onDetectCurrentLocation}
          disabled={detectingLocation}
          activeOpacity={0.8}
        >
          {detectingLocation ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="locate" size={17} color="#FFFFFF" />
              <Text style={styles.gpsBtnText}>
                {formCoordinates ? 'Actualiser ma position sur place' : 'Capturer ma position GPS sur place'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Accordéon discret pour lien Google Maps manuel */}
        <TouchableOpacity
          style={styles.manualToggleRow}
          onPress={() => setShowManualMaps(!showManualMaps)}
          activeOpacity={0.7}
        >
          <Text style={[styles.manualToggleText, { color: theme.primary }]}>
            {showManualMaps
              ? 'Masquer le lien Google Maps'
              : 'Vous n’êtes pas sur place ? Saisir un lien Google Maps'}
          </Text>
          <Ionicons
            name={showManualMaps ? 'chevron-up' : 'chevron-down'}
            size={13}
            color={theme.primary}
          />
        </TouchableOpacity>

        {showManualMaps && (
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: theme.cardBorder },
            ]}
          >
            <Ionicons name="link-outline" size={15} color={theme.primary} style={{ marginLeft: 10 }} />
            <TextInput
              style={[styles.rawInput, { color: theme.textMain }]}
              placeholder="https://maps.app.goo.gl/..."
              placeholderTextColor={theme.textMuted}
              value={formMapsUrl}
              onChangeText={onChangeMapsUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}
      </View>

      {/* ── 2. VILLE / GOUVERNORAT (24 GOUVERNORATS DE TUNISIE) ── */}
      <View>
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
          Gouvernorat / Ville :
        </Text>
        <TouchableOpacity
          style={[
            styles.selectorBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderColor: cityPickerOpen ? theme.primary : theme.cardBorder,
            },
          ]}
          onPress={() => setCityPickerOpen(!cityPickerOpen)}
          activeOpacity={0.8}
        >
          <View style={styles.selectorLeft}>
            <Ionicons name="location-outline" size={17} color={theme.primary} />
            <Text style={[styles.selectorValue, { color: theme.textMain }]}>
              {TUNISIAN_CITIES.find((c) => c.key === formCity)?.label || formCity || 'Choisir une ville'}
            </Text>
          </View>
          <Ionicons
            name={cityPickerOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        {cityPickerOpen && (
          <View
            style={[
              styles.cityDropdownPanel,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: theme.cardBorder,
              },
            ]}
          >
            {/* Recherche de gouvernorat */}
            <View
              style={[
                styles.citySearchRow,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Ionicons name="search-outline" size={15} color={theme.textMuted} />
              <TextInput
                style={[styles.citySearchInput, { color: theme.textMain }]}
                placeholder="Rechercher parmi les 24 gouvernorats..."
                placeholderTextColor={theme.textMuted}
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                autoCorrect={false}
              />
              {citySearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCitySearchQuery('')}>
                  <Ionicons name="close-circle" size={15} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Liste déroulante des gouvernorats */}
            <ScrollView
              style={styles.cityScrollView}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.citiesGrid}>
                {filteredCities.map((c) => {
                  const isSelected = formCity === c.key;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      style={[
                        styles.cityChip,
                        isSelected
                          ? { backgroundColor: theme.primary, borderColor: theme.primary }
                          : {
                              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                              borderColor: theme.cardBorder,
                            },
                      ]}
                      onPress={() => {
                        onChangeCity(c.key);
                        setCityPickerOpen(false);
                        setCitySearchQuery('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.cityChipText,
                          {
                            color: isSelected ? '#FFFFFF' : theme.textMain,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {c.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── 3. ADRESSE PRÉCISE / QUARTIER ── */}
      <View>
        <View style={styles.labelRowWithBadge}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
            Adresse précise & Quartier :
          </Text>
          {formCoordinates && (
            <View style={styles.autoFilledBadge}>
              <Ionicons name="flash" size={10} color="#059669" />
              <Text style={styles.autoFilledText}>Auto-rempli par GPS</Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
          ]}
        >
          <Ionicons name="business-outline" size={16} color={theme.primary} style={{ marginLeft: 12 }} />
          <TextInput
            style={[styles.rawInput, { color: theme.textMain }]}
            placeholder="Ex: Route de Gremda km 2.5, Ennasr 2, Lac 2..."
            placeholderTextColor={theme.textMuted}
            value={formAddress}
            onChangeText={onChangeAddress}
          />
        </View>
      </View>

      {/* ── 4. TÉLÉPHONE & WHATSAPP (AVEC PRÉFIXE FIXE +216) ── */}
      <View style={styles.rowTwoCols}>
        {/* Téléphone direct */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
            Téléphone direct :
          </Text>
          <View
            style={[
              styles.phoneInputBox,
              { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
            ]}
          >
            <View style={[styles.prefixPill, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Ionicons name="call" size={12} color="#0284C7" />
              <Text style={[styles.prefixText, { color: theme.textMain }]}>+216</Text>
            </View>
            <TextInput
              style={[styles.phoneTextInput, { color: theme.textMain }]}
              keyboardType="phone-pad"
              maxLength={12}
              placeholder="74 123 456"
              placeholderTextColor={theme.textMuted}
              value={formPhone}
              onChangeText={(val) => onChangePhone(sanitizeLocalPhone(val))}
            />
          </View>
        </View>

        {/* WhatsApp Réservation */}
        <View style={{ flex: 1 }}>
          <View style={styles.whatsAppHeaderRow}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted, marginBottom: 0 }]}>
              WhatsApp :
            </Text>
            {formPhone.length >= 8 && formWhatsapp !== formPhone && (
              <TouchableOpacity onPress={handleCopyPhoneToWhatsapp} activeOpacity={0.7}>
                <Text style={[styles.sameAsPhoneText, { color: theme.primary }]}>
                  Identique
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles.phoneInputBox,
              { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
            ]}
          >
            <View style={[styles.prefixPill, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
              <Ionicons name="logo-whatsapp" size={13} color="#10B981" />
              <Text style={[styles.prefixText, { color: '#047857' }]}>+216</Text>
            </View>
            <TextInput
              style={[styles.phoneTextInput, { color: theme.textMain }]}
              keyboardType="phone-pad"
              maxLength={12}
              placeholder="98 123 456"
              placeholderTextColor={theme.textMuted}
              value={formWhatsapp}
              onChangeText={(val) => onChangeWhatsapp(sanitizeLocalPhone(val))}
            />
          </View>
        </View>
      </View>

      {/* ── 5. RÉSEAUX SOCIAUX : FACEBOOK & INSTAGRAM (CLIQUABLES DANS LA FICHE) ── */}
      <View style={styles.socialHeaderRow}>
        <Ionicons name="share-social-outline" size={14} color={theme.primary} />
        <Text style={[styles.fieldLabel, { color: theme.textMuted, marginTop: 0, marginBottom: 0 }]}>
          Réseaux Sociaux (Cliquables sur votre fiche) :
        </Text>
      </View>

      <View style={styles.rowTwoCols}>
        {/* Page Facebook */}
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
            ]}
          >
            <Ionicons name="logo-facebook" size={17} color="#1877F2" style={{ marginLeft: 10 }} />
            <Text style={{ marginLeft: 6, color: '#1877F2', fontWeight: '800', fontSize: 11 }}>fb.com/</Text>
            <TextInput
              style={[styles.rawInput, { color: theme.textMain, paddingLeft: 3 }]}
              placeholder="ma_page"
              placeholderTextColor={theme.textMuted}
              value={formFacebook}
              onChangeText={onChangeFacebook}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Compte Instagram */}
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
            ]}
          >
            <Ionicons name="logo-instagram" size={17} color="#E1306C" style={{ marginLeft: 10 }} />
            <Text style={{ marginLeft: 6, color: '#E1306C', fontWeight: '800', fontSize: 12 }}>@</Text>
            <TextInput
              style={[styles.rawInput, { color: theme.textMain, paddingLeft: 3 }]}
              placeholder="mon_profil"
              placeholderTextColor={theme.textMuted}
              value={formInstagram}
              onChangeText={onChangeInstagram}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  gpsCard: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  gpsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gpsIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  gpsSubtitle: {
    fontSize: 11,
    marginTop: 1,
    lineHeight: 15,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  gpsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  manualToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  manualToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 4,
  },
  labelRowWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  autoFilledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  autoFilledText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectorValue: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  cityDropdownPanel: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginTop: 6,
    maxHeight: 250,
  },
  citySearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },
  citySearchInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
  },
  cityScrollView: {
    maxHeight: 180,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  cityChipText: {
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
  },
  rawInput: {
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 8,
    height: '100%',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  phoneInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 4,
  },
  prefixPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  prefixText: {
    fontSize: 11,
    fontWeight: '800',
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
    paddingHorizontal: 4,
  },
  whatsAppHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 4,
  },
  sameAsPhoneText: {
    fontSize: 11,
    fontWeight: '800',
  },
  socialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
});
