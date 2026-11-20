import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';
import type { PartnerActivityItem, PromoOfferType } from '../../types';
import { ScrollableModal } from '../ui/ScrollableModal';
import { DateCalendarPicker } from '../ui/DateCalendarPicker';
import { PartnerVenuePickerBanner } from './shared/PartnerVenuePickerBanner';
import {
  calculateDiscountedPrice,
  extractMenuItems,
  getOfferBadgeLabel,
} from '../../utils/promoHelpers';

const PRESET_DISCOUNTS = ['10', '15', '20', '25', '30', '50'];
const PRESET_VALIDITY = [
  'Ce week-end uniquement',
  'Cette semaine',
  'Jusqu’à la fin du mois',
  'Offre permanente',
];

const OFFER_TYPES: {
  key: PromoOfferType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'percentage', label: 'Remise %', icon: 'pricetag-outline' },
  { key: 'bogo', label: '1+1 Offert', icon: 'copy-outline' },
  { key: 'bundle', label: 'Formule Pack', icon: 'layers-outline' },
  { key: 'gift', label: 'Cadeau', icon: 'gift-outline' },
  { key: 'custom', label: 'Autre', icon: 'sparkles-outline' },
];

interface PartnerProPromoModalProps {
  visible: boolean;
  activities?: PartnerActivityItem[];
  targetActivity: PartnerActivityItem | null;
  offerType: PromoOfferType;
  discount: string;
  label: string;
  promoType: 'all' | 'item';
  targetItem: string;
  originalPrice?: number;
  promoPrice?: number;
  validUntil?: string;
  theme: ThemeColors;
  isDark: boolean;
  hasActivePromo?: boolean;
  onSelectActivity?: (activity: PartnerActivityItem) => void;
  onOfferTypeChange: (val: PromoOfferType) => void;
  onDiscountChange: (val: string) => void;
  onLabelChange: (val: string) => void;
  onPromoTypeChange: (val: 'all' | 'item') => void;
  onTargetItemChange: (val: string, itemPrice?: number) => void;
  onValidUntilChange?: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDisablePromo?: () => void;
}

