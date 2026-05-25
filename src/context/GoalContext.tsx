import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Goal, CheckIn, Action, CountStyle } from '../types';
import { loadState, saveState } from '../storage/asyncStorage';

// --- 初始状态 ---
const initialState: AppState = {
  goals: [],
  checkIns: [],
};

// --- Reducer ---
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };

    case 'DELETE_GOAL':
      return {
        goals: state.goals.filter((g) => g.id !== action.payload.goalId),
        checkIns: state.checkIns.filter((c) => c.goalId !== action.payload.goalId),
      };

    case 'CHECK_IN':
      return { ...state, checkIns: [...state.checkIns, action.payload] };

    case 'UNDO_CHECK_IN': {
      // 找到该目标的最新一次打卡并移除
      const goalCheckIns = state.checkIns.filter(
        (c) => c.goalId === action.payload.goalId
      );
      if (goalCheckIns.length === 0) return state;

      const sorted = [...goalCheckIns].sort((a, b) => b.timestamp - a.timestamp);
      const latestId = sorted[0].id;

      return {
        ...state,
        checkIns: state.checkIns.filter((c) => c.id !== latestId),
      };
    }

    case 'TOGGLE_PIN':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.goalId ? { ...g, pinned: !g.pinned } : g
        ),
      };

    case 'BATCH_DELETE_GOALS': {
      const ids = new Set(action.payload.goalIds);
      return {
        goals: state.goals.filter((g) => !ids.has(g.id)),
        checkIns: state.checkIns.filter((c) => !ids.has(c.goalId)),
      };
    }

    case 'BATCH_SET_PIN': {
      const ids = new Set(action.payload.goalIds);
      return {
        ...state,
        goals: state.goals.map((g) =>
          ids.has(g.id) ? { ...g, pinned: action.payload.pinned } : g
        ),
      };
    }

    default:
      return state;
  }
}

// --- Context ---
interface GoalContextValue {
  goals: Goal[];
  getCheckIns: (goalId: string) => CheckIn[];
  getCheckInCount: (goalId: string) => number;
  getStreak: (goalId: string) => number;
  addGoal: (title: string, description: string, color: string, countStyle: CountStyle) => void;
  deleteGoal: (goalId: string) => void;
  deleteGoals: (goalIds: string[]) => void;
  setPins: (goalIds: string[], pinned: boolean) => void;
  checkIn: (goalId: string) => void;
  undoCheckIn: (goalId: string) => void;
  togglePin: (goalId: string) => void;
}

const GoalContext = createContext<GoalContextValue | null>(null);

// --- 生成唯一 ID ---
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// --- 计算连续天数 ---
function calculateStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;

  // 按日期去重（同一天多次打卡算 1 天）
  const dates = [
    ...new Set(checkIns.map((c) => new Date(c.timestamp).toDateString())),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // 最近一次打卡不是今天也不是昨天，连续断开
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]).getTime();
    const curr = new Date(dates[i]).getTime();
    const diffDays = (prev - curr) / 86400000;
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// --- Provider ---
export function GoalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 启动时从本地存储加载数据
  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: saved });
      }
    })();
  }, []);

  // 每次 state 变更自动保存
  useEffect(() => {
    saveState(state);
  }, [state]);

  const value: GoalContextValue = {
    goals: state.goals,

    getCheckIns: (goalId: string) =>
      state.checkIns.filter((c) => c.goalId === goalId),

    getCheckInCount: (goalId: string) =>
      state.checkIns.filter((c) => c.goalId === goalId).length,

    getStreak: (goalId: string) =>
      calculateStreak(state.checkIns.filter((c) => c.goalId === goalId)),

    addGoal: (title, description, color, countStyle) => {
      const goal: Goal = {
        id: generateId(),
        title,
        description,
        color,
        countStyle,
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_GOAL', payload: goal });
    },

    deleteGoal: (goalId) => {
      dispatch({ type: 'DELETE_GOAL', payload: { goalId } });
    },

    deleteGoals: (goalIds) => {
      dispatch({ type: 'BATCH_DELETE_GOALS', payload: { goalIds } });
    },

    setPins: (goalIds, pinned) => {
      dispatch({ type: 'BATCH_SET_PIN', payload: { goalIds, pinned } });
    },

    checkIn: (goalId) => {
      const entry: CheckIn = {
        id: generateId(),
        goalId,
        timestamp: Date.now(),
      };
      dispatch({ type: 'CHECK_IN', payload: entry });
    },

    undoCheckIn: (goalId) => {
      dispatch({ type: 'UNDO_CHECK_IN', payload: { goalId } });
    },

    togglePin: (goalId) => {
      dispatch({ type: 'TOGGLE_PIN', payload: { goalId } });
    },
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

// --- Hook ---
export function useGoals(): GoalContextValue {
  const ctx = useContext(GoalContext);
  if (!ctx) {
    throw new Error('useGoals 必须在 GoalProvider 内部使用');
  }
  return ctx;
}
