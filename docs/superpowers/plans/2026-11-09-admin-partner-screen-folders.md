# Admin and Partner Screen Folders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Place the admin and partner dashboard screens in domain folders while retaining existing component locations and behavior.

**Architecture:** Move only the two dashboard screen files into `src/screens/admin/` and `src/screens/partner/`. Update `App.tsx` imports and the moved screens' relative imports; preserve exported component names and props.

**Tech Stack:** Expo, React Native, TypeScript.

**Spec:** `docs/superpowers/specs/2026-11-09-admin-partner-screens-design.md`

## Global Constraints

- Keep shared components in `src/components/` and existing admin/partner components in their current folders.
- Preserve UI, behavior, exports, and screen props.
- Preserve all pre-existing local modifications.

## Review Focus

- Relative imports inside moved screens must still resolve after their path depth changes.
- `App.tsx` must point to the new paths while retaining both named imports.
- No other consumers of the old paths should remain.

---

### Task 1: Relocate Admin and Partner Dashboard Screens

**Files:**
- Move: `src/screens/AdminDashboardScreen.tsx` → `src/screens/admin/AdminDashboardScreen.tsx`
- Move: `src/screens/PartnerDashboardScreen.tsx` → `src/screens/partner/PartnerDashboardScreen.tsx`
- Modify: `App.tsx`
- Modify: relative imports inside the two moved screen files, only where needed

**Interfaces:**
- Preserve `AdminDashboardScreen` and `PartnerDashboardScreen` named exports and their current props.
- Keep all component imports under `src/components/` at their current locations.

- [ ] Create the two domain folders and move each screen without editing its content beyond import paths.
- [ ] Update the two imports in `App.tsx` to the new paths.
- [ ] Search the repository for old screen paths and ensure no stale references remain.
- [ ] Run `npm run typecheck` from `activitytn` and confirm it passes.