export const PartnerProPromoModal: React.FC<PartnerProPromoModalProps> = ({
  visible,
  activities = [],
  targetActivity,
  offerType,
  discount,
  label,
  promoType,
  targetItem,
  originalPrice,
  validUntil = '',
  theme,
  isDark,
  hasActivePromo = false,
  onSelectActivity,
  onOfferTypeChange,
  onDiscountChange,
  onLabelChange,
  onPromoTypeChange,
  onTargetItemChange,
  onValidUntilChange,
  onClose,
  onSave,
  onDisablePromo,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [manualItemMode, setManualItemMode] = useState(false);

  const menuItems = useMemo(() => extractMenuItems(targetActivity), [targetActivity]);
  const hasMenuItems = menuItems.length > 0;
  const currentDiscountNum = parseInt(discount, 10) || 20;

  const computedDiscountedPrice = useMemo(() => {
    if (!originalPrice || originalPrice <= 0) return undefined;
    if (offerType === 'percentage') {
      return calculateDiscountedPrice(originalPrice, currentDiscountNum);
    }
    return undefined;
  }, [originalPrice, offerType, currentDiscountNum]);

  const badgeLabel = getOfferBadgeLabel(offerType, currentDiscountNum);

  const defaultSlogan = useMemo(() => {
    const itemName = targetItem.trim();
    if (offerType === 'bogo') {
      return itemName
        ? `1 ${itemName} acheté = le 2ème offert`
        : '1 article acheté = 1 offert';
    }
    if (offerType === 'bundle') {
      return itemName ? `Formule Spéciale ${itemName}` : 'Menu Formule Duo Spécial';
    }
    if (offerType === 'gift') {
      return itemName ? `${itemName} offert avec votre commande` : 'Surprise offerte avec votre addition';
    }
    if (offerType === 'custom') {
      return 'Offre Spéciale Exclusive';
    }
    if (promoType === 'item' && itemName) {
      return computedDiscountedPrice && originalPrice
        ? `${itemName} à ${computedDiscountedPrice} DT au lieu de ${originalPrice} DT`
        : `-${currentDiscountNum}% sur ${itemName}`;
    }
    return `-${currentDiscountNum}% sur toute l'addition`;
  }, [offerType, promoType, targetItem, currentDiscountNum, computedDiscountedPrice, originalPrice]);

  const previewTitle = label.trim() || defaultSlogan;

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      title="Offre & Promotion"
      subtitle="Configurez votre bon plan en quelques clics sans saisie complexe"
      height="90%"
      theme={theme}
      contentContainerStyle={styles.container}
    >
      {/* ── 1. ÉTABLISSEMENT CONCERNÉ (COMPOSANT PARTAGÉ) ── */}
      <PartnerVenuePickerBanner
        activities={activities}
        targetActivity={targetActivity}
        overlineLabel="Établissement ciblé :"
        accentColor={theme.primary}
        fallbackIcon="restaurant"
        theme={theme}
        isDark={isDark}
        onSelectActivity={onSelectActivity}
      />

      {/* ── 2. TYPE D'OFFRE (5 FORMATS) ── */}
      <View>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
          Type de promotion :
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offerTypesScroll}
        >
          {OFFER_TYPES.map((ot) => {
            const isSelected = offerType === ot.key;
            return (
              <TouchableOpacity
                key={ot.key}
                style={[
                  styles.offerTypeChip,
                  isSelected
                    ? { backgroundColor: '#EA580C', borderColor: '#EA580C' }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: theme.cardBorder,
                      },
                ]}
                onPress={() => onOfferTypeChange(ot.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={ot.icon}
                  size={15}
                  color={isSelected ? '#FFFFFF' : theme.textMuted}
                />
                <Text
                  style={[
                    styles.offerTypeText,
                    { color: isSelected ? '#FFFFFF' : theme.textMain },
                  ]}
                >
                  {ot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── 3. PORTÉE (TOUTE L'ADDITION VS PLAT DU MENU) ── */}
      {offerType === 'percentage' && (
        <View>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            Portée de la réduction :
          </Text>
          <View style={styles.scopeRow}>
            <TouchableOpacity
              onPress={() => onPromoTypeChange('all')}
              style={[
                styles.scopeBtn,
                promoType === 'all'
                  ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }
                  : {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: theme.cardBorder,
                    },
              ]}
            >
              <Ionicons
                name="globe-outline"
                size={15}
                color={promoType === 'all' ? '#FFFFFF' : theme.textMuted}
              />
              <Text
                style={[
                  styles.scopeBtnText,
                  { color: promoType === 'all' ? '#FFFFFF' : theme.textMain },
                ]}
              >
                Toute l'addition
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onPromoTypeChange('item')}
              style={[
                styles.scopeBtn,
                promoType === 'item'
                  ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }
                  : {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: theme.cardBorder,
                    },
              ]}
            >
              <Ionicons
                name="restaurant-outline"
                size={15}
                color={promoType === 'item' ? '#FFFFFF' : theme.textMuted}
              />
              <Text
                style={[
                  styles.scopeBtnText,
                  { color: promoType === 'item' ? '#FFFFFF' : theme.textMain },
                ]}
              >
                Plat du menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── 4. SÉLECTEUR DE PLAT DEPUIS LE MENU EXISTANT ── */}
      {(promoType === 'item' || offerType === 'bogo' || offerType === 'gift') && (
        <View style={styles.fieldGroup}>
          <View style={styles.labelWithBadgeRow}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              {offerType === 'gift'
                ? 'Article offert en cadeau :'
                : 'Sélectionnez le plat concerné :'}
            </Text>
            {hasMenuItems && (
              <TouchableOpacity onPress={() => setManualItemMode(!manualItemMode)}>
                <Text style={[styles.toggleManualLink, { color: theme.primary }]}>
                  {manualItemMode ? 'Choisir depuis le menu' : 'Saisie libre'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {hasMenuItems && !manualItemMode ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.menuItemsScroll}
            >
              {menuItems.map((mItem) => {
                const isSelected = targetItem === mItem.name;
                return (
                  <TouchableOpacity
                    key={mItem.id}
                    style={[
                      styles.menuItemChip,
                      isSelected
                        ? {
                            backgroundColor: isDark ? '#312E81' : '#EEF2FF',
                            borderColor: '#4F46E5',
                          }
                        : {
                            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                            borderColor: theme.cardBorder,
                          },
                    ]}
                    onPress={() => onTargetItemChange(mItem.name, mItem.price)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.menuItemName,
                        { color: isSelected ? '#4F46E5' : theme.textMain },
                      ]}
                      numberOfLines={1}
                    >
                      {mItem.name}
                    </Text>
                    <Text style={[styles.menuItemPrice, { color: theme.textMuted }]}>
                      {mItem.price} DT
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.inputBox,
                { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
              ]}
            >
              <Ionicons name="fast-food-outline" size={16} color={theme.primary} style={{ marginLeft: 12 }} />
              <TextInput
                style={[styles.textInput, { color: theme.textMain }]}
                placeholder={
                  offerType === 'gift'
                    ? 'Ex: Thé à la menthe, Tiramisu maison...'
                    : 'Ex: Pizza 4 Fromages, Burger Double...'
                }
                placeholderTextColor={theme.textMuted}
                value={targetItem}
                onChangeText={(txt) => onTargetItemChange(txt, undefined)}
              />
            </View>
          )}
        </View>
      )}

      {/* ── 5. TAUX DE RÉDUCTION (SI REMISE %) ── */}
      {offerType === 'percentage' && (
        <View style={styles.fieldGroup}>
          <View style={styles.labelWithBadgeRow}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              Pourcentage de remise :
            </Text>
            {computedDiscountedPrice !== undefined && originalPrice ? (
              <Text style={styles.priceCalculationText}>
                {originalPrice} DT ➔ {computedDiscountedPrice} DT
              </Text>
            ) : null}
          </View>
          <View style={styles.presetsRow}>
            {PRESET_DISCOUNTS.map((pct) => {
              const isSelected = discount === pct;
              return (
                <TouchableOpacity
                  key={pct}
                  style={[
                    styles.presetChip,
                    isSelected
                      ? { backgroundColor: '#EA580C', borderColor: '#EA580C' }
                      : {
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          borderColor: theme.cardBorder,
                        },
                  ]}
                  onPress={() => onDiscountChange(pct)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textMain,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    -{pct}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── 6. TITRE / SLOGAN ── */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
          Slogan de l'offre (Modifiable) :
        </Text>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
          ]}
        >
          <Ionicons name="create-outline" size={16} color="#EA580C" style={{ marginLeft: 12 }} />
          <TextInput
            style={[styles.textInput, { color: theme.textMain }]}
            placeholder={defaultSlogan}
            placeholderTextColor={theme.textMuted}
            value={label}
            onChangeText={onLabelChange}
          />
        </View>
      </View>

      {/* ── 7. VALIDITÉ : RACCOURCIS OU CALENDRIER VISUEL ── */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithBadgeRow}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Date limite de validité :
          </Text>
          <TouchableOpacity
            style={styles.calendarTriggerBtn}
            onPress={() => setShowCalendar(!showCalendar)}
            activeOpacity={0.75}
          >
            <Ionicons name="calendar-outline" size={14} color={theme.primary} />
            <Text style={[styles.calendarTriggerText, { color: theme.primary }]}>
              {showCalendar ? 'Fermer calendrier' : 'Choisir dans le calendrier'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.validityPresetsRow}>
          {PRESET_VALIDITY.map((v) => {
            const isSelected = validUntil === v;
            return (
              <TouchableOpacity
                key={v}
                style={[
                  styles.validityChip,
                  isSelected
                    ? { backgroundColor: isDark ? '#312E81' : '#EEF2FF', borderColor: '#6366F1' }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: theme.cardBorder,
                      },
                ]}
                onPress={() => {
                  onValidUntilChange && onValidUntilChange(v);
                  setShowCalendar(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.validityChipText,
                    {
                      color: isSelected ? '#4F46E5' : theme.textMuted,
                      fontWeight: isSelected ? '800' : '500',
                    },
                  ]}
                >
                  {v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showCalendar && (
          <DateCalendarPicker
            selectedDateLabel={validUntil}
            theme={theme}
            isDark={isDark}
            onSelectDate={(formatted) => {
              onValidUntilChange && onValidUntilChange(formatted);
              setShowCalendar(false);
            }}
          />
        )}

        {Boolean(validUntil) && !PRESET_VALIDITY.includes(validUntil) && (
          <View
            style={[
              styles.selectedDateBanner,
              { backgroundColor: isDark ? '#1E293B' : '#FFF7ED', borderColor: '#FDBA74' },
            ]}
          >
            <Ionicons name="calendar" size={14} color="#EA580C" />
            <Text style={[styles.selectedDateText, { color: isDark ? '#FDBA74' : '#9A3412' }]}>
              Date choisie : {validUntil}
            </Text>
          </View>
        )}
      </View>

      {/* ── 8. APERÇU EN DIRECT (LIVE PREVIEW) ── */}
      <View style={styles.previewContainer}>
        <Text style={[styles.previewSectionTitle, { color: theme.textMuted }]}>
          Aperçu du coupon sur la fiche Hamla :
        </Text>
        <View
          style={[
            styles.previewCouponCard,
            {
              backgroundColor: isDark ? '#1E1B4B' : '#FFFBEB',
              borderColor: isDark ? '#4338CA' : '#FCD34D',
            },
          ]}
        >
          <View style={styles.previewCouponLeft}>
            <View style={styles.previewBadgeCircle}>
              <Ionicons name="pricetag" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.previewCouponTitle, { color: isDark ? '#F5F3FF' : '#92400E' }]}
                numberOfLines={2}
              >
                {previewTitle}
              </Text>
              <Text style={[styles.previewCouponSub, { color: isDark ? '#C4B5FD' : '#B45309' }]}>
                {targetActivity?.name || 'Votre lieu'}
                {validUntil ? ` · ${validUntil}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.previewTagPill}>
            <Text style={styles.previewTagPillText}>{badgeLabel}</Text>
          </View>
        </View>
      </View>

      {/* ── 9. BOUTONS D'ACTION ── */}
      <View style={styles.actionButtonsRow}>
        {hasActivePromo && onDisablePromo && (
          <TouchableOpacity
            style={[
              styles.disableBtn,
              { backgroundColor: isDark ? '#450A0A' : '#FEE2E2', borderColor: '#FCA5A5' },
            ]}
            onPress={onDisablePromo}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={17} color="#DC2626" />
            <Text style={styles.disableBtnText}>Désactiver l'offre en cours</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: '#EA580C' }]}
          onPress={onSave}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>
            {hasActivePromo ? 'Mettre à jour la promotion' : 'Publier cette offre'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  venueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    gap: 10,
  },
  venueBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  venueAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  venueAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueBannerOverline: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  venueBannerName: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  switchVenueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  switchVenueText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  venueDropdown: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    gap: 4,
    marginTop: -6,
  },
  venueOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  venueOptionName: {
    fontSize: 12.5,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  offerTypesScroll: {
    gap: 8,
    paddingRight: 10,
  },
  offerTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  offerTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scopeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  scopeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  labelWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleManualLink: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  priceCalculationText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
  },
  menuItemsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  menuItemChip: {
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 110,
    maxWidth: 165,
  },
  menuItemName: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuItemPrice: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.2,
  },
  presetChipText: {
    fontSize: 12.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 10,
    height: '100%',
  },
  calendarTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarTriggerText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  validityPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  validityChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  validityChipText: {
    fontSize: 11,
  },
  selectedDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 4,
  },
  selectedDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewContainer: {
    marginTop: 4,
    gap: 6,
  },
  previewSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewCouponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  previewCouponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  previewBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCouponTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  previewCouponSub: {
    fontSize: 11,
    marginTop: 2,
  },
  previewTagPill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewTagPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  actionButtonsRow: {
    gap: 10,
    marginTop: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  disableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  disableBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default PartnerProPromoModal;
