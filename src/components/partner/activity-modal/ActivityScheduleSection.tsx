import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';
import { TimeWheelPicker } from '../../ui/TimeWheelPicker';
import { OPEN_DAYS_OPTIONS, PARTNER_AMENITIES } from './constants';

interface ActivityScheduleSectionProps {
  formOpeningTime: string;
  formClosingTime: string;
  formOpenDays: string;
  formAmenities: string[];
  formHasAc: boolean;
  formHasPower: boolean;
  electricityAlertActive: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onChangeOpeningTime: (val: string) => void;
  onChangeClosingTime: (val: string) => void;
  onChangeOpenDays: (val: string) => void;
  onToggleAmenity: (key: string) => void;
  onChangeHasAc: (val: boolean) => void;
  onChangeHasPower: (val: boolean) => void;
}

export const ActivityScheduleSection: React.FC<ActivityScheduleSectionProps> = ({
  formOpeningTime,
  formClosingTime,
  formOpenDays,
  formAmenities,
  formHasAc,
  formHasPower,
  electricityAlertActive,
  theme,
  isDark,
  onChangeOpeningTime,
  onChangeClosingTime,
  onChangeOpenDays,
  onToggleAmenity,
  onChangeHasAc,
  onChangeHasPower,
}) => {
  return (
    <View style={styles.container}>
      {/* ── BLOC 1 : DISPONIBILITÉ & HORAIRES D'OUVERTURE ── */}
      <View
        style={[
          styles.cardBlock,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardHeaderIcon, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
            <Ionicons name="time-outline" size={18} color="#4F46E5" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={[styles.cardTitle, { color: theme.textMain }]}>
              Horaires & Jours d'ouverture
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
              Indiquez quand les visiteurs peuvent venir
            </Text>
          </View>
        </View>

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
          Heures d'activité :
        </Text>
        <TimeWheelPicker
          openingTime={formOpeningTime}
          closingTime={formClosingTime}
          onOpeningTimeChange={onChangeOpeningTime}
          onClosingTimeChange={onChangeClosingTime}
          theme={theme}
          isDark={isDark}
        />

        <Text style={[styles.fieldLabel, { color: theme.textMuted, marginTop: 14 }]}>
          Jours d'ouverture :
        </Text>
        <View style={styles.daysRow}>
          {OPEN_DAYS_OPTIONS.map((days) => {
            const isSelected = formOpenDays === days;
            return (
              <TouchableOpacity
                key={days}
                style={[
                  styles.daysChip,
                  isSelected
                    ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: theme.cardBorder,
                      },
                ]}
                onPress={() => onChangeOpenDays(days)}
                activeOpacity={0.75}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
                )}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#FFFFFF' : theme.textMain,
                  }}
                >
                  {days}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── BLOC 2 : ÉQUIPEMENTS & SERVICES CLÉS ── */}
      <View
        style={[
          styles.cardBlock,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardHeaderIcon, { backgroundColor: isDark ? '#2E1065' : '#FAF5FF' }]}>
            <Ionicons name="sparkles-outline" size={18} color="#9333EA" />
          </View>
          <View style={styles.cardHeaderText}>
            <View style={styles.cardTitleWithBadge}>
              <Text style={[styles.cardTitle, { color: theme.textMain }]}>
                Services & Équipements
              </Text>
              {formAmenities.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: isDark ? '#3B0764' : '#F3E8FF' }]}>
                  <Text style={[styles.countBadgeText, { color: '#9333EA' }]}>
                    {formAmenities.length}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
              Sélectionnez les commodités qui valorisent votre lieu
            </Text>
          </View>
        </View>

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
                    ? {
                        backgroundColor: isDark ? '#312E81' : '#EEF2FF',
                        borderColor: '#6366F1',
                      }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: theme.cardBorder,
                      },
                ]}
                onPress={() => onToggleAmenity(a.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={iconName}
                  size={15}
                  color={isSelected ? '#4F46E5' : theme.textMuted}
                />
                <Text
                  style={[
                    styles.amenityChipText,
                    {
                      color: isSelected ? '#4F46E5' : theme.textMain,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── BLOC 3 : CONFORT & ÉNERGIE ── */}
      <View
        style={[
          styles.cardBlock,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardHeaderIcon, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#059669" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={[styles.cardTitle, { color: theme.textMain }]}>
              Confort & Continuité de Service
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
              Rassurez vos clients sur les conditions d'accueil
            </Text>
          </View>
        </View>

        {/* Climatisation */}
        <View style={[styles.switchRow, { borderBottomColor: theme.cardBorder, borderBottomWidth: 1 }]}>
          <View style={styles.switchLeftCol}>
            <View style={[styles.switchIconCircle, { backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' }]}>
              <Ionicons name="snow-outline" size={17} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: theme.textMain }]}>
                Climatisation garantie
              </Text>
              <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                Espace tempéré apprécié lors des fortes chaleurs
              </Text>
            </View>
          </View>
          <Switch
            value={formHasAc}
            onValueChange={onChangeHasAc}
            trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Groupe Électrogène (Toujours présent dans la déclaration de l'établissement) */}
        <View
          style={[
            styles.switchRow,
            electricityAlertActive && {
              backgroundColor: isDark ? '#451A03' : '#FEF3C7',
              borderRadius: 12,
              paddingHorizontal: 10,
              marginTop: 10,
              borderBottomWidth: 0,
            },
          ]}
        >
          <View style={styles.switchLeftCol}>
            <View
              style={[
                styles.switchIconCircle,
                { backgroundColor: isDark ? '#78350F' : '#FEF3C7' },
              ]}
            >
              <Ionicons name="flash-outline" size={17} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.powerTitleRow}>
                <Text
                  style={[
                    styles.switchTitle,
                    { color: electricityAlertActive ? '#B45309' : theme.textMain },
                  ]}
                >
                  Groupe Électrogène
                </Text>
                {electricityAlertActive && (
                  <View style={styles.alertPill}>
                    <Text style={styles.alertPillText}>Alerte active</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.switchSub,
                  { color: electricityAlertActive ? '#92400E' : theme.textMuted },
                ]}
              >
                {electricityAlertActive
                  ? 'Alerte coupure en cours : affiche le badge lumière garantie en priorité sur la carte'
                  : 'Établissement autonome en cas de coupure de courant'}
              </Text>
            </View>
          </View>
          <Switch
            value={formHasPower}
            onValueChange={onChangeHasPower}
            trackColor={{ false: '#CBD5E1', true: '#F59E0B' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingTop: 4,
  },
  cardBlock: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLeftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    gap: 10,
  },
  switchIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  powerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertPill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  alertPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
