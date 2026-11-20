import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const BARCODE_WIDTHS = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 2];

interface LoyaltyVipCardVisualProps {
  venueName: string;
  rewardLabel: string;
  stampsCount: number;
  requiredStamps: number;
  customerCode?: string;
  activityId?: string;
  rewardReady?: boolean;
  flippable?: boolean;
}

/**
 * Ticket Digital Pass Privilège fidèle au design UIverse ("DIGITAL PASS")
 * avec effet holographique, découpes de ticket, code-barres, cube isométrique,
 * reflet brillant et retournement 3D (recto tampons / verso QR Code).
 */
export const LoyaltyVipCardVisual: React.FC<LoyaltyVipCardVisualProps> = ({
  venueName,
  rewardLabel,
  stampsCount,
  requiredStamps,
  customerCode = '001',
  activityId = 'hamla',
  rewardReady = stampsCount >= requiredStamps,
  flippable = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    if (!flippable) return;
    const toValue = isFlipped ? 0 : 180;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 12,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const todayFormatted = (() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();

  const qrPayload = `https://hamla.tn/pass/${customerCode}?venue=${activityId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    qrPayload
  )}`;

  const WrapperComponent: React.ComponentType<any> = flippable ? TouchableOpacity : View;

  return (
    <WrapperComponent
      activeOpacity={0.95}
      onPress={flippable ? handleFlip : undefined}
      style={styles.outerArea}
    >
      {/* ── FACE AVANT (RECTO : DIGITAL PASS + TAMPONS) ── */}
      <Animated.View
        style={[
          styles.animatedFace,
          {
            transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }],
            opacity: frontOpacity,
          },
        ]}
        pointerEvents={isFlipped ? 'none' : 'auto'}
      >
        <LinearGradient
          colors={
            rewardReady
              ? ['#A7F3D0', '#E0F2FE', '#FEF3C7']
              : ['#E0E7FF', '#FCE7F3', '#CFFAFE']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.holographicFrame}
        >
          <View style={styles.ticketBody}>
            {/* Reflet diagonal glossy */}
            <LinearGradient
              colors={[
                'rgba(255,255,255,0)',
                'rgba(255,255,255,0.65)',
                'rgba(255,255,255,0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.reflexSheen}
              pointerEvents="none"
            />

            {/* Header : Cube + DIGITAL PASS + Code-barres */}
            <View style={styles.header}>
              <View style={styles.brandGroup}>
                <Ionicons name="cube-outline" size={22} color="#0F172A" />
                <View style={styles.ticketNameRow}>
                  <Text style={styles.ticketNameLight}>DIGITAL </Text>
                  <Text style={styles.ticketNameBold}>PASS</Text>
                </View>
              </View>

              {/* Code-barres vectoriel */}
              <View style={styles.barcode}>
                {BARCODE_WIDTHS.map((w, idx) => (
                  <View key={idx} style={[styles.barLine, { width: w }]} />
                ))}
              </View>
            </View>

            {/* Séparateur pointillé avec découpes de ticket latérales */}
            <View style={styles.tearLineWrap}>
              <View style={styles.notchLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.notchRight} />
            </View>

            {/* Contenu principal : Établissement, Numéro #PASS, Tampons */}
            <View style={styles.contents}>
              <View style={styles.eventTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.hamlaBrandRow}>
                    <Text style={styles.eventBold}>HAMLA </Text>
                    <Text style={styles.eventSub}>PRIVILÈGE</Text>
                  </View>
                  <Text style={styles.venueTitle} numberOfLines={1}>
                    {venueName}
                  </Text>
                </View>

                <Text style={styles.passNumber}>#{customerCode}</Text>
              </View>

              <Text style={styles.rewardPromise} numberOfLines={1}>
                {rewardLabel}
              </Text>

              {/* Rangée des tampons de fidélité */}
              <View style={styles.stampsRow}>
                {Array.from({ length: requiredStamps }).map((_, idx) => {
                  const isFilled = idx < stampsCount;
                  return (
                    <View
                      key={`pass-stamp-${idx}`}
                      style={[
                        styles.stampSlot,
                        isFilled ? styles.stampSlotFilled : styles.stampSlotEmpty,
                      ]}
                    >
                      <Ionicons
                        name={isFilled ? 'checkmark' : 'ellipse-outline'}
                        size={14}
                        color={isFilled ? '#FFFFFF' : '#94A3B8'}
                      />
                    </View>
                  );
                })}
                <View
                  style={[
                    styles.rewardSlot,
                    rewardReady ? styles.rewardSlotReady : styles.rewardSlotPending,
                  ]}
                >
                  <Ionicons
                    name="gift"
                    size={15}
                    color={rewardReady ? '#FFFFFF' : '#0F172A'}
                  />
                </View>
              </View>

              {/* Pied de ticket */}
              <View style={styles.footerRow}>
                <Text style={styles.footerCounter}>
                  {Math.min(stampsCount, requiredStamps)} / {requiredStamps} passages
                </Text>
                {flippable && (
                  <View style={styles.flipHintRow}>
                    <Ionicons name="sync-outline" size={12} color="#64748B" />
                    <Text style={styles.flipHintText}>Touchez pour le QR Code</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── FACE ARRIÈRE (VERSO : QR CODE SCANNABLE + DATE) ── */}
      {flippable && (
        <Animated.View
          style={[
            styles.animatedFace,
            styles.backFaceAbsolute,
            {
              transform: [{ perspective: 1000 }, { rotateY: backInterpolate }],
              opacity: backOpacity,
            },
          ]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          <LinearGradient
            colors={['#CFFAFE', '#E0E7FF', '#FCE7F3']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.holographicFrame}
          >
            <View style={styles.ticketBody}>
              <View style={styles.header}>
                <View style={styles.brandGroup}>
                  <Ionicons name="cube-outline" size={20} color="#0F172A" />
                  <View style={styles.ticketNameRow}>
                    <Text style={styles.ticketNameLight}>DIGITAL </Text>
                    <Text style={styles.ticketNameBold}>PASS</Text>
                  </View>
                </View>
                <Text style={styles.dateText}>{todayFormatted}</Text>
              </View>

              <View style={styles.tearLineWrap}>
                <View style={styles.notchLeft} />
                <View style={styles.dashedLine} />
                <View style={styles.notchRight} />
              </View>

              <View style={styles.backContents}>
                <View style={styles.qrWrapper}>
                  <Image source={{ uri: qrUrl }} style={styles.qrImg} />
                </View>
                <Text style={styles.backCodeText}>PASS #{customerCode}</Text>
                <View style={styles.flipHintRow}>
                  <Ionicons name="sync-outline" size={12} color="#64748B" />
                  <Text style={styles.flipHintText}>Touchez pour voir vos tampons</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </WrapperComponent>
  );
};

const styles = StyleSheet.create({
  outerArea: {
    width: '100%',
    position: 'relative',
  },
  animatedFace: {
    backfaceVisibility: 'hidden',
    width: '100%',
  },
  backFaceAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  holographicFrame: {
    borderRadius: 22,
    padding: 3,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  ticketBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  reflexSheen: {
    position: 'absolute',
    top: -40,
    left: -60,
    right: -60,
    bottom: -40,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketNameLight: {
    fontSize: 12.5,
    fontWeight: '400',
    letterSpacing: 2,
    color: '#0F172A',
  },
  ticketNameBold: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#0F172A',
  },
  barcode: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    gap: 1.5,
  },
  barLine: {
    height: '100%',
    backgroundColor: '#0F172A',
  },
  tearLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -16,
    marginBottom: 10,
    height: 16,
  },
  notchLeft: {
    width: 14,
    height: 16,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#E0E7FF',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginHorizontal: 6,
  },
  notchRight: {
    width: 14,
    height: 16,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: '#CFFAFE',
  },
  contents: {
    gap: 10,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  hamlaBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventBold: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#0F172A',
  },
  eventSub: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    color: '#475569',
  },
  venueTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  passNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  rewardPromise: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  stampsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  stampSlot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampSlotFilled: {
    backgroundColor: '#0F172A',
  },
  stampSlotEmpty: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  rewardSlot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardSlotReady: {
    backgroundColor: '#10B981',
  },
  rewardSlotPending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerCounter: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  flipHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flipHintText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  backContents: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  qrWrapper: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImg: {
    width: 110,
    height: 110,
  },
  backCodeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
  },
});
