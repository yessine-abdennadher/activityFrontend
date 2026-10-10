import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';

interface NewtonsCradleProps {
  size?: number;
  color?: string;
  speed?: number;
}

export const NewtonsCradleLoader: React.FC<NewtonsCradleProps> = ({
  size = 50,
  color = '#C026D3',
  speed = 1200,
}) => {
  const swingLeft = useRef(new Animated.Value(0)).current;
  const swingRight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 0deg -> 70deg -> 0deg animation loop for first dot
    const leftAnim = Animated.sequence([
      Animated.timing(swingLeft, {
        toValue: 70,
        duration: speed * 0.25,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swingLeft, {
        toValue: 0,
        duration: speed * 0.25,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swingLeft, {
        toValue: 0,
        duration: speed * 0.5,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);

    // 0deg -> -70deg -> 0deg animation loop for last dot (offset by 50% duration)
    const rightAnim = Animated.sequence([
      Animated.timing(swingRight, {
        toValue: 0,
        duration: speed * 0.5,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(swingRight, {
        toValue: -70,
        duration: speed * 0.25,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swingRight, {
        toValue: 0,
        duration: speed * 0.25,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(Animated.parallel([leftAnim, rightAnim]));
    loop.start();

    return () => loop.stop();
  }, [speed, swingLeft, swingRight]);

  const dotWidth = size * 0.25;
  const ballSize = dotWidth;

  const leftRotation = swingLeft.interpolate({
    inputRange: [0, 70],
    outputRange: ['0deg', '70deg'],
  });

  const rightRotation = swingRight.interpolate({
    inputRange: [-70, 0],
    outputRange: ['-70deg', '0deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Dot 1 - Left Swinging */}
      <Animated.View
        style={[
          styles.dotWrapper,
          {
            width: dotWidth,
            transform: [{ rotate: leftRotation }],
          },
        ]}
      >
        <View style={[styles.ball, { width: ballSize, height: ballSize, backgroundColor: color }]} />
      </Animated.View>

      {/* Dot 2 - Middle Left (Stationary) */}
      <View style={[styles.dotWrapper, { width: dotWidth }]}>
        <View style={[styles.ball, { width: ballSize, height: ballSize, backgroundColor: color }]} />
      </View>

      {/* Dot 3 - Middle Right (Stationary) */}
      <View style={[styles.dotWrapper, { width: dotWidth }]}>
        <View style={[styles.ball, { width: ballSize, height: ballSize, backgroundColor: color }]} />
      </View>

      {/* Dot 4 - Right Swinging */}
      <Animated.View
        style={[
          styles.dotWrapper,
          {
            width: dotWidth,
            transform: [{ rotate: rightRotation }],
          },
        ]}
      >
        <View style={[styles.ball, { width: ballSize, height: ballSize, backgroundColor: color }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotWrapper: {
    position: 'relative',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // Transform origin at the top center
    transformOrigin: 'top center',
  },
  ball: {
    borderRadius: 999,
  },
});
