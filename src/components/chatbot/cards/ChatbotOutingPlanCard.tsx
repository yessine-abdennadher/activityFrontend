/**
 * ChatbotOutingPlanCard.tsx
 * Carte timeline chronologique pour afficher les étapes d'un plan de sortie multi-activités.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../../context/AppPreferencesContext';
import type { OutingPlanStep } from '../types/chatbot.types';

interface ChatbotOutingPlanCardProps {
  steps: OutingPlanStep[];
  onSelectActivityId?: (id: string) => void;
}

export const ChatbotOutingPlanCard: React.FC<ChatbotOutingPlanCardProps> = ({
  steps,
  onSelectActivityId,
}) => {
  const { theme, isDark, language } = usePreferences();
  const isRTL = language === 'ar';

  if (!Array.isArray(steps) || steps.length === 0) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name="map-outline" size={16} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>
          {language === 'ar' ? 'برنامج الخرجة المقترح' : (language === 'en' ? 'Suggested Outing Plan' : 'Plan de sortie suggéré')}
        </Text>
      </View>

      <View style={styles.stepsContainer}>
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const activity = step.activity;

          return (
            <View key={`step-${idx}`} style={[styles.stepRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {/* Timeline Indicator */}
              <View style={styles.timelineCol}>
                <View style={[styles.stepDot, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepDotText}>{idx + 1}</Text>
                </View>
                {!isLast && <View style={[styles.stepConnector, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />}
              </View>

              {/* Step Info */}
              <View
                style={[
                  styles.stepContent,
                  {
                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                    marginBottom: isLast ? 0 : 16,
                  },
                ]}
              >
                <Text style={[styles.categoryLabel, { color: theme.textMuted }]}>
                  {step.category}
                </Text>

                {activity ? (
                  <TouchableOpacity
                    style={[styles.activityPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
                    activeOpacity={0.75}
                    onPress={() => onSelectActivityId?.(activity.id)}
                  >
                    <Text style={[styles.activityName, { color: theme.textMain }]} numberOfLines={1}>
                      {activity.name}
                    </Text>
                    {activity.city ? (
                      <Text style={[styles.activityCity, { color: theme.textMuted }]}>
                        {activity.city}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.emptyStepText, { color: theme.textMuted }]}>
                    {language === 'ar' ? 'في انتظار الاختيار...' : 'À déterminer...'}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  headerRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  stepsContainer: {
    paddingLeft: 4,
  },
  stepRow: {
    gap: 12,
  },
  timelineCol: {
    alignItems: 'center',
    width: 22,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  stepConnector: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  activityPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    width: '100%',
  },
  activityName: {
    fontSize: 13,
    fontWeight: '700',
  },
  activityCity: {
    fontSize: 11,
    marginTop: 1,
  },
  emptyStepText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

