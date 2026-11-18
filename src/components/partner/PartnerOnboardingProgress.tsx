import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { PartnerActivityItem } from '../../types';

interface PartnerOnboardingProgressProps {
  activity: PartnerActivityItem | null;
  theme: ThemeColors;
  isDark: boolean;
  onActionPress: (stepKey: string) => void;
}

export const PartnerOnboardingProgress: React.FC<PartnerOnboardingProgressProps> = ({
  activity,
  theme,
  isDark,
  onActionPress,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!activity || dismissed) return null;

  // Calcul des étapes indispensables pour une visibilité optimale
  const steps = [
    {
      key: 'photos',
      label: 'Photo de couverture',
      completed: Boolean(activity.imageUrl || activity.image),
      hint: 'Une belle photo attire 3x plus de clients',
    },
    {
      key: 'whatsapp',
      label: 'Numéro WhatsApp',
      completed: Boolean(activity.whatsapp && activity.whatsapp.length >= 8),
      hint: 'Permet les réservations en 1 clic direct',
    },
    {
      key: 'hours',
      label: 'Horaires d’ouverture',
      completed: Boolean(activity.openingTime && activity.closingTime),
      hint: 'Affiche en direct si vous êtes ouvert',
    },
    {
      key: 'menu',
      label: 'Carte ou Menu',
      completed: Boolean(activity.menuUrl || (activity.menu && activity.menu.images && activity.menu.images.length > 0)),
      hint: 'Les clients aiment voir les prix à l’avance',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Si tout est complété à 100%, masquer l'encart d'aide pour ne pas encombrer
  if (progressPercent === 100) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
          borderColor: isDark ? '#4338CA' : '#C7D2FE',
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="sparkles" size={17} color="#4F46E5" />
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
            Compléter votre fiche ({progressPercent}%)
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Text style={[styles.badgeText, { color: '#4F46E5' }]}>
            {completedCount}/{steps.length}
          </Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setDismissed(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color={isDark ? '#C7D2FE' : '#64748B'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Barre de progression fluide */}
      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#312E81' : '#E0E7FF' }]}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Liste des étapes restantes cliquables */}
      <View style={styles.stepsList}>
        {steps.map((step) => {
          if (step.completed) return null; // Afficher seulement ce qui manque pour rester épuré
          return (
            <TouchableOpacity
              key={step.key}
              style={[
                styles.stepItem,
                {
                  backgroundColor: isDark ? '#2E106540' : '#FFFFFF',
                  borderColor: isDark ? '#4C1D95' : '#E0E7FF',
                },
              ]}
              onPress={() => onActionPress(step.key)}
              activeOpacity={0.75}
            >
              <View style={styles.stepIconBox}>
                <Ionicons name="add-circle" size={18} color="#4F46E5" />
              </View>

              <View style={styles.stepContent}>
                <Text style={[styles.stepLabel, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  {step.label}
                </Text>
                <Text style={[styles.stepHint, { color: isDark ? '#A5B4FC' : '#64748B' }]} numberOfLines={1}>
                  {step.hint}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={15} color="#94A3B8" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 2,
    borderRadius: 10,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  stepsList: {
    gap: 6,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 8,
  },
  stepIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepHint: {
    fontSize: 10,
    marginTop: 1,
  },
});
