import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';

interface LoyaltyQrScannerBoxProps {
  theme: ThemeColors;
  isDark: boolean;
  onScanSuccess: (rawData: string) => void;
  onCloseScanner: () => void;
}

export const LoyaltyQrScannerBox: React.FC<LoyaltyQrScannerBoxProps> = ({
  theme,
  isDark,
  onScanSuccess,
  onCloseScanner,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const scanLockedRef = useRef(false);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanLockedRef.current || !result?.data) return;
    scanLockedRef.current = true;
    onScanSuccess(result.data);
  };

  if (!permission) {
    return (
      <View
        style={[
          styles.permissionBox,
          { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.cardBorder },
        ]}
      >
        <Text style={[styles.permissionText, { color: theme.textMuted }]}>
          Initialisation de la caméra...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.permissionBox,
          { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.cardBorder },
        ]}
      >
        <Ionicons name="camera-outline" size={32} color={theme.primary} />
        <Text style={[styles.permissionTitle, { color: theme.textMain }]}>
          Accès Caméra Requis
        </Text>
        <Text style={[styles.permissionText, { color: theme.textMuted }]}>
          Autorisez la caméra pour scanner le Pass Fidélité du client en 1 seconde.
        </Text>
        <View style={styles.permissionActions}>
          <TouchableOpacity
            style={[styles.grantBtn, { backgroundColor: '#4F46E5' }]}
            onPress={requestPermission}
          >
            <Text style={styles.grantBtnText}>Autoriser la caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelScanBtn, { borderColor: theme.cardBorder }]}
            onPress={onCloseScanner}
          >
            <Text style={[styles.cancelScanText, { color: theme.textMuted }]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.scannerWrapper}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.scanHint}>
            Pointez vers le QR Code du Pass client
          </Text>
        </View>
      </CameraView>

      <TouchableOpacity
        style={styles.closeCameraBtn}
        onPress={onCloseScanner}
        activeOpacity={0.85}
      >
        <Ionicons name="close-circle" size={18} color="#FFFFFF" />
        <Text style={styles.closeCameraText}>Fermer la caméra</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  permissionBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  permissionText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  permissionActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  grantBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  cancelScanBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelScanText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  scannerWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 250,
    position: 'relative',
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanFrame: {
    width: 150,
    height: 150,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#FCD34D',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  scanHint: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closeCameraBtn: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  closeCameraText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
