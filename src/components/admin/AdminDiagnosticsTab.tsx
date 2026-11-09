import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';
import { AdminDiagnostics } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface AdminDiagnosticsTabProps {
  diagnosticsData: AdminDiagnostics | null;
  theme: ThemeColors;
  onToggleGlobalElectricity?: (active: boolean) => void;
}

export const AdminDiagnosticsTab: React.FC<AdminDiagnosticsTabProps> = ({
  diagnosticsData,
  theme,
  onToggleGlobalElectricity,
}) => {
  if (!diagnosticsData) return null;

  const { t } = useTranslation();

  const isGlobalElectricityOn = Boolean(diagnosticsData.electricityAlertActive);

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
        {t('adminDiagnosticsTitle')}
      </Text>

      {/* ── ALERTE COUPURE DE COURANT / MODE ÉLECTRICITÉ (Contrôle Admin Plateforme) ── */}
      <View
        style={[
          styles.cardSection,
          {
            backgroundColor: isGlobalElectricityOn ? theme.pillBg : theme.cardBg,
            borderColor: isGlobalElectricityOn ? theme.secondary : theme.cardBorder,
            borderWidth: 1.8,
            marginBottom: 14,
          },
        ]}
      >
        <View style={styles.cardSectionHeader}>
          <Ionicons name="flash-outline" size={22} color={theme.primary} />
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.cardSectionTitle, { color: theme.textMain }]}>
              {t('adminElectricityModeTitle')}
            </Text>
            <Text style={{ fontSize: 12, color: theme.textMuted }}>
              {t('adminPlatformControlled')}
            </Text>
          </View>
          <Switch
            value={isGlobalElectricityOn}
            onValueChange={onToggleGlobalElectricity}
            accessibilityLabel={t('adminElectricityMode')}
            accessibilityState={{ checked: isGlobalElectricityOn }}
            trackColor={{ false: theme.cardBorder, true: theme.secondary }}
            thumbColor={theme.cardBg}
          />
        </View>

        <Text style={[styles.sectionHelpText, { color: theme.textMuted, marginTop: 8 }]}>
          {isGlobalElectricityOn ? t('adminElectricityActiveDescription') : t('adminElectricityInactiveDescription')}
        </Text>
      </View>

      {/* Sessions Overview Card */}
      <View style={[styles.cardSection, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardSectionHeader}>
          <Ionicons name="phone-portrait-outline" size={20} color={theme.primary} />
          <Text style={[styles.cardSectionTitle, { color: theme.textMain }]}>
            {t('adminUsageFrequency')}
          </Text>
        </View>
        <View style={styles.sessionCountRow}>
          <View>
            <Text style={[styles.sessionBigNumber, { color: theme.primary }]}>
              {diagnosticsData.telemetry?.totalSessions || 0}
            </Text>
            <Text style={[styles.sessionSubtitle, { color: theme.textMuted }]}>
              {t('adminTotalAppSessions')}
            </Text>
          </View>
          <View style={[styles.sessionFlameIcon, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="flame" size={32} color={theme.primary} />
          </View>
        </View>
      </View>

      {/* Top Sections / Ecrans les plus consultés */}
      <View style={[styles.cardSection, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, marginTop: 14 }]}>
        <View style={styles.cardSectionHeader}>
          <Ionicons name="pie-chart-outline" size={20} color={theme.primary} />
          <Text style={[styles.cardSectionTitle, { color: theme.textMain }]}>
            {t('adminTopAppSections')}
          </Text>
        </View>
        <Text style={[styles.sectionHelpText, { color: theme.textMuted }]}>
          {t('adminTopSectionsHint')}
        </Text>

        {!diagnosticsData.telemetry?.screenViews || diagnosticsData.telemetry.screenViews.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            {t('adminTelemetryWaiting')}
          </Text>
        ) : (
          <View style={{ gap: 10, marginTop: 6 }}>
            {diagnosticsData.telemetry.screenViews.map((item, idx) => {
              const totalViews = diagnosticsData.telemetry.screenViews.reduce(
                (acc, curr) => acc + curr.count,
                0
              );
              const percent = totalViews > 0 ? Math.round((item.count / totalViews) * 100) : 0;
              const screenLabel = item.screenName === 'tab_home' ? t('adminScreenHome')
                : item.screenName === 'recommendation_flow' ? t('adminScreenRecommendationFlow')
                : item.screenName === 'recommendation_results' ? t('adminScreenRecommendationResults')
                : item.screenName === 'interactive_map' ? t('adminScreenMap')
                : item.screenName === 'activity_details' ? t('adminScreenActivityDetail')
                : item.screenName === 'tab_explore' ? t('adminScreenExplore')
                : item.screenName === 'tab_favorites' ? t('adminScreenFavorites')
                : item.screenName === 'tab_profile' ? t('adminScreenProfile')
                : item.screenName === 'partner_dashboard' ? t('adminScreenPartnerDashboard')
                : item.screenName === 'admin_dashboard' ? t('adminScreenAdminDashboard')
                : t('adminScreenUnknown');

              return (
                <View key={item.screenName || idx} style={{ gap: 4 }}>
                  <View style={styles.screenRow}>
                    <Text style={[styles.screenLabelText, { color: theme.textMain }]}>
                      {screenLabel}
                    </Text>
                    <Text style={[styles.screenCountText, { color: theme.primary }]}>
                      {item.count} {t('adminViewsCount')} ({percent}%)
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: theme.cardBorder }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.max(percent, 4)}%`,
                          backgroundColor: idx === 0 ? theme.secondary : theme.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  cardSection: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHelpText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  sessionCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sessionBigNumber: {
    fontSize: 32,
    fontWeight: '900',
  },
  sessionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sessionFlameIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenLabelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  screenCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
