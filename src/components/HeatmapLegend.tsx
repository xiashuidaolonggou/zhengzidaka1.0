import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { levelToColor } from '../utils/heatmap';
import { FONT_SIZE } from '../constants';

interface HeatmapLegendProps {
  isDark: boolean;
}

export function HeatmapLegend({ isDark }: HeatmapLegendProps) {
  const levels = [0, 1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      <Text style={[styles.label, isDark && styles.labelDark]}>少</Text>
      {levels.map((lvl) => (
        <View
          key={lvl}
          style={[
            styles.swatch,
            { backgroundColor: levelToColor(lvl, isDark) },
          ]}
        />
      ))}
      <Text style={[styles.label, isDark && styles.labelDark]}>多</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 8,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: '#8B8378',
    marginHorizontal: 4,
  },
  labelDark: {
    color: '#8B8070',
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});
