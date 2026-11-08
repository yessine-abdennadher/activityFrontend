import { Linking, Platform, Share, Alert } from 'react-native';

export interface ShareActivityParams {
  name: string;
  city?: string;
  price?: number;
  rating?: number;
  reviewsCount?: number;
  notRatedText?: string;
  freePriceText?: string;
}

export interface MapNavigationParams {
  latitude?: number;
  longitude?: number;
  label?: string;
}

export interface WhatsAppBookingParams {
  phone?: string;
  whatsapp?: string;
  activityName?: string;
  customMessage?: string;
  fallbackLabel?: string;
}

/**
 * Service d'actions et interactions pour les activités
 * Gère les appels téléphoniques, WhatsApp, itinéraires GPS et partages natifs.
 */
export const activityActionService = {
  /**
   * Effectue un appel téléphonique direct avec gestion d'erreurs et repli
   */
  async callVenue(phone?: string, fallbackLabel = 'Téléphone'): Promise<boolean> {
    const rawPhone = phone || '+216 74 200 100';
    const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
    const url = `tel:${cleanPhone}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert(fallbackLabel, rawPhone);
        return false;
      }
    } catch (err) {
      console.warn('[activityActionService] Erreur appel téléphonique:', err);
      Alert.alert(fallbackLabel, rawPhone);
      return false;
    }
  },

  /**
   * Ouvre une conversation WhatsApp pré-remplie pour réservation
   */
  async openWhatsAppBooking({
    phone,
    whatsapp,
    activityName = 'ActivityTN',
    customMessage,
    fallbackLabel = 'WhatsApp',
  }: WhatsAppBookingParams): Promise<boolean> {
    const rawWa = whatsapp || phone || '98 200 100';
    const cleanWa = rawWa.replace(/[^\d]/g, '');
    const finalWa = cleanWa.startsWith('216') ? cleanWa : `216${cleanWa}`;
    const message =
      customMessage ||
      `Bonjour / مرحبا, je souhaite réserver pour "${activityName}" via ActivityTN 🇹🇳.`;
    const url = `https://wa.me/${finalWa}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(url);
      return true;
    } catch (err) {
      console.warn('[activityActionService] Erreur WhatsApp:', err);
      Alert.alert(fallbackLabel, rawWa);
      return false;
    }
  },

  /**
   * Ouvre l'itinéraire GPS dans l'application native (Apple Maps / Google Maps)
   */
  async openMapNavigation({
    latitude = 34.7406,
    longitude = 10.7603,
    label = 'ActivityTN',
  }: MapNavigationParams): Promise<boolean> {
    const encodedLabel = encodeURIComponent(label);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    const nativeMapUrl =
      Platform.select({
        ios: `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}(${encodedLabel})`,
        default: googleMapsUrl,
      }) || googleMapsUrl;

    try {
      const supported = await Linking.canOpenURL(nativeMapUrl);
      if (supported) {
        await Linking.openURL(nativeMapUrl);
        return true;
      }
      await Linking.openURL(googleMapsUrl);
      return true;
    } catch {
      try {
        await Linking.openURL(googleMapsUrl);
        return true;
      } catch (err) {
        console.warn('[activityActionService] Erreur ouverture carte:', err);
        return false;
      }
    }
  },

  /**
   * Partage l'activité via la boîte de dialogue système native
   */
  async shareActivity({
    name,
    city,
    price,
    rating,
    reviewsCount = 0,
    notRatedText = 'Non noté',
    freePriceText = 'Gratuit',
  }: ShareActivityParams): Promise<boolean> {
    try {
      const scoreText =
        reviewsCount > 0 && rating !== undefined ? `⭐ ${rating}/5 (${reviewsCount})` : notRatedText;
      const priceText = price === 0 ? freePriceText : price ? `${price} DT` : freePriceText;
      const locationText = city ? ` (${city})` : '';

      await Share.share({
        title: name,
        message: `🌟 ${name}${locationText}\n💰 ${priceText}\n⭐ ${scoreText}\n📲 Win 🇹🇳`,
      });
      return true;
    } catch (err) {
      console.warn('[activityActionService] Erreur partage activité:', err);
      return false;
    }
  },
};
