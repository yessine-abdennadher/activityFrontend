import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastOptions {
  title?: string;
  duration?: number;
}

interface ToastContextType {
  show: (message: string, type?: ToastType, options?: ToastOptions) => void;
  error: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [type, setType] = useState<ToastType>('info');

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -30,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [opacity, translateY]);

  const show = useCallback(
    (msg: string, toastType: ToastType = 'info', options?: ToastOptions) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setMessage(msg);
      setType(toastType);
      setTitle(options?.title);
      setVisible(true);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options?.duration || 4500;
      timerRef.current = setTimeout(() => {
        hide();
      }, duration);
    },
    [opacity, translateY, hide]
  );

  const error = useCallback(
    (msg: string, errTitle: string = 'Erreur') => {
      show(msg, 'error', { title: errTitle });
    },
    [show]
  );

  const success = useCallback(
    (msg: string, successTitle: string = 'Succès') => {
      show(msg, 'success', { title: successTitle });
    },
    [show]
  );

  const info = useCallback(
    (msg: string, infoTitle: string = 'Information') => {
      show(msg, 'info', { title: infoTitle });
    },
    [show]
  );

  const getThemeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#F87171',
          icon: 'alert-circle',
          iconColor: '#DC2626',
          titleColor: '#991B1B',
          textColor: '#B91C1C',
        };
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#34D399',
          icon: 'checkmark-circle',
          iconColor: '#059669',
          titleColor: '#065F46',
          textColor: '#047857',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FBBF24',
          icon: 'warning',
          iconColor: '#D97706',
          titleColor: '#92400E',
          textColor: '#B45309',
        };
      default:
        return {
          bg: '#EFF6FF',
          border: '#60A5FA',
          icon: 'information-circle',
          iconColor: '#2563EB',
          titleColor: '#1E40AF',
          textColor: '#1D4ED8',
        };
    }
  };

  const themeConfig = getThemeStyles();

  return (
    <ToastContext.Provider value={{ show, error, success, info, hide }}>
      {children}
      {visible && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.toastContainer,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View
            style={[
              styles.toastCard,
              {
                backgroundColor: themeConfig.bg,
                borderColor: themeConfig.border,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={themeConfig.icon as any}
                size={24}
                color={themeConfig.iconColor}
              />
            </View>

            <View style={styles.textContainer}>
              {title && (
                <Text style={[styles.title, { color: themeConfig.titleColor }]}>
                  {title}
                </Text>
              )}
              <Text style={[styles.message, { color: themeConfig.textColor }]}>
                {message}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={hide} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={themeConfig.iconColor} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l’intérieur d’un ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
    elevation: 20,
  },
  toastCard: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    gap: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
  },
});
