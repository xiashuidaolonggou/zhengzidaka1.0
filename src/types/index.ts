// --- 计数方式 ---
export type CountStyle = 'zheng' | 'tally' | 'star';

// --- 目标 ---
export interface Goal {
  id: string;
  title: string;
  description: string;
  color: string;
  countStyle: CountStyle;
  pinned?: boolean;
  createdAt: number; // Date.now()
}

// --- 打卡记录 ---
export interface CheckIn {
  id: string;
  goalId: string;
  timestamp: number; // Date.now()
}

// --- 全局状态 ---
export interface AppState {
  goals: Goal[];
  checkIns: CheckIn[];
}

// --- Reducer Action 类型 ---
export type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: { goalId: string } }
  | { type: 'CHECK_IN'; payload: CheckIn }
  | { type: 'UNDO_CHECK_IN'; payload: { goalId: string } }
  | { type: 'TOGGLE_PIN'; payload: { goalId: string } }
  | { type: 'BATCH_DELETE_GOALS'; payload: { goalIds: string[] } }
  | { type: 'BATCH_SET_PIN'; payload: { goalIds: string[]; pinned: boolean } };
