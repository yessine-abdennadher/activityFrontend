import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast, type ToastType } from '../../context/ToastContext';

export { useToast, type ToastType };

interface InlineToastProps {
  message: string;
  type?: ToastType;
  title?: string;
  onClose?: () => void;
}

/**
 * Composant Toast autonome pouvant être affiché inline directement dans un formulaire
 */
export const InlineToast: React.FC<InlineToastProps> = ({
  message,
  type = 'error',
  title,
  onClose,
}) => {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const bgColor = isError ? '#FEF2F2' : isSuccess ? '#ECFDF5' : '#EFF6FF';
  const borderColor = isError ? '#FCA5A5' : isSuccess ? '#6EE7B7' : '#93C5FD';
  const iconName = isError ? 'alert-circle' : isSuccess ? 'checkmark-circle' : 'information-circle';
  const iconColor = isError ? '#DC2626' : isSuccess ? '#059669' : '#2563EB';
  const textColor = isError ? '#B91C1C' : isSuccess ? '#047857' : '#1D4ED8';

  return (
    <View style={[styles.inlineCard, { backgroundColor: bgColor, borderColor }]}>
      <Ionicons name={iconName as any} size={20} color={iconColor} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        {title && <Text style={[styles.inlineTitle, { color: textColor }]}>{title}</Text>}
        <Text style={[styles.inlineText, { color: textColor }]}>{message}</Text>
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inlineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: 8,
    gap: 10,
  },
  inlineTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  inlineText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  closeBtn: {
    padding: 2,
  },
});
