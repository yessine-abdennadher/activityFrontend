import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';
import { PartnerActivityItem } from '../../types';
import { SwipeableModal } from '../ui/SwipeableModal';

interface PartnerProPromoModalProps {
  visible: boolean;
  targetActivity: PartnerActivityItem | null;
  discount: string;
  label: string;
  promoType: 'all' | 'item';
  targetItem: string;
  validUntil?: string;
  theme: ThemeColors;
  isDark: boolean;
  onDiscountChange: (val: string) => void;
  onLabelChange: (val: string) => void;
  onPromoTypeChange: (val: 'all' | 'item') => void;
  onTargetItemChange: (val: string) => void;
  onValidUntilChange?: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const PartnerProPromoModal: React.FC<PartnerProPromoModalProps> = ({
  visible,
  targetActivity,
  discount,
  label,
  promoType,
  targetItem,
  validUntil = '',
  theme,
  isDark,
  onDiscountChange,
  onLabelChange,
  onPromoTypeChange,
  onTargetItemChange,
  onValidUntilChange,
  onClose,
  onSave,
}) => {
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
              <Text style={{ fontSize: 18 }}>🏷️</Text>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                Créer une Promotion (Pro & Premium ⭐)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={[styles.modalHelpText, { color: theme.textMuted }]}>
              Configurez une offre attractive pour {targetActivity?.name}.
            </Text>

            {/* Type de Promotion : Sur tout vs Sur un article */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Portée de la promotion :</Text>
            <View style={styles.tabRow}>
              <TouchableOpacity
                onPress={() => onPromoTypeChange('all')}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: promoType === 'all' ? '#EA580C' : isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: promoType === 'all' ? '#EA580C' : theme.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: promoType === 'all' ? '#FFFFFF' : theme.textMain },
                  ]}
                >
                  🌐 Sur tout l'établissement
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onPromoTypeChange('item')}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: promoType === 'item' ? '#EA580C' : isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: promoType === 'item' ? '#EA580C' : theme.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: promoType === 'item' ? '#FFFFFF' : theme.textMain },
                  ]}
                >
                  🍕 Sur un article / menu
                </Text>
              </TouchableOpacity>
            </View>

            {/* Si promo sur un article spécifique */}
            {promoType === 'item' && (
              <>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Nom de l'article ou du menu :</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: theme.textMain,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                  placeholder="Ex: Café Gourmand, Pizza 4 Fromages..."
                  placeholderTextColor={theme.textMuted}
                  value={targetItem}
                  onChangeText={onTargetItemChange}
                />
              </>
            )}

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Pourcentage de réduction (%) :</Text>
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
              placeholder="20"
              placeholderTextColor={theme.textMuted}
              value={discount}
              onChangeText={onDiscountChange}
            />

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Titre / Slogan de la promo :</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder={
                promoType === 'all'
                  ? 'Ex: -20% sur toute l\'addition ce soir'
                  : 'Ex: Formule burger à 12 DT au lieu de 16 DT'
              }
              placeholderTextColor={theme.textMuted}
              value={label}
              onChangeText={onLabelChange}
            />

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Période / Date limite de validité :</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="Ex: Jusqu'au 31 Octobre, Ce week-end uniquement..."
              placeholderTextColor={theme.textMuted}
              value={validUntil}
              onChangeText={onValidUntilChange}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={onSave}>
              <Text style={styles.submitBtnText}>Enregistrer la Promotion 🎉</Text>
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
    fontSize: 15.5,
    fontWeight: '800',
  },
  modalHelpText: {
    fontSize: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default PartnerProPromoModal;
