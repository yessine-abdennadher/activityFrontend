import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';

// ─── Typed filters ────────────────────────────────────────────────────────────
export interface RecommendationFilters {
  group?: 'Solo' | 'Couple' | 'Amis' | 'Famille';
  budget?: string;
  budgetMax?: number; // DT
  duration?: string;
  durationMin?: number; // min
  durationMax?: number; // min
  category?: string;
  mood?: string;
  distance?: string;
  distanceMax?: number; // km
  situation?: 'hot' | 'rain' | 'powercut' | 'open_now' | 'surprise_me';
}

interface RecommendationFlowScreenProps {
  filters: RecommendationFilters;
  onFiltersChange: (filters: RecommendationFilters) => void;
  onNavigate: (screen: string) => void;
}

// ─── Situation Card with Vector Icons (100% Ionicons) ─────────────────────────
const SituationCard: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  tag?: string;
  selected: boolean;
  onPress: () => void;
}> = ({ icon, label, sublabel, tag, selected, onPress }) => {
  const { theme, isDark } = usePreferences();
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.situationCard,
        {
          borderColor: selected ? theme.primary : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(2,132,199,0.1)'),
          backgroundColor: selected 
            ? (isDark ? 'rgba(56,189,248,0.12)' : '#E0F2FE')
            : (isDark ? 'rgba(14,30,56,0.65)' : '#FFFFFF'),
          shadowColor: selected ? theme.primary : '#000',
          shadowOpacity: selected ? (isDark ? 0.35 : 0.15) : 0.04,
        },
      ]}
    >
      <View style={[
        styles.situationIconWrap,
        {
          backgroundColor: selected ? theme.primary : (isDark ? 'rgba(255,255,255,0.06)' : '#F0F7FF'),
        },
      ]}>
        <Ionicons name={icon} size={24} color={selected ? '#FFFFFF' : theme.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.situationRow}>
          {tag && (
            <View style={[styles.situationTag, { backgroundColor: selected ? theme.primary : theme.primary + '20' }]}>
              <Text style={[styles.situationTagText, { color: selected ? '#FFFFFF' : theme.primary }]}>{tag}</Text>
            </View>
          )}
          <Text style={[styles.situationLabel, { color: selected ? theme.primary : theme.textMain }]}>
            {label}
          </Text>
        </View>
        <Text style={[styles.situationSub, { color: theme.textMuted }]}>{sublabel}</Text>
      </View>

      <View style={[
        styles.radioIndicator,
        {
          borderColor: selected ? theme.primary : theme.textMuted + '50',
          backgroundColor: selected ? theme.primary : 'transparent',
        },
      ]}>
        {selected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
};

// ─── Grid Choice Card with Vector Icons ────────────────────────────────────────
const ChoiceCard: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}> = ({ label, icon, selected, onPress }) => {
  const { theme, isDark } = usePreferences();
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.choiceCard,
        {
          borderColor: selected ? theme.primary : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(2,132,199,0.1)'),
          backgroundColor: selected 
            ? (isDark ? 'rgba(56,189,248,0.12)' : '#E0F2FE')
            : (isDark ? 'rgba(14,30,56,0.65)' : '#FFFFFF'),
          shadowColor: selected ? theme.primary : '#000',
          shadowOpacity: selected ? (isDark ? 0.35 : 0.15) : 0.04,
        },
      ]}
    >
      <View
        style={[
          styles.choiceIconWrap,
          {
            backgroundColor: selected ? theme.primary : (isDark ? 'rgba(255,255,255,0.06)' : '#F0F7FF'),
          },
        ]}
      >
        <Ionicons name={icon} size={26} color={selected ? '#FFFFFF' : theme.primary} />
      </View>
      <Text
        numberOfLines={2}
        style={[
          styles.choiceLabel,
          { color: selected ? theme.primary : theme.textMain, fontWeight: selected ? '800' : '700' },
        ]}
      >
        {label}
      </Text>

      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Step Progress Bar & Dots ─────────────────────────────────────────────────
const StepBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const { theme, isDark } = usePreferences();
  return (
    <View style={styles.stepProgressContainer}>
      <View style={[styles.stepTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(2,132,199,0.1)' }]}>
        <View
          style={[
            styles.stepFill,
            {
              backgroundColor: theme.primary,
              width: `${((current + 1) / total) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

// ─── Step Definitions (Pure Vector Icons Only) ────────────────────────────────
interface GridStep {
  type: 'grid';
  filterKey: keyof RecommendationFilters;
  badge: string;
  title: string;
  subtitle: string;
  options: Array<{
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    structured?: Partial<RecommendationFilters>;
  }>;
}

interface SituationStep {
  type: 'situation';
  filterKey: 'situation';
  badge: string;
  title: string;
  subtitle: string;
  options: Array<{
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    sublabel: string;
    tag?: string;
  }>;
}

type Step = GridStep | SituationStep;

const STEPS: Step[] = [
  {
    type: 'grid',
    filterKey: 'group',
    badge: '1 / 7 · الصحبة',
    title: 'مع شكون خارج؟',
    subtitle: 'اختر الرفقة المناسبة باش نقترحوا ليك أحسن الأماكن',
    options: [
      { value: 'Solo', icon: 'person-outline', label: 'وحدك\nSolo' },
      { value: 'Couple', icon: 'heart-outline', label: 'Couple\nثنائي' },
      { value: 'Amis', icon: 'people-outline', label: 'صحاب\nAmis' },
      { value: 'Famille', icon: 'home-outline', label: 'عائلة\nFamille' },
    ],
  },
  {
    type: 'grid',
    filterKey: 'budget',
    badge: '2 / 7 · الميزانية',
    title: 'قداش الميزانية للشخص؟',
    subtitle: 'معدل الصرف التقريبي للشخص الواحد (Ticket moyen / pers)',
    options: [
      { value: '0-10 DT', icon: 'gift-outline', label: 'Gratuit · < 10 DT\nقهوة أو خرجة خفيفة', structured: { budgetMax: 10 } },
      { value: '10-30 DT', icon: 'cash-outline', label: '10 – 30 DT\nفطور / وجبة عادية', structured: { budgetMax: 30 } },
      { value: '30-50 DT', icon: 'card-outline', label: '30 – 50 DT\nمطعم مريح & Plat كامل', structured: { budgetMax: 50 } },
      { value: '+50 DT', icon: 'diamond-outline', label: '+ 50 DT\nPremium & Gastronomie', structured: { budgetMax: 999 } },
    ],

  },
  {
    type: 'grid',
    filterKey: 'duration',
    badge: '3 / 7 · الوقت',
    title: 'قداش عندك وقت؟',
    subtitle: 'الوقت المتاح ليك في الخرجة',
    options: [
      { value: 'under-1h', icon: 'flash-outline', label: '< 1h\nسريع و خفيف', structured: { durationMin: 0, durationMax: 60 } },
      { value: '1-2h', icon: 'time-outline', label: '1 – 2h\nنص نهار', structured: { durationMin: 60, durationMax: 120 } },
      { value: '2-4h', icon: 'hourglass-outline', label: '2 – 4h\nعشوية كاملة', structured: { durationMin: 120, durationMax: 240 } },
      { value: 'over-4h', icon: 'sunny-outline', label: '+ 4h\nيوم كامل', structured: { durationMin: 240 } },
    ],
  },
  {
    type: 'grid',
    filterKey: 'category',
    badge: '4 / 7 · النوع',
    title: 'شنوّة تحب تعمل؟',
    subtitle: 'اختر نوع النشاط اللي يستهويك',
    options: [
      { value: 'food', icon: 'restaurant-outline', label: 'Food & Café\nماكلة و قعدة' },
      { value: 'fun', icon: 'game-controller-outline', label: 'Fun & Jeux\nألعاب و ترفيه' },
      { value: 'sport', icon: 'football-outline', label: 'Sport\nرياضة و حركة' },
      { value: 'outdoor', icon: 'leaf-outline', label: 'Outdoor\nطبيعة و بحر' },
      { value: 'creative', icon: 'color-palette-outline', label: 'Créatif & Art\nثقافة و إبداع' },
      { value: 'couple', icon: 'rose-outline', label: 'Romantique\nجو هادئ و رومانسي' },
    ],
  },
  {
    type: 'grid',
    filterKey: 'mood',
    badge: '5 / 7 · الـ Mood',
    title: 'كيفاش حاسس روحك؟',
    subtitle: 'المود العام اللي تحب تعيشو توّا',
    options: [
      { value: 'chill', icon: 'cafe-outline', label: 'Chill & Relax\nريّح بالمرتاح' },
      { value: 'aventure', icon: 'compass-outline', label: 'Aventure\nمغامرة و تشويق' },
      { value: 'romantique', icon: 'heart-circle-outline', label: 'Romantique\nجو شاعري' },
      { value: 'festif', icon: 'musical-notes-outline', label: 'Festif\nحماس و جو صاخب' },
      { value: 'culturel', icon: 'library-outline', label: 'Culturel\nاستكشاف و فن' },
      { value: 'gourmand', icon: 'fast-food-outline', label: 'Gourmand\nعشاق البنة' },
    ],
  },
  {
    type: 'grid',
    filterKey: 'distance',
    badge: '6 / 7 · المسافة',
    title: 'قداش بعيد تنجم تمشي؟',
    subtitle: 'أقصى مسافة تحب تتبعدها من موقعك',
    options: [
      { value: '1 km', icon: 'walk-outline', label: 'على ساقيك\n< 1 km', structured: { distanceMax: 1 } },
      { value: '5 km', icon: 'bicycle-outline', label: 'قريب ليك\n< 5 km', structured: { distanceMax: 5 } },
      { value: '10 km', icon: 'car-outline', label: 'بالكرهبة\n< 10 km', structured: { distanceMax: 10 } },
      { value: 'Toute la ville', icon: 'map-outline', label: 'كل الولاية\nPartout', structured: {} },
    ],
  },
  {
    type: 'situation',
    filterKey: 'situation',
    badge: '7 / 7 · الوضع الخاص',
    title: 'شنوّة وضعك توّا؟',
    subtitle: 'ActivityTN يتكيّف مع ظروفك الآنية 🎯',
    options: [
      { value: 'hot', icon: 'sunny-outline', label: 'الجو سخون برشا', sublabel: 'أماكن مكيّفة (Clim) أو في الظل', tag: 'Clim' },
      { value: 'rain', icon: 'rainy-outline', label: 'الدنيا تشتي ومطر', sublabel: 'أماكن مغلقة ومسقوفة 100%', tag: 'Indoor' },
      { value: 'powercut', icon: 'flash-off-outline', label: 'الكهرباء مقصوصة', sublabel: 'فقط أماكن بمولّد كهربائي (Groupe)', tag: 'Urgent' },
      { value: 'open_now', icon: 'time-outline', label: 'نحب حاجة محلولة توّا', sublabel: 'أماكن تخدم في هذه اللحظة', tag: 'En direct' },
      { value: 'surprise_me', icon: 'sparkles-outline', label: 'ما نعرفش، اقترح عليّا', sublabel: 'خلّي الذكاء الاصطناعي يختار ليك', tag: 'Surprise' },
    ],
  },
];

// ─── Main Screen Component ────────────────────────────────────────────────────
export const RecommendationFlowScreen: React.FC<RecommendationFlowScreenProps> = ({
  filters,
  onFiltersChange,
  onNavigate,
}) => {
  const { theme, isDark } = usePreferences();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const currentValue = filters[current.filterKey as keyof RecommendationFilters];
  const canContinue = !!currentValue;

  const handleSelect = (option: GridStep['options'][number] | SituationStep['options'][number]) => {
    if (current.type === 'grid') {
      const gridOpt = option as GridStep['options'][number];
      onFiltersChange({ ...filters, [current.filterKey]: gridOpt.value, ...(gridOpt.structured ?? {}) });
    } else {
      onFiltersChange({ ...filters, situation: option.value as RecommendationFilters['situation'] });
    }
  };

  const goNext = () => (isLast ? onNavigate('recommendationResults') : setStep(step + 1));
  const goBack = () => (step === 0 ? onNavigate('home') : setStep(step - 1));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      {/* Top Floating Action Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={goBack}
          style={[
            styles.circleButton,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(2,132,199,0.08)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(2,132,199,0.15)',
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.textMain} />
        </TouchableOpacity>

        {/* Dynamic Badge Pill */}
        <View style={[styles.stepBadge, { backgroundColor: isDark ? 'rgba(56,189,248,0.15)' : '#E0F2FE' }]}>
          <Ionicons name="sparkles" size={13} color={theme.primary} />
          <Text style={[styles.stepBadgeText, { color: theme.primary }]}>{current.badge}</Text>
        </View>

        <TouchableOpacity onPress={goNext} style={styles.skipActionBtn} activeOpacity={0.7}>
          <Text style={[styles.skipActionText, { color: theme.textMuted }]}>{t('skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Smooth Step Progress */}
      <StepBar current={step} total={STEPS.length} />

      {/* Main Interactive Flow Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.stepTitle, { color: theme.textMain }]}>{current.title}</Text>
          <Text style={[styles.stepSubtitle, { color: theme.textMuted }]}>{current.subtitle}</Text>
        </View>

        {/* Step 7 — Situation Layout */}
        {current.type === 'situation' && (
          <View style={styles.situationContainer}>
            {(current as SituationStep).options.map((opt) => (
              <SituationCard
                key={opt.value}
                icon={opt.icon}
                label={opt.label}
                sublabel={opt.sublabel}
                tag={opt.tag}
                selected={filters.situation === opt.value}
                onPress={() => handleSelect(opt)}
              />
            ))}
          </View>
        )}

        {/* Steps 1 to 6 — 2 Column Choice Grid */}
        {current.type === 'grid' && (
          <View style={styles.gridContainer}>
            {(current as GridStep).options.map((opt) => (
              <View key={opt.value} style={styles.gridItem}>
                <ChoiceCard
                  label={opt.label}
                  icon={opt.icon}
                  selected={filters[current.filterKey as keyof RecommendationFilters] === opt.value}
                  onPress={() => handleSelect(opt)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Panel with Glow Effect */}
      <View
        style={[
          styles.bottomPanel,
          {
            backgroundColor: isDark ? 'rgba(7,13,24,0.92)' : 'rgba(240,247,255,0.95)',
            borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(2,132,199,0.08)',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: canContinue ? theme.primary : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
              shadowColor: theme.primary,
              shadowOpacity: canContinue ? (isDark ? 0.45 : 0.3) : 0,
            },
          ]}
          onPress={() => { if (canContinue) goNext(); }}
          activeOpacity={canContinue ? 0.85 : 1}
        >
          <Text style={[styles.continueButtonText, { color: canContinue ? '#FFFFFF' : theme.textMuted }]}>
            {isLast ? t('showRecommendations') : t('nextStep')}
          </Text>
          <Ionicons
            name={isLast ? 'sparkles' : 'arrow-forward'}
            size={19}
            color={canContinue ? '#FFFFFF' : theme.textMuted}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Premium UX/UI Stylesheet ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  skipActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepProgressContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  stepTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  stepFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  titleSection: {
    marginBottom: 22,
    alignItems: 'flex-end',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'right',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    textAlign: 'right',
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  choiceCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 126,
    position: 'relative',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    
  
  },
  choiceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  choiceLabel: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  situationContainer: {
    gap: 12,
  },
  situationCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
   
    
  },
  situationIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  situationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  situationLabel: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  situationTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  situationTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  situationSub: {
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 17,
  },
  radioIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
  },
  continueButton: {
    minHeight: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,

    
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
