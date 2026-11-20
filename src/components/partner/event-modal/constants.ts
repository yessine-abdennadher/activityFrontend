import { Ionicons } from '@expo/vector-icons';

export type EventCategoryKey = 'music' | 'sport' | 'food' | 'fun' | 'art';

export interface EventCategoryOption {
  key: EventCategoryKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
}

export const EVENT_CATEGORIES: EventCategoryOption[] = [
  {
    key: 'music',
    label: 'Musique / DJ',
    icon: 'musical-notes-outline',
    placeholder: 'Ex: Soirée Acoustique & Guitare Live',
  },
  {
    key: 'sport',
    label: 'Match / Sport',
    icon: 'football-outline',
    placeholder: 'Ex: Diffusion Finale Ligue des Champions sur Écran Géant',
  },
  {
    key: 'food',
    label: 'Brunch / Dégustation',
    icon: 'restaurant-outline',
    placeholder: 'Ex: Grand Brunch du Dimanche Matin',
  },
  {
    key: 'fun',
    label: 'Karaoké / Stand-up',
    icon: 'mic-outline',
    placeholder: 'Ex: Soirée Stand-Up Comedy & Open Mic',
  },
  {
    key: 'art',
    label: 'Atelier / Expo',
    icon: 'color-palette-outline',
    placeholder: 'Ex: Atelier Peinture & Café Créatif',
  },
];

export const QUICK_EVENT_DATES = ['Ce soir', 'Vendredi soir', 'Samedi soir', 'Dimanche'];
export const QUICK_EVENT_TIMES = ['18:00', '19:30', '20:30', '21:00', '22:00'];
