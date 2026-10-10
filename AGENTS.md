# AGENTS.md — Technical Architecture & Guidelines for ActivityTN ⚡

This document is the **primary technical specification, architecture handbook, and context memory** for any AI assistant working on the **ActivityTN** mobile application repository.

---

## 🚀 Product Concept & Slogan
- **App Name**: ActivityTN (أكتيفيتي تونس)
- **Slogan**: "شنوّة نعمل توّا؟" (What are we doing right now?)
- **Goal**: Tunisian activity discovery app tailored for young Tunisians, students, couples, and groups of friends to find activities nearby according to budget (DT), duration, distance, and categories.

---

## 🎨 Design System & Visual Guidelines

1. **Color Palette**: Mediterranean Blue & Sapphire Cyan — `#0D7CF2` (Azur), `#00C2FF` (Cyan), `#0A3B8C` (Deep Blue). Defined in `src/theme/theme.ts`.
2. **Visual Style**: Light glassmorphism — white/cyan gradients, soft shadows, frosted blurs, bright accents. Avoid dark/heavy colors on interactive elements.
3. **Icons**: Strictly use **`@expo/vector-icons` (Ionicons)**. Never use emoji or text strings as icons in core components.
4. **Card Design**: Rounded cards (`borderRadius: 20–32`), generous drop shadows, glassmorphic overlays. Defined in `src/components/home/ActivityCard.tsx`.
5. **Buttons**: Use `AnimatedGlowButton` (`src/components/ui/AnimatedGlowButton.tsx`) for primary CTAs — bright white/cyan glassmorphic style with animated shimmer/glow.
6. **Navigation Bar**: Floating pill-shaped bottom tab bar (`borderRadius: 999`) with active gradient highlight. Always visible on primary tabs with `zIndex: 9999`.
7. **Header**: Ambient mesh-orb background using Mediterranean palette, with glassmorphic search bar.
8. **Dark Mode & Theme**: Managed globally via `AppPreferencesContext.tsx`. Tokens in `src/theme/theme.ts` (`lightTheme` / `darkTheme`).
9. **Localization**: All user-facing text uses `src/constants/translations.ts`, `src/hooks/useTranslation.ts`, and locale files `src/locales/{fr,ar,en}.json`. No hardcoded strings in screens.
10. **RTL**: Arabic via centralized `configureRTL`. All components must be usable when `isRTL` is active.

---

## 📂 Project Structure

```
activitytn/
├── App.tsx                          # Expo entry point — IntroGate + MainContent
├── index.html                       # Web preview (phone frame mockup)
├── package.json
├── AGENTS.md                        # This file
└── src/
    ├── screens/                     # ⚠️ One file per screen — mandatory rule
    │   ├── SplashScreen.tsx                 # Animated splash / brand intro
    │   ├── OnboardingScreen.tsx             # First-run onboarding flow
    │   ├── HomeScreenTab.tsx                # Home tab UI (ambient header + activity feed)
    │   ├── RecommendationFlowScreen.tsx     # Step-by-step recommendation wizard
    │   ├── RecommendationResultsScreen.tsx  # Filtered activity results
    │   ├── MapScreen.tsx                    # Map / nearby activities view
    │   ├── ActivityDetailsScreen.tsx        # Full activity detail page
    │   ├── FavoritesScreen.tsx              # Saved/favorite activities
    │   ├── ProfileScreen.tsx                # User profile, settings, dark mode toggle
    │   ├── ChatbotScreen.tsx                # AI chatbot interface
    │   ├── AuthScreen.tsx                   # Login / Signup
    │   ├── StatusStateScreen.tsx            # Loading, empty, and error states
    │   ├── MchinaMvpScreens.tsx             # ⚠️ LEGACY — do not add new screens here
    │   └── HomeScreen.tsx                   # ⚠️ LEGACY — superseded by HomeScreenTab.tsx
    ├── components/
    │   ├── ActivityCard.tsx         # Canonical localized activity card with i18n & glassmorphism
    │   ├── FloatingTabBar.tsx       # Floating pill tab bar
    │   ├── GoogleMapView.tsx        # Map integration component
    │   └── ui/
    │       ├── AnimatedGlowButton.tsx   # Primary CTA (bright glassmorphism + shimmer)
    │       ├── LikeButton.tsx           # Animated favorite/like button
    │       └── NewtonsCradleLoader.tsx  # Loading animation
    ├── context/
    │   └── AppPreferencesContext.tsx  # Global dark mode, language, RTL state
    ├── theme/
    │   └── theme.ts                 # lightTheme / darkTheme color tokens
    ├── types/
    │   └── index.ts                 # TypeScript interfaces (Activity, Category, User)
    ├── data/
    │   └── mockData.js              # Tunisian activity datasets (Sfax, Tunis, Sousse…)
    ├── constants/
    │   └── translations.ts          # i18n key constants
    ├── hooks/
    │   └── useTranslation.ts        # Translation hook
    ├── locales/
    │   ├── fr.json
    │   ├── ar.json
    │   └── en.json
    └── services/                    # API service layer (ready for backend)
```

