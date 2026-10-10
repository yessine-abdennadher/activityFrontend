import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { AuthUser } from '../types';
import { login, register, loginWithGoogle } from '../services/authService';
import { getGoogleClientId, setGoogleClientId } from '../services/apiConfig';
import {
  getSavedGoogleAccounts,
  saveGoogleAccount,
  removeGoogleAccount,
  type SavedGoogleAccount,
} from '../services/googleAccountsStore';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: (user: AuthUser) => void;
  onBack?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onSuccess,
  onBack,
}) => {
  const { theme } = usePreferences();
  const { t } = useTranslation();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'user' | 'partner'>('user');
  const [fullName, setFullName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة السر');
      return;
    }

    if (mode === 'signup') {
      if (!fullName) {
        Alert.alert('خطأ', 'يرجى إدخال الاسم الكامل');
        return;
      }
      if (selectedRole === 'partner' && !establishmentName) {
        Alert.alert('خطأ', 'يرجى إدخال اسم المقهى / المطرح / المشروع');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('خطأ', 'كلمتا السر غير متطابقتين');
        return;
      }
    }

    setIsLoading(true);
    try {
      const authenticatedUser = mode === 'login'
        ? await login(email, password)
        : await register(fullName, email, password, selectedRole, establishmentName);
      setIsLoading(false);
      Alert.alert('تم بنجاح! 🎉', mode === 'login' ? 'تم تسجيل الدخول بنجاح' : 'تم إنشاء الحساب بنجاح');
      if (onSuccess) onSuccess(authenticatedUser);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('خطأ', error instanceof Error ? error.message : 'تعذر الاتصال بالخادم');
    }
  };

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>(getSavedGoogleAccounts());
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleFullName, setGoogleFullName] = useState('');

  const handleGoogleSignIn = () => {
    setSavedAccounts(getSavedGoogleAccounts());
    setIsAddingNewAccount(false);
    setShowGoogleModal(true);
  };

  const handleSelectAccount = async (account: SavedGoogleAccount) => {
    setGoogleLoading(true);
    try {
      const authenticatedUser = await loginWithGoogle({
        email: account.email,
        name: account.name,
        avatar: account.avatar,
        googleId: 'google_' + Math.abs(account.email.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)),
      });

      saveGoogleAccount({
        ...account,
        lastUsed: new Date().toISOString(),
      });
      setSavedAccounts(getSavedGoogleAccounts());

      setGoogleLoading(false);
      setShowGoogleModal(false);
      Alert.alert('مرحباً بك! 🎉', `تم الدخول بنجاح بحساب ${account.name}`);
      if (onSuccess) onSuccess(authenticatedUser);
    } catch (err) {
      setGoogleLoading(false);
      Alert.alert('خطأ', err instanceof Error ? err.message : 'تعذر الاتصال بخادم ActivityTN');
    }
  };

  const handleAddNewAccount = async () => {
    if (!googleEmail || !googleEmail.includes('@')) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان بريد إلكتروني Gmail صحيح');
      return;
    }

    setGoogleLoading(true);
    try {
      const cleanEmail = googleEmail.trim().toLowerCase();
      const displayName = googleFullName.trim() || cleanEmail.split('@')[0];
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=EA4335&color=fff&size=200`;

      const newAccount: SavedGoogleAccount = {
        email: cleanEmail,
        name: displayName,
        avatar: avatarUrl,
        lastUsed: new Date().toISOString(),
      };

      const authenticatedUser = await loginWithGoogle({
        email: cleanEmail,
        name: displayName,
        googleId: 'google_' + Math.abs(cleanEmail.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)),
        avatar: avatarUrl,
      });

      saveGoogleAccount(newAccount);
      setSavedAccounts(getSavedGoogleAccounts());

      setGoogleLoading(false);
      setShowGoogleModal(false);
      setIsAddingNewAccount(false);
      setGoogleEmail('');
      setGoogleFullName('');
      Alert.alert('تم تسجيل الدخول بنجاح! 🎉', `مرحباً بك ${authenticatedUser.name}`);
      if (onSuccess) onSuccess(authenticatedUser);
    } catch (err) {
      setGoogleLoading(false);
      Alert.alert('خطأ', err instanceof Error ? err.message : 'تعذر الاتصال بخادم ActivityTN');
    }
  };

  const handleDeleteSavedAccount = (email: string) => {
    const updated = removeGoogleAccount(email);
    setSavedAccounts(updated);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={theme.textMain} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>
          {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <View style={styles.brandSection}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="sparkles" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.brandTitle, { color: theme.textMain }]}>MCHINA ActivityTN</Text>
          <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
            اكتشف أفضل الأنشطة والأصدقاء بالقرب منك في تونس 🇹🇳
          </Text>
        </View>

        {/* Tab Switcher (Login / Signup) */}
        <View style={[styles.tabContainer, { backgroundColor: theme.bgSecondary }]}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && { backgroundColor: theme.cardBg, elevation: 2 }]}
            onPress={() => setMode('login')}
          >
            <Text
              style={[
                styles.tabText,
                { color: mode === 'login' ? theme.primary : theme.textMuted },
                mode === 'login' && { fontWeight: '700' },
              ]}
            >
              تسجيل الدخول (Login)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, mode === 'signup' && { backgroundColor: theme.cardBg, elevation: 2 }]}
            onPress={() => setMode('signup')}
          >
            <Text
              style={[
                styles.tabText,
                { color: mode === 'signup' ? theme.primary : theme.textMuted },
                mode === 'signup' && { fontWeight: '700' },
              ]}
            >
              حساب جديد (Sign Up)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Google OAuth Button */}
        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
          onPress={handleGoogleSignIn}
          disabled={googleLoading || isLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <>
              {/* Google G Icon */}
              <View style={styles.googleIconCircle}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              </View>
              <Text style={[styles.googleButtonText, { color: theme.textMain }]}>
                المتابعة باستخدام Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
          <Text style={[styles.dividerText, { color: theme.textMuted }]}>أو بواسطة البريد الإلكتروني</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          {mode === 'signup' && (
            <>
              {/* Role Picker (Simple User vs Partner) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textMain }]}>نوع الحساب (Rôle)</Text>
                <View style={styles.rolePickerRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      { backgroundColor: theme.cardBg, borderColor: selectedRole === 'user' ? theme.primary : theme.cardBorder },
                      selectedRole === 'user' && { borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedRole('user')}
                  >
                    <Ionicons
                      name="person-circle-outline"
                      size={24}
                      color={selectedRole === 'user' ? theme.primary : theme.textMuted}
                    />
                    <Text
                      style={[
                        styles.roleCardText,
                        { color: selectedRole === 'user' ? theme.primary : theme.textMuted },
                        selectedRole === 'user' && { fontWeight: '700' },
                      ]}
                    >
                      مستخدم عادي
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      { backgroundColor: theme.cardBg, borderColor: selectedRole === 'partner' ? theme.primary : theme.cardBorder },
                      selectedRole === 'partner' && { borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedRole('partner')}
                  >
                    <Ionicons
                      name="cafe-outline"
                      size={24}
                      color={selectedRole === 'partner' ? theme.primary : theme.textMuted}
                    />
                    <Text
                      style={[
                        styles.roleCardText,
                        { color: selectedRole === 'partner' ? theme.primary : theme.textMuted },
                        selectedRole === 'partner' && { fontWeight: '700' },
                      ]}
                    >
                      صاحب مشروع / مقهى
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textMain }]}>الاسم الكامل</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <Ionicons name="person-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="مثال: أحمد التونسي"
                    placeholderTextColor={theme.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                    style={[styles.input, { color: theme.textMain }]}
                  />
                </View>
              </View>

              {selectedRole === 'partner' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textMain }]}>اسم المقهى / المطعم / المشروع</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                    <Ionicons name="business-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      placeholder="مثال: Le Moulin Cafe & Lounge"
                      placeholderTextColor={theme.textMuted}
                      value={establishmentName}
                      onChangeText={setEstablishmentName}
                      style={[styles.input, { color: theme.textMain }]}
                    />
                  </View>
                </View>
              )}
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMain }]}>البريد الإلكتروني</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Ionicons name="mail-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="name@example.com"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: theme.textMain }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMain }]}>كلمة السر</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.textMain }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMain }]}>تأكيد كلمة السر</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={theme.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { color: theme.textMain }]}
                />
              </View>
            </View>
          )}

          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotPassRow} onPress={() => Alert.alert('تلميح', 'تم إرسال رابط استعادة كلمة السر إلى بريدك')}>
              <Text style={[styles.forgotPassText, { color: theme.primary }]}>نسيت كلمة السر؟</Text>
            </TouchableOpacity>
          )}

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleEmailAuth}
            disabled={isLoading || googleLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <Text style={[styles.termsText, { color: theme.textMuted }]}>
          بمرورك، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بـ MCHINA 🇹🇳
        </Text>
      </ScrollView>

      {/* Modal officiel de connexion avec compte Google (Gmail) */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.googleModalCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={styles.googleModalHeaderIcon}>
              <Ionicons name="logo-google" size={32} color="#EA4335" />
            </View>
            <Text style={[styles.googleModalTitle, { color: theme.textMain }]}>
              اختيار حساب Google
            </Text>
            <Text style={[styles.googleModalSubtitle, { color: theme.textMuted }]}>
              للمتابعة المباشرة إلى ActivityTN Tunisie 🇹🇳
            </Text>

            {!isAddingNewAccount ? (
              <View style={{ width: '100%', marginVertical: 12 }}>
                {/* Liste des comptes Gmail mémorisés sur l'appareil */}
                <View style={{ gap: 10, width: '100%' }}>
                  {savedAccounts.map((account) => (
                    <TouchableOpacity
                      key={account.email}
                      style={[styles.accountItem, { borderColor: theme.cardBorder, backgroundColor: theme.bgSecondary }]}
                      onPress={() => handleSelectAccount(account)}
                      disabled={googleLoading}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: account.avatar }} style={styles.accountAvatar} />
                      <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <Text style={[styles.accountName, { color: theme.textMain }]}>{account.name}</Text>
                        <Text style={[styles.accountEmail, { color: theme.textMuted }]}>{account.email}</Text>
                      </View>
                      <TouchableOpacity
                        style={{ padding: 6 }}
                        onPress={() => handleDeleteSavedAccount(account.email)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close-circle-outline" size={18} color={theme.textMuted} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Bouton pour ajouter un autre compte */}
                <TouchableOpacity
                  style={[styles.addAnotherAccountBtn, { borderColor: theme.cardBorder, backgroundColor: theme.cardBg }]}
                  onPress={() => setIsAddingNewAccount(true)}
                  disabled={googleLoading}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-add-outline" size={18} color="#EA4335" style={{ marginRight: 8 }} />
                  <Text style={[styles.addAnotherAccountText, { color: theme.textMain }]}>
                    + استخدام حساب Google آخر...
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: '100%', gap: 14, marginVertical: 14 }}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textMain }]}>البريد الإلكتروني Gmail *</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.bgSecondary, borderColor: theme.cardBorder }]}>
                    <Ionicons name="mail-outline" size={20} color="#EA4335" style={styles.inputIcon} />
                    <TextInput
                      placeholder="exemple@gmail.com"
                      placeholderTextColor={theme.textMuted}
                      value={googleEmail}
                      onChangeText={setGoogleEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[styles.input, { color: theme.textMain }]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textMain }]}>الاسم الكامل (اختياري)</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.bgSecondary, borderColor: theme.cardBorder }]}>
                    <Ionicons name="person-outline" size={20} color="#EA4335" style={styles.inputIcon} />
                    <TextInput
                      placeholder="مثال: أحمد التونسي"
                      placeholderTextColor={theme.textMuted}
                      value={googleFullName}
                      onChangeText={setGoogleFullName}
                      style={[styles.input, { color: theme.textMain }]}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[styles.googleModalCancelBtn, { borderColor: theme.cardBorder }]}
                    onPress={() => setIsAddingNewAccount(false)}
                    disabled={googleLoading}
                  >
                    <Text style={[styles.googleModalCancelText, { color: theme.textMain }]}>رجوع للحسابات</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.googleModalConfirmBtn, { flex: 1.5 }]}
                    onPress={handleAddNewAccount}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.googleModalConfirmText}>إضافة ودخول</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.googleModalCancelBtn, { width: '100%', marginTop: 8, borderColor: theme.cardBorder }]}
              onPress={() => setShowGoogleModal(false)}
              disabled={googleLoading}
            >
              <Text style={[styles.googleModalCancelText, { color: theme.textMain }]}>إغلاق النافذة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
  },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  googleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EA433515',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
  },
  form: {
    width: '100%',
    marginTop: 12,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  roleCardText: {
    fontSize: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  forgotPassRow: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  googleModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  googleModalHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  googleModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  googleModalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  googleModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  googleModalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleModalCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  googleModalConfirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#EA4335',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  googleModalConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  googleModalTabs: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 14,
    padding: 4,
    marginTop: 10,
    marginBottom: 6,
  },
  googleModalTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleModalTabText: {
    fontSize: 13,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#EA4335',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 12,
  },
  addAnotherAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addAnotherAccountText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
