import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Image, useWindowDimensions, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../../core/store/useAppStore';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation drivers
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.72)).current;
  const shimmerAnim = useRef(new Animated.Value(1)).current;

  const initialize = useAppStore((state) => state.initialize);

  // Dynamic responsive logo sizing formula (Senior UX/UI responsive guidelines)
  // Max width 68% of screen on mobile, clamped between 220px and 380px for tablets/large displays
  const logoWidth = Math.min(Math.max(screenWidth * 0.65, 220), 380);
  const logoHeight = logoWidth * 0.42; // Preserves optimal brand aspect ratio

  useEffect(() => {
    // 1. Entrance animation sequence (Cubic-bezier scale + Smooth fade)
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6.5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Continuous subtle micro-breathing while background resources load
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1.03,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 3. Application initialization with UX minimum duration (1.5s for seamless transition)
    const runInit = async () => {
      const startTime = Date.now();
      await initialize();
      const elapsedTime = Date.now() - startTime;
      const minDuration = 1500;

      const remainingTime = Math.max(0, minDuration - elapsedTime);
      setTimeout(() => {
        // Exit animation: Smooth fade & slight expansion for ultra-premium UX
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onFinish) {
            onFinish();
          }
        });
      }, remainingTime);
    };

    runInit();
  }, []);

  return (
    <View style={styles.container}>
      {/* Dark icons for status bar on pure white background */}
      <StatusBar style="dark" animated />

      {/* Main Centered Logo Container */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { scale: shimmerAnim },
            ],
          },
        ]}
      >
        <Image
          source={require('../../../assets/logo.png')}
          style={[
            styles.logoImage,
            {
              width: logoWidth,
              height: logoHeight,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoImage: {
    // Sizing handled dynamically via responsive calculation inline
  },
});

