# Plan d'Implémentation : Compte Administrateur & Panneau de Contrôle (Admin Control Center) 👑

> **Pour agents & développeurs :** Ce plan applique la méthodologie TDD et Superpowers. Chaque tâche contient ses fichiers, ses interfaces, ses tests vérifiables et ses critères d'acceptation.

**Objectif :** Doter la plateforme ActivityTN d'un espace d'administration complet, sécurisé et performant permettant de piloter l'écosystème : métriques KPI, modération des activités, gestion des partenaires et suspension des comptes frauduleux.

**Architecture :**
- **Backend (Node.js / Express / MongoDB) :** Module dédié `/api/admin` restreint strictement au rôle `admin` via `auth.middleware.js`. Agrégations MongoDB optimisées pour les KPIs temps réel et opérations de modération.
- **Frontend (Expo / React Native) :** Écran dédié `AdminDashboardScreen` avec tabs (Statistiques & KPI, Activités, Utilisateurs), accessible nativement depuis le profil lorsque `currentUser.role === 'admin'`.

**Tech Stack :** Express, MongoDB / Mongoose, JWT RBAC (Role-Based Access Control), React Native / Expo, Ionicons.

---

## 🔒 Contraintes Globales

1. **Sécurité RBAC stricte :** Seul un token avec `role === "admin"` et `isActive === true` peut exécuter les routes sous `/api/admin`. Tout autre rôle reçoit un code HTTP `403 Forbidden`.
2. **Protection contre l'auto-rétrogradation :** Un administrateur ne peut ni désactiver ni supprimer son propre compte administrateur.
3. **Optimisation MongoDB :** Utilisation d'agrégations avec projections ciblées pour les statistiques et pagination stricte (`limit` max 50).
4. **Multilinguisme & Design :** Interface d'administration intégrée avec Dark/Light mode, badges de statut visuels et support complet de l'arabe et du français.

---

## 🎯 Review Focus (Cas Limites & Risques)

1. **Tentative d'accès par un utilisateur simple :** Requête vers `/api/admin/*` sans rôle admin → 403 immédiat.
2. **Auto-verrouillage :** L'admin tente de suspendre son propre compte → rejet avec message explicite 400.
3. **Activité orpheline :** Suppression d'une activité → nettoyage des avis et des favoris liés.
4. **Pagination et volume important :** Liste de 500+ utilisateurs → pagination paginée côté serveur avec filtres par rôle et ville.
5. **Mode déconnecté / Erreur réseau mobile :** Repli gracieux avec indicateur et bouton "Réessayer".

---

## 📋 Découpage des Tâches (Tasks)

### Tâche 1 : Service & Contrôleur Backend Admin (`backend/services/admin.service.js`, `backend/controllers/admin.controller.js`)

**Fichiers :**
- Créer : `c:\AT\backend\services\admin.service.js`
- Créer : `c:\AT\backend\controllers\admin.controller.js`
- Modifier : `c:\AT\backend\models\Activity.js` (ajout champ `isApproved: Boolean`, par défaut `true` pour démo)

**Fonctionnalités fournies :**
- `getPlatformStats()` : Retourne `{ totalUsers, totalPartners, totalActivities, totalReviews, activitiesByCity }`.
- `getUsersList({ role, status, search, page, limit })` : Liste paginée des utilisateurs avec filtres.
- `updateUserStatus(userId, isActive, adminUserId)` : Bloque ou réactive un compte.
- `updateUserRole(userId, newRole, adminUserId)` : Promeut ou rétrograde un utilisateur.
- `toggleActivityApproval(activityId, isApproved)` : Approuve ou masque une activité partenaire.
- `toggleActivityHighlight(activityId, field)` : Alterne `isFeatured` ou `isPopular`.

---

### Tâche 2 : Routes Sécurisées & Intégration Serveur (`backend/routes/admin.routes.js`, `backend/server.js`)

**Fichiers :**
- Créer : `c:\AT\backend\routes\admin.routes.js`
- Modifier : `c:\AT\backend\server.js` (montage de `app.use("/api/admin", adminRoutes)`)

**Points d'API :**
- `GET /api/admin/stats` → KPI généraux
- `GET /api/admin/users` → Liste des utilisateurs & partenaires
- `PATCH /api/admin/users/:id/status` → Activer / suspendre
- `PATCH /api/admin/users/:id/role` → Modifier le rôle
- `GET /api/admin/activities` → Liste complète pour modération
- `PATCH /api/admin/activities/:id/approve` → Approuver / rejeter
- `PATCH /api/admin/activities/:id/feature` → Mettre en vedette
- `DELETE /api/admin/activities/:id` → Suppression directe modérateur

---

### Tâche 3 : Tests Automatisés Backend RBAC (`backend/tests/admin.test.js`)

**Fichiers :**
- Créer : `c:\AT\backend\tests\admin.test.js`
- Modifier : `c:\AT\backend\package.json` (ajout dans script `npm test`)

**Tests couverts :**
- Test 1 : Rejet d'un utilisateur standard (`role: 'user'`) avec code HTTP 403.
- Test 2 : Accès autorisé pour `role: 'admin'`.
- Test 3 : Calcul correct des statistiques de plateforme.
- Test 4 : Protection contre l'auto-désactivation de l'admin.
- Test 5 : Mise à jour du statut d'une activité (Approuvée / Vedette).

---

### Tâche 4 : Service Client Mobile (`src/services/adminService.ts`)

**Fichiers :**
- Créer : `c:\AT\activitytn\src\services\adminService.ts`
- Modifier : `c:\AT\activitytn\src\types\index.ts` (types `AdminStats`, `AdminUserFilter`)

**Fonctionnalités :**
- Appels HTTP authentifiés avec le Bearer token stocké dans `storage.ts`.
- Gestion des erreurs et typage strict TypeScript.

---

### Tâche 5 : Écran de Contrôle Administrateur (`src/screens/AdminDashboardScreen.tsx`)

**Fichiers :**
- Créer : `c:\AT\activitytn\src\screens\AdminDashboardScreen.tsx`

**Composants & Sous-vues :**
1. **Header Admin Premium :** Badge bouclier rouge/doré, bouton de fermeture/retour, indicateur "Connecté en tant qu'Admin".
2. **Onglet 1 : KPI & Métriques :**
   - 4 cartes statistiques en dégradé (Total Utilisateurs, Partenaires Actifs, Activités, Avis).
   - Répartition des activités par ville (Sfax, Tunis, Sousse, etc.).
3. **Onglet 2 : Modération des Activités :**
   - Liste des activités avec statut (Approuvée / En attente).
   - Boutons d'action rapide : ⭐ Mettre en vedette, 🔥 Populaire, 🗑️ Supprimer.
4. **Onglet 3 : Gestion des Comptes :**
   - Recherche d'utilisateur par nom ou email.
   - Filtre par rôle (`Tous`, `Users`, `Partners`).
   - Switch pour bloquer/débloquer immédiatement un compte.

---

### Tâche 6 : Point d'Entrée & Intégration dans `App.tsx`

**Fichiers :**
- Modifier : `c:\AT\activitytn\App.tsx`

**Expérience utilisateur :**
- Si `currentUser?.role === 'admin'`, une carte dédiée **"👑 Panneau d'administration"** avec bouton "Accéder au dashboard" apparaît dans l'onglet Profil.
- L'appui ouvre `AdminDashboardScreen` en plein écran avec animation fluide et gestion du bouton retour matériel.
