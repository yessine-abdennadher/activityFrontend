import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AdminMfaChallengeViewProps {
  maskedEmail: string;
  code: string;
  setCode: (value: string) => void;
  error: string | null;
  isLoading: boolean;
  isDark: boolean;
  title: string;
  instructions: string;
  codeLabel: string;
  verifyLabel: string;
  backLabel: string;
  onVerify: () => void;
  onBack: () => void;
}

export const AdminMfaChallengeView: React.FC<AdminMfaChallengeViewProps> = ({
  maskedEmail, code, setCode, error, isLoading, isDark,
  title, instructions, codeLabel, verifyLabel, backLabel, onVerify, onBack,
}) => (
  <View style={[styles.card, isDark && styles.darkCard]}>
    <Text style={[styles.title, isDark && styles.darkText]}>{title}</Text>
    <Text style={[styles.instructions, isDark && styles.darkSub]}>{instructions.replace('{{email}}', maskedEmail)}</Text>
    <TextInput
      accessibilityLabel={codeLabel}
      accessibilityHint={instructions.replace('{{email}}', maskedEmail)}
      value={code}
      onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      maxLength={6}
      autoFocus
      style={[styles.input, isDark && styles.darkInput]}
    />
    {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onVerify}
      disabled={isLoading || code.length !== 6}
      style={[styles.button, (isLoading || code.length !== 6) && styles.disabled]}
    >
      {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{verifyLabel}</Text>}
    </TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" onPress={onBack} style={styles.backButton}>
      <Text style={[styles.backText, isDark && styles.darkSub]}>{backLabel}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: { margin: 20, padding: 24, borderRadius: 24, backgroundColor: '#FFFFFF', gap: 16 },
  darkCard: { backgroundColor: '#0F172A' },
  title: { color: '#0F172A', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  darkText: { color: '#FFFFFF' },
  instructions: { color: '#475569', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  darkSub: { color: '#CBD5E1' },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#94A3B8', borderRadius: 12, color: '#0F172A', fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  darkInput: { color: '#FFFFFF', borderColor: '#64748B' },
  error: { color: '#B91C1C', fontSize: 14, textAlign: 'center' },
  button: { minHeight: 48, borderRadius: 12, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  disabled: { opacity: 0.55 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#334155', fontSize: 15, fontWeight: '600' },
});
