import { getDatabase } from './database';
import type { AppState, Goal, CheckIn, CountStyle } from '../types';

// ── 加载全量状态 ──
export function loadFullState(): AppState {
  const db = getDatabase();

  const goalRows = db.getAllSync(
    'SELECT id, title, description, color, count_style, pinned, created_at FROM goals ORDER BY created_at ASC'
  ) as Array<{
    id: string;
    title: string;
    description: string;
    color: string;
    count_style: string;
    pinned: number;
    created_at: number;
  }>;

  const goals: Goal[] = goalRows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    color: row.color,
    countStyle: row.count_style as CountStyle,
    pinned: row.pinned === 1 ? true : undefined,
    createdAt: row.created_at,
  }));

  const checkInRows = db.getAllSync(
    'SELECT id, goal_id, timestamp FROM checkins ORDER BY timestamp ASC'
  ) as Array<{ id: string; goal_id: string; timestamp: number }>;

  const checkIns: CheckIn[] = checkInRows.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    timestamp: row.timestamp,
  }));

  return { goals, checkIns };
}

// ── 全量保存（事务内 DELETE ALL + INSERT ALL） ──
export function saveFullState(state: AppState): void {
  const db = getDatabase();

  db.withTransactionSync(() => {
    db.execSync('DELETE FROM checkins');
    db.execSync('DELETE FROM goals');

    for (const g of state.goals) {
      db.runSync(
        'INSERT INTO goals (id, title, description, color, count_style, pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        g.id,
        g.title,
        g.description,
        g.color,
        g.countStyle,
        g.pinned ? 1 : 0,
        g.createdAt
      );
    }

    for (const c of state.checkIns) {
      db.runSync(
        'INSERT INTO checkins (id, goal_id, timestamp) VALUES (?, ?, ?)',
        c.id,
        c.goalId,
        c.timestamp
      );
    }
  });
}

// ── 数据库是否为空 ──
export function isEmpty(): boolean {
  const db = getDatabase();
  const row = db.getFirstSync('SELECT COUNT(*) as count FROM goals') as { count: number } | null;
  return (row?.count ?? 0) === 0;
}
