import { loadState } from '../storage/asyncStorage';
import { isEmpty, saveFullState } from './repository';

// 从 AsyncStorage 一次性迁移到 SQLite
// - 幂等：SQLite 已有数据时跳过
// - 不删除旧 AsyncStorage 数据（保留作为备份）
// - 失败静默返回 false，不阻塞 App 启动
export async function migrateFromAsyncStorage(): Promise<boolean> {
  try {
    // SQLite 已有数据 → 跳过，不做覆盖
    if (!isEmpty()) return false;

    const oldState = await loadState();
    if (!oldState) return false;

    saveFullState(oldState);
    return true;
  } catch {
    return false;
  }
}
