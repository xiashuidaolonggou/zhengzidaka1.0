import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { useRef, useEffect } from 'react';

interface CheckInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}

export function CheckInButton({ onPress, disabled = false, size = 88 }: CheckInButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 呼吸脉冲动画
  useEffect(() => {
    if (disabled) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [disabled, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            { width: size, height: size, borderRadius: size / 2 },
            disabled && styles.disabled,
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <Text style={styles.icon}>+1</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#B8433F',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#B8433F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  disabled: {
    backgroundColor: '#D8CFC0',
    elevation: 0,
    shadowOpacity: 0,
  },
  icon: {
    color: '#FFFBF5',
    fontSize: 24,
    fontWeight: '700',
  },
});
