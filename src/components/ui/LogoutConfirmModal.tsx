import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';

interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const { theme, language } = usePreferences();
  const isRTL = language === 'ar';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.logoutModalCard,
            { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.logoutModalIconBox}>
            <Ionicons name="log-out-outline" size={32} color="#EF4444" />
          </View>
          <Text style={[styles.logoutModalTitle, { color: theme.textMain }]}>
            {language === 'ar'
              ? 'تسجيل الخروج'
              : language === 'en'
              ? 'Sign Out'
              : 'Déconnexion'}
          </Text>
          <Text style={[styles.logoutModalMessage, { color: theme.textMuted }]}>
            {language === 'ar'
              ? 'هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك في ActivityTN؟'
              : language === 'en'
              ? 'Are you sure you want to sign out from your ActivityTN account?'
              : 'Êtes-vous sûr de vouloir vous déconnecter de votre compte ActivityTN ?'}
          </Text>
          <View
            style={[
              styles.logoutModalActions,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.logoutModalCancelBtn,
                { borderColor: theme.cardBorder, backgroundColor: theme.cardBg },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.logoutModalCancelText, { color: theme.textMain }]}>
                {language === 'ar' ? 'إلغاء' : language === 'en' ? 'Cancel' : 'Annuler'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.logoutModalConfirmBtn,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Ionicons
                name="log-out"
                size={18}
                color="#FFFFFF"
                style={{ marginHorizontal: 6 }}
              />
              <Text style={styles.logoutModalConfirmText}>
                {language === 'ar'
                  ? 'تأكيد الخروج'
                  : language === 'en'
                  ? 'Confirm'
                  : 'Confirmer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoutModalCard: {
    width: '100%',
    maxWidth: 360,
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
  logoutModalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  logoutModalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutModalActions: {
    width: '100%',
    gap: 12,
  },
  logoutModalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  logoutModalConfirmBtn: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoutModalConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
