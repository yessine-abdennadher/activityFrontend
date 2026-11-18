import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { usePreferences } from '../context/AppPreferencesContext';
import { useToast } from '../components/ui/Toast';
import { AuthUser } from '../types';
import { AdminMfaRequiredError, login, register, verifyAdminMfa, loginWithGoogle } from '../services/authService';
import { useTranslation } from '../hooks/useTranslation';

WebBrowser.maybeCompleteAuthSession();

// Architectural Auth sub-components
import { AuthBackground } from './auth/AuthBackground';
import { AuthHeader } from './auth/AuthHeader';
import { WelcomeAuthView } from './auth/WelcomeAuthView';
import { LoginView } from './auth/LoginView';
import { SignupView } from './auth/SignupView';
import { AdminMfaChallengeView } from './auth/AdminMfaChallengeView';

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
  const { t } = useTranslation();

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
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<{ challengeId: string; maskedEmail: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // Google OAuth Hook avec redirectUri universel compatible Expo Go & Build autonome
  const redirectUri = makeRedirectUri({
    scheme: 'hamla',
    path: 'oauthredirect',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '180217308994-427lli8bnm1ednklogio9piecdvr5fjd.apps.googleusercontent.com',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '180217308994-vhs8mp2a2v4vpcq91u2ua2rn1s1c4df6.apps.googleusercontent.com',
    redirectUri,
  });

  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication, params } = response;
      const idToken = authentication?.idToken || (params as any)?.id_token;
      const accessToken = authentication?.accessToken;

      const authenticateGoogleUser = async () => {
        setGoogleLoading(true);
        setIsLoading(true);
        try {
          const user = await loginWithGoogle(idToken || accessToken);
          toast.success(`Bienvenue ${user.name} !`, 'Connexion réussie');
          if (onSuccess) onSuccess(user);
        } catch (err: any) {
          const errorMsg = err?.message || 'Erreur lors de la connexion Google';
          setAuthError(errorMsg);
          toast.error(errorMsg, t('error'));
        } finally {
          setGoogleLoading(false);
          setIsLoading(false);
        }
      };

      authenticateGoogleUser();
    }
  }, [response]);

  const handleHeaderBack = () => {
    if (mfaChallenge) {
      setMfaChallenge(null);
      setMfaCode('');
      setAuthError(null);
      return;
    }
    if (mode === 'login' || mode === 'signup') {
      setMode('welcome');
      setAuthError(null);
    } else if (onBack) {
      onBack();
    }
  };

  const handleEmailAuth = async () => {
    if (Platform.OS === 'web') {
      const message = t('webAuthUnavailable');
      setAuthError(message);
      toast.error(message, t('error'));
      return;
    }
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
      if (selectedRole === 'partner') {
        const msg = t('partnerSignupVerifiedFlow');
        setAuthError(msg);
        toast.error(msg, t('partnerSignupTitle'));
        return;
      }
      if (!fullName.trim()) {
        const msg = 'Veuillez renseigner votre nom complet.';
        setAuthError(msg);
        toast.error(msg, 'Nom requis');
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
          : await register(fullName.trim(), cleanEmail, password);

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
      if (error instanceof AdminMfaRequiredError) {
        setMfaChallenge({ challengeId: error.challengeId, maskedEmail: error.maskedEmail });
        setMfaCode(error.devOtp || '');
        if (error.devOtp) {
          toast.info(`Code Admin (Dev) : ${error.devOtp}`, 'Code de vérification');
        }
        return;
      }
      const errorMsg =
        error instanceof Error ? error.message : 'Impossible de contacter le serveur backend.';
      setAuthError(errorMsg);
      toast.error(errorMsg, 'Échec de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAdminMfa = async () => {
    if (!mfaChallenge || !/^\d{6}$/.test(mfaCode)) {
      setAuthError(t('adminMfaInvalid'));
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      const authenticatedUser = await verifyAdminMfa(mfaChallenge.challengeId, mfaCode);
      setMfaChallenge(null);
      setMfaCode('');
      onSuccess?.(authenticatedUser);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('adminMfaInvalid');
      setAuthError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignInPress = () => {
    if (promptAsync) {
      promptAsync();
    } else {
      toast.error('Configuration Google non disponible', t('error'));
    }
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
            mfaChallenge ? (
              <AdminMfaChallengeView
                maskedEmail={mfaChallenge.maskedEmail}
                code={mfaCode}
                setCode={setMfaCode}
                error={authError}
                isLoading={isLoading}
                isDark={isDark}
                title={t('adminMfaTitle')}
                instructions={t('adminMfaInstructions')}
                codeLabel={t('adminMfaCodeLabel')}
                verifyLabel={t('adminMfaVerify')}
                backLabel={t('adminMfaBack')}
                onVerify={handleVerifyAdminMfa}
                onBack={handleHeaderBack}
              />
            ) : <LoginView
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
