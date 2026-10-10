# Backend ActivityTN — rôles et permissions

## Objectif

Définir qui peut gérer les activités, restaurants, cafés et autres lieux.

## Règles

- `user` / `simple_user` : lecture publique des activités et restaurants.
- `admin` / `administrator` : création, modification et suppression.
- L’inscription publique force le rôle `user`; un administrateur doit être attribué de manière contrôlée en base.

## API

- `GET /api/activities` et `GET /api/activities/:id` sont publics.
- `POST`, `PUT` et `DELETE /api/activities` nécessitent un JWT Bearer et le rôle `admin`.
- Le champ `type` accepte `activity`, `restaurant`, `cafe` ou `other`.
- Pour un téléphone physique, définir `EXPO_PUBLIC_API_URL` avec l’adresse IP locale du PC, par exemple `http://192.168.1.20:5000/api`; `localhost` fonctionne pour le web ou un émulateur configuré en conséquence.

## Vérifications

- `npm run typecheck` dans `activitytn/` : validé.
- Vérification syntaxique Node des modèles, contrôleurs et routes backend : validée.
- Test avec MongoDB réel et parcours HTTP complet : À VÉRIFIER.
