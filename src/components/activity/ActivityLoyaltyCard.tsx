import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { LoyaltyProgramConfig } from '../../types';
import { ScrollableModal } from '../ui/ScrollableModal';
import { LoyaltyVipCardVisual } from './LoyaltyVipCardVisual';
import {
  fetchUserLoyaltyCard,
  stampLoyaltyCard,
  redeemLoyaltyReward,
} from '../../services/loyaltyService';

interface ActivityLoyaltyCardProps {
  activityId: string;
  activityName: string;
  loyaltyProgram?: LoyaltyProgramConfig;
  isLoggedIn: boolean;
  currentUserId?: string;
  isPartnerPreview?: boolean;
  theme: ThemeColors;
  isDark: boolean;
  variant?: 'banner' | 'card';
}

export const ActivityLoyaltyCard: React.FC<ActivityLoyaltyCardProps> = ({
  activityId,
  activityName,
  loyaltyProgram,
  isLoggedIn,
  currentUserId,
  isPartnerPreview = false,
  theme,
  isDark,
  variant = 'banner',
}) => {
  const initialCode = isPartnerPreview
    ? 'A8F3C1'
    : currentUserId
    ? String(currentUserId).slice(-6).toUpperCase()
    : '';
  const [stampsCount, setStampsCount] = useState(isPartnerPreview ? 3 : 0);
  const [rewardsRedeemed, setRewardsRedeemed] = useState(0);
  const [customerCode, setCustomerCode] = useState(initialCode);
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!isLoggedIn || isPartnerPreview || !loyaltyProgram?.isActive || !activityId) return;
    try {
      const data = await fetchUserLoyaltyCard(activityId);
      setStampsCount(data.stampsCount);
      setRewardsRedeemed(data.rewardsRedeemed);
      if (data.customerCode) setCustomerCode(data.customerCode);
    } catch {
      // Silencieux hors-ligne
    }
  }, [activityId, isLoggedIn, isPartnerPreview, loyaltyProgram?.isActive]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (!loyaltyProgram?.isActive) return null;

  const requiredStamps = loyaltyProgram.requiredStamps || 5;
  const rewardLabel = loyaltyProgram.rewardLabel || `${requiredStamps + 1}ème passage offert`;
  const rewardReady = stampsCount >= requiredStamps;

  const handleActionPress = () => {
    if (isPartnerPreview) {
      Alert.alert(
        'Aperçu Carte VIP Privilège',
        'Voici le rendu Premium de votre carte de fidélité. Vos clients peuvent présenter leur Code Pass ou QR Code en caisse pour cumuler leurs tampons.'
      );
      return;
    }
    if (!isLoggedIn) {
      Alert.alert(
        'Connexion requise',
        'Connectez-vous à votre compte Hamla pour obtenir votre Carte Privilège et cumuler des tampons.'
      );
      return;
    }
    setShowPinFallback(false);
    setPinInput('');
    setPassModalVisible(true);
  };

  const handleConfirmPinFallback = async () => {
    if (pinInput.trim().length < 4) {
      Alert.alert('Code requis', 'Le code comptoir comporte au moins 4 chiffres.');
      return;
    }
    setSubmitting(true);
    try {
      if (rewardReady) {
        const res = await redeemLoyaltyReward(activityId, pinInput.trim());
        setStampsCount(res.card.stampsCount);
        setRewardsRedeemed(res.card.rewardsRedeemed);
        setPassModalVisible(false);
        Alert.alert('Félicitations', res.message);
      } else {
        const res = await stampLoyaltyCard(activityId, pinInput.trim());
        setStampsCount(res.card.stampsCount);
        setPassModalVisible(false);
        Alert.alert('Passage validé', res.message);
      }
    } catch (err: any) {
      Alert.alert('Validation refusée', err.message || 'Vérifiez le code saisi.');
    } finally {
      setSubmitting(false);
    }
  };

  const effectiveCode = customerCode || '001';
  const qrPayload = `https://hamla.tn/pass/${effectiveCode}?venue=${activityId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrPayload
  )}`;

  return (
    <View style={variant === 'banner' ? styles.bannerWrapper : styles.wrapper}>
      {variant === 'banner' ? (
        /* Bannière Privilège Compacte (1 ligne élégante) */
        <TouchableOpacity
          style={[
            styles.bannerCard,
            {
              backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF',
              borderColor: rewardReady ? '#10B981' : isDark ? '#4338CA' : '#DDD6FE',
            },
          ]}
          onPress={handleActionPress}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.bannerIconPill,
              { backgroundColor: rewardReady ? '#059669' : '#6366F1' },
            ]}
          >
            <Ionicons
              name={rewardReady ? 'gift' : 'sparkles'}
              size={15}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.bannerTextCol}>
            <View style={styles.bannerTitleRow}>
              <Text
                style={[
                  styles.bannerTitle,
                  { color: isDark ? '#F5F3FF' : '#1E1B4B' },
                ]}
              >
                {rewardReady ? 'Cadeau débloqué !' : 'Carte Fidélité Hamla'}
              </Text>
              <View
                style={[
                  styles.bannerBadge,
                  {
                    backgroundColor: rewardReady
                      ? '#D1FAE5'
                      : isDark
                      ? '#312E81'
                      : '#EDE9FE',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bannerBadgeText,
                    { color: rewardReady ? '#059669' : '#6366F1' },
                  ]}
                >
                  {rewardReady
                    ? 'Offert'
                    : `${stampsCount}/${requiredStamps} tampons`}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.bannerSub,
                { color: isDark ? '#C4B5FD' : '#6B21A8' },
              ]}
              numberOfLines={1}
            >
              {rewardReady
                ? rewardLabel
                : `${rewardLabel} · Touchez pour le Pass`}
            </Text>
          </View>

          <View style={styles.bannerActionIcon}>
            <Ionicons
              name="qr-code-outline"
              size={18}
              color={rewardReady ? '#10B981' : '#6366F1'}
            />
          </View>
        </TouchableOpacity>
      ) : (
        /* Format Carte Visuelle Complète (UIverse) */
        <>
          <LoyaltyVipCardVisual
            venueName={activityName}
            rewardLabel={rewardLabel}
            stampsCount={stampsCount}
            requiredStamps={requiredStamps}
            customerCode={customerCode || '001'}
            activityId={activityId}
            rewardReady={rewardReady}
            flippable={true}
          />

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: rewardReady ? '#059669' : '#1E1B4B' },
            ]}
            onPress={handleActionPress}
            activeOpacity={0.85}
          >
            <Ionicons
              name={rewardReady ? 'gift' : 'qr-code'}
              size={16}
              color="#FCD34D"
            />
            <Text style={styles.actionBtnText}>
              {rewardReady
                ? 'Présenter mon Pass pour réclamer mon cadeau'
                : 'Présenter mon Pass Fidélité en caisse'}
            </Text>
          </TouchableOpacity>

          {rewardsRedeemed > 0 && (
            <Text style={[styles.redeemedNote, { color: theme.textMuted }]}>
              Vous avez déjà débloqué {rewardsRedeemed} récompense(s) chez {activityName}.
            </Text>
          )}
        </>
      )}

      {/* Modale Pass Client (QR + Code Pass + Option Comptoir) */}
      <ScrollableModal
        visible={passModalVisible}
        onClose={() => {
          setPassModalVisible(false);
          loadStatus();
        }}
        title={rewardReady ? 'Réclamer votre Récompense' : 'Mon Pass Fidélité Hamla'}
        subtitle={`Montrez cet écran au caissier de ${activityName} pour valider`}
        height="76%"
        theme={theme}
        contentContainerStyle={styles.modalContent}
      >
        {/* Rappel Visuel VIP dans la modale */}
        <LoyaltyVipCardVisual
          venueName={activityName}
          rewardLabel={rewardLabel}
          stampsCount={stampsCount}
          requiredStamps={requiredStamps}
          customerCode={customerCode || '001'}
          activityId={activityId}
          rewardReady={rewardReady}
          flippable={false}
        />

        {/* Bloc Code Pass + QR Code */}
        <View
          style={[
            styles.passBox,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.qrFrame}>
            <Image source={{ uri: qrUrl }} style={styles.qrImage} />
          </View>

          <Text style={[styles.codeOverline, { color: theme.textMuted }]}>
            CODE PASS CLIENT À COMMUNIQUER
          </Text>
          <View style={[styles.codePill, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
            <Text style={[styles.codeText, { color: '#4F46E5' }]}>
              #{customerCode || 'HAMLA'}
            </Text>
          </View>
          <Text style={[styles.passHelp, { color: theme.textMuted }]}>
            Le commerçant valide directement votre passage depuis son espace partenaire, sans jamais toucher à votre téléphone.
          </Text>
        </View>

        {/* Bouton rafraîchir le statut après validation */}
        <TouchableOpacity
          style={[styles.refreshBtn, { borderColor: theme.primary }]}
          onPress={loadStatus}
        >
          <Ionicons name="refresh" size={15} color={theme.primary} />
          <Text style={[styles.refreshBtnText, { color: theme.primary }]}>
            Actualiser mes tampons
          </Text>
        </TouchableOpacity>

        {/* Option secondaire : Code Comptoir (si le commerce préfère) */}
        <TouchableOpacity
          style={styles.fallbackToggle}
          onPress={() => setShowPinFallback(!showPinFallback)}
        >
          <Text style={[styles.fallbackToggleText, { color: theme.textMuted }]}>
            {showPinFallback ? 'Masquer le code comptoir' : 'Ou valider avec le code comptoir du lieu'}
          </Text>
        </TouchableOpacity>

        {showPinFallback && (
          <View style={styles.pinFallbackBox}>
            <TextInput
              style={[
                styles.pinInput,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={pinInput}
              onChangeText={(v) => setPinInput(v.replace(/\D/g, ''))}
              placeholder="Code PIN"
              placeholderTextColor={theme.textMuted}
            />
            <TouchableOpacity
              style={[styles.pinConfirmBtn, { backgroundColor: '#4F46E5' }]}
              onPress={handleConfirmPinFallback}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.pinConfirmText}>Valider</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollableModal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    gap: 8,
  },
  bannerWrapper: {
    marginBottom: 6,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerIconPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
    gap: 2,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bannerBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  bannerBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  bannerActionIcon: {
    paddingLeft: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  actionBtnText: {
    color: '#FEF3C7',
    fontSize: 12.5,
    fontWeight: '800',
  },
  redeemedNote: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 12,
  },
  passBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  qrFrame: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 150,
    height: 150,
  },
  codeOverline: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  codePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  passHelp: {
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fallbackToggle: {
    paddingVertical: 6,
  },
  fallbackToggleText: {
    fontSize: 11.5,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  pinFallbackBox: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    alignItems: 'center',
  },
  pinInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 4,
  },
  pinConfirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pinConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
