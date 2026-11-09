# Admin Dashboard UX/UI Design

## Intent

Improve the ActivityTN admin dashboard for phone use, assistive technology, and the existing French, Arabic, and English locales. Preserve current admin workflows and data behavior while addressing the UX audit findings.

## Scope

- Extract the dashboard header and refresh action into `src/components/admin/AdminDashboardHeader.tsx`.
- Extract the five-tab navigation into `src/components/admin/AdminDashboardTabs.tsx`, with translated labels and an announced selected state.
- Extract activity moderation cards and their actions into `src/components/admin/ActivityModerationCard.tsx`; allow controls to wrap on narrow screens and give interactive targets at least 44 points.
- Add the required text keys to `src/locales/fr.json`, `src/locales/en.json`, and `src/locales/ar.json`; use the existing translation hook and RTL preference.
- Replace fixed functional colors in the touched components with the existing theme tokens where available.
- Give icon-only controls accessible names, expose loading and error announcements, and preserve the current per-tab data behavior.

## Non-goals

- No changes to admin permissions, API contracts, moderation rules, or data loading architecture.
- No redesign of the diagnostics and review workflows beyond accessible labels and theme compatibility where they are directly touched.
- No new dependencies, navigation framework, or unrelated dashboard refactor.

## Approaches

1. **Patch the large screen in place.** Fastest, but keeps navigation and activity-card behavior coupled to a very large screen and makes responsive behavior harder to review.
2. **Extract focused UI components (chosen).** Moves the header, tabs, and activity card into separate files while preserving the existing screen as the composition point. This keeps the change within the audit scope and makes touch sizing, RTL, and accessibility easier to verify per component.

## Constraints and decisions

- Use the existing `useTranslation`, `usePreferences`, theme tokens, and `Ionicons`.
- Preserve current labels semantically while providing FR/EN/AR translations.
- Respect the existing selected tab and refresh behavior.
- Keep destructive activity deletion confirmation and all current moderation actions.
- Avoid wrapping away or hiding actions at narrow widths; controls must remain reachable.
- Existing unrelated worktree changes must be preserved.

## Acceptance criteria

- Header actions and interactive moderation controls have at least 44-point touch areas.
- Each tab announces its translated name and selected state to accessibility services.
- French, English, Arabic, and RTL layout are applied to the extracted UI.
- Activity-card actions remain visible and operable at narrow phone widths.
- Touched loading/error states are announced accessibly and retry remains available.
- Theme-dependent surfaces use semantic theme colors instead of fixed light-only colors.
- `npm run typecheck` succeeds; no claim of visual or screen-reader validation is made unless those checks are actually performed.

## Files

- Create: `src/components/admin/AdminDashboardHeader.tsx`
- Create: `src/components/admin/AdminDashboardTabs.tsx`
- Create: `src/components/admin/ActivityModerationCard.tsx`
- Modify: `src/screens/admin/AdminDashboardScreen.tsx`
- Modify: `src/locales/fr.json`, `src/locales/en.json`, `src/locales/ar.json`
- Document: this design and the implementation plan under `docs/superpowers/`
