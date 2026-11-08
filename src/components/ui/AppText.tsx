import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { usePreferences } from '../../context/AppPreferencesContext';
import { getAppFont, FontWeightToken } from '../../theme/typography';

export interface AppTextProps extends RNTextProps {
  variant?: 'display' | 'title' | 'body' | 'caption' | 'badge';
  weight?: FontWeightToken;
  isTitle?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  weight = 'regular',
  isTitle,
  style,
  children,
  ...props
}) => {
  const { language } = usePreferences();
  const isArabic = language === 'ar';
  const shouldBeTitle = isTitle ?? (variant === 'title' || variant === 'display');

  const resolvedFont = getAppFont(weight, shouldBeTitle, isArabic);

  return (
    <RNText
      {...props}
      style={[
        styles.base,
        { fontFamily: resolvedFont },
        variant === 'display' && styles.display,
        variant === 'title' && styles.title,
        variant === 'body' && styles.body,
        variant === 'caption' && styles.caption,
        variant === 'badge' && styles.badge,
        style,
      ]}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
  display: {
    fontSize: 28,
    lineHeight: 34,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    lineHeight: 14,
  },
});

export default AppText;

