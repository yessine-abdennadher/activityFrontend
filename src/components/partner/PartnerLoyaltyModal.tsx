import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { LoyaltyProgramConfig, PartnerActivityItem } from '../../types';
import { ScrollableModal } from '../ui/ScrollableModal';
import { PartnerVenuePickerBanner } from './shared/PartnerVenuePickerBanner';
import { LoyaltyVipCardVisual } from '../activity/LoyaltyVipCardVisual';
import { LoyaltyQrScannerBox } from './loyalty/LoyaltyQrScannerBox';
import { partnerStampCustomerCard } from '../../services/loyaltyService';

const STAMPS_OPTIONS = [3, 5, 8, 10];
const LOYALTY_DISCOUNT_PRESETS = ['15', '20', '25', '30', '50', '70'];

interface PartnerLoyaltyModalProps {
  visible: boolean;
  activities?: PartnerActivityItem[];
  targetActivity: PartnerActivityItem | null;
  theme: ThemeColors;
  isDark: boolean;
  onSelectActivity?: (activity: PartnerActivityItem) => void;
  onClose: () => void;
  onSave: (activityId: string, config: LoyaltyProgramConfig) => Promise<void>;
}

export const PartnerLoyaltyModal: React.FC<PartnerLoyaltyModalProps> = ({
  visible,
  activities = [],
  targetActivity,
  theme,
  isDark,
  onSelectActivity,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'stamp' | 'config'>('config');

  // Onglet Configuration
  const [isActive, setIsActive] = useState(true);
  const [requiredStamps, setRequiredStamps] = useState(5);
  const [rewardType, setRewardType] = useState<'free' | 'discount' | 'gift'>('free');
  const [rewardDiscountPercent, setRewardDiscountPercent] = useState('50');
  const [rewardLabel, setRewardLabel] = useState('6ème passage offert');
  const [cashierPin, setCashierPin] = useState('1234');
  const [saving, setSaving] = useState(false);

  // Onglet Tamponner un Client
  const [customerQuery, setCustomerQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<'stamp' | 'redeem'>('stamp');
  const [showManualInput, setShowManualInput] = useState(false);
  const [stampingClient, setStampingClient] = useState(false);
  const [lastStampedResult, setLastStampedResult] = useState<{
    message: string;
    rewardReady: boolean;
  } | null>(null);

  useEffect(() => {
    if (!visible || !targetActivity) return;
    const lp = targetActivity.loyaltyProgram;
    const active = lp ? Boolean(lp.isActive) : true;
    setIsActive(active);
    // Si le programme est déjà actif, ouvrir par défaut sur l'onglet rapide "Tamponner"
    setActiveTab(lp?.isActive ? 'stamp' : 'config');

    const stamps = lp?.requiredStamps || 5;
    setRequiredStamps(stamps);
    setRewardType(lp?.rewardType || 'free');
    setRewardDiscountPercent(String(lp?.rewardDiscountPercent || 50));
    setRewardLabel(lp?.rewardLabel || `${stamps + 1}ème passage offert`);
    setCashierPin(lp?.cashierPin || '1234');
    setCustomerQuery('');
    setLastStampedResult(null);
  }, [visible, targetActivity]);

  const handleSelectStampsCount = (count: number) => {
    setRequiredStamps(count);
    if (rewardType === 'free') {
      setRewardLabel(`${count + 1}ème passage offert`);
    } else if (rewardType === 'discount') {
      setRewardLabel(`-${rewardDiscountPercent}% sur le ${count + 1}ème passage`);
    }
  };

  const handleSaveConfig = async () => {
    if (!targetActivity) return;
    const cleanPin = cashierPin.replace(/\D/g, '');
    if (cleanPin.length < 4) {
      Alert.alert('Code requis', 'Veuillez définir un code comptoir de secours d’au moins 4 chiffres.');
      return;
    }

    setSaving(true);
    try {
      await onSave(targetActivity._id, {
        isActive,
        requiredStamps,
        rewardType,
        rewardDiscountPercent:
          rewardType === 'free' ? 100 : parseInt(rewardDiscountPercent, 10) || 50,
        rewardLabel: rewardLabel.trim() || `${requiredStamps + 1}ème passage offert`,
        cashierPin: cleanPin,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStampOrRedeemCustomer = async (
    action: 'stamp' | 'redeem',
    overrideQuery?: string
  ) => {
    if (!targetActivity) return;
    const queryToUse = (overrideQuery !== undefined ? overrideQuery : customerQuery).trim();
    if (!queryToUse) {
      Alert.alert(
        'Code Pass ou Email requis',
        'Scannez le QR Code du client ou saisissez son Code Pass (#XXXXXX).'
      );
      return;
    }

    setStampingClient(true);
    setLastStampedResult(null);
    try {
      const res = await partnerStampCustomerCard(
        targetActivity._id,
        queryToUse,
        action
      );
      setLastStampedResult({
        message: res.message,
        rewardReady: res.rewardReady,
      });
      setCustomerQuery('');
      setShowScanner(false);
      Alert.alert('Validé avec succès', res.message);
    } catch (err: any) {
      setShowScanner(false);
      Alert.alert('Validation impossible', err.message || 'Vérifiez le QR Code ou Code Pass.');
    } finally {
      setStampingClient(false);
    }
  };

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      title="Carte Privilège & Fidélité"
      subtitle="Fidélisez vos clients et validez leurs passages depuis votre téléphone"
      height="92%"
      theme={theme}
      contentContainerStyle={styles.container}
    >
      {/* 1. Sélecteur d'établissement partagé */}
      <PartnerVenuePickerBanner
        activities={activities}
        targetActivity={targetActivity}
        overlineLabel="Établissement concerné :"
        accentColor="#4F46E5"
        fallbackIcon="ribbon"
        theme={theme}
        isDark={isDark}
        onSelectActivity={onSelectActivity}
      />

      {/* 2. Barre d'onglets : Tamponner un Client | Configurer la Carte */}
      <View style={[styles.tabsBar, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'stamp' && [styles.tabBtnActive, { backgroundColor: theme.cardBg }],
          ]}
          onPress={() => setActiveTab('stamp')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="qr-code-outline"
            size={15}
            color={activeTab === 'stamp' ? theme.primary : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'stamp' ? theme.textMain : theme.textMuted },
              activeTab === 'stamp' && styles.tabTextActive,
            ]}
          >
            Tamponner un client
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'config' && [styles.tabBtnActive, { backgroundColor: theme.cardBg }],
          ]}
          onPress={() => setActiveTab('config')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="settings-outline"
            size={15}
            color={activeTab === 'config' ? theme.primary : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'config' ? theme.textMain : theme.textMuted },
              activeTab === 'config' && styles.tabTextActive,
            ]}
          >
            Configurer la carte
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── ONGLET 1 : TAMPONNER UN CLIENT EN CAISSE ── */}
      {activeTab === 'stamp' ? (
        <View style={styles.stampTabContainer}>
          {!targetActivity?.loyaltyProgram?.isActive ? (
            <View
              style={[
                styles.inactiveAlertBox,
                { backgroundColor: isDark ? '#451A03' : '#FFFBEB', borderColor: '#FCD34D' },
              ]}
            >
              <Ionicons name="information-circle-outline" size={20} color="#D97706" />
              <Text style={[styles.inactiveAlertText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                Activez et enregistrez d'abord votre carte de fidélité dans l'onglet « Configurer la carte ».
              </Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.stampGuideCard,
                  { backgroundColor: isDark ? '#0F172A' : '#EEF2FF', borderColor: '#818CF8' },
                ]}
              >
                <Text style={[styles.stampGuideTitle, { color: theme.textMain }]}>
                  Scanner le Digital Pass du client
                </Text>
                <Text style={[styles.stampGuideSub, { color: theme.textMuted }]}>
                  Le client retourne son Digital Pass pour afficher son QR Code. Scannez-le en moins d'une seconde.
                </Text>
              </View>

              {showScanner ? (
                <LoyaltyQrScannerBox
                  theme={theme}
                  isDark={isDark}
                  onCloseScanner={() => setShowScanner(false)}
                  onScanSuccess={(rawData) => {
                    handleStampOrRedeemCustomer(scanMode, rawData);
                  }}
                />
              ) : (
                <View style={styles.stampActionsRow}>
                  <TouchableOpacity
                    style={[styles.stampActionBtn, { backgroundColor: '#4F46E5' }]}
                    onPress={() => {
                      setScanMode('stamp');
                      setShowScanner(true);
                    }}
                    disabled={stampingClient}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.stampActionBtnText}>
                      Scanner le QR Code (+1 Tampon)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.redeemActionBtn, { backgroundColor: '#059669' }]}
                    onPress={() => {
                      setScanMode('redeem');
                      setShowScanner(true);
                    }}
                    disabled={stampingClient}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="gift-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.stampActionBtnText}>
                      Scanner pour Offrir la Récompense
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {lastStampedResult && (
                <View
                  style={[
                    styles.resultBanner,
                    { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#15803D" />
                  <Text style={styles.resultBannerText}>{lastStampedResult.message}</Text>
                </View>
              )}

              {/* Bouton discret de secours : saisie manuelle du Code Pass */}
              <TouchableOpacity
                style={styles.manualFallbackToggle}
                onPress={() => setShowManualInput((prev) => !prev)}
                activeOpacity={0.75}
              >
                <Text style={[styles.manualFallbackText, { color: theme.textMuted }]}>
                  {showManualInput
                    ? 'Masquer la saisie manuelle'
                    : 'Ou saisir le Code Pass (#A8F3C1) manuellement'}
                </Text>
              </TouchableOpacity>

              {showManualInput && (
                <View style={styles.manualBackupBox}>
                  <View
                    style={[
                      styles.inputBox,
                      { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: theme.cardBorder },
                    ]}
                  >
                    <Ionicons name="keypad-outline" size={16} color={theme.primary} style={{ marginLeft: 12 }} />
                    <TextInput
                      style={[styles.textInput, { color: theme.textMain, fontWeight: '700' }]}
                      value={customerQuery}
                      onChangeText={setCustomerQuery}
                      placeholder="Ex: A8F3C1 ou client@email.com"
                      placeholderTextColor={theme.textMuted}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.manualBackupBtnsRow}>
                    <TouchableOpacity
                      style={[styles.manualSmallBtn, { backgroundColor: '#4F46E5' }]}
                      onPress={() => handleStampOrRedeemCustomer('stamp')}
                      disabled={stampingClient}
                    >
                      {stampingClient ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.manualSmallBtnText}>+1 Tampon</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.manualSmallBtn, { backgroundColor: '#059669' }]}
                      onPress={() => handleStampOrRedeemCustomer('redeem')}
                      disabled={stampingClient}
                    >
                      <Text style={styles.manualSmallBtnText}>Offrir récompense</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      ) : (
        /* ── ONGLET 2 : CONFIGURATION & APERÇU PREMIUM ── */
        <View style={styles.configTabContainer}>
          {/* Switch Activation */}
          <View
            style={[
              styles.switchCard,
              { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.cardBorder },
            ]}
          >
            <View style={styles.switchTextCol}>
              <Text style={[styles.switchTitle, { color: theme.textMain }]}>
                Activer la Carte de Fidélité
              </Text>
              <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                Affiche votre carte VIP Privilège aux visiteurs sur Hamla
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Nombre d'achats / tampons requis */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Nombre d'achats avant la récompense :
            </Text>
            <View style={styles.stampsPresetsRow}>
              {STAMPS_OPTIONS.map((num) => {
                const isSel = requiredStamps === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.stampOptionBtn,
                      isSel
                        ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }
                        : {
                            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                            borderColor: theme.cardBorder,
                          },
                    ]}
                    onPress={() => handleSelectStampsCount(num)}
                  >
                    <Text
                      style={[
                        styles.stampOptionText,
                        { color: isSel ? '#FFFFFF' : theme.textMain },
                      ]}
                    >
                      {num} visites
                    </Text>
                    <Text
                      style={[
                        styles.stampOptionSub,
                        { color: isSel ? '#E0E7FF' : theme.textMuted },
                      ]}
                    >
                      {num + 1}ème offert
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Type de récompense */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Récompense débloquée au {requiredStamps + 1}ème passage :
            </Text>
            <View style={styles.rewardTypesRow}>
              {[
                { key: 'free' as const, label: '100% Gratuit', icon: 'gift-outline' as const },
                { key: 'discount' as const, label: 'Réduction %', icon: 'pricetag-outline' as const },
                { key: 'gift' as const, label: 'Cadeau', icon: 'sparkles-outline' as const },
              ].map((rt) => {
                const isSel = rewardType === rt.key;
                return (
                  <TouchableOpacity
                    key={rt.key}
                    style={[
                      styles.rewardTypeChip,
                      isSel
                        ? {
                            backgroundColor: isDark ? '#312E81' : '#EEF2FF',
                            borderColor: '#4F46E5',
                          }
                        : {
                            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                            borderColor: theme.cardBorder,
                          },
                    ]}
                    onPress={() => {
                      setRewardType(rt.key);
                      if (rt.key === 'free') {
                        setRewardLabel(`${requiredStamps + 1}ème passage offert`);
                      } else if (rt.key === 'discount') {
                        setRewardLabel(
                          `-${rewardDiscountPercent}% sur le ${requiredStamps + 1}ème passage`
                        );
                      } else {
                        setRewardLabel(`Cadeau offert dès ${requiredStamps} visites`);
                      }
                    }}
                  >
                    <Ionicons
                      name={rt.icon}
                      size={15}
                      color={isSel ? '#4F46E5' : theme.textMuted}
                    />
                    <Text
                      style={{
                        fontSize: 11.5,
                        fontWeight: isSel ? '800' : '600',
                        color: isSel ? '#4F46E5' : theme.textMain,
                      }}
                    >
                      {rt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {rewardType === 'discount' && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                Choisissez le pourcentage de réduction :
              </Text>
              <View style={styles.discountPresetsRow}>
                {LOYALTY_DISCOUNT_PRESETS.map((pct) => {
                  const isSel = rewardDiscountPercent === pct;
                  return (
                    <TouchableOpacity
                      key={pct}
                      style={[
                        styles.discountPresetChip,
                        isSel
                          ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }
                          : {
                              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                              borderColor: theme.cardBorder,
                            },
                      ]}
                      onPress={() => {
                        setRewardDiscountPercent(pct);
                        setRewardLabel(`-${pct}% sur le ${requiredStamps + 1}ème passage`);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.discountPresetText,
                          {
                            color: isSel ? '#FFFFFF' : theme.textMain,
                            fontWeight: isSel ? '800' : '600',
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

          {/* Libellé de la récompense */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Promesse affichée sur la carte :
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
              value={rewardLabel}
              onChangeText={setRewardLabel}
              placeholder="Ex: 6ème café ou dessert offert"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          {/* Code Comptoir de secours */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Code Comptoir de secours (4 chiffres, optionnel) :
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.pinInput,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              keyboardType="number-pad"
              maxLength={6}
              value={cashierPin}
              onChangeText={(txt) => setCashierPin(txt.replace(/\D/g, ''))}
              placeholder="1234"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          {/* Live Preview Premium (identique à la vue client) */}
          <View style={styles.previewBox}>
            <Text style={[styles.previewHeading, { color: theme.textMuted }]}>
              Aperçu Carte VIP Privilège :
            </Text>
            <LoyaltyVipCardVisual
              venueName={targetActivity?.name || 'Votre Établissement'}
              rewardLabel={rewardLabel || `${requiredStamps + 1}ème passage offert`}
              stampsCount={Math.min(3, requiredStamps)}
              requiredStamps={requiredStamps}
              customerCode="A8F3C1"
            />
          </View>

          {/* Bouton Sauvegarder */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: '#4F46E5' }]}
            onPress={handleSaveConfig}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Enregistrer la Carte Fidélité</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  tabsBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '800',
  },
  stampTabContainer: {
    gap: 14,
  },
  inactiveAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  inactiveAlertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  stampGuideCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  stampGuideTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  stampGuideSub: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    height: '100%',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  resultBannerText: {
    color: '#15803D',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  stampActionsRow: {
    gap: 10,
  },
  stampActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  redeemActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  stampActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  manualFallbackToggle: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  manualFallbackText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  manualBackupBox: {
    gap: 10,
  },
  manualBackupBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualSmallBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  configTabContainer: {
    gap: 14,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  stampsPresetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stampOptionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  stampOptionText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  stampOptionSub: {
    fontSize: 10,
    marginTop: 2,
  },
  rewardTypesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardTypeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  discountPresetsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  discountPresetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.2,
  },
  discountPresetText: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
  },
  pinInput: {
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 6,
    textAlign: 'center',
  },
  previewBox: {
    gap: 6,
  },
  previewHeading: {
    fontSize: 11,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
