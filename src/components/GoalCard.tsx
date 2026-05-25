import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

import { Goal } from '../types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BTN = 65;
const LEFT_WIDTH = 72;
const RIGHT_WIDTH = BTN * 2;
const DRAG_OFFSET = 6;
const OVER_THRESHOLD = SCREEN_WIDTH * 0.35;
const SPRING_CONFIG = { damping: 15, stiffness: 170, mass: 0.5 };
const CHECKBOX_WIDTH = 38;

// ── worklet utils ──

function rubberBand(value: number, limit: number): number {
  'worklet';
  const abs = Math.abs(value);
  if (abs <= limit) return value;
  const excess = abs - limit;
  return Math.sign(value) * (limit + (1 - Math.exp(-excess / 100)) * 60);
}

function snapToClosest(
  tx: number,
  leftW: number,
  rightW: number,
  velocityX: number,
): number {
  'worklet';
  const DRAG_TOSS = 0.05;
  const tossX = tx + DRAG_TOSS * velocityX;

  if (tx > 0) {
    if (tossX > leftW * 0.4 || velocityX > 300) return leftW;
    return 0;
  }
  if (tx < 0) {
    if (tossX < -rightW * 0.4 || velocityX < -300) return -rightW;
    return 0;
  }
  return 0;
}

interface GoalCardProps {
  goal: Goal;
  checkInCount: number;
  onPress: () => void;
  onDelete: (goalId: string, title: string) => void;
  onSwipeDelete: (goalId: string) => void;
  onTogglePin: (goalId: string) => void;
  onLongPress: () => void;
  isActive: boolean;
  onCardOpen: (goalId: string) => void;
  isEditing: boolean;
  isSelected: boolean;
  onToggleSelect: (goalId: string) => void;
}

