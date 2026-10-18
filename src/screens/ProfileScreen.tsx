import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { AvatarPickerModal } from '../components/profile/AvatarPickerModal';
import { PalettePickerModal } from '../components/profile/PalettePickerModal';
import { APP_PALETTES } from '../theme/palettes';
import { updateUserAvatar } from '../services/authService';
import type { AuthUser } from '../types';

interface ProfileScreenProps {
  currentUser: AuthUser | null;
  favoritesCount: number;
  onUpdateUser: (user: AuthUser) => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenAdminDashboard: () => void;
  onOpenPartnerDashboard: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  favoritesCount,
  onUpdateUser,
  onLogout,
  onOpenNotifications,
  onOpenAdminDashboard,
  onOpenPartnerDashboard,
}) => {
  const { isDark, theme, toggleDarkMode, language, setLanguage, palette } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [palettePickerVisible, setPalettePickerVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);

  const activePaletteObj = APP_PALETTES.find((p) => p.id === palette) || APP_PALETTES[0];
  const paletteDisplayName =
    language === 'ar'
      ? activePaletteObj.nameAr
      : language === 'en'
      ? activePaletteObj.nameEn
      : activePaletteObj.nameFr;

  const handleSelectAvatar = async (newAvatarUri: string) => {
    const updated = await updateUserAvatar(newAvatarUri);
    if (updated) {
      onUpdateUser(updated);
    }
  };

  const roleColor =
    currentUser?.role === 'admin'
      ? '#EF4444'
      : currentUser?.role === 'partner'
      ? '#F59E0B'
      : '#0D7CF2';

  const roleIcon =
    currentUser?.role === 'admin'
      ? 'shield-checkmark'
      : currentUser?.role === 'partner'
      ? 'cafe'
      : 'person';

  const roleText =
    currentUser?.role === 'admin'
      ? (language === 'ar' ? 'مسؤول المنصة' : language === 'en' ? 'Administrator' : 'Administrateur')
      : currentUser?.role === 'partner'
      ? currentUser?.establishmentName || (language === 'ar' ? 'شريك أعمال' : language === 'en' ? 'Partner Business' : 'Partenaire')
      : (language === 'ar' ? 'مستخدم' : language === 'en' ? 'Member' : 'Utilisateur');

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View>
        {/* Hero Profil avec dégradé officiel du thème */}
        <LinearGradient
          colors={theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHero}
        >
          <TouchableOpacity
            style={styles.avatarPickerTrigger}
            onPress={() => setAvatarPickerVisible(true)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('changeAvatarTitle')}
          >
            <Image
              source={{
                uri:
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              }}
              style={styles.profileAvatar}
            />
            <View style={[styles.avatarCameraBadge, { backgroundColor: theme.headerBg || '#0369A1' }]}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editPhotoPill}
            onPress={() => setAvatarPickerVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={13} color="#FFFFFF" />
            <Text style={styles.editPhotoPillText}>
              {language === 'ar' ? 'تعديل الصورة' : language === 'en' ? 'Edit Photo' : 'Modifier la photo'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.profileName}>{currentUser?.name || 'Utilisateur ActivityTN'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email || ''}</Text>

          <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
            <Ionicons name={roleIcon} size={12} color="#FFFFFF" />
            <Text style={styles.roleBadgeText}>{roleText}</Text>
          </View>

          {currentUser?.city && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{currentUser.city}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats */}
        <View style={[styles.profileStats, { backgroundColor: theme.cardBg }]}>
          <View style={styles.profileStat}>
            <Text style={[styles.profileStatValue, { color: theme.primary }]}>{favoritesCount}</Text>
            <Text style={[styles.profileStatLabel, { color: theme.textMuted }]}>
              {language === 'ar' ? 'المفضلة' : language === 'en' ? 'Favorites' : 'Favoris'}
            </Text>
          </View>
          <View style={[styles.profileStatDivider, { backgroundColor: theme.cardBorder }]} />
          <View style={styles.profileStat}>
            <Text style={[styles.profileStatValue, { color: theme.primary }]}>14</Text>
            <Text style={[styles.profileStatLabel, { color: theme.textMuted }]}>
              {language === 'ar' ? 'اكتشافات' : language === 'en' ? 'Explored' : 'Découvertes'}
            </Text>
          </View>
          <View style={[styles.profileStatDivider, { backgroundColor: theme.cardBorder }]} />
          <View style={styles.profileStat}>
            <Text style={[styles.profileStatValue, { color: theme.primary }]}>4.8</Text>
            <Text style={[styles.profileStatLabel, { color: theme.textMuted }]}>
              {language === 'ar' ? 'التقييم' : language === 'en' ? 'Rating' : 'Note moy.'}
            </Text>
          </View>
        </View>

        <View style={{ gap: 12, padding: 20 }}>
          {/* Panneau Administrateur */}
          {currentUser?.role === 'admin' && (
            <TouchableOpacity
              style={[
                styles.adminCtaCard,
                {
                  backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                  borderColor: isDark ? '#4338CA' : '#C7D2FE',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={onOpenAdminDashboard}
              activeOpacity={0.8}
            >
              <View style={[styles.adminCtaLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.adminCtaIconBox}>
                  <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.adminCtaTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                      {language === 'ar' ? 'لوحة الإدارة' : language === 'en' ? 'Admin Dashboard' : 'Panneau d\'administration'}
                    </Text>
                    <View style={styles.adminPill}>
                      <Text style={styles.adminPillText}>ADMIN</Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.adminCtaSub,
                      { color: isDark ? '#A5B4FC' : '#4F46E5', textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {language === 'ar'
                      ? 'مؤشرات الأداء، الإشراف والتحكم'
                      : language === 'en'
                      ? 'Live KPIs, moderation & management'
                      : 'KPI en direct, modération & gestion'}
                  </Text>
                </View>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#4F46E5" />
            </TouchableOpacity>
          )}

          {/* Espace Partenaire Pro */}
          {currentUser?.role === 'partner' && (
            <TouchableOpacity
              style={[
                styles.adminCtaCard,
                {
                  backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                  borderColor: isDark ? '#4338CA' : '#818CF8',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={onOpenPartnerDashboard}
              activeOpacity={0.8}
            >
              <View style={[styles.adminCtaLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.adminCtaIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="restaurant" size={24} color="#6D28D9" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.adminCtaTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]} numberOfLines={1}>
                      {currentUser?.establishmentName || (language === 'ar' ? 'فضاء الشريك المهني' : 'Espace Partenaire Pro')}
                    </Text>
                    <View style={[styles.adminPill, { backgroundColor: '#6D28D9' }]}>
                      <Text style={styles.adminPillText}>PRO</Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.adminCtaSub,
                      { color: isDark ? '#C7D2FE' : '#6D28D9', textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {language === 'ar'
                      ? 'إدارة المؤسسة، الفعاليات والعروض'
                      : language === 'en'
                      ? 'Manage venue, events & offers'
                      : 'Gérer mon restaurant / établissement & mes offres'}
                  </Text>
                </View>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#6D28D9" />
            </TouchableOpacity>
          )}

          {/* Raccourci Notifications */}
          <TouchableOpacity
            style={[
              styles.settingRow,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={onOpenNotifications}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="notifications-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.textMain }]}>{t('notifications')}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.textSub} />
          </TouchableOpacity>

          {/* Mode Sombre */}
          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.textMain }]}>{t('darkMode')}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Palette de Couleurs */}
          <TouchableOpacity
            style={[
              styles.settingRow,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={() => setPalettePickerVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Changer la palette de couleurs"
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="color-palette-outline" size={22} color={theme.primary} />
              <View>
                <Text style={[styles.settingText, { color: theme.textMain }]}>
                  {t('colorPaletteTitle')}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 1, textAlign: isRTL ? 'right' : 'left' }}>
                  {paletteDisplayName}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
              {/* Preview swatches */}
              <View style={{ flexDirection: 'row', gap: 3 }}>
                {activePaletteObj.previewColors.slice(0, 3).map((hex, i) => (
                  <View
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: hex,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.textSub} />
            </View>
          </TouchableOpacity>

          {/* Notifications Switch */}
          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="notifications-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.textMain }]}>{t('notifications')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Langue (AR, FR, EN) */}
          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="language-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.textMain }]}>{t('language')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['ar', 'fr', 'en'] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  accessibilityRole="button"
                  onPress={() => setLanguage(item)}
                  style={[styles.languageChip, language === item && { backgroundColor: theme.primary }]}
                >
                  <Text style={{ color: language === item ? '#FFFFFF' : theme.textMain, fontWeight: '700' }}>
                    {item.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Service de Localisation GPS */}
          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="navigate-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.textMain }]}>{t('locationServices')}</Text>
            </View>
            <Switch
              value={locationServicesEnabled}
              onValueChange={setLocationServicesEnabled}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Bouton Déconnexion */}
          <TouchableOpacity
            style={[
              styles.settingRow,
              {
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={[styles.settingText, { color: '#EF4444' }]}>
                {language === 'fr' ? 'Se déconnecter' : language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
              </Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color="#EF4444" />
          </TouchableOpacity>

          <Text style={{ color: theme.textMuted, textAlign: 'center', fontSize: 12, marginTop: 8 }}>
            ActivityTN · Version 1.0
          </Text>
        </View>
      </View>

      {/* Modal de sélection d'avatar pour l'utilisateur */}
      <AvatarPickerModal
        visible={avatarPickerVisible}
        currentAvatar={currentUser?.avatar}
        onClose={() => setAvatarPickerVisible(false)}
        onSelectAvatar={handleSelectAvatar}
      />

      {/* Modal développé de sélection de la palette de couleurs */}
      <PalettePickerModal
        visible={palettePickerVisible}
        onClose={() => setPalettePickerVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  profileHero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarPickerTrigger: {
    position: 'relative',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 8,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  editPhotoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  editPhotoPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  profileStats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  profileStat: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  profileStatLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  profileStatDivider: {
    height: 30,
    width: 1,
  },
  adminCtaCard: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  adminCtaLeft: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  adminCtaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminCtaTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  adminPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  adminPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  adminCtaSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  settingRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '700',
  },
  languageChip: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
});
