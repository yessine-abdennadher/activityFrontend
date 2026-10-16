import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WIN_GRADIENTS } from '../../theme';
import { SocialAuthRow } from './SocialAuthRow';
import { InlineToast } from '../../components/ui/Toast';

interface LoginViewProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onGooglePress: () => void;
  googleLoading: boolean;
  onSwitchToSignup: () => void;
  authError: string | null;
  authSuccess: string | null;
  onClearError: () => void;
  isDark?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading,
  onGooglePress,
  googleLoading,
  onSwitchToSignup,
  authError,
  authSuccess,
  onClearError,
  isDark = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Floating Card Sheet */}
      <View style={[styles.card, isDark && styles.darkCard]}>
        {/* Title & Subtitle */}
        <View style={styles.headerBlock}>
          <Text style={[styles.title, isDark && styles.darkTitle]}>Welcome Back</Text>
          <Text style={[styles.subtitle, isDark && styles.darkSub]}>
            Ready to continue your journey? Your path is right here.
          </Text>
        </View>

        {/* Demo Accounts Quick Chips */}
        <View style={styles.demoSection}>
          <Text style={[styles.demoTitle, isDark && styles.darkSub]}>⚡ Comptes démo rapides :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.demoList}>
            <TouchableOpacity
              onPress={() => {
                setEmail('user.sfax@activitytn.tn');
                setPassword('User123456!');
                onClearError();
              }}
              style={[
                styles.demoChip,
                email === 'user.sfax@activitytn.tn' && styles.demoChipActive,
                isDark && styles.darkDemoChip,
              ]}
            >
              <Text style={styles.demoEmoji}>👤</Text>
              <Text style={[styles.demoText, isDark && styles.darkTitle]}>Découvreur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setEmail('partner.moulin@activitytn.tn');
                setPassword('Partner123456!');
                onClearError();
              }}
              style={[
                styles.demoChip,
                email === 'partner.moulin@activitytn.tn' && styles.demoChipActive,
                isDark && styles.darkDemoChip,
              ]}
            >
              <Text style={styles.demoEmoji}>☕</Text>
              <Text style={[styles.demoText, isDark && styles.darkTitle]}>Café Le Moulin (Pro)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setEmail('admin@activitytn.tn');
                setPassword('Admin123456!');
                onClearError();
              }}
              style={[
                styles.demoChip,
                email === 'admin@activitytn.tn' && styles.demoChipActive,
                isDark && styles.darkDemoChip,
              ]}
            >
              <Text style={styles.demoEmoji}>👑</Text>
              <Text style={[styles.demoText, isDark && styles.darkTitle]}>Admin</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          {/* Email input */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, isDark && styles.darkInput]}
              />
            </View>
          </View>

          {/* Password input */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, isDark && styles.darkInput]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember me & Forgot password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={[styles.rememberText, isDark && styles.darkSub]}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          {authError && (
            <InlineToast
              message={authError}
              type="error"
              title="Erreur de connexion"
              onClose={onClearError}
            />
          )}
          {authSuccess && (
            <InlineToast
              message={authSuccess}
              type="success"
              title="Bienvenue !"
              onClose={() => {}}
            />
          )}

          {/* Gradient Log In Button */}
          <TouchableOpacity
            onPress={onSubmit}
            disabled={isLoading || googleLoading}
            activeOpacity={0.85}
            style={styles.submitWrapper}
          >
            <LinearGradient
              colors={WIN_GRADIENTS.buttonPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Log In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <SocialAuthRow
          label="Sign in with"
          onGooglePress={onGooglePress}
          googleLoading={googleLoading}
          disabled={isLoading}
          isDark={isDark}
        />

        {/* Switch to Signup */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, isDark && styles.darkSub]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onSwitchToSignup} activeOpacity={0.7}>
            <Text style={styles.switchLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 10,
  },
  darkCard: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    borderTopWidth: 1,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  darkTitle: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  darkSub: {
    color: '#94A3B8',
  },
  demoSection: {
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  demoList: {
    gap: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  darkDemoChip: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  demoEmoji: {
    fontSize: 13,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  darkInputContainer: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  darkInput: {
    color: '#FFFFFF',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#818CF8',
    borderColor: '#818CF8',
  },
  rememberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  submitWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6366F1',
  },
});
