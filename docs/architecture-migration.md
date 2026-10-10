# Migration d’architecture

## Objectif

Aligner le projet ActivityTN sur l’organisation modulaire utilisée par WellbeingPro, en conservant l’écran et les données d’activités existants.

## Périmètre

- `src/application/` : composition racine de l’application. Ce nom évite la détection automatique d’Expo Router, non utilisé par ce projet Expo 51.
- `src/screens/` : écrans et orchestration UI.
- `src/components/` : composants réutilisables.
- `src/services/` : accès aux données.
- `src/hooks/` : logique réutilisable et chargement.
- `src/stores/` : état partagé des favoris.
- `src/context/` : état de navigation local.
- `src/constants/`, `src/theme/`, `src/types/` : contrat visuel et types.
- `src/screens/ChatbotScreen.tsx` : conversation locale, suggestions rapides et saisie de message.
- `src/screens/ProfileScreen.tsx` : profil, statistiques et raccourcis utilisateur.
- `src/screens/ActivityDetailsScreen.tsx` : détail d’une activité, favori et itinéraire.
- `src/screens/FavoritesScreen.tsx` : liste dédiée des activités favorites et état vide.
- `src/context/AppPreferencesContext.tsx` : thème clair/sombre et traductions français, arabe et anglais.
- `src/constants/translations.ts` + `src/hooks/useTranslation.ts` + `src/locales/*.json` : i18n centralisé avec `i18n-js`, fallback français et préparation RTL arabe.

## Décisions

La migration ne copie pas les services métier WellbeingPro ni ses dépendances natives. Le projet reste compatible avec Expo 51 et utilise les données mock existantes derrière un service asynchrone, ce qui permettra de remplacer cette source par une API sans déplacer l’UI.

## Tests réalisés

À compléter après installation/validation du projet.

## Limites connues

- La navigation est encore un état local ; elle pourra être remplacée par React Navigation lorsque plusieurs routes natives seront nécessaires.
- Le chatbot est une interface locale de démonstration ; son branchement à un service conversationnel reste à faire.
- Les préférences sont actuellement conservées pendant la session ; une persistance AsyncStorage pourra être ajoutée avec la dépendance dédiée.
- Les textes existants de `src/data/mockData.js` conservent leur encodage actuel et devront être normalisés dans une tâche dédiée.
- `src/main.js`, `src/styles.css` et `index.html` restent l’ancien point d’entrée web autonome ; l’entrée Expo actuelle passe par `App.tsx`.
