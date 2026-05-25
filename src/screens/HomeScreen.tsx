import React, { useCallback, useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGoals } from '../context/GoalContext';
import { GoalCard } from '../components/GoalCard';
import { EmptyState } from '../components/EmptyState';
import { EditToolbar } from '../components/EditToolbar';
import { COLORS, SPACING, FONT_SIZE } from '../constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GoalStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<GoalStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { goals, getCheckInCount, deleteGoal, deleteGoals, togglePin, setPins } = useGoals();
  const [, forceUpdate] = useState(0);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  useFocusEffect(refresh);

  const dismiss = () => setOpenCardId(null);

  // ── Edit mode helpers ──
  const enterEditMode = useCallback(() => {
    setOpenCardId(null);
    setIsEditing(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((goalId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(goals.map((g) => g.id)));
  }, [goals]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = goals.length > 0 && selectedIds.size === goals.length;

  // ── Batch operations ──
  const handleBatchDelete = useCallback(() => {
    const ids = [...selectedIds];
    const count = ids.length;
    Alert.alert('批量删除', `确定要删除 ${count} 个目标吗？\n所有打卡记录也会被清除。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteGoals(ids);
          exitEditMode();
        },
      },
    ]);
  }, [selectedIds, deleteGoals, exitEditMode]);

  const handleBatchPin = useCallback(() => {
    setPins([...selectedIds], true);
    exitEditMode();
  }, [selectedIds, setPins, exitEditMode]);

  const handleBatchUnpin = useCallback(() => {
    setPins([...selectedIds], false);
    exitEditMode();
  }, [selectedIds, setPins, exitEditMode]);

  // ── Dynamic header ──
  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({
        headerRight: () => (
          <Text
            style={{ color: COLORS.accent, fontSize: FONT_SIZE.md, fontWeight: '600' }}
            onPress={exitEditMode}
          >
            取消
          </Text>
        ),
        headerLeft: () => (
          <Text
            style={{ color: COLORS.accentBlue, fontSize: FONT_SIZE.md, fontWeight: '500' }}
            onPress={isAllSelected ? deselectAll : selectAll}
          >
            {isAllSelected ? '取消全选' : '全选'}
          </Text>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => (
          <Text
            style={{
              color: COLORS.accent,
              fontSize: 26,
              fontWeight: '300',
              marginRight: 8,
            }}
            onPress={() => navigation.navigate('CreateGoal')}
          >
            ＋
          </Text>
        ),
        headerLeft: () => (
          <Text
            style={{ color: COLORS.accentBlue, fontSize: FONT_SIZE.md, fontWeight: '500', marginLeft: 4 }}
            onPress={enterEditMode}
          >
            编辑
          </Text>
        ),
      });
    }
  }, [isEditing, isAllSelected, navigation, exitEditMode, selectAll, deselectAll, enterEditMode]);

  // ── Delete / Long-press handlers ──
  const handleDelete = (goalId: string, title: string) => {
    Alert.alert('删除目标', `确定要删除「${title}」吗？\n所有打卡记录也会被清除。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => deleteGoal(goalId),
      },
    ]);
  };

  const handleSwipeDelete = (goalId: string) => {
    deleteGoal(goalId);
  };

  const handleLongPress = (goalId: string, title: string) => {
    if (isEditing) return;
    Alert.alert('删除目标', `确定要删除「${title}」吗？\n所有打卡记录也会被清除。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteGoal(goalId) },
    ]);
  };

  const handleCardOpen = useCallback((goalId: string) => {
    setOpenCardId(goalId);
  }, []);

  const sorted = [...goals].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <View style={styles.container}>
      {goals.length === 0 ? (
        <EmptyState
          message="还没有目标\n创建你的第一个打卡目标吧"
          actionLabel="创建目标"
          onAction={() => navigation.navigate('CreateGoal')}
        />
      ) : (
        <>
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            onScrollBeginDrag={isEditing ? undefined : dismiss}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <GoalCard
                goal={item}
                checkInCount={getCheckInCount(item.id)}
                onPress={() => {
                  dismiss();
                  navigation.navigate('GoalDetail', { goalId: item.id });
                }}
                onDelete={handleDelete}
                onSwipeDelete={handleSwipeDelete}
                onTogglePin={togglePin}
                onLongPress={() => handleLongPress(item.id, item.title)}
                isActive={openCardId === item.id}
                onCardOpen={handleCardOpen}
                isEditing={isEditing}
                isSelected={selectedIds.has(item.id)}
                onToggleSelect={toggleSelect}
              />
            )}
          />
          <EditToolbar
            visible={isEditing && selectedIds.size > 0}
            selectedCount={selectedIds.size}
            onPinAll={handleBatchPin}
            onUnpinAll={handleBatchUnpin}
            onDelete={handleBatchDelete}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl + SPACING.xxl,
  },
});
