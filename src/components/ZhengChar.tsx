import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ZhengCharProps {
  filledStrokes: number; // 0 ~ 5
  size: number;
  color: string;
  animateNewest?: boolean;
}

// 五笔路径（viewBox 0 0 100 100）
// 正字结构：右竖从顶横中点贯穿，左竖偏左且较短
const STROKES = [
  'M 22 20 L 83 20',   // 1: 顶横
  'M 50 20 L 50 85',   // 2: 右竖（从顶横中点贯穿全高）
  'M 50 52 L 78 52',   // 3: 中横（从右竖中点向右延伸）
  'M 28 39 L 28 85',   // 4: 左竖（偏左，上端不碰顶横）
  'M 15 85 L 85 85',   // 5: 底横（全宽封口）
];

const STROKE_LENGTH = 140;

export function ZhengChar({ filledStrokes, size, color, animateNewest = false }: ZhengCharProps) {
  const animValues = useRef(
    Array(5).fill(null).map(() => new Animated.Value(0))
  ).current;

  const prevStrokes = useRef(filledStrokes);

  useEffect(() => {
    if (animateNewest && filledStrokes > prevStrokes.current && filledStrokes <= 5) {
      const newestIndex = filledStrokes - 1;
      animValues[newestIndex].setValue(0);
      Animated.timing(animValues[newestIndex], {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start();
    } else {
      for (let i = 0; i < 5; i++) {
        animValues[i].setValue(i < filledStrokes ? 1 : 0);
      }
    }
    prevStrokes.current = filledStrokes;
  }, [filledStrokes, animateNewest, animValues]);

  const strokeW = size >= 50 ? 5 : 4;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 空状态：虚线边框 — 如淡墨勾勒 */}
      {filledStrokes === 0 && (
        <>
          <Path
            d="M 10 10 L 90 10 L 90 90 L 10 90 Z"
            stroke={COLORS.emptyStroke}
            strokeWidth={1.5}
            strokeDasharray="8 5"
            fill="none"
          />
          {/* 四角小墨点 */}
          <Circle cx={10} cy={10} r={1.5} fill={COLORS.emptyStroke} />
          <Circle cx={90} cy={10} r={1.5} fill={COLORS.emptyStroke} />
          <Circle cx={10} cy={90} r={1.5} fill={COLORS.emptyStroke} />
          <Circle cx={90} cy={90} r={1.5} fill={COLORS.emptyStroke} />
        </>
      )}

      {/* 五笔笔画 */}
      {STROKES.map((d, i) => {
        if (i >= filledStrokes) return null;

        return (
          <AnimatedPath
            key={i}
            d={d}
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={STROKE_LENGTH}
            strokeDashoffset={animValues[i].interpolate({
              inputRange: [0, 1],
              outputRange: [STROKE_LENGTH, 0],
            })}
          />
        );
      })}
    </Svg>
  );
}
