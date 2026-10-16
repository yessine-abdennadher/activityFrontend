import React from 'react';
import {
  Modal,
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

interface PartnerProEventModalProps {
  visible: boolean;
  targetActivity: PartnerActivityItem | null;
  title: string;
  image?: string;
  date: string;
  time: string;
  price?: string;
  desc: string;
  theme: ThemeColors;
  isDark: boolean;
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
  targetActivity,
  title,
  image = '',
  date,
  time,
  price = '',
  desc,
  theme,
  isDark,
  onTitleChange,
  onImageChange,
  onDateChange,
  onTimeChange,
  onPriceChange,
  onDescChange,
  onClose,
  onSave,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Text style={{ fontSize: 18 }}>🎵</Text>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                Organiser un Événement / Soirée (Pro ⭐)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={[styles.modalHelpText, { color: theme.textMuted }]}>
              Annoncez une soirée musicale, dégustation avec DJ ou animation pour {targetActivity?.name}.
            </Text>

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Nom de l'événement :</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="Ex: Soirée Acoustique & Guitare Live"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={onTitleChange}
            />

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Photo / Affiche de l'événement (URL) :</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="https://images.unsplash.com/... (optionnel)"
              placeholderTextColor={theme.textMuted}
              value={image}
              onChangeText={onImageChange}
            />

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Date :</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: theme.textMain,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                  placeholder="Ex: Samedi 18 Octobre"
                  placeholderTextColor={theme.textMuted}
                  value={date}
                  onChangeText={onDateChange}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Heure :</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: theme.textMain,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                  placeholder="21:00"
                  placeholderTextColor={theme.textMuted}
                  value={time}
                  onChangeText={onTimeChange}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Prix d'entrée (DT) :</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="Ex: 20 (ou 0 pour Entrée libre)"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={onPriceChange}
            />

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Description de la soirée :</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: theme.textMain,
                  borderColor: theme.cardBorder,
                },
              ]}
              multiline
              numberOfLines={2}
              placeholder="Détails de l'ambiance, artistes présents..."
              placeholderTextColor={theme.textMuted}
              value={desc}
              onChangeText={onDescChange}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={onSave}>
              <Text style={styles.submitBtnText}>Publier la Soirée Live 🎶</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1.5,
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
    fontSize: 16,
    fontWeight: '800',
  },
  modalHelpText: {
    fontSize: 12,
    marginBottom: 12,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  submitBtn: {
    height: 50,
    backgroundColor: '#DB2777',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
