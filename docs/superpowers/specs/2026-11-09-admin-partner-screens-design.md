# Organisation des écrans Admin et Partenaire

## Intention

Rendre les écrans métier plus faciles à trouver en séparant les écrans d'administration et de partenaire des écrans grand public, sans déplacer les composants déjà classés dans `src/components/admin/` et `src/components/partner/`.

## Approches considérées

- **Déplacement léger retenu** : créer `src/screens/admin/` et `src/screens/partner/`, déplacer un dashboard dans chaque dossier et mettre à jour ses imports. Les composants partagés et spécialisés restent à leur emplacement actuel.
- **Organisation complète par fonctionnalité écartée** : déplacer aussi composants, services, hooks et types sous `src/features/`. Cela élargirait fortement le périmètre et dupliquerait l'organisation déjà présente dans `src/components/`.

## Périmètre

- Déplacer `AdminDashboardScreen.tsx` vers `src/screens/admin/AdminDashboardScreen.tsx`.
- Déplacer `PartnerDashboardScreen.tsx` vers `src/screens/partner/PartnerDashboardScreen.tsx`.
- Adapter les imports dans `App.tsx` et les chemins relatifs internes de ces deux écrans, en conservant les noms et interfaces exportés.
- Ne pas modifier le rendu, les règles métier, les composants, les services, ni les autres écrans.

## Contraintes et risques

- Les deux dashboards importent des modules depuis plusieurs dossiers `src/`; chaque chemin relatif doit être recalculé après le déplacement.
- `App.tsx` est le seul consommateur direct trouvé pour ces deux écrans.
- Des changements locaux préexistants sont présents dans `.env.example`, `src/components/FloatingTabBar.tsx`, `src/components/chatbot/ui/KharjaBotOrb.tsx` et `src/services/apiConfig.ts`; ils doivent rester intacts.

## Validation prévue

- Rechercher les anciennes références de chemin et vérifier qu'elles ont été mises à jour.
- Lancer le contrôle TypeScript si disponible; aucun test automatisé ou changement fonctionnel n'est prévu.
