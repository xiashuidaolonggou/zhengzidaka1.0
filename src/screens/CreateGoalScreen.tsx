import React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useGoals } from '../context/GoalContext';
import { GOAL_COLORS, DEFAULT_COLOR, COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants';
import type { CountStyle } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GoalStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<GoalStackParamList, 'CreateGoal'>;

export function CreateGoalScreen({ navigation }: Props) {
  const { addGoal } = useGoals();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [selectedStyle, setSelectedStyle] = useState<CountStyle>('zheng');

  const canCreate = title.trim().length > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    addGoal(title.trim(), description.trim(), selectedColor, selectedStyle);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* 标题 */}
        <Text style={styles.label}>目标名称</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：每天背100个单词"
          placeholderTextColor={COLORS.emptyStroke}
          value={title}
          onChangeText={setTitle}
          maxLength={30}
          autoFocus
        />

        {/* 描述 */}
        <Text style={styles.label}>描述（选填）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="给自己一点提醒…"
          placeholderTextColor={COLORS.emptyStroke}
          value={description}
          onChangeText={setDescription}
          maxLength={100}
          multiline
          numberOfLines={3}
        />

        {/* 颜色选择 */}
        <Text style={styles.label}>选择颜色</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colorRow}
        >
          {GOAL_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.colorSelected,
              ]}
              onPress={() => setSelectedColor(color)}
              activeOpacity={0.7}
            />
          ))}
        </ScrollView>

        {/* 计数方式 */}
        <Text style={styles.label}>计数方式</Text>
        <View style={styles.styleRow}>
          <TouchableOpacity
            style={[
              styles.styleOption,
              selectedStyle === 'zheng' && styles.styleSelected,
            ]}
            onPress={() => setSelectedStyle('zheng')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.styleText,
                selectedStyle === 'zheng' && styles.styleTextSelected,
              ]}
            >
              正
            </Text>
            <Text style={styles.styleHint}>正字</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.styleOption,
              selectedStyle === 'tally' && styles.styleSelected,
            ]}
            onPress={() => setSelectedStyle('tally')}
            activeOpacity={0.7}
          >
            <Svg width={28} height={28} viewBox="0 0 100 100">
              <Path
                d="M 22 12 L 22 88 M 40 12 L 40 88 M 58 12 L 58 88 M 76 12 L 76 88 M 8 32 L 92 68"
                stroke={selectedStyle === 'tally' ? COLORS.accent : COLORS.textSecondary}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <Text style={styles.styleHint}>四竖一横</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.styleOption,
              selectedStyle === 'star' && styles.styleSelected,
            ]}
            onPress={() => setSelectedStyle('star')}
            activeOpacity={0.7}
          >
            <Svg width={28} height={28} viewBox="0 0 100 100">
              <Path
                d="M 28 81 L 50 12 L 72 81 L 14 38 L 86 38 Z"
                stroke={selectedStyle === 'star' ? COLORS.accent : COLORS.textSecondary}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            <Text style={styles.styleHint}>五角星</Text>
          </TouchableOpacity>
        </View>

        {/* 创建按钮 */}
        <TouchableOpacity
          style={[styles.createButton, !canCreate && styles.createDisabled]}
          onPress={handleCreate}
          disabled={!canCreate}
          activeOpacity={0.8}
        >
          <Text style={styles.createText}>创建目标</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorRow: {
    flexDirection: 'row',
    gap: SPACING.sm + 2,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  styleRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  styleOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
  },
  styleSelected: {
    borderColor: COLORS.accent,
    backgroundColor: '#FDF0ED',
  },
  styleText: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  styleTextSelected: {
    color: COLORS.accent,
  },
  styleHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  createButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.xxl,
    elevation: 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  createDisabled: {
    backgroundColor: COLORS.emptyStroke,
    elevation: 0,
    shadowOpacity: 0,
  },
  createText: {
    color: '#FFFBF5',
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
