/**
 * 🎨 Palette de couleurs centrale officielle WIN / ActivityTN
 * Source unique de vérité pour toutes les couleurs et dégradés de l'application.
 */

export const WIN_COLORS = {
  // 💎 Brand Signature (Couleurs du logo ruban 3D WIN)
  cyan: '#00D2FF',
  cyanLight: '#38BDF8',
  cyanDark: '#0284C7',

  blue: '#2563EB',
  blueDark: '#1D4ED8',
  indigo: '#6366F1',

  violet: '#9865f0ca',
  violetLight: '#C084FC',
  violetDark: '#5B21B6',
  purple: '#9333EA',

  // 🌸 Tons Pastel & Corail (Boutons soyeux & Arrière-plans doux)
  coral: '#FDA4AF',
  pink: '#F472B6',
  peach: '#FFD1BA',
  rose: '#FB7185',

  // 🌿 États & Statuts
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // ⚪ Nuances Neutres (Mode Clair)
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  // 🌌 Nuances Neutres Cosmiques (Mode Sombre)
  darkBg: '#060B24',
  darkCard: '#0F172A',
  darkSurface: '#151D3B',
  darkBorder: 'rgba(255, 255, 255, 0.1)',
} as const;

/**
 * 🌈 Dégradés Signature officiels WIN
 */
export const WIN_GRADIENTS = {
  // En-tête Hero Header (Cyan -> Bleu -> Violet signature)
  headerLight: ['#fce3e4ff', '#c2a9faff', '#8cbbf8ff', '#dbcdfdff'],
  headerDark: ['#060B24', '#0F1E4A', '#1E1245', '#081730'],

  // Boutons CTA Principaux (Corail / Pêche -> Lilas -> Violet soyeux)
  buttonPrimary: ['#FDA4AF', '#C084FC', '#818CF8'],

  // Boutons Accent & Glow (Cyan électrique -> Royal Blue -> Violet)
  buttonAccent: ['#00D2FF', '#2563EB', '#7C3AED'],

  // Arrière-plan Pastel Ondes (Welcome / Auth / Splash)
  pastelWave: ['#fcdadcff', '#e0d4fcff', '#cce0fbff', '#e7defeff'],

  // Feuilles / Cartes flottantes
  cardLight: ['#FFFFFF', '#F8FAFC'],
  cardDark: ['#0F172A', '#1E293B'],
} as const;

/**
 * 🪟 Tokens de Glassmorphism & Translucidité
 */
export const WIN_GLASS = {
  // Badges & Pilules flottantes
  pillBgLight: 'rgba(255, 255, 255, 0.22)',
  pillBorderLight: 'rgba(255, 255, 255, 0.35)',
  pillBgDark: 'rgba(255, 255, 255, 0.08)',
  pillBorderDark: 'rgba(255, 255, 255, 0.15)',

  // Conteneurs verre dépoli
  surfaceGlassLight: 'rgba(255, 255, 255, 0.85)',
  surfaceBorderLight: 'rgba(255, 255, 255, 0.65)',
  surfaceGlassDark: 'rgba(15, 23, 42, 0.85)',
  surfaceBorderDark: 'rgba(255, 255, 255, 0.12)',

  // Halo lumineux
  cyanGlow: 'rgba(0, 210, 255, 0.3)',
  violetGlow: 'rgba(124, 58, 237, 0.25)',
} as const;