---

## 🧭 Navigation Architecture

Navigation is **state-based** (no React Navigation library). `App.tsx` owns all navigation state.

```
App.tsx
 └── IntroGate
      ├── phase === 'splash'      → <SplashScreen>
      ├── phase === 'onboarding'  → <OnboardingScreen>
      └── phase === 'app'         → <MainContent>
                                       ├── activeTab === 'home'          → <HomeScreenTab>
                                       ├── activeTab === 'explore'       → Explore/Filter UI (inline in App.tsx)
                                       ├── activeTab === 'favorites'     → <FavoritesScreen>
                                       ├── activeTab === 'profile'       → <ProfileScreen>
                                       └── activeTab === 'notifications' → Notifications UI (inline in App.tsx)
```

**Overlay states** (rendered on top of active tab):
- `recommendationScreen === 'flow'` → `<RecommendationFlowScreen>`
- `recommendationScreen === 'results'` → `<RecommendationResultsScreen>`
- `selectedActivity !== null` → `<ActivityDetailsScreen>`
- `mapVisible === true` → `<MapScreen>`

---

## 🗑️ Deprecated / Legacy Files (Cleaned)

| File | Status | Replacement |
|------|--------|-------------|
| `src/screens/MchinaMvpScreens.tsx` | ❌ Obsolete | Modular screens in `src/screens/` and `App.tsx` |
| `src/screens/HomeScreen.tsx` | ❌ Obsolete | `src/screens/HomeScreenTab.tsx` |
| `src/screens/FavoritesScreen.tsx` | ❌ Obsolete | Integrated interactive Favorites tab in `App.tsx` |
| `src/screens/ProfileScreen.tsx` | ❌ Obsolete | Integrated interactive Profile tab in `App.tsx` |
| `src/components/home/ActivityCard.tsx` | ❌ Duplicate | Canonical `src/components/ActivityCard.tsx` (supports i18n & optional theme) |
| `src/application/RootLayout.tsx` | ❌ Inactive | Root `App.tsx` entrypoint |

---

## 🇹🇳 Tunisian Localization Details
- **Cities**: Sfax, Tunis, Sousse, Hammamet, Monastir, Bizerte.
- **Currency**: DT / TND.
- **Language**: Tunisian Arabic dialect for user-facing content, RTL support.

---

## ⚡ Backend Readiness
API endpoints to connect when backend is ready:
- `GET /activities`
- `GET /categories`
- `POST /recommendations`
- `POST /favorites`

---

## ✅ Mandatory Rules

1. **One screen = one file** under `src/screens/`. Never bundle multiple screens in one file.
2. **Real vector icons only**: Use `Ionicons` from `@expo/vector-icons`. No emoji, Unicode characters, or text strings used as icons.
3. **Bright UI**: CTAs and interactive elements use the light glassmorphic Mediterranean palette. No dark/dull colors on buttons.
4. **Theme tokens**: Always use `theme.*` from `AppPreferencesContext` — never hardcode colors.
5. **Localization**: All user-facing strings through translation hooks/locale files. No hardcoded text in screens.
6. **Favorites & details**: Every `ActivityCard` must support opening the detail view and toggling favorites.
7. **Architecture rules go here**: Any new global rule must be added to this file, not to tool-specific configs.
