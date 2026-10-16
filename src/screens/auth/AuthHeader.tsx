import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthHeaderProps {
  onBack?: () => void;
  backLabel?: string;
  isDark?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  onBack,
  backLabel = 'Back',
  isDark = false,
}) => {
  return (
    <View style={styles.header}>


      {/* Mini brand badge */}
      <View style={styles.brandBadge}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    display: "flex",
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 8,
    zIndex: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 2,
  },
  darkText: {
    color: '#FFFFFF',
  },
  brandBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 'auto',

  },
  logoImage: {
    width: 250,
    height: 125,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#0F172A',
  },
});
