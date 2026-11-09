# Admin Dashboard UX Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in the current ActivityTN feature worktree. Preserve all existing local modifications. Do not merge or push.

**Goal:** Improve the admin dashboard's mobile usability, accessibility, localization, RTL behavior, and theme consistency while preserving its current workflows.

**Architecture:** Extract the header, tab navigation, and activity moderation card from `AdminDashboardScreen` into focused admin UI components. Keep data fetching, state, mutation handlers, and modal ownership in the screen. Use the existing preferences, translation, theme, and icon systems.

**Tech Stack:** React Native, TypeScript, existing `usePreferences`, `useTranslation`, `Ionicons`, JSON locales.

**Spec:** `docs/superpowers/specs/2026-11-09-admin-dashboard-ux-design.md`

## Global Constraints

- Preserve the current admin tab routing, refresh behavior, moderation actions, deletion confirmation, and per-tab loading/error logic.
- All visible labels added or changed by this work use FR/EN/AR locale files.
- Use existing theme tokens and RTL preference; add no dependencies.
- Preserve unrelated modifications already present in the worktree; do not merge or push.
- Do not add or run tests unless specifically requested; run the existing TypeScript typecheck as specified in the approved design.

## Review Focus

- At narrow phone widths, all activity moderation actions wrap and remain reachable.
- Arabic RTL ordering remains legible for header, tabs, and activity actions.
- Selected tab, refresh, retry, moderation, and partner controls expose accessible names and states.
- Larger system text does not hide labels or collapse action controls.
- Light and dark themes retain readable status and action colors.

---

### Task 1: Extract the admin header

**Files:**
- Create: `src/components/admin/AdminDashboardHeader.tsx`
- Modify: `src/screens/admin/AdminDashboardScreen.tsx`

**Interfaces:**
- Consumes: current user display name, theme, dark-mode state, back callback, refresh callback, and translated labels.
- Produces: reusable header matching the current layout with accessible back and refresh buttons sized to at least 44 points.

- [x] Extract header JSX and local styles; add RTL-aware direction and translated title/admin labels.
- [x] Wire the screen callbacks and verify the extraction preserves current navigation and refresh behavior by source review.

### Task 2: Extract accessible admin tab navigation

**Files:**
- Create: `src/components/admin/AdminDashboardTabs.tsx`
- Modify: `src/screens/admin/AdminDashboardScreen.tsx`
- Modify: `src/locales/fr.json`, `src/locales/en.json`, `src/locales/ar.json`

**Interfaces:**
- Consumes: active tab, selection callback, theme, RTL preference, and a typed translation function.
- Produces: horizontally scrollable five-tab navigation with translated labels, accessible roles/names, and selected state.

- [x] Add the missing locale entries consistently to all three dictionaries.
- [x] Move tab bar JSX/styles into the component; give tab controls adequate vertical hit area and accessibility state.
- [x] Replace inline navigation with the new component and verify all five tabs still select the same values.

### Task 3: Extract responsive activity moderation card

**Files:**
- Create: `src/components/admin/ActivityModerationCard.tsx`
- Modify: `src/screens/admin/AdminDashboardScreen.tsx`
- Modify: `src/locales/fr.json`, `src/locales/en.json`, `src/locales/ar.json`

**Interfaces:**
- Consumes: an `AdminActivityItem`, theme, RTL preference, and typed callbacks for approval, feature/popular toggles, and delete.
- Produces: activity card whose actions can wrap at narrow widths and have accessible names and 44-point targets.

- [x] Move image/title/status/action card JSX and styles into the component; use semantic theme colors for surfaces and badges.
- [x] Keep delete confirmation in the parent by passing its existing handler; retain the existing mutation behavior.
- [x] Replace the inline activity-card renderer with the extracted component and check the props against `AdminActivityItem`.

### Task 4: Align remaining states and verify

**Files:**
- Modify: `src/screens/admin/AdminDashboardScreen.tsx`
- Modify: locale files only if a missing label remains after Tasks 1–3.

- [x] Ensure loading/error messages and retry buttons expose appropriate accessibility announcements and labels.
- [x] Ensure touched switches and icon-only controls expose their purpose and state.
- [x] Run the TypeScript compiler directly from `activitytn/` and resolve type errors. (`npm run typecheck` exits 1 without diagnostics in this environment; `node_modules/.bin/tsc.cmd --noEmit --pretty false` exits 0.)
- [x] Review the diff for unrelated changes and run `git diff --check`.
- [x] Report device-width, visual, RTL, and screen-reader checks as `À VÉRIFIER` unless actually performed.
