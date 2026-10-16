import { PowerCommunityReports } from '../types';
import { reportActivityPowerStatus as apiReportPowerStatus } from './activityService';

export interface PowerStatusInfo {
  type: 'on' | 'off' | 'partner_on' | 'partner_off';
  title: string;
  subtitle: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

/**
 * Service de gestion des signalements communautaires du courant et éclairage
 */
export const powerReportService = {
  /**
   * Calcule le statut en temps réel selon les votes des utilisateurs et le mode secours partenaire
   */
  calculateStatusInfo(
    powerReports?: PowerCommunityReports,
    partnerPowerBackupMode?: boolean,
    isDark = false,
    language = 'fr'
  ): PowerStatusInfo {
    const yesVotes = powerReports?.yesVotes || 0;
    const noVotes = powerReports?.noVotes || 0;
    const totalVotes = yesVotes + noVotes;

    if (totalVotes > 0) {
      if (yesVotes >= noVotes) {
        const percent = Math.round((yesVotes / totalVotes) * 100);
        return {
          type: 'on',
          title: language === 'ar' ? 'إنارة مؤكدة من الزوار 💡' : 'Lumière confirmée allumée 💡',
          subtitle:
            language === 'ar'
              ? `${yesVotes} شخص أكدوا وجود الكهرباء (${percent}%)`
              : `${yesVotes} personnes confirment la lumière (${percent}%)`,
          bgColor: isDark ? '#451A03' : '#FEF3C7',
          borderColor: '#F59E0B',
          textColor: '#B45309',
        };
      } else {
        const percent = Math.round((noVotes / totalVotes) * 100);
        return {
          type: 'off',
          title: language === 'ar' ? 'انقطاع تيار مبلّغ عنه 🔌' : 'Coupure de courant signalée 🔌',
          subtitle:
            language === 'ar'
              ? `${noVotes} شخص أبلغوا عن انقطاع (${percent}%)`
              : `${noVotes} personnes signalent une coupure (${percent}%)`,
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
  },

  /**
   * Formate le temps relatif écoulé depuis le dernier signalement
   */
  formatLastReportTime(lastReportAt?: string | null, language = 'fr'): string {
    if (!lastReportAt) {
      return language === 'ar' ? 'لا يوجد تحديث اليوم' : 'Aucun signalement aujourd’hui';
    }

    const diffMin = Math.max(
      0,
      Math.floor((Date.now() - new Date(lastReportAt).getTime()) / 60000)
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

    return new Date(lastReportAt).toLocaleDateString();
  },

  /**
   * Soumet un signalement communautaire vers le backend
   */
  async submitPowerReport(activityId: string, hasPower: boolean) {
    return apiReportPowerStatus(activityId, hasPower);
  },
};
