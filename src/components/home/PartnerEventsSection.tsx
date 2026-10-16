import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import { EventCard } from './EventCard';
import { EventDetailModal } from './EventDetailModal';
import type { Activity, ActivityEvent } from '../../types';
import type { ThemeColors } from '../../theme/theme';

export interface PartnerEventsSectionProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  theme?: ThemeColors;
}

export const PartnerEventsSection: React.FC<PartnerEventsSectionProps> = ({
  activities,
  onSelectActivity,
  theme: customTheme,
}) => {
  const { theme: ctxTheme, language } = usePreferences();
  const theme = customTheme || ctxTheme;

  // État de sélection d'un événement pour afficher l'interface de détail
  const [selectedEventData, setSelectedEventData] = useState<{
    activity: Activity;
    event: ActivityEvent;
  } | null>(null);

  // Filtrer les activités ayant des événements partenaires (ou afficher les meilleures soirées partenaires)
  const activitiesWithEvents = activities.filter(
    (act) => act.events && act.events.length > 0
  );

  // Si aucune activité n'a d'événement dans la base pour le moment, créer une liste démo basée sur les partenaires existants
  const displayList = activitiesWithEvents.length > 0
    ? activitiesWithEvents
    : activities.slice(0, 4).map((act, idx) => ({
        ...act,
        events: [
          {
            id: `evt-demo-${idx}`,
            title:
              idx === 0
                ? 'Mohamed Live Acoustique'
                : idx === 1
                ? 'Live Jazz & Saxophone Night'
                : idx === 2
                ? 'Stand-up Comedy Live'
                : 'Oriental Oud Session Live',
            image:
              idx === 0
                ? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
                : idx === 1
                ? 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80'
                : idx === 2
                ? 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
                : 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
            date: idx === 0 ? '15 Oct 2026' : idx === 1 ? '17 Oct 2026' : idx === 2 ? '18 Oct 2026' : '24 Oct 2026',
            time: '21:00',
            price: idx === 0 ? 0 : idx === 1 ? 25 : idx === 2 ? 15 : 0,
            description:
              idx === 0
                ? 'Ambiance intimiste à la bougie, musique acoustique live et cocktails signature. Entrée libre.'
                : idx === 1
                ? 'Une nuit magique rythmée par le quartet jazz de Sfax. Saxophone envoûtant et dîner gastronomique.'
                : idx === 2
                ? 'Rires et bonne humeur au rendez-vous avec les meilleurs humoristes de la scène tunisienne.'
                : 'Mélodies d’Orient au luth et percussions traditionnelles pour une veillée inoubliable.',
          },
        ],
      }));

  if (displayList.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* En-tête de section */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconBadge}>
            <Ionicons name="musical-notes" size={16} color="#A855F7" />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              {language === 'ar' ? 'سهرات وأحداث بريميوم ⭐' : language === 'fr' ? 'Soirées & Événements' : 'Events & Live Nights'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              {language === 'ar' ? 'شركاء بريميوم المعتمدين' : 'Partenaires Premium vérifiés ⭐'}
            </Text>
          </View>
        </View>

        <View style={styles.premiumTag}>
          <Text style={styles.premiumTagText}>PREMIUM</Text>
        </View>
      </View>

      {/* Carrousel horizontal des cartes événements (Taille compacte équivalente à ActivityCard) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {displayList.map((act) => {
          const mainEvent = act.events?.[0];
          if (!mainEvent) return null;

          return (
            <EventCard
              key={`event-${act.id}-${mainEvent.id || (mainEvent as any)._id || '0'}`}
              activity={act}
              event={mainEvent}
              onPress={(activity, event) => setSelectedEventData({ activity, event })}
              theme={theme}
            />
          );
        })}
      </ScrollView>

      {/* Interface Détail de l'Événement (Modal avec image, description, et lien restaurant) */}
      <EventDetailModal
        visible={selectedEventData !== null}
        activity={selectedEventData?.activity || null}
        event={selectedEventData?.event || null}
        onClose={() => setSelectedEventData(null)}
        onViewEstablishment={(activity) => {
          setSelectedEventData(null);
          onSelectActivity(activity);
        }}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  premiumTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  premiumTagText: {
    color: '#A855F7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  scrollList: {
    paddingHorizontal: 20,
    gap: 12,
  },
});

export default PartnerEventsSection;
