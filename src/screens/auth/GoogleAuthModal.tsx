import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SavedGoogleAccount } from '../../services/googleAccountsStore';

interface GoogleAuthModalProps {
  visible: boolean;
  onClose: () => void;
  savedAccounts: SavedGoogleAccount[];
  onSelectAccount: (account: SavedGoogleAccount) => void;
  onAddNewAccount: (email: string, fullName: string) => void;
  onDeleteSavedAccount: (email: string) => void;
  isLoading?: boolean;
  isDark?: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  visible,
  onClose,
  savedAccounts,
  onSelectAccount,
  onAddNewAccount,
  onDeleteSavedAccount,
  isLoading = false,
  isDark = false,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleFullName, setGoogleFullName] = useState('');

  const handleConfirmNew = () => {
    onAddNewAccount(googleEmail, googleFullName);
  };

  const handleClose = () => {
    setIsAddingNew(false);
    setGoogleEmail('');
    setGoogleFullName('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isDark && styles.darkModalCard]}>
          <View style={styles.headerIcon}>
            <Ionicons name="logo-google" size={32} color="#EA4335" />
          </View>
          <Text style={[styles.title, isDark && styles.darkText]}>Compte Google</Text>
          <Text style={[styles.subtitle, isDark && styles.darkSub]}>
            Connexion sécurisée à ActivityTN
          </Text>

          {!isAddingNew ? (
            <View style={styles.accountsWrapper}>
              <View style={styles.accountsList}>
                {savedAccounts.map((account) => (
                  <TouchableOpacity
                    key={account.email}
                    style={[styles.accountItem, isDark && styles.darkAccountItem]}
                    onPress={() => onSelectAccount(account)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: account.avatar }} style={styles.accountAvatar} />
                    <View style={styles.accountDetails}>
                      <Text style={[styles.accountName, isDark && styles.darkText]}>
                        {account.name}
                      </Text>
                      <Text style={[styles.accountEmail, isDark && styles.darkSub]}>
                        {account.email}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => onDeleteSavedAccount(account.email)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.addAnotherBtn, isDark && styles.darkAddBtn]}
                onPress={() => setIsAddingNew(true)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="person-add-outline" size={18} color="#EA4335" style={{ marginRight: 8 }} />
                <Text style={[styles.addAnotherText, isDark && styles.darkText]}>
                  + Utiliser un autre compte Google...
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formWrapper}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark && styles.darkText]}>Adresse Gmail *</Text>
                <View style={[styles.inputBox, isDark && styles.darkInputBox]}>
                  <Ionicons name="mail-outline" size={18} color="#EA4335" style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="exemple@gmail.com"
                    placeholderTextColor="#94A3B8"
                    value={googleEmail}
                    onChangeText={setGoogleEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.input, isDark && styles.darkText]}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark && styles.darkText]}>Nom complet (optionnel)</Text>
                <View style={[styles.inputBox, isDark && styles.darkInputBox]}>
                  <Ionicons name="person-outline" size={18} color="#EA4335" style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Ex: Ahmed Ben Salah"
                    placeholderTextColor="#94A3B8"
                    value={googleFullName}
                    onChangeText={setGoogleFullName}
                    style={[styles.input, isDark && styles.darkText]}
                  />
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, isDark && styles.darkCancelBtn]}
                  onPress={() => setIsAddingNew(false)}
                  disabled={isLoading}
                >
                  <Text style={[styles.cancelBtnText, isDark && styles.darkText]}>Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmNew}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.confirmBtnText}>Ajouter et se connecter</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.closeBtn, isDark && styles.darkCancelBtn]}
            onPress={handleClose}
            disabled={isLoading}
          >
            <Text style={[styles.cancelBtnText, isDark && styles.darkText]}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  darkModalCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSub: {
    color: '#94A3B8',
  },
  accountsWrapper: {
    width: '100%',
    marginVertical: 8,
  },
  accountsList: {
    gap: 8,
    width: '100%',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkAccountItem: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  accountAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  accountDetails: {
    flex: 1,
    marginHorizontal: 10,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  accountEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteBtn: {
    padding: 4,
  },
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
  },
  darkAddBtn: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  addAnotherText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  formWrapper: {
    width: '100%',
    gap: 12,
    marginVertical: 10,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
  },
  darkInputBox: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkCancelBtn: {
    borderColor: '#334155',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EA4335',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  closeBtn: {
    width: '100%',
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