function GoalCardInner({
  goal,
  checkInCount,
  onPress,
  onDelete,
  onSwipeDelete,
  onTogglePin,
  onLongPress,
  isActive,
  onCardOpen,
  isEditing,
  isSelected,
  onToggleSelect,
}: GoalCardProps) {
  // ── Shared values (all animated state on UI thread) ──
  const rowState = useSharedValue(0); // 0=closed, 1=left-open, -1=right-open
  const userDrag = useSharedValue(0);
  const translationX = useSharedValue(0);
  const cardHeight = useSharedValue(1);
  const rightStretch = useSharedValue(RIGHT_WIDTH);
  const leftStretch = useSharedValue(LEFT_WIDTH);
  const redFlex = useSharedValue(1);

  // Edit mode
  const editProgress = useSharedValue(0);
  const editingSv = useSharedValue(false);
  const selectedSv = useSharedValue(false);

  useEffect(() => {
    editingSv.value = isEditing;
    editProgress.value = withSpring(isEditing ? 1 : 0, SPRING_CONFIG);
  }, [isEditing]);

  useEffect(() => {
    selectedSv.value = isSelected;
  }, [isSelected]);

  // ── Close animation ──
  const animateClose = useCallback(() => {
    'worklet';
    translationX.value = withSpring(0, SPRING_CONFIG);
    rightStretch.value = withSpring(RIGHT_WIDTH, SPRING_CONFIG);
    leftStretch.value = withSpring(LEFT_WIDTH, SPRING_CONFIG);
    redFlex.value = withSpring(1, SPRING_CONFIG);
    rowState.value = 0;
  }, [translationX, rightStretch, leftStretch, redFlex, rowState]);

  // ── Open animation ──
  const animateOpen = useCallback(
    (dir: 'left' | 'right', velocityX?: number) => {
      'worklet';
      const to = dir === 'left' ? -RIGHT_WIDTH : LEFT_WIDTH;
      translationX.value = withSpring(to, {
        ...SPRING_CONFIG,
        velocity: velocityX ?? 0,
      });
      rowState.value = dir === 'left' ? -1 : 1;
      runOnJS(onCardOpen)(goal.id);
    },
    [translationX, rowState, onCardOpen, goal.id],
  );

  // External close when another card opens
  useEffect(() => {
    if (!isActive && rowState.value !== 0) {
      animateClose();
    }
  }, [isActive, animateClose, rowState]);

  // ── Pan gesture ──
  const panGesture = useMemo(() => {
    const pan = Gesture.Pan()
      .activeOffsetX([-DRAG_OFFSET, DRAG_OFFSET])
      .onUpdate((event) => {
        if (editingSv.value) return;
        userDrag.value = event.translationX;

        const startOffset =
          rowState.value === -1
            ? -RIGHT_WIDTH
            : rowState.value === 1
              ? LEFT_WIDTH
              : 0;
        const raw = startOffset + event.translationX;

        // Apply rubber-banding for overscroll
        let clamped: number;
        if (rowState.value === 0) {
          if (raw > LEFT_WIDTH) {
            clamped = rubberBand(raw, LEFT_WIDTH);
          } else if (raw < -RIGHT_WIDTH) {
            clamped = rubberBand(raw, -RIGHT_WIDTH);
          } else {
            clamped = raw;
          }
        } else if (rowState.value === -1) {
          // Open-left: allow close (rightward) or slight further left
          if (raw > 0) {
            clamped = rubberBand(raw, LEFT_WIDTH);
          } else if (raw < -RIGHT_WIDTH) {
            const excess = -raw - RIGHT_WIDTH;
            clamped = -RIGHT_WIDTH - rubberBand(excess, 40);
          } else {
            clamped = raw;
          }
        } else {
          // Open-right: allow close (leftward) or slight further right
          if (raw < 0) {
            clamped = -rubberBand(-raw, RIGHT_WIDTH);
          } else if (raw > LEFT_WIDTH) {
            const excess = raw - LEFT_WIDTH;
            clamped = LEFT_WIDTH + rubberBand(excess, 40);
          } else {
            clamped = raw;
          }
        }
        translationX.value = clamped;

        // Stretch action areas on overswipe
        if (clamped < -RIGHT_WIDTH) {
          const extra = Math.min(-clamped - RIGHT_WIDTH, 100);
          rightStretch.value = RIGHT_WIDTH + extra;
          const ratio = Math.min(1, extra / 65);
          redFlex.value = 1 + ratio * 2;
        } else {
          rightStretch.value = RIGHT_WIDTH;
          redFlex.value = 1;
        }
        if (clamped > LEFT_WIDTH) {
          leftStretch.value = LEFT_WIDTH + Math.min(clamped - LEFT_WIDTH, 80);
        } else {
          leftStretch.value = LEFT_WIDTH;
        }
      })
      .onEnd((event) => {
        if (editingSv.value) return;
        const { velocityX } = event;

        // ── Overswipe triggers ──
        const closedSnap = snapToClosest(
          translationX.value,
          LEFT_WIDTH,
          RIGHT_WIDTH,
          velocityX,
        );

        if (rowState.value === 0) {
          if (translationX.value < -OVER_THRESHOLD) {
            // Auto-delete with height collapse
            translationX.value = withSpring(0, SPRING_CONFIG);
            rightStretch.value = withSpring(RIGHT_WIDTH, SPRING_CONFIG);
            cardHeight.value = withTiming(0, { duration: 350 }, () => {
              runOnJS(onSwipeDelete)(goal.id);
            });
            rowState.value = 0;
            return;
          }
          if (translationX.value > OVER_THRESHOLD) {
            // Auto-pin
            translationX.value = withSpring(0, SPRING_CONFIG);
            leftStretch.value = withSpring(LEFT_WIDTH, SPRING_CONFIG);
            rowState.value = 0;
            runOnJS(onTogglePin)(goal.id);
            return;
          }
        }

        if (closedSnap === 0) {
          animateClose();
        } else if (closedSnap > 0) {
          animateOpen('right', velocityX);
        } else {
          animateOpen('left', velocityX);
        }
      })
      .onFinalize(() => {
        userDrag.value = 0;
      });

    return pan;
  }, [
    userDrag,
    rowState,
    translationX,
    rightStretch,
    leftStretch,
    redFlex,
    cardHeight,
    animateClose,
    animateOpen,
    goal.id,
    onSwipeDelete,
    onTogglePin,
  ]);

  // ── Tap gesture (close card when open; toggle select in edit mode) ──
  const tapGesture = useMemo(() => {
    return Gesture.Tap().onStart(() => {
      if (editingSv.value) {
        runOnJS(onToggleSelect)(goal.id);
        return;
      }
      if (rowState.value !== 0) {
        animateClose();
      }
    });
  }, [rowState, animateClose, editingSv, onToggleSelect, goal.id]);

  // ── Animated styles ──
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
    pointerEvents: rowState.value === 0 ? 'auto' : 'box-only',
  }));

  const collapseStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(cardHeight.value, [0, 1], [0, 200]),
    opacity: cardHeight.value,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    width: rightStretch.value,
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    width: leftStretch.value,
  }));

  const redStyle = useAnimatedStyle(() => ({
    flex: redFlex.value,
  }));

  // Edit mode styles
  const cardShiftStyle = useAnimatedStyle(() => ({
    paddingLeft: interpolate(editProgress.value, [0, 1], [SPACING.md, SPACING.md + CHECKBOX_WIDTH]),
  }));

  const checkboxContainerStyle = useAnimatedStyle(() => ({
    opacity: editProgress.value,
    transform: [
      { translateX: interpolate(editProgress.value, [0, 1], [-20, 0]) },
    ],
  }));

  const checkboxScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selectedSv.value ? 1.1 : 1, SPRING_CONFIG) }],
  }));

  // ── JS-thread handlers (called from button presses) ──
  const handlePinPress = () => {
    onTogglePin(goal.id);
    animateClose();
  };

  const handleFolderPress = () => {
    animateClose();
    onPress();
  };

  const handleDeletePress = () => {
    animateClose();
    onDelete(goal.id, goal.title);
  };

  const handleLongPressProxy = () => {
    onLongPress();
  };

  // ── Render ──
  return (
    <Animated.View style={[styles.collapse, collapseStyle]}>
      <View style={styles.card}>
        {/* Left: Pin button */}
        <Animated.View style={[styles.actionLeft, leftActionStyle]}>
          <TouchableOpacity
            style={[styles.btn, styles.pinBtn, goal.pinned && styles.pinBtnActive]}
            onPress={handlePinPress}
            activeOpacity={0.8}
          >
            <Text style={styles.btnIcon}>📌</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Right: Folder + Delete */}
        <Animated.View style={[styles.actionRight, rightActionStyle]}>
          <Animated.View style={[styles.btn, styles.folderBtn]}>
            <TouchableOpacity
              style={styles.btnTouch}
              onPress={handleFolderPress}
              activeOpacity={0.8}
            >
              <Text style={styles.btnIcon}>📁</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.btn, styles.delBtn, redStyle]}>
            <TouchableOpacity
              style={styles.btnTouch}
              onPress={handleDeletePress}
              activeOpacity={0.8}
            >
              <Text style={styles.btnIcon}>🗑️</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Main card content */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.inner, animatedStyle]}
            onLayout={undefined}
          >
            <GestureDetector gesture={tapGesture}>
              <Animated.View style={[styles.innerContent, cardShiftStyle]}>
                {/* Checkbox (edit mode) — absolutely positioned, overlays left padding */}
                <Animated.View style={[styles.checkbox, checkboxContainerStyle]}>
                  <Animated.View style={[
                    styles.checkCircle,
                    isSelected && styles.checkCircleSelected,
                    checkboxScaleStyle,
                  ]}>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </Animated.View>
                </Animated.View>

                <TouchableOpacity
                  style={styles.cardBodyTouch}
                  onPress={isEditing ? undefined : onPress}
                  onLongPress={isEditing ? undefined : handleLongPressProxy}
                  activeOpacity={isEditing ? 1 : 0.7}
                  delayLongPress={500}
                >
                  <View style={[styles.dot, { backgroundColor: goal.color }]} />
                  <View style={styles.info}>
                    <View style={styles.titleRow}>
                      {goal.pinned && <Text style={styles.pinMark}>📌</Text>}
                      <Text style={styles.title} numberOfLines={1}>{goal.title}</Text>
                    </View>
                    {goal.description ? (
                      <Text style={styles.desc} numberOfLines={1}>{goal.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.progress}>
                    <Text style={[styles.count, { color: goal.color }]}>{checkInCount}</Text>
                    <Text style={styles.label}>次</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

export const GoalCard = React.memo(GoalCardInner);

const styles = StyleSheet.create({
  collapse: {
    overflow: 'hidden',
  },
  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#8B8378',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  // ── Action buttons ──
  actionLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: LEFT_WIDTH,
    flexDirection: 'row',
  },
  actionRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: RIGHT_WIDTH,
    flexDirection: 'row',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBtn: {
    width: LEFT_WIDTH,
    backgroundColor: '#E8B44B',
  },
  pinBtnActive: {
    backgroundColor: '#D49B2A',
  },
  folderBtn: {
    backgroundColor: '#4A7FB5',
    flex: 1,
  },
  delBtn: {
    backgroundColor: '#C44B4B',
    flex: 1,
  },
  btnTouch: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: { fontSize: 22 },
  // ── Card inner ──
  inner: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.md,
  },
  cardBodyTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 28,
  },
  checkbox: {
    position: 'absolute',
    left: SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: SPACING.md,
  },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  pinMark: { fontSize: 12, marginRight: 4 },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  desc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: SPACING.md,
  },
  count: { fontSize: 28, fontWeight: '700' },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
});
