import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../services/uploadService';
import { ThemeColors } from '../../theme/theme';
import { PartnerActivityItem } from '../../types';
import { ScrollableModal } from '../ui/ScrollableModal';
import { DateCalendarPicker } from '../ui/DateCalendarPicker';
import { PartnerVenuePickerBanner } from './shared/PartnerVenuePickerBanner';
import {
  EVENT_CATEGORIES,
  QUICK_EVENT_DATES,
  QUICK_EVENT_TIMES,
  type EventCategoryKey,
} from './event-modal/constants';
import { EventPosterUploader } from './event-modal/EventPosterUploader';
import { EventLivePreviewCard } from './event-modal/EventLivePreviewCard';

export type { EventCategoryKey };

interface PartnerProEventModalProps {
  visible: boolean;
  activities?: PartnerActivityItem[];
  targetActivity: PartnerActivityItem | null;
  category?: EventCategoryKey;
  title: string;
  image?: string;
  date: string;
  time: string;
  price?: string;
  desc: string;
  theme: ThemeColors;
  isDark: boolean;
  onSelectActivity?: (activity: PartnerActivityItem) => void;
  onCategoryChange?: (val: EventCategoryKey) => void;
  onTitleChange: (val: string) => void;
  onImageChange?: (val: string) => void;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  onPriceChange?: (val: string) => void;
  onDescChange: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const PartnerProEventModal: React.FC<PartnerProEventModalProps> = ({
  visible,
  activities = [],
  targetActivity,
  category = 'music',
  title,
  image = '',
  date,
  time,
  price = '0',
  desc,
  theme,
  isDark,
  onSelectActivity,
  onCategoryChange,
  onTitleChange,
  onImageChange,
  onDateChange,
  onTimeChange,
  onPriceChange,
  onDescChange,
  onClose,
  onSave,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const isFreeEntry = !price || parseFloat(price) === 0;
  const activeCategoryObj =
    EVENT_CATEGORIES.find((c) => c.key === category) || EVENT_CATEGORIES[0];

  const handlePickEventImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l’accès à votre galerie pour ajouter l’affiche de l’événement.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        const uploadRes = await uploadImage(result.assets[0].uri, 'activities');
        if (uploadRes && uploadRes.url && onImageChange) {
          onImageChange(uploadRes.url);
        }
      }
    } catch (err: any) {
      Alert.alert(
        'Échec de l’envoi',
        err.message || 'Impossible de charger cette image. Veuillez réessayer.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      title="Publier un Événement"
      subtitle="Attirez le public avec une soirée, un match ou un atelier spécial"
      height="90%"
      theme={theme}
      contentContainerStyle={styles.container}
    >
      {/* 1. Sélecteur d'établissement hôte réutilisable */}
      <PartnerVenuePickerBanner
        activities={activities}
        targetActivity={targetActivity}
        overlineLabel="Établissement hôte :"
        accentColor="#7C3AED"
        fallbackIcon="musical-notes"
        theme={theme}
        isDark={isDark}
        onSelectActivity={onSelectActivity}
      />

      {/* 2. Thème de l'événement */}
      <View>
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
          Thème de l'événement :
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {EVENT_CATEGORIES.map((cat) => {
            const isSelected = category === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.catChip,
                  isSelected
                    ? { backgroundColor: '#7C3AED', borderColor: '#7C3AED' }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: theme.cardBorder,
                      },
                ]}
                onPress={() => onCategoryChange && onCategoryChange(cat.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon}
                  size={15}
                  color={isSelected ? '#FFFFFF' : theme.textMuted}
                />
                <Text
                  style={[
                    styles.catChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textMain },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Titre de l'événement */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
          Titre de l'événement :
        </Text>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder },
          ]}
        >
          <Ionicons name={activeCategoryObj.icon} size={16} color="#7C3AED" style={{ marginLeft: 12 }} />
          <TextInput
            style={[styles.textInput, { color: theme.textMain }]}
            placeholder={activeCategoryObj.placeholder}
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={onTitleChange}
          />
        </View>
      </View>

      {/* 4. Affiche visuelle */}
      <EventPosterUploader
        image={image}
        uploading={uploadingImage}
        theme={theme}
        isDark={isDark}
        onPickImage={handlePickEventImage}
        onRemoveImage={() => onImageChange && onImageChange('')}
      />

      {/* 5. Date (Raccourcis + Calendrier visuel) */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithActionRow}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
            Date de l'événement :
          </Text>
          <TouchableOpacity
            style={styles.calendarBtn}
            onPress={() => setShowCalendar(!showCalendar)}
            activeOpacity={0.75}
          >
            <Ionicons name="calendar-outline" size={14} color="#7C3AED" />
            <Text style={styles.calendarBtnText}>
              {showCalendar ? 'Fermer calendrier' : 'Calendrier précis'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickPillsRow}>
          {QUICK_EVENT_DATES.map((d) => {
            const isSelected = date === d;
            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.quickPill,
                  isSelected
                    ? { backgroundColor: '#7C3AED', borderColor: '#7C3AED' }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: theme.cardBorder,
                      },
                ]}
                onPress={() => {
                  onDateChange(d);
                  setShowCalendar(false);
                }}
              >
                <Text
                  style={[
                    styles.quickPillText,
                    { color: isSelected ? '#FFFFFF' : theme.textMain },
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showCalendar && (
          <DateCalendarPicker
            selectedDateLabel={date}
            theme={theme}
            isDark={isDark}
            onSelectDate={(formatted) => {
              onDateChange(formatted.replace("Jusqu'au ", ''));
              setShowCalendar(false);
            }}
          />
        )}

        {Boolean(date) && !QUICK_EVENT_DATES.includes(date) && (
          <View
            style={[
              styles.selectedDateBanner,
              { backgroundColor: isDark ? '#2E1065' : '#FAF5FF', borderColor: '#D8B4FE' },
            ]}
          >
            <Ionicons name="calendar" size={14} color="#7C3AED" />
            <Text style={[styles.selectedDateText, { color: isDark ? '#E9D5FF' : '#581C87' }]}>
              Date sélectionnée : {date}
            </Text>
          </View>
        )}
      </View>

      {/* 6. Heure de début */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
          Heure de début :
        </Text>
        <View style={styles.quickPillsRow}>
          {QUICK_EVENT_TIMES.map((t) => {
            const isSelected = time === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.quickPill,
                  isSelected
                    ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: theme.cardBorder,
                      },
                ]}
                onPress={() => onTimeChange(t)}
              >
                <Text
                  style={[
                    styles.quickPillText,
                    { color: isSelected ? '#FFFFFF' : theme.textMain },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 7. Tarif / Accès */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
          Tarif d'entrée :
        </Text>
        <View style={styles.accessRow}>
          <TouchableOpacity
            style={[
              styles.accessBtn,
              isFreeEntry
                ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                : {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: theme.cardBorder,
                  },
            ]}
            onPress={() => onPriceChange && onPriceChange('0')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={15}
              color={isFreeEntry ? '#FFFFFF' : theme.textMuted}
            />
            <Text
              style={[
                styles.accessBtnText,
                { color: isFreeEntry ? '#FFFFFF' : theme.textMain },
              ]}
            >
              Entrée libre (Gratuit)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.accessBtn,
              !isFreeEntry
                ? { backgroundColor: '#7C3AED', borderColor: '#7C3AED' }
                : {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: theme.cardBorder,
                  },
            ]}
            onPress={() => {
              if (isFreeEntry && onPriceChange) onPriceChange('20');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="ticket-outline"
              size={15}
              color={!isFreeEntry ? '#FFFFFF' : theme.textMuted}
            />
            <Text
              style={[
                styles.accessBtnText,
                { color: !isFreeEntry ? '#FFFFFF' : theme.textMain },
              ]}
            >
              Payant (DT)
            </Text>
          </TouchableOpacity>
        </View>

        {!isFreeEntry && (
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: theme.cardBorder,
                marginTop: 6,
              },
            ]}
          >
            <Ionicons name="cash-outline" size={16} color="#7C3AED" style={{ marginLeft: 12 }} />
            <TextInput
              style={[styles.textInput, { color: theme.textMain }]}
              keyboardType="numeric"
              placeholder="20"
              placeholderTextColor={theme.textMuted}
              value={price}
              onChangeText={onPriceChange}
            />
            <Text style={styles.currencySuffix}>DT</Text>
          </View>
        )}
      </View>

      {/* 8. Description courte */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
          Programme & Détails :
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              color: theme.textMain,
              borderColor: theme.cardBorder,
            },
          ]}
          multiline
          placeholder="Ex: Ambiance acoustique intimiste, réservation conseillée..."
          placeholderTextColor={theme.textMuted}
          value={desc}
          onChangeText={onDescChange}
        />
      </View>

      {/* 9. Aperçu en direct modulaire */}
      <EventLivePreviewCard
        icon={activeCategoryObj.icon}
        title={title.trim() || activeCategoryObj.placeholder.replace('Ex: ', '')}
        date={date}
        time={time}
        price={price}
        isFreeEntry={isFreeEntry}
        description={desc}
        theme={theme}
        isDark={isDark}
      />

      {/* 10. Bouton de publication */}
      <TouchableOpacity style={styles.submitBtn} onPress={onSave} activeOpacity={0.85}>
        <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
        <Text style={styles.submitBtnText}>Publier l'événement</Text>
      </TouchableOpacity>
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 10,
    height: '100%',
  },
  currencySuffix: {
    marginRight: 14,
    color: '#7C3AED',
    fontWeight: '800',
    fontSize: 13,
  },
  labelWithActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarBtnText: {
    color: '#7C3AED',
    fontSize: 11.5,
    fontWeight: '700',
  },
  quickPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  quickPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectedDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  selectedDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  accessRow: {
    flexDirection: 'row',
    gap: 10,
  },
  accessBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  accessBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 74,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default PartnerProEventModal;
