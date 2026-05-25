import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StarCharProps {
  filledStrokes: number; // 0 ~ 5
  size: number;
  color: string;
  animateNewest?: boolean;
}

// 五角星路径（viewBox 0 0 100 100）
// 5 条星线，连接每隔一个顶点，标准一笔画星形
// 顶点: 顶(50,12) 右上(86,38) 右下(72,81) 左下(28,81) 左上(14,38)
const STROKES = [
  'M 28 81 L 50 12',   // 1: 左下 → 顶
  'M 50 12 L 72 81',   // 2: 顶 → 右下
  'M 72 81 L 14 38',   // 3: 右下 → 左上
  'M 14 38 L 86 38',   // 4: 左上 → 右上
  'M 86 38 L 28 81',   // 5: 右上 → 左下
];

const STROKE_LENGTH = 140;

export function StarChar({ filledStrokes, size, color, animateNewest = false }: StarCharProps) {
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
      {filledStrokes === 0 && (
        <>
          <Path
            d="M 10 10 L 90 10 L 90 90 L 10 90 Z"
            stroke={COLORS.emptyStroke}
            strokeWidth={1.5}
            strokeDasharray="8 5"
            fill="none"
          />
          <Circle cx={10} cy={10} r={1.5} fill={COLORS.emptyStroke} />
          <Circle cx={90} cy={10} r={1.5} fill={COLORS.emptyStroke} />
          <Circle cx={10} cy={90} r={1.5} fill={COLORS.emptyStroke} />
          <Circle cx={90} cy={90} r={1.5} fill={COLORS.emptyStroke} />
        </>
      )}

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
