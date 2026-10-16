import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialAuthRowProps {
  label: string;
  onGooglePress: () => void;
  googleLoading?: boolean;
  disabled?: boolean;
  isDark?: boolean;
}

export const SocialAuthRow: React.FC<SocialAuthRowProps> = ({
  label,
  onGooglePress,
  googleLoading = false,
  disabled = false,
  isDark = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, isDark && styles.darkDivider]} />
        <Text style={[styles.dividerText, isDark && styles.darkText]}>{label}</Text>
        <View style={[styles.dividerLine, isDark && styles.darkDivider]} />
      </View>

      <View style={styles.socialIconsRow}>
        {/* Facebook */}
        <TouchableOpacity
          style={[styles.socialBtn, isDark && styles.darkSocialBtn]}
          activeOpacity={0.75}
          disabled={disabled}
        >
          <Ionicons name="logo-facebook" size={20} color="#1877F2" />
        </TouchableOpacity>

        {/* Google (functional) */}
        <TouchableOpacity
          style={[styles.socialBtn, isDark && styles.darkSocialBtn]}
          onPress={onGooglePress}
          disabled={disabled || googleLoading}
          activeOpacity={0.75}
        >
          {googleLoading ? (
            <ActivityIndicator size="small" color="#EA4335" />
          ) : (
            <Ionicons name="logo-google" size={20} color="#EA4335" />
          )}
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity
          style={[styles.socialBtn, isDark && styles.darkSocialBtn]}
          activeOpacity={0.75}
          disabled={disabled}
        >
          <Ionicons name="logo-apple" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 18,
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  darkDivider: {
    backgroundColor: '#334155',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  darkText: {
    color: '#94A3B8',
  },
  socialIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkSocialBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
});
