---
trigger: always_on
description: Règle d'or : Toujours utiliser ScrollableModal pour les modaux partagés et formulaires modaux (partenaire, établissement, etc.)
---

# Règle d'Architecture : Utilisation systématique de ScrollableModal

Pour tout modal partagé, feuille d'édition, formulaire modal ou modal d'action (notamment pour l'espace partenaire, la création ou modification d'établissement / activité, les promotions et options) :

1. **Composant Obligatoire** :
   - Toujours importer et utiliser `ScrollableModal` depuis `src/components/ui/ScrollableModal.tsx`.
   - Ne jamais réimplémenter de `<Modal>` React Native inline standard avec un `<ScrollView>` interne basique ou des boutons de fermeture manuels répétitifs.

2. **Propriétés & Bonnes Pratiques avec ScrollableModal** :
   - `visible: boolean`
   - `onClose: () => void`
   - `title?: string` & `subtitle?: string`
   - `height?: number | string` (ex: `"90%"`, `"82%"`)
   - `contentContainerStyle` pour les marges intérieures.
   - Ne **pas** réinsérer un deuxième `<ScrollView>` comme enfant direct : `ScrollableModal` intègre déjà son propre `<ScrollView>` fluide, évitant ainsi tout conflit de défilement (nested scroll bugs).

3. **UX & Accessibilité Tactile** :
   - Fermeture par swipe vers le bas (*swipe down to dismiss*) avec physique de ressort élastique.
   - Fermeture par tap à l'extérieur (*backdrop dismiss*).
   - Fermeture par touche retour Android (*hardware back button*).
