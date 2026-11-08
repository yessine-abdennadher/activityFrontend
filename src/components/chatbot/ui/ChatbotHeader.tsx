/**
 * ChatbotHeader.tsx
 * En-tête épuré et moderne pour l'écran KharjaBot IA style Gemini.
 *
 * Dispose de deux actions rapides :
 * - Bouton Historique (icône horloge / discussions) ouvrant le tiroir des conversations passées
 * - Bouton Nouvelle discussion (icône nouveau message) pour repartir sur une session fraîche
 * 100% vectoriel (Ionicons), zéro emoji, conforme aux règles d'accessibilité et RTL.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../../../context/AppPreferencesContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { KharjaBotOrb, type KharjaBotOrbState } from './KharjaBotOrb';

interface ChatbotHeaderProps {
  onBack?: () => void;
  onReset?: () => void;
  onOpenHistory?: () => void;
  onNewChat?: () => void;
  orbState?: KharjaBotOrbState;
  isTyping?: boolean;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  onBack,
  onReset,
  onOpenHistory,
  onNewChat,
  orbState = 'default',
  isTyping = false,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const handleNewChat = onNewChat || onReset;
  const effectiveOrbState: KharjaBotOrbState = isTyping ? 'thinking' : orbState;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      {/* ── Gauche : Bouton Retour (ou Historique si pas de retour) ── */}
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={theme.textMain}
          />
        </TouchableOpacity>
      ) : onOpenHistory ? (
        <TouchableOpacity
          onPress={onOpenHistory}
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('chatbotHistory')}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={20} color={theme.textMain} />
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButtonPlaceholder} />
      )}

      {/* ── Centre : Identité KharjaBot & État En Ligne ── */}
      <View
        style={[
          styles.centerInfoWrapper,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <View style={styles.avatarContainer}>
          <KharjaBotOrb size={36} animated={true} state={effectiveOrbState} />
          <View style={styles.onlineBadge} />
        </View>

        <View style={[styles.textCol, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text style={[styles.title, { color: theme.textMain }]} numberOfLines={1}>
              {t('chatbotTitle')}
            </Text>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isDark
                    ? 'rgba(16,185,129,0.2)'
                    : '#ECFDF5',
                },
              ]}
            >
              <Ionicons name="ellipse" size={6} color="#10B981" />
              <Text style={styles.statusPillText}>{t('chatbotOnlineStatus')}</Text>
            </View>
          </View>
          <Text
            style={[styles.subtitle, { color: theme.textMuted }]}
            numberOfLines={1}
          >
            {t('chatbotSubtitle')}
          </Text>
        </View>
      </View>

      {/* ── Droite : Actions Rapides (Historique si retour actif, + Nouvelle Discussion) ── */}
      <View
        style={[
          styles.rightActions,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {onBack && onOpenHistory && (
          <TouchableOpacity
            onPress={onOpenHistory}
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('chatbotHistory')}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={19} color={theme.textMain} />
          </TouchableOpacity>
        )}

        {handleNewChat ? (
          <TouchableOpacity
            onPress={handleNewChat}
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('chatbotNewChat')}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={19} color="#6366F1" />
          </TouchableOpacity>
        ) : (
          !onBack && <View style={styles.actionButtonPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  rightActions: {
    alignItems: 'center',
    gap: 6,
  },
  centerInfoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
    marginLeft: 8,
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textCol: {
    flexShrink: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '500',
  },
});
