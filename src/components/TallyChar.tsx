import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface TallyCharProps {
  filledStrokes: number; // 0 ~ 5
  size: number;
  color: string;
  animateNewest?: boolean;
}

// 四竖一横路径（viewBox 0 0 100 100）
// 4条竖线均匀分布，第5笔斜线贯穿
const STROKES = [
  'M 22 12 L 22 88',   // 1: 第一竖
  'M 40 12 L 40 88',   // 2: 第二竖
  'M 58 12 L 58 88',   // 3: 第三竖
  'M 76 12 L 76 88',   // 4: 第四竖
  'M 8 32 L 92 68',    // 5: 斜线贯穿（左上→右下）
];

const STROKE_LENGTH = 140;

export function TallyChar({ filledStrokes, size, color, animateNewest = false }: TallyCharProps) {
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
