import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import { formatCalendarDateFr, isPastCalendarDate } from '../../utils/promoHelpers';

const MONTHS_HEADER_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const WEEKDAYS_SHORT_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface DateCalendarPickerProps {
  selectedDateLabel?: string;
  theme: ThemeColors;
  isDark: boolean;
  onSelectDate: (formattedLabel: string, date: Date) => void;
}

export const DateCalendarPicker: React.FC<DateCalendarPickerProps> = ({
  selectedDateLabel,
  theme,
  isDark,
  onSelectDate,
}) => {
  const now = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // Décalage pour commencer la semaine le Lundi (0 = Lun, ..., 6 = Dim)
  const firstDayOffset = useMemo(() => {
    const jsDay = new Date(viewYear, viewMonth, 1).getDay();
    return (jsDay + 6) % 7;
  }, [viewYear, viewMonth]);

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOffset; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  }, [firstDayOffset, daysInMonth]);

  const handlePrevMonth = () => {
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  return (
    <View
      style={[
        styles.calendarCard,
        {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderColor: theme.cardBorder,
        },
      ]}
    >
      {/* En-tête navigation mois */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          disabled={isCurrentMonth}
          style={[styles.navBtn, isCurrentMonth && { opacity: 0.3 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={18} color={theme.textMain} />
        </TouchableOpacity>

        <Text style={[styles.monthTitle, { color: theme.textMain }]}>
          {MONTHS_HEADER_FR[viewMonth]} {viewYear}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.navBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={18} color={theme.textMain} />
        </TouchableOpacity>
      </View>

      {/* Jours de la semaine */}
      <View style={styles.weekRow}>
        {WEEKDAYS_SHORT_FR.map((wd) => (
          <View key={wd} style={styles.weekCell}>
            <Text style={[styles.weekText, { color: theme.textMuted }]}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Grille des jours */}
      <View style={styles.daysGrid}>
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.dayCell} />;
          }

          const past = isPastCalendarDate(viewYear, viewMonth, day, now);
          const dayKey = `${viewYear}-${viewMonth}-${day}`;
          const isToday =
            viewYear === now.getFullYear() &&
            viewMonth === now.getMonth() &&
            day === now.getDate();

          const dateObj = new Date(viewYear, viewMonth, day);
          const formatted = `Jusqu'au ${formatCalendarDateFr(dateObj)}`;
          const isSelected = selectedDayKey === dayKey || selectedDateLabel === formatted;

          return (
            <TouchableOpacity
              key={dayKey}
              style={styles.dayCell}
              disabled={past}
              onPress={() => {
                setSelectedDayKey(dayKey);
                onSelectDate(formatted, dateObj);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dayPill,
                  isSelected && { backgroundColor: '#EA580C' },
                  !isSelected && isToday && { borderWidth: 1.5, borderColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: past
                        ? theme.cardBorder
                        : isSelected
                        ? '#FFFFFF'
                        : theme.textMain,
                      fontWeight: isSelected || isToday ? '800' : '500',
                    },
                  ]}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navBtn: {
    padding: 4,
    borderRadius: 8,
  },
  monthTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekCell: {
    width: '14.28%',
    alignItems: 'center',
  },
  weekText: {
    fontSize: 11,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12.5,
  },
});
