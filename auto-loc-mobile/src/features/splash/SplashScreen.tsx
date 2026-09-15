import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../core/theme';
import { useAppStore } from '../../core/store/useAppStore';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    // 1. Entrance animation (Fade-in + Spring Scale)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse ambient background glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Application initialization & minimum duration
    const runInit = async () => {
      const startTime = Date.now();
      await initialize();
      const elapsedTime = Date.now() - startTime;
      const minDuration = 1400;

      const remainingTime = Math.max(0, minDuration - elapsedTime);
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
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
      <StatusBar style="light" />

      {/* Luxury Dark Radial/Linear Background */}
      <LinearGradient
        colors={['#0F172A', '#090D16', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle Glowing Radial Aura */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            opacity: pulseAnim,
          },
        ]}
      />

      {/* Centered Animated Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    filter: 'blur(30px)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: {
    width: 260,
    height: 110,
  },
});
