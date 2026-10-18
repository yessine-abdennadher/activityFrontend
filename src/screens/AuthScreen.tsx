import React, { useState } from 'react';
import { StyleSheet, View, Alert, SafeAreaView, StatusBar } from 'react-native';
import { usePreferences } from '../context/AppPreferencesContext';
import { useToast } from '../components/ui/Toast';
import { AuthUser } from '../types';
import { login, register, loginWithGoogle } from '../services/authService';
import {
  getSavedGoogleAccounts,
  saveGoogleAccount,
  removeGoogleAccount,
  type SavedGoogleAccount,
} from '../services/googleAccountsStore';

// Architectural Auth sub-components
import { AuthBackground } from './auth/AuthBackground';
import { AuthHeader } from './auth/AuthHeader';
import { WelcomeAuthView } from './auth/WelcomeAuthView';
import { LoginView } from './auth/LoginView';
import { SignupView } from './auth/SignupView';
import { GoogleAuthModal } from './auth/GoogleAuthModal';

interface AuthScreenProps {
  initialMode?: 'welcome' | 'login' | 'signup';
  onSuccess?: (user: AuthUser) => void;
  onBack?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'welcome',
  onSuccess,
  onBack,
}) => {
  const { isDark } = usePreferences();
  const toast = useToast();

  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'user' | 'partner'>('user');

  // Form states
  const [fullName, setFullName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Google Modal states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>(getSavedGoogleAccounts());

  const handleHeaderBack = () => {
    if (mode === 'login' || mode === 'signup') {
      setMode('welcome');
      setAuthError(null);
    } else if (onBack) {
      onBack();
    }
  };

  const handleEmailAuth = async () => {
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      const msg = 'Veuillez saisir votre adresse email et votre mot de passe.';
      setAuthError(msg);
      toast.error(msg, 'Champs obligatoires');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        const msg = 'Veuillez renseigner votre nom complet.';
        setAuthError(msg);
        toast.error(msg, 'Nom requis');
        return;
      }
      if (selectedRole === 'partner' && !establishmentName.trim()) {
        const msg = "Veuillez renseigner le nom de votre établissement (ex: restaurant, café).";
        setAuthError(msg);
        toast.error(msg, 'Nom d’établissement requis');
        return;
      }
      if (password !== confirmPassword) {
        const msg = 'Les deux mots de passe ne correspondent pas.';
        setAuthError(msg);
        toast.error(msg, 'Mots de passe non identiques');
        return;
      }
    }

    setIsLoading(true);
    try {
      const authenticatedUser =
        mode === 'login'
          ? await login(cleanEmail, password)
          : await register(fullName.trim(), cleanEmail, password, selectedRole, establishmentName.trim());

      const successMsg =
        mode === 'login'
          ? 'Connexion réussie ! Bienvenue sur Tfarhida.'
          : 'Compte créé avec succès !';
      setAuthSuccess(successMsg);
      toast.success(successMsg, 'Succès 🎉');

      if (onSuccess) {
        onSuccess(authenticatedUser);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Impossible de contacter le serveur backend.';
      setAuthError(errorMsg);
      toast.error(errorMsg, 'Échec de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignInPress = () => {
    setSavedAccounts(getSavedGoogleAccounts());
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = async (account: SavedGoogleAccount) => {
    setGoogleLoading(true);
    try {
      const authenticatedUser = await loginWithGoogle({
        email: account.email,
        name: account.name,
        avatar: account.avatar,
        googleId:
          'google_' +
          Math.abs(account.email.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)),
      });

      saveGoogleAccount({
        ...account,
        lastUsed: new Date().toISOString(),
      });
      setSavedAccounts(getSavedGoogleAccounts());

      setGoogleLoading(false);
      setShowGoogleModal(false);
      toast.success(`Bienvenue ${account.name} !`, 'Connexion Google réussie');

      if (onSuccess) {
        onSuccess(authenticatedUser);
      }
    } catch (err) {
      setGoogleLoading(false);
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Connexion Google impossible.');
    }
  };

  const handleAddNewGoogleAccount = async (newEmail: string, newFullName: string) => {
    if (!newEmail || !newEmail.includes('@')) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email valide.');
      return;
    }

    setGoogleLoading(true);
    try {
      const cleanEmail = newEmail.trim().toLowerCase();
      const displayName = newFullName.trim() || cleanEmail.split('@')[0];
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        displayName
      )}&background=EA4335&color=fff&size=200`;

      const newAccount: SavedGoogleAccount = {
        email: cleanEmail,
        name: displayName,
        avatar: avatarUrl,
        lastUsed: new Date().toISOString(),
      };

      const authenticatedUser = await loginWithGoogle({
        email: cleanEmail,
        name: displayName,
        googleId:
          'google_' +
          Math.abs(cleanEmail.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)),
        avatar: avatarUrl,
      });

      saveGoogleAccount(newAccount);
      setSavedAccounts(getSavedGoogleAccounts());

      setGoogleLoading(false);
      setShowGoogleModal(false);
      toast.success(`Bienvenue ${authenticatedUser.name} !`, 'Compte Google synchronisé');

      if (onSuccess) {
        onSuccess(authenticatedUser);
      }
    } catch (err) {
      setGoogleLoading(false);
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Connexion Google impossible.');
    }
  };

  const handleDeleteSavedGoogleAccount = (targetEmail: string) => {
    const updated = removeGoogleAccount(targetEmail);
    setSavedAccounts(updated);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Modern Pastel Wave Background */}
      <AuthBackground isDark={isDark} />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header with Back Button (shown on login & signup, or welcome if onBack provided) */}
        {(mode !== 'welcome' || !!onBack) && (
          <AuthHeader
            onBack={mode !== 'welcome' ? handleHeaderBack : onBack}
            backLabel={mode !== 'welcome' ? 'Back' : 'Retour'}
            isDark={isDark}
          />
        )}

        {/* Dynamic Auth Views */}
        <View style={styles.content}>
          {mode === 'welcome' && (
            <WelcomeAuthView
              onGoToLogin={() => {
                setMode('login');
                setAuthError(null);
              }}
              onGoToSignup={() => {
                setMode('signup');
                setAuthError(null);
              }}
              onSkip={onBack}
              isDark={isDark}
            />
          )}

          {mode === 'login' && (
            <LoginView
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleEmailAuth}
              isLoading={isLoading}
              onGooglePress={handleGoogleSignInPress}
              googleLoading={googleLoading}
              onSwitchToSignup={() => {
                setMode('signup');
                setAuthError(null);
              }}
              authError={authError}
              authSuccess={authSuccess}
              onClearError={() => setAuthError(null)}
              isDark={isDark}
            />
          )}

          {mode === 'signup' && (
            <SignupView
              fullName={fullName}
              setFullName={setFullName}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              establishmentName={establishmentName}
              setEstablishmentName={setEstablishmentName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              onSubmit={handleEmailAuth}
              isLoading={isLoading}
              onGooglePress={handleGoogleSignInPress}
              googleLoading={googleLoading}
              onSwitchToLogin={() => {
                setMode('login');
                setAuthError(null);
              }}
              authError={authError}
              authSuccess={authSuccess}
              onClearError={() => setAuthError(null)}
              isDark={isDark}
            />
          )}
        </View>
      </SafeAreaView>

      {/* Google Accounts Picker Modal */}
      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        savedAccounts={savedAccounts}
        onSelectAccount={handleSelectGoogleAccount}
        onAddNewAccount={handleAddNewGoogleAccount}
        onDeleteSavedAccount={handleDeleteSavedGoogleAccount}
        isLoading={googleLoading}
        isDark={isDark}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
