import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PowerCommunityReports } from '../../types';

interface ActivityPowerCommunityReportProps {
  powerReports?: PowerCommunityReports;
  partnerPowerBackupMode?: boolean;
  isDark: boolean;
  language: string;
  isLoggedIn: boolean;
  onVote: (hasPower: boolean) => void;
  votingLoading?: boolean;
}

export const ActivityPowerCommunityReport: React.FC<ActivityPowerCommunityReportProps> = ({
  powerReports,
  partnerPowerBackupMode,
  isDark,
  language,
  isLoggedIn,
  onVote,
  votingLoading = false,
}) => {
  const yesVotes = powerReports?.yesVotes || 0;
  const noVotes = powerReports?.noVotes || 0;
  const totalVotes = yesVotes + noVotes;
  const userVote = powerReports?.userVote;

  // Calcul du statut en temps réel
  const statusInfo = useMemo(() => {
    if (totalVotes > 0) {
      if (yesVotes >= noVotes) {
        return {
          type: 'on',
          title: language === 'ar' ? 'إنارة مؤكدة من الزوار 💡' : 'Lumière confirmée allumée 💡',
          subtitle:
            language === 'ar'
              ? `${yesVotes} شخص أكدوا وجود الكهرباء (${Math.round((yesVotes / totalVotes) * 100)}%)`
              : `${yesVotes} personnes confirment la lumière (${Math.round((yesVotes / totalVotes) * 100)}%)`,
          bgColor: isDark ? '#451A03' : '#FEF3C7',
          borderColor: '#F59E0B',
          textColor: '#B45309',
        };
      } else {
        return {
          type: 'off',
          title: language === 'ar' ? 'انقطاع تيار مبلّغ عنه 🔌' : 'Coupure de courant signalée 🔌',
          subtitle:
            language === 'ar'
              ? `${noVotes} شخص أبلغوا عن انقطاع (${Math.round((noVotes / totalVotes) * 100)}%)`
              : `${noVotes} personnes signalent une coupure (${Math.round((noVotes / totalVotes) * 100)}%)`,
          bgColor: isDark ? '#450A0A' : '#FEE2E2',
          borderColor: '#EF4444',
          textColor: '#DC2626',
        };
      }
    }

    // Aucun vote pour le moment : se base sur la déclaration partenaire
    const partnerOn = partnerPowerBackupMode !== false;
    return {
      type: partnerOn ? 'partner_on' : 'partner_off',
      title: partnerOn
        ? language === 'ar'
          ? 'المحل مجهز بمولد كهربائي 💡'
          : 'Lumière garantie par l’établissement 💡'
        : language === 'ar'
        ? 'إنارة غير متوفرة حالياً'
        : 'Mode lumière non garanti',
      subtitle:
        language === 'ar'
          ? 'في انتظار تأكيد أول زائر على عين المكان'
          : 'En attente du premier signalement des visiteurs sur place',
      bgColor: isDark ? (partnerOn ? '#451A03' : '#1E293B') : partnerOn ? '#FEF3C7' : '#F1F5F9',
      borderColor: partnerOn ? '#F59E0B' : '#94A3B8',
      textColor: partnerOn ? '#B45309' : '#64748B',
    };
  }, [totalVotes, yesVotes, noVotes, partnerPowerBackupMode, isDark, language]);

  // Calcul du temps écoulé depuis la dernière modification
  const lastUpdatedText = useMemo(() => {
    if (!powerReports?.lastReportAt) {
      return language === 'ar' ? 'لا يوجد تحديث اليوم' : 'Aucun signalement aujourd’hui';
    }
    const diffMin = Math.max(
      0,
      Math.floor((Date.now() - new Date(powerReports.lastReportAt).getTime()) / 60000)
    );
    if (diffMin < 1) {
      return language === 'ar' ? 'الآن مباشرة' : 'À l’instant';
    }
    if (diffMin < 60) {
      return language === 'ar' ? `منذ ${diffMin} دقيقة` : `Il y a ${diffMin} min`;
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return language === 'ar' ? `منذ ${diffHours} ساعة` : `Il y a ${diffHours} h`;
    }
    return new Date(powerReports.lastReportAt).toLocaleDateString();
  }, [powerReports?.lastReportAt, language]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: statusInfo.bgColor,
          borderColor: statusInfo.borderColor,
        },
      ]}
    >
      {/* En-tête : Statut + Horodatage de la dernière modif */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.statusEmoji}>
            {statusInfo.type === 'off' ? '🔌' : '💡'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: statusInfo.textColor }]}>
              {statusInfo.title}
            </Text>
            <Text style={[styles.statusSubtitle, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>
              {statusInfo.subtitle}
            </Text>
          </View>
        </View>

        {/* Badge horodatage dernière modification */}
        <View style={styles.lastUpdateBadge}>
          <Ionicons name="time-outline" size={12} color="#6B7280" />
          <Text style={styles.lastUpdateText}>
            {lastUpdatedText}
          </Text>
        </View>
      </View>

      {/* Barre de proportion des signalements si votes existants */}
      {totalVotes > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressYes,
                { width: `${Math.round((yesVotes / totalVotes) * 100)}%` },
              ]}
            />
            <View
              style={[
                styles.progressNo,
                { width: `${Math.round((noVotes / totalVotes) * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelYes}>
              {yesVotes} {language === 'ar' ? 'نعم' : 'Oui'} ({Math.round((yesVotes / totalVotes) * 100)}%)
            </Text>
            <Text style={styles.progressLabelNo}>
              {noVotes} {language === 'ar' ? 'لا' : 'Non'} ({Math.round((noVotes / totalVotes) * 100)}%)
            </Text>
          </View>
        </View>
      )}

      {/* Invitation au vote communautaire */}
      <View style={styles.voteSection}>
        <Text style={[styles.votePrompt, { color: isDark ? '#E2E8F0' : '#334155' }]}>
          {language === 'ar'
            ? 'هل أنت في المكان ؟ شارك برأيك هل توجد كهرباء الآن :'
            : 'Êtes-vous sur place ? Signalez l’état réel du courant :'}
        </Text>

        <View style={styles.voteButtonsRow}>
          {/* Bouton OUI : Il y a de la lumière */}
          <TouchableOpacity
            style={[
              styles.voteBtn,
              styles.voteBtnYes,
              userVote === 'yes' && styles.voteBtnYesActive,
            ]}
            onPress={() => onVote(true)}
            disabled={votingLoading}
            activeOpacity={0.7}
          >
            {votingLoading ? (
              <ActivityIndicator size="small" color="#15803D" />
            ) : (
              <>
                <Text style={styles.voteBtnEmoji}>💡</Text>
                <Text style={[styles.voteBtnText, styles.voteBtnTextYes]}>
                  {language === 'ar' ? 'نعم توجد إنارة' : 'Il y a de la lumière'} ({yesVotes})
                </Text>
                {userVote === 'yes' && (
                  <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                )}
              </>
            )}
          </TouchableOpacity>

          {/* Bouton NON : Pas de lumière */}
          <TouchableOpacity
            style={[
              styles.voteBtn,
              styles.voteBtnNo,
              userVote === 'no' && styles.voteBtnNoActive,
            ]}
            onPress={() => onVote(false)}
            disabled={votingLoading}
            activeOpacity={0.7}
          >
            {votingLoading ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Text style={styles.voteBtnEmoji}>🔌</Text>
                <Text style={[styles.voteBtnText, styles.voteBtnTextNo]}>
                  {language === 'ar' ? 'لا، مقطوعة' : 'Coupure de courant'} ({noVotes})
                </Text>
                {userVote === 'no' && (
                  <Ionicons name="checkmark-circle" size={14} color="#DC2626" />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusEmoji: {
    fontSize: 26,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  lastUpdateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF90',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lastUpdateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  progressContainer: {
    marginTop: 12,
    gap: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressYes: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressNo: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelYes: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  progressLabelNo: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  voteSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
    paddingTop: 10,
    gap: 8,
  },
  votePrompt: {
    fontSize: 11,
    fontWeight: '700',
  },
  voteButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  voteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  voteBtnYes: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  voteBtnYesActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  voteBtnNo: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  voteBtnNoActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  voteBtnEmoji: {
    fontSize: 14,
  },
  voteBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  voteBtnTextYes: {
    color: '#15803D',
  },
  voteBtnTextNo: {
    color: '#B91C1C',
  },
});
