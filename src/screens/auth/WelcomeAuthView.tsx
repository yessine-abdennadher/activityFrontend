import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeAuthViewProps {
  onGoToLogin: () => void;
  onGoToSignup: () => void;
  onSkip?: () => void;
  isDark?: boolean;
}

export const WelcomeAuthView: React.FC<WelcomeAuthViewProps> = ({
  onGoToLogin,
  onGoToSignup,
  onSkip,
  isDark = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Header Block */}
      <View style={styles.headerBlock}>
        <Text style={[styles.title, isDark && styles.darkText]}>Welcome =)</Text>
        <Text style={[styles.subtitle, isDark && styles.darkSub]}>
          Hi there! We're here to help you explore and book the best experiences in Tunisia.
          {'\n'}The choice is yours: Log in or create an account.
        </Text>
      </View>

      {/* Centerpiece Hero Visual (Inspired by modern minimal aesthetic) */}
      <View style={styles.centerpiece}>
        <View style={styles.brandHeroCard}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <View style={styles.taglineBadge}>
            <Ionicons name="sparkles" size={14} color="#7C3AED" />
            <Text style={styles.taglineText}>MCHINA · SORTIES & BONS PLANS</Text>
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons */}
      <View style={styles.actionsBlock}>
        {/* Primary Solid Button: Create Account */}
        <TouchableOpacity
          style={styles.createAccountBtn}
          onPress={onGoToSignup}
          activeOpacity={0.85}
        >
          <Text style={styles.createAccountText}>Create Account</Text>
        </TouchableOpacity>

        {/* Secondary Outlined Button: Log In */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={onGoToLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        {/* Optional Skip / Explore */}
        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={[styles.skipText, isDark && styles.darkSub]}>
              Continuer en tant qu'invité
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  headerBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSub: {
    color: '#CBD5E1',
  },
  centerpiece: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  brandHeroCard: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  heroLogo: {
    width: 110,
    height: 110,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  actionsBlock: {
    width: '100%',
    gap: 12,
  },
  createAccountBtn: {
    height: 56,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  createAccountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  loginBtn: {
    height: 56,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
