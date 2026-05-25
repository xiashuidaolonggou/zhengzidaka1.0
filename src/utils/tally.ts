// 纯函数：次数 → 正字数量
export function strokesToZheng(count: number): {
  fullChars: number;
  partialStrokes: number;
} {
  return {
    fullChars: Math.floor(count / 5),
    partialStrokes: count % 5,
  };
}

// 计算连续打卡天数
export function calculateStreak(checkInDates: number[]): number {
  if (checkInDates.length === 0) return 0;

  // 按日期去重（同一天多次打卡算 1 天）
  const dates = [
    ...new Set(checkInDates.map((ts) => new Date(ts).toDateString())),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // 最近一次打卡不是今天也不是昨天 → 连续断开
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
