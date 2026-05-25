import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

const STORAGE_KEY = '@tally_app_state_v1';

// 从本地存储加载状态
export async function loadState(): Promise<AppState | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null; // 存储读取失败也不影响应用运行
  }
}

// 保存状态到本地
export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 写入失败静默处理，应用仍可正常运行
  }
}

// 清除所有数据
export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // 忽略清除错误
  }
}
