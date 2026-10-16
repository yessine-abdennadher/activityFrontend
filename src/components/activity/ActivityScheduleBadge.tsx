import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActivityScheduleBadgeProps {
  openingTime?: string;
  closingTime?: string;
  openDays?: string[];
  isDark: boolean;
  language: string;
}

export const ActivityScheduleBadge: React.FC<ActivityScheduleBadgeProps> = ({
  openingTime = '09:00',
  closingTime = '23:00',
  openDays = ['Tous les jours'],
  isDark,
  language,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
        },
      ]}
    >
      <Ionicons name="time" size={18} color="#10B981" />
      <View style={styles.textContainer}>
        <Text style={styles.hoursText}>
          {language === 'ar'
            ? 'ساعات العمل الرسمية :'
            : language === 'en'
            ? 'Opening Hours:'
            : 'Horaires d’ouverture :'} {openingTime} - {closingTime}
        </Text>
        <Text style={styles.daysText}>
          {openDays && openDays.length > 0
            ? openDays.join(', ')
            : language === 'ar'
            ? 'مفتوح كامل أيام الأسبوع'
            : language === 'en'
            ? 'Open every day'
            : 'Ouvert tous les jours'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textContainer: {
    flex: 1,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  daysText: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
});
