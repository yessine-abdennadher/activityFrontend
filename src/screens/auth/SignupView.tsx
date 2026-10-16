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

interface SignupViewProps {
  fullName: string;
  setFullName: (val: string) => void;
  selectedRole: 'user' | 'partner';
  setSelectedRole: (role: 'user' | 'partner') => void;
  establishmentName: string;
  setEstablishmentName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onGooglePress: () => void;
  googleLoading: boolean;
  onSwitchToLogin: () => void;
  authError: string | null;
  authSuccess: string | null;
  onClearError: () => void;
  isDark?: boolean;
}

export const SignupView: React.FC<SignupViewProps> = ({
  fullName,
  setFullName,
  selectedRole,
  setSelectedRole,
  establishmentName,
  setEstablishmentName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  isLoading,
  onGooglePress,
  googleLoading,
  onSwitchToLogin,
  authError,
  authSuccess,
  onClearError,
  isDark = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

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
          <Text style={[styles.title, isDark && styles.darkTitle]}>Create Your Account</Text>
          <Text style={[styles.subtitle, isDark && styles.darkSub]}>
            Rejoignez ActivityTN pour vivre et partager les meilleures expériences en Tunisie.
          </Text>
        </View>

        {/* Account Role Selector Pills */}
        <View style={[styles.roleContainer, isDark && styles.darkRoleContainer]}>
          <TouchableOpacity
            style={[styles.roleTab, selectedRole === 'user' && styles.roleTabActive]}
            onPress={() => setSelectedRole('user')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={selectedRole === 'user' ? '#6366F1' : '#64748B'}
            />
            <Text
              style={[
                styles.roleTabText,
                selectedRole === 'user' && styles.roleTabTextActive,
                isDark && selectedRole !== 'user' && styles.darkSub,
              ]}
            >
              Découvreur
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, selectedRole === 'partner' && styles.roleTabActive]}
            onPress={() => setSelectedRole('partner')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={16}
              color={selectedRole === 'partner' ? '#6366F1' : '#64748B'}
            />
            <Text
              style={[
                styles.roleTabText,
                selectedRole === 'partner' && styles.roleTabTextActive,
                isDark && selectedRole !== 'partner' && styles.darkSub,
              ]}
            >
              Partenaire Pro
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
                style={[styles.input, isDark && styles.darkInput]}
              />
            </View>
          </View>

          {/* Establishment Name (if Partner) */}
          {selectedRole === 'partner' && (
            <View style={styles.inputGroup}>
              <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                <Ionicons name="cafe-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Nom de l'établissement (café, resto...)"
                  placeholderTextColor="#94A3B8"
                  value={establishmentName}
                  onChangeText={setEstablishmentName}
                  style={[styles.input, isDark && styles.darkInput]}
                />
              </View>
            </View>
          )}

          {/* Email */}
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

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter password"
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

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, isDark && styles.darkInput]}
              />
            </View>
          </View>

          {/* Messages */}
          {authError && (
            <InlineToast
              message={authError}
              type="error"
              title="Erreur d'inscription"
              onClose={onClearError}
            />
          )}
          {authSuccess && (
            <InlineToast
              message={authSuccess}
              type="success"
              title="Compte créé !"
              onClose={() => {}}
            />
          )}

          {/* Gradient Action Button (Get Started) */}
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
                <Text style={styles.submitBtnText}>Get Started</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <SocialAuthRow
          label="Sign up with"
          onGooglePress={onGooglePress}
          googleLoading={googleLoading}
          disabled={isLoading}
          isDark={isDark}
        />

        {/* Switch to Login */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, isDark && styles.darkSub]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.7}>
            <Text style={styles.switchLink}>Log In</Text>
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
    paddingTop: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 28,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
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
    paddingHorizontal: 12,
  },
  darkSub: {
    color: '#94A3B8',
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  darkRoleContainer: {
    backgroundColor: '#1E293B',
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#6366F1',
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
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
