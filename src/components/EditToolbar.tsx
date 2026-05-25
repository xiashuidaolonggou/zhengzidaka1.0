import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants';

interface EditToolbarProps {
  visible: boolean;
  selectedCount: number;
  onPinAll: () => void;
  onUnpinAll: () => void;
  onDelete: () => void;
}

const SPRING_CONFIG = { damping: 15, stiffness: 170, mass: 0.5 };

export function EditToolbar({
  visible,
  selectedCount,
  onPinAll,
  onUnpinAll,
  onDelete,
}: EditToolbarProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(100, SPRING_CONFIG);
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, translateY, opacity]);

  const toolbarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + SPACING.sm },
        toolbarStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={onPinAll}
          activeOpacity={0.8}
        >
          <Text style={styles.btnIcon}>📌</Text>
          <Text style={styles.btnLabel}>全部置顶</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={onUnpinAll}
          activeOpacity={0.8}
        >
          <Text style={styles.btnIcon}>📌</Text>
          <Text style={[styles.btnLabel, { color: COLORS.textSecondary }]}>
            取消置顶
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.delBtn]}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Text style={styles.btnIcon}>🗑️</Text>
          <Text style={[styles.btnLabel, { color: COLORS.accent }]}>
            删除({selectedCount})
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  delBtn: {
    // extra emphasis
  },
  btnIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  btnLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
});
